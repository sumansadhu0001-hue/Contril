import { supabase, isSupabaseConfigured, getLocalSession, authDomain } from './auth';
import { 
  getStoredGoogleTokens, 
  saveGoogleTokens, 
  clearGoogleTokens,
  GoogleTokens, 
  getGoogleAccessToken,
  fetchLiveGmailMessages,
  fetchLiveCalendarEvents,
  fetchLiveDriveFiles
} from './googleApi';
import { 
  getConnectedAccounts, 
  saveConnectedAccounts, 
  addActivityEvent, 
  saveUserStoredEmails, 
  getUserStoredEmails,
  saveUserStoredMeetings,
  saveUserStoredDocs
} from './integrationsStore';
import { EmailItem } from '../types';

export const REQUIRED_GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

export interface GmailVerificationResult {
  isAuthenticated: boolean;
  isGoogleProvider: boolean;
  hasValidConnection: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  hasRequiredScopes: boolean;
  missingScopes: string[];
  status: 'connected' | 'not_authenticated' | 'not_google' | 'missing_scopes' | 'token_expired' | 'refresh_failed' | 'api_error';
  errorMessage?: string;
  userEmail?: string;
  emails: EmailItem[];
}

/**
 * Step 1: Verify current Supabase session
 */
export async function getCurrentSupabaseSession() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session) {
        return data.session;
      }
    } catch (err) {
      console.error('Error fetching Supabase session:', err);
    }
  }
  return null;
}

/**
 * Step 2: Determine if user's authenticated provider is Google
 */
export function checkIsGoogleProvider(session: any, storedTokens: GoogleTokens | null): boolean {
  if (session?.user) {
    const provider = session.user.app_metadata?.provider;
    if (provider === 'google') return true;
    const identities = session.user.identities || [];
    if (identities.some((id: any) => id.provider === 'google')) return true;
  }
  if (session?.provider_token) return true;
  if (storedTokens?.accessToken) return true;
  return false;
}

/**
 * Step 3: Extract OAuth access token & refresh token
 */
export function extractOAuthTokens(session: any, storedTokens: GoogleTokens | null) {
  const accessToken = session?.provider_token || storedTokens?.accessToken || null;
  const refreshToken = session?.provider_refresh_token || storedTokens?.refreshToken || null;
  const expiresAt = storedTokens?.expiresAt || (session?.expires_at ? session.expires_at * 1000 : Date.now() + 3600000);
  const email = session?.user?.email || storedTokens?.email || 'user@gmail.com';

  return { accessToken, refreshToken, expiresAt, email };
}

/**
 * Step 4: Verify Gmail API scopes via Google tokeninfo endpoint
 */
export async function checkTokenScopes(accessToken: string): Promise<{
  valid: boolean;
  hasRequiredScopes: boolean;
  missingScopes: string[];
  email?: string;
  scopeString?: string;
}> {
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
    if (!res.ok) {
      return { valid: false, hasRequiredScopes: false, missingScopes: REQUIRED_GMAIL_SCOPES };
    }

    const data = await res.json();
    const scopeStr: string = data.scope || '';
    const grantedScopes = scopeStr.split(' ').map(s => s.trim().toLowerCase());

    const missingScopes: string[] = [];
    for (const reqScope of REQUIRED_GMAIL_SCOPES) {
      const scopeShort = reqScope.replace('https://www.googleapis.com/auth/', '').toLowerCase();
      const hasIt = grantedScopes.some(gs => gs.includes(scopeShort) || gs.includes(reqScope.toLowerCase()));
      if (!hasIt) {
        missingScopes.push(reqScope);
      }
    }

    return {
      valid: true,
      hasRequiredScopes: missingScopes.length === 0,
      missingScopes,
      email: data.email,
      scopeString: scopeStr
    };
  } catch (err) {
    console.error('Error verifying token scopes with Google:', err);
    return { valid: false, hasRequiredScopes: false, missingScopes: REQUIRED_GMAIL_SCOPES };
  }
}

/**
 * Step 5: Verify Gmail API connection directly by calling GET https://gmail.googleapis.com/gmail/v1/users/me/profile
 */
