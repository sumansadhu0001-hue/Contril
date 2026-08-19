import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite or Next or Node environment variables
const getEnvVar = (name: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return String(import.meta.env[name]);
  }
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return String(process.env[name]);
  }
  return '';
};

export const supabaseUrl = 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('SUPABASE_URL') || 
  'https://qjyowojnvbfezznezxrr.supabase.co';

export const supabaseAnonKey = 
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('SUPABASE_ANON_KEY') || 
  'sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 10
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase Configuration Alert]\n' +
    'Supabase environment variables are missing or incomplete:\n' +
    `  - NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL: ${supabaseUrl ? 'FOUND' : 'MISSING'}\n` +
    `  - NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'FOUND' : 'MISSING'}\n` +
    'Local mode active. Configure these variables in your environment to connect your live Supabase database.'
  );
} else {
  console.info('[Supabase Client] Successfully initialized Supabase client for URL:', supabaseUrl);
}

// Single initialized Supabase client instance using official supabase-js
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    })
  : null;

export const IS_DEV_MODE = 
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.DEV || import.meta.env.MODE === 'development')) ||
  (typeof window !== 'undefined' && (
    window.location.hostname.includes('ais-dev') || 
    window.location.hostname.includes('ais-pre') ||
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1')
  ));

export const appName = getEnvVar('VITE_APP_NAME') || 'Contril';
export const appUrl = getEnvVar('VITE_APP_URL') || (typeof window !== 'undefined' ? window.location.origin : '');
export const authDomain = getEnvVar('VITE_AUTH_DOMAIN') || appUrl;

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  provider?: string;
  identityType?: string;
  companyOrName?: string;
  createdAt: string;
}

const LOCAL_STORAGE_SESSION_KEY = 'contril_auth_session';

export function getLocalSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse auth session', err);
  }

  return null;
}

export function setLocalSession(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  }
}

/**
 * Save user profile and onboarding data to Supabase database tables:
 * - profiles
 * - organizations
 * - user_preferences
 */
export async function saveUserProfileToDatabase(
  userId: string,
  profileData: {
    name: string;
    email?: string;
    role: string;
    company?: string;
    workspaceType?: string;
    identityType?: string;
    studentSchool?: string;
    studentClass?: string;
    studentCountry?: string;
    freelancerBusinessName?: string;
    businessIndustry?: string;
    businessTeamSize?: string;
    enterpriseDepartment?: string;
    enterpriseEmployees?: string;
    startupStage?: string;
    startupIndustry?: string;
  }
) {
  if (!supabase) {
    console.info('Supabase client not initialized; skipping remote DB record sync.');
    return;
  }

  try {
    // 1. Upsert into profiles table
    await supabase.from('profiles').upsert({
      id: userId,
      full_name: profileData.name,
      email: profileData.email,
      role: profileData.role,
      business_name: profileData.company || profileData.freelancerBusinessName,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    });

    // 2. Upsert into organizations if applicable
    if (profileData.company || profileData.freelancerBusinessName) {
      await supabase.from('organizations').upsert({
        user_id: userId,
        company_name: profileData.company || profileData.freelancerBusinessName,
        industry: profileData.businessIndustry || profileData.startupIndustry,
        team_size: profileData.businessTeamSize || profileData.enterpriseEmployees,
        updated_at: new Date().toISOString()
      });
    }

    // 3. Upsert into user_preferences
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      workspace_type: profileData.workspaceType,
      role_details: {
        school: profileData.studentSchool,
        class: profileData.studentClass,
        country: profileData.studentCountry,
        department: profileData.enterpriseDepartment,
        stage: profileData.startupStage
      },
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error saving user profile to Supabase database:', err);
  }
}

