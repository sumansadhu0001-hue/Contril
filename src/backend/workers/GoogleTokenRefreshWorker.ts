import { supabaseAdmin } from '../database/supabaseAdmin';
import { EncryptionHelper } from '../security/EncryptionHelper';
import { OutlookAuthService } from '../integrations/outlookAuthService';

export class GoogleTokenRefreshWorker {
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Run one cycle of the token refresh scan
   */
  public static async scanAndRefresh(): Promise<void> {
    try {
      console.log('[GoogleTokenRefreshWorker] Scanning database for active OAuth sessions nearing expiration...');

      // Find all authorized credentials
      const { data: records, error } = await supabaseAdmin
        .from('connector_authorizations')
        .select('*')
        .eq('status', 'authorized');

      if (error) throw error;
      if (!records || records.length === 0) {
        console.log('[GoogleTokenRefreshWorker] No active OAuth connections found.');
        return;
      }

      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      let refreshCount = 0;

      for (const record of records) {
        if (!record.expires_at) continue;

        const expiry = new Date(record.expires_at).getTime();
        // Refresh if expired or expiring within 10 minutes
        if (now >= expiry - tenMinutes) {
          console.log(`[GoogleTokenRefreshWorker] Token for workspace ${record.workspace_id} (${record.connector_id}) expiring soon/expired. Initiating refresh...`);
          
          if (!record.refresh_token_encrypted) {
            console.warn(`[GoogleTokenRefreshWorker] Missing refresh token for workspace ${record.workspace_id}. Marking as expired.`);
            await supabaseAdmin
              .from('connector_authorizations')
              .update({ status: 'expired', updated_at: new Date().toISOString() })
              .eq('id', record.id);
            continue;
          }

          const decryptedRefresh = EncryptionHelper.decrypt(record.refresh_token_encrypted);
          if (!decryptedRefresh) {
            console.error(`[GoogleTokenRefreshWorker] Failed to decrypt refresh token for workspace ${record.workspace_id}.`);
            continue;
          }

          let success = false;
          if (record.connector_id === 'google') {
            success = await this.refreshSessionToken(record.id, record.workspace_id, decryptedRefresh);
          } else if (record.connector_id === 'microsoft_outlook') {
            const refreshed = await OutlookAuthService.refreshAccessToken(record.id, record.workspace_id, decryptedRefresh);
            success = Boolean(refreshed);
          }

          if (success) refreshCount++;
        }
      }

      console.log(`[GoogleTokenRefreshWorker] Scan complete. Refreshed ${refreshCount} sessions.`);
    } catch (err: any) {
      console.error('[GoogleTokenRefreshWorker Error] Scan failed:', err.message || err);
    }
  }

  /**
   * Exchange the refresh token with Google
   */
  private static async refreshSessionToken(recordId: string, workspaceId: string, refreshToken: string): Promise<boolean> {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

      if (!clientId || !clientSecret || clientId.includes('CONTRIL_') || clientSecret.includes('CONTRIL_')) {
        console.warn(`[GoogleTokenRefreshWorker] Client credentials not configured. Simulating fallback refresh token exchange.`);
        const mockToken = 'mock_google_access_token_dev_refreshed_' + Date.now();
        
        await supabaseAdmin
          .from('connector_authorizations')
          .update({
            access_token_encrypted: EncryptionHelper.encrypt(mockToken),
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId);
        return true;
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const encryptedAccess = EncryptionHelper.encrypt(data.access_token);
        const expiresAtDate = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

        const updatePayload: any = {
          access_token_encrypted: encryptedAccess,
          expires_at: expiresAtDate,
          status: 'authorized',
          updated_at: new Date().toISOString()
        };

        // If Google rotated the refresh token, save the new one
        if (data.refresh_token) {
          updatePayload.refresh_token_encrypted = EncryptionHelper.encrypt(data.refresh_token);
        }

        const { error } = await supabaseAdmin
          .from('connector_authorizations')
          .update(updatePayload)
          .eq('id', recordId);

        if (error) throw error;

        console.log(`[GoogleTokenRefreshWorker] Successfully refreshed tokens in DB for workspace ${workspaceId}.`);
        return true;
      } else {
        const errText = await response.text();
        console.error(`[GoogleTokenRefreshWorker] Google token endpoint rejected token exchange:`, errText);
        
        // Mark as revoked/expired if the grant is invalid (e.g. user revoked access)
        if (errText.includes('invalid_grant')) {
          await supabaseAdmin
            .from('connector_authorizations')
            .update({ status: 'revoked', updated_at: new Date().toISOString() })
            .eq('id', recordId);
        }
      }
    } catch (e: any) {
      console.error(`[GoogleTokenRefreshWorker] Exception refreshing token for record ${recordId}:`, e.message || e);
    }
    return false;
  }

  /**
   * Start recurring background worker scan
   * Default interval: 5 minutes
   */
  public static start(intervalMs: number = 5 * 60 * 1000): void {
    if (this.intervalId) return;

    console.log(`[GoogleTokenRefreshWorker] Initializing persistent worker interval loop (${intervalMs / 1000}s)...`);
    
    // Run an initial scan on boot asynchronously
    this.scanAndRefresh().catch(() => {});

    this.intervalId = setInterval(() => {
      this.scanAndRefresh().catch(() => {});
    }, intervalMs);
  }

  /**
   * Stop background worker scan
   */
  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[GoogleTokenRefreshWorker] Background worker interval loop stopped.');
    }
  }
}