export async function verifyGmailProfile(accessToken: string): Promise<{
  success: boolean;
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
  historyId?: string;
  errorMessage?: string;
}> {
  try {
    console.info('Gmail profile request starting...', {
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/profile',
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 12)}...` : 'NONE'
    });

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      let errText = `Gmail Profile API returned status ${res.status}`;
      try {
        const errJson = await res.json();
        console.error('Gmail profile response error json:', errJson);
        if (errJson.error?.message) {
          errText = errJson.error.message;
        }
      } catch (e: any) {
        console.error('Failed to parse error json from Gmail profile response:', e?.stack || e);
      }
      console.error('Gmail profile request failed:', { status: res.status, errText });
      return { success: false, errorMessage: errText };
    }

    const data = await res.json();
    console.info('Gmail profile response received successfully:', {
      status: res.status,
      emailAddress: data.emailAddress,
      messagesTotal: data.messagesTotal,
      threadsTotal: data.threadsTotal,
      historyId: data.historyId
    });

    return {
      success: true,
      emailAddress: data.emailAddress,
      messagesTotal: data.messagesTotal,
      threadsTotal: data.threadsTotal,
      historyId: data.historyId
    };
  } catch (err: any) {
    console.error('Gmail profile request exception:', err?.stack || err);
    return {
      success: false,
      errorMessage: err?.message || 'Error communicating with Gmail API'
    };
  }
}

/**
 * Step 6: Refresh access token automatically
 */
export async function autoRefreshGoogleToken(refreshToken: string): Promise<{ success: boolean; accessToken?: string; expiresAt?: number }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data?.session?.provider_token) {
        return {
          success: true,
          accessToken: data.session.provider_token,
          expiresAt: Date.now() + 3600000
        };
      }
    }

    const res = await fetch('/api/v1/auth/refresh-google-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        return {
          success: true,
          accessToken: data.accessToken,
          expiresAt: Date.now() + 3600000
        };
      }
    }
  } catch (err) {
    console.error('Failed to auto-refresh Google token:', err);
  }
  return { success: false };
}

/**
 * Initiate Google OAuth login via Supabase Authentication
 */
export async function initiateGoogleOAuth() {
  console.info('initiateGoogleOAuth() entered');
  const redirectTo = `${authDomain}/auth/callback`;
  const scopesStr = REQUIRED_GMAIL_SCOPES.join(' ');

  if (typeof window !== 'undefined') {
    const currentHash = window.location.hash.replace('#', '') || 'settings';
    console.info('[Google OAuth] Caching redirect mode in localStorage:', currentHash);
    localStorage.setItem('contril_auth_redirect_mode', currentHash);
  }

  if (!isSupabaseConfigured || !supabase) {
    const configErr = 'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing. Please configure them to complete OAuth authentication.';
    console.error('[Google OAuth Error]', configErr);
    throw new Error(configErr);
  }

  console.info('Calling supabase.auth.signInWithOAuth for Google...');
  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: scopesStr,
      redirectTo: redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (result.error) {
    console.error('Supabase signInWithOAuth failed:', result.error.message);
    throw result.error;
  }

  return result.data;
}

/**
 * Disconnect Google Workspace connection completely
 */
export function disconnectGoogleWorkspace() {
  clearGoogleTokens();

  const connectedAccounts = getConnectedAccounts();
  delete connectedAccounts['gmail'];
  delete connectedAccounts['google_calendar'];
  delete connectedAccounts['google_drive'];
  delete connectedAccounts['google_docs'];
  saveConnectedAccounts(connectedAccounts);

  addActivityEvent(
    'gmail',
    'Google Workspace',
    'Integration Disconnected',
    'Revoked OAuth tokens and removed workspace data',
    'action'
  );
}

/**
 * Main Verification Function
 * Checks Supabase session, Google provider, tokens, expiry, scopes, DB record, and performs a live Gmail API profile call.
 * ONLY marks Gmail as connected after https://gmail.googleapis.com/gmail/v1/users/me/profile succeeds.
 */
export async function checkAndVerifyGmailConnection(): Promise<GmailVerificationResult> {
  const session = await getCurrentSupabaseSession();
  
  // 1. If returning with a fresh OAuth handshake payload, save it to in-memory and backend
  if (session?.provider_token) {
    const freshTokens = {
      accessToken: session.provider_token,
      refreshToken: session.provider_refresh_token || undefined,
      expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000,
      email: session.user?.email || 'user@gmail.com',
      scopes: REQUIRED_GMAIL_SCOPES
    };
    saveGoogleTokens(freshTokens);
  }

  // 2. Fetch connection status from backend
  const localUser = getLocalSession();
  const sessionUserStr = localStorage.getItem('contril_session_user');
  const token = sessionUserStr ? JSON.parse(sessionUserStr).token : '';

  let isBackendConnected = false;
  if (token) {
    try {
      const res = await fetch('/api/v1/integrations/google/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const statusData = await res.json();
        if (statusData.success && statusData.isConnected) {
          isBackendConnected = true;
        }
      }
    } catch (err) {
      console.error('[Google Check] Backend status fetch failed:', err);
    }
  }

  // If not connected in backend, clear local cache and return disconnected
  if (!isBackendConnected && !session?.provider_token) {
    const stored = getStoredGoogleTokens();
    if (stored) {
      clearGoogleTokens();
    }
    
    return {
      isAuthenticated: Boolean(session?.user || localUser),
      isGoogleProvider: false,
      hasValidConnection: false,
      accessToken: null,
      refreshToken: null,
      hasRequiredScopes: false,
      missingScopes: REQUIRED_GMAIL_SCOPES,
      status: 'not_authenticated',
      emails: []
    };
  }

  // 3. Resolve active access token
  const activeAccessToken = await getGoogleAccessToken();
  if (!activeAccessToken) {
    return {
      isAuthenticated: true,
      isGoogleProvider: true,
      hasValidConnection: false,
      accessToken: null,
      refreshToken: null,
      hasRequiredScopes: false,
      missingScopes: REQUIRED_GMAIL_SCOPES,
      status: 'token_expired',
      errorMessage: 'Google access token expired or was revoked. Please reconnect.',
      emails: []
    };
  }

  // 4. Verify API Scopes
  const scopeCheck = await checkTokenScopes(activeAccessToken);
  if (!scopeCheck.valid) {
    console.warn('[Google Check] Token rejected by Google. Retrying getGoogleAccessToken...');
    clearGoogleTokens();
    const retriedToken = await getGoogleAccessToken();
    if (!retriedToken) {
      return {
        isAuthenticated: true,
        isGoogleProvider: true,
        hasValidConnection: false,
        accessToken: null,
        refreshToken: null,
        hasRequiredScopes: false,
        missingScopes: REQUIRED_GMAIL_SCOPES,
        status: 'refresh_failed',
        errorMessage: 'Google OAuth session was revoked or expired. Please reconnect.',
        emails: []
      };
    }
  }

  if (scopeCheck.valid && !scopeCheck.hasRequiredScopes) {
    return {
      isAuthenticated: true,
      isGoogleProvider: true,
      hasValidConnection: false,
      accessToken: activeAccessToken,
      refreshToken: null,
      hasRequiredScopes: false,
      missingScopes: scopeCheck.missingScopes,
      status: 'missing_scopes',
      errorMessage: 'Gmail API read permissions are missing. Please reconnect to grant required scopes.',
      userEmail: scopeCheck.email || session?.user?.email || 'user@gmail.com',
      emails: []
    };
  }

  // 5. Verify live profile call
  const profileVerification = await verifyGmailProfile(activeAccessToken);
  if (!profileVerification.success) {
    return {
      isAuthenticated: true,
      isGoogleProvider: true,
      hasValidConnection: false,
      accessToken: activeAccessToken,
      refreshToken: null,
      hasRequiredScopes: true,
      missingScopes: [],
      status: 'api_error',
      errorMessage: profileVerification.errorMessage || 'Gmail API profile call failed.',
      emails: []
    };
  }

  // 6. Fetch live workspace data (Gmail messages, Calendar events, Drive files)
  try {
    const liveEmails = await fetchLiveGmailMessages(activeAccessToken, session?.user?.id);
    await fetchLiveCalendarEvents(activeAccessToken, session?.user?.id);
    await fetchLiveDriveFiles(activeAccessToken, session?.user?.id);

    // Save connection statuses to integrations store
    const connectedAccounts = getConnectedAccounts();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const verifiedAccountEmail = profileVerification.emailAddress || session?.user?.email || 'user@gmail.com';

    const accountDetails = {
      integrationId: '',
      isConnected: true,
      accountEmail: verifiedAccountEmail,
      lastSyncTime: timeFormatted,
      statusMessage: 'Live Verified Google Connection'
    };

    connectedAccounts['gmail'] = { ...accountDetails, integrationId: 'gmail' };
    connectedAccounts['google_calendar'] = { ...accountDetails, integrationId: 'google_calendar' };
    connectedAccounts['google_drive'] = { ...accountDetails, integrationId: 'google_drive' };
    connectedAccounts['google_docs'] = { ...accountDetails, integrationId: 'google_docs' };

    saveConnectedAccounts(connectedAccounts);

    return {
      isAuthenticated: true,
      isGoogleProvider: true,
      hasValidConnection: true,
      accessToken: activeAccessToken,
      refreshToken: null,
      hasRequiredScopes: true,
      missingScopes: [],
      status: 'connected',
      userEmail: verifiedAccountEmail,
      emails: liveEmails
    };
  } catch (err: any) {
    console.error('[Google Check] Error fetching workspace items:', err);
    return {
      isAuthenticated: true,
      isGoogleProvider: true,
      hasValidConnection: false,
      accessToken: activeAccessToken,
      refreshToken: null,
      hasRequiredScopes: true,
      missingScopes: [],
      status: 'api_error',
      errorMessage: err.message || 'Error communicating with Google Workspace.',
      emails: []
    };
  }
}