/** Robust fetch parsing with clear diagnostics */
async function robustFetchJson(url: string, options: RequestInit): Promise<{ success: boolean; data?: any; error?: string }> {
  let targetUrl = url;
  if (url.startsWith('/')) {
    // If the frontend is loaded on Vite standalone port 5173, redirect API calls to Express port 3000
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const apiBase = origin.includes(':5173') ? origin.replace(':5173', ':3000') : origin;
    targetUrl = `${apiBase}${url}`;
  }

  console.log(`[Fetch Trace] URL: ${targetUrl}`, {
    method: options.method,
    headers: options.headers,
    body: options.body
  });

  try {
    const res = await fetch(targetUrl, options);
    console.log(`[Fetch Trace] URL: ${targetUrl}. HTTP Status: ${res.status} ${res.statusText}`);
    
    // Log headers
    const headersObj: Record<string, string> = {};
    res.headers.forEach((val, key) => { headersObj[key] = val; });
    console.log(`[Fetch Trace] URL: ${url}. Headers:`, headersObj);

    const rawText = await res.text();
    console.log(`[Fetch Trace] URL: ${url}. Body:`, rawText);

    if (!rawText || rawText.trim().length === 0) {
      return {
        success: false,
        error: `Server returned an empty response. (HTTP Status: ${res.status})`
      };
    }

    try {
      const parsed = JSON.parse(rawText);
      return { success: true, data: parsed };
    } catch (jsonErr: any) {
      return {
        success: false,
        error: `Invalid JSON response from server. (HTTP Status: ${res.status}). Response text: "${rawText.substring(0, 300)}"`
      };
    }
  } catch (err: any) {
    console.error(`[Fetch Trace Error] URL: ${url}. Exception:`, err);
    return {
      success: false,
      error: `Network request failed: ${err.message}`
    };
  }
}

/** Email Sign Up with Password */
export async function signUpWithPassword(email: string, password: string, name?: string): Promise<{ success: boolean; user?: AuthUser; needsVerification?: boolean; message?: string }> {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name || '' }
      }
    });
    if (error) return { success: false, message: error.message };
    if (data.user) {
      // Immediately sign out to prevent auto-login
      await supabase.auth.signOut().catch(() => {});
      setLocalSession(null);

      // Trigger custom OTP backend email dispatch via robustFetchJson
      const otpRes = await robustFetchJson('/api/v1/auth/custom-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: data.user.id })
      });

      if (!otpRes.success || !otpRes.data?.success) {
        const errorMsg = otpRes.error || (otpRes.data && otpRes.data.error) || 'Failed to dispatch email verification.';
        return { success: false, message: errorMsg };
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: name || data.user.user_metadata?.full_name || '',
        provider: 'email',
        createdAt: new Date().toISOString()
      };
      return { success: true, user, needsVerification: true };
    }
  }
  return {
    success: false,
    message: 'Supabase URL/Key environment variables are required for email authentication.'
  };
}

/** Email Sign In with Password */
export async function signInWithPassword(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const res = await robustFetchJson('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.success || !res.data?.success) {
    return { success: false, message: res.error || (res.data && res.data.error) || 'Login failed.' };
  }

  const { session, user } = res.data;
  if (supabase && session) {
    const { error: setSessionErr } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
    if (setSessionErr) {
      console.error('[Supabase setSession Error]:', setSessionErr.message);
    }
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    provider: 'email',
    createdAt: new Date().toISOString()
  };
  setLocalSession(authUser);
  return { success: true, user: authUser };
}

/** Send Password Reset Email (OTP) */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message?: string }> {
  const otpRes = await robustFetchJson('/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!otpRes.success || !otpRes.data?.success) {
    const errorMsg = (otpRes.data && otpRes.data.error) || otpRes.error || 'Failed to dispatch password recovery code.';
    return { success: false, message: errorMsg };
  }
  return { success: true, message: '6-digit password recovery code sent to ' + email };
}

/** Verify Signup OTP Code using Custom OTP Backend */
export async function verifySignupOtp(email: string, token: string): Promise<{ success: boolean; message?: string }> {
  const otpRes = await robustFetchJson('/api/v1/auth/custom-otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code: token, type: 'signup' })
  });
  if (!otpRes.success || !otpRes.data?.success) {
    const errorMsg = otpRes.error || (otpRes.data && otpRes.data.error) || 'Invalid or expired verification code.';
    return { success: false, message: errorMsg };
  }
  return { success: true };
}

