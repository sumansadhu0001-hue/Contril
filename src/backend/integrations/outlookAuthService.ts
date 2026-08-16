import { supabaseAdmin } from '../database/supabaseAdmin';
import { EncryptionHelper } from '../security/EncryptionHelper';

export class OutlookAuthService {
  private static getMicrosoftCredentials() {
    const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.VITE_MICROSOFT_CLIENT_ID || '';
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
    const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
    // Use configured redirect URI or fallback to auth callback path
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;

    return { clientId, clientSecret, tenantId, redirectUri };
  }

  /**
   * Save Microsoft access and refresh tokens to database
   */
  public static async saveTokens(workspaceId: string, accessToken: string, refreshToken: string | null, expiresAt: number): Promise<boolean> {
    try {
      const accessTokenEncrypted = EncryptionHelper.encrypt(accessToken);
      const refreshTokenEncrypted = refreshToken ? EncryptionHelper.encrypt(refreshToken) : null;
      const expiresAtDate = new Date(expiresAt).toISOString();

      const { data: existing } = await supabaseAdmin
        .from('connector_authorizations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('connector_id', 'microsoft_outlook')
        .maybeSingle();

      if (existing) {
        const updatePayload: any = {
          access_token_encrypted: accessTokenEncrypted,
          expires_at: expiresAtDate,
          status: 'authorized',
          updated_at: new Date().toISOString()
        };
        if (refreshTokenEncrypted) {
          updatePayload.refresh_token_encrypted = refreshTokenEncrypted;
        }

        const { error } = await supabaseAdmin
          .from('connector_authorizations')
          .update(updatePayload)
          .eq('workspace_id', workspaceId)
          .eq('connector_id', 'microsoft_outlook');
          
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from('connector_authorizations')
          .insert({
            workspace_id: workspaceId,
            connector_id: 'microsoft_outlook',
            access_token_encrypted: accessTokenEncrypted,
            refresh_token_encrypted: refreshTokenEncrypted || '',
            expires_at: expiresAtDate,
            status: 'authorized'
          });

        if (error) throw error;
      }

      return true;
    } catch (e: any) {
      console.error('[OutlookAuthService] Failed to save Microsoft tokens:', e.message || e);
      return false;
    }
  }

  /**
   * Exchange Microsoft authorization code for tokens
   */
  public static async exchangeCodeForSession(workspaceId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { clientId, clientSecret, tenantId, redirectUri } = this.getMicrosoftCredentials();

      if (!clientId || !clientSecret || clientId.includes('CONTRIL_')) {
        console.warn('[OutlookAuthService] Missing MS Credentials. Returning mock connection tokens.');
        const mockAccess = 'mock_microsoft_access_token_dev_' + Date.now();
        const mockRefresh = 'mock_microsoft_refresh_token_dev_' + Date.now();
        await this.saveTokens(workspaceId, mockAccess, mockRefresh, Date.now() + 3600000);
        return { success: true };
      }

      const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Microsoft code exchange failed: ${errText}`);
      }

      const data = await res.json();
      const expiresAt = Date.now() + (data.expires_in * 1000);
      await this.saveTokens(workspaceId, data.access_token, data.refresh_token, expiresAt);

      return { success: true };
    } catch (err: any) {
      console.error('[OutlookAuthService] OAuth Code Exchange Exception:', err);
      return { success: false, error: err.message || 'OAuth code exchange failed.' };
    }
  }

  /**
   * Silently refresh Microsoft Access Token
   */
  public static async refreshAccessToken(recordId: string, workspaceId: string, refreshToken: string): Promise<string | null> {
    try {
      const { clientId, clientSecret, tenantId } = this.getMicrosoftCredentials();

      if (!clientId || !clientSecret || clientId.includes('CONTRIL_')) {
        console.warn('[OutlookAuthService] Missing credentials. Simulating refreshed Microsoft Graph token.');
        const mockAccess = 'mock_microsoft_access_token_dev_refreshed_' + Date.now();
        
        await supabaseAdmin
          .from('connector_authorizations')
          .update({
            access_token_encrypted: EncryptionHelper.encrypt(mockAccess),
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId);
        return mockAccess;
      }

      const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const encryptedAccess = EncryptionHelper.encrypt(data.access_token);
        const expiresAtDate = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

        const updatePayload: any = {
          access_token_encrypted: encryptedAccess,
          expires_at: expiresAtDate,
          status: 'authorized',
          updated_at: new Date().toISOString()
        };

        if (data.refresh_token) {
          updatePayload.refresh_token_encrypted = EncryptionHelper.encrypt(data.refresh_token);
        }

        await supabaseAdmin
          .from('connector_authorizations')
          .update(updatePayload)
          .eq('id', recordId);

        console.log(`[OutlookAuthService] Silent token refresh succeeded for workspace ${workspaceId}.`);
        return data.access_token;
      } else {
        const errText = await res.text();
        console.error('[OutlookAuthService] Microsoft Graph refresh failed:', errText);
        
        if (errText.includes('invalid_grant')) {
          await supabaseAdmin
            .from('connector_authorizations')
            .update({ status: 'revoked', updated_at: new Date().toISOString() })
            .eq('id', recordId);
        }
      }
    } catch (e: any) {
      console.error('[OutlookAuthService] Silent token refresh exception:', e);
    }
    return null;
  }
}