/** Verify Recovery OTP Code using Custom OTP Backend */
export async function verifyRecoveryOtp(email: string, token: string): Promise<{ success: boolean; message?: string }> {
  const otpRes = await robustFetchJson('/api/v1/auth/custom-otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code: token, type: 'recovery' })
  });
  if (!otpRes.success || !otpRes.data?.success) {
    const errorMsg = otpRes.error || (otpRes.data && otpRes.data.error) || 'Invalid or expired recovery code.';
    return { success: false, message: errorMsg };
  }
  return { success: true };
}

/** Update User Password using Custom OTP Backend */
export async function updateUserPassword(password: string, email?: string, code?: string): Promise<{ success: boolean; message?: string }> {
  const otpRes = await robustFetchJson('/api/v1/auth/custom-otp/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password })
  });
  if (!otpRes.success || !otpRes.data?.success) {
    const errorMsg = otpRes.error || (otpRes.data && otpRes.data.error) || 'Failed to update password.';
    return { success: false, message: errorMsg };
  }
  return { success: true };
}

/** Resend Signup OTP Code using Custom OTP Backend */
export async function resendSignupOtp(email: string, isRecovery: boolean = false): Promise<{ success: boolean; message?: string }> {
  const otpRes = await robustFetchJson('/api/v1/auth/custom-otp/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, isRecovery })
  });
  if (!otpRes.success || !otpRes.data?.success) {
    const errorMsg = otpRes.error || (otpRes.data && otpRes.data.error) || 'Failed to dispatch code.';
    return { success: false, message: errorMsg };
  }
  return { success: true, message: otpRes.data.message || 'Verification code sent.' };
}

/** OAuth Sign In (Google, GitHub, Apple) */
export async function signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  console.info('[OAuth Debug] signInWithOAuth called. Provider:', provider);
  console.info('[OAuth Debug] supabase client exists:', !!supabase);
  console.info('[OAuth Debug] isSupabaseConfigured:', isSupabaseConfigured);
  console.info('[OAuth Debug] supabaseUrl:', supabaseUrl);
  console.info('[OAuth Debug] supabaseAnonKey length:', supabaseAnonKey.length, 'starts with:', supabaseAnonKey.substring(0, 10));

  if (typeof window !== 'undefined') {
    const currentHash = window.location.hash.replace('#', '') || 'focus';
    console.info('[OAuth Debug] Caching redirect mode in localStorage:', currentHash);
    localStorage.setItem('contril_auth_redirect_mode', currentHash);
  }

  if (!supabase) {
    const msg = 'Supabase client is NULL. Cannot initiate OAuth. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
    console.error('[OAuth Debug]', msg);
    return { success: false, message: msg };
  }

  const callbackUrl = `${authDomain || (typeof window !== 'undefined' ? window.location.origin : '')}/auth/callback`;
  console.info('[OAuth Debug] Calling supabase.auth.signInWithOAuth. redirectTo:', callbackUrl);

  try {
    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl
      }
    });

    console.info('[OAuth Debug] signInWithOAuth returned:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('[OAuth Debug] OAuth error:', result.error);
      console.error('[OAuth Debug] OAuth error message:', result.error.message);
      console.error('[OAuth Debug] OAuth error stack:', result.error.stack);
      return { success: false, message: result.error.message };
    }

    if (result.data?.url) {
      console.info('[OAuth Debug] OAuth redirect URL generated:', result.data.url);
    } else {
      console.warn('[OAuth Debug] No redirect URL in result. Full data:', result.data);
    }

    return { success: true };
  } catch (err: any) {
    console.error('[OAuth Debug] signInWithOAuth EXCEPTION:', err);
    console.error('[OAuth Debug] Exception stack:', err?.stack);
    return { success: false, message: err?.message || 'Unexpected OAuth exception' };
  }
}

export function logoutUser() {
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
  setLocalSession(null);
  localStorage.removeItem('contril_onboarding_completed');
}


