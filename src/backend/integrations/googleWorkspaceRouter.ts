import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../database/supabaseAdmin';
import { SessionResolver } from '../database/SessionResolver';
import { EncryptionHelper } from '../security/EncryptionHelper';

const router = Router();

// 1. Save / Update Google Workspace credentials
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, expiresAt, email, scopes } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: 'AccessToken is required' });
    }

    const { userId, workspaceId } = await SessionResolver.resolve(req);
    console.log(`[Google OAuth Save] Saving tokens for user: ${userId}, workspace: ${workspaceId}`);

    const accessTokenEncrypted = EncryptionHelper.encrypt(accessToken);
    const refreshTokenEncrypted = refreshToken ? EncryptionHelper.encrypt(refreshToken) : null;
    const expiresAtDate = new Date(expiresAt || (Date.now() + 3600000)).toISOString();

    // Check if configuration already exists
    const { data: existing } = await supabaseAdmin
      .from('connector_authorizations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'google')
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing record (retain old refresh token if new one is missing)
      const updateData: any = {
        access_token_encrypted: accessTokenEncrypted,
        expires_at: expiresAtDate,
        granted_scopes: scopes || existing.granted_scopes,
        status: 'authorized',
        updated_at: new Date().toISOString()
      };
      if (refreshTokenEncrypted) {
        updateData.refresh_token_encrypted = refreshTokenEncrypted;
      }

      result = await supabaseAdmin
        .from('connector_authorizations')
        .update(updateData)
        .eq('workspace_id', workspaceId)
        .eq('connector_id', 'google')
        .select();
    } else {
      // Insert new record
      result = await supabaseAdmin
        .from('connector_authorizations')
        .insert({
          workspace_id: workspaceId,
          connector_id: 'google',
          access_token_encrypted: accessTokenEncrypted,
          refresh_token_encrypted: refreshTokenEncrypted || '',
          expires_at: expiresAtDate,
          granted_scopes: scopes || [],
          status: 'authorized'
        })
        .select();
    }

    if (result.error) throw result.error;

    console.log('[Google OAuth Save] Successfully stored encrypted OAuth credentials in database.');
    return res.json({ success: true, message: 'Google credentials persisted securely.' });
  } catch (error: any) {
    console.error('[Google OAuth Save Error]', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to persist credentials.' });
  }
});

// Helper: Perform inline refresh
async function refreshAccessToken(workspaceId: string, refreshTokenEncrypted: string): Promise<string | null> {
  try {
    const refreshToken = EncryptionHelper.decrypt(refreshTokenEncrypted);
    if (!refreshToken) return null;

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    if (!clientId || !clientSecret || clientId.includes('CONTRIL_') || clientSecret.includes('CONTRIL_')) {
      console.warn('[Inline Refresh Fallback] Google credentials not configured. Returning fallback dev access token.');
      const mockToken = 'mock_google_access_token_dev_refreshed_' + Date.now();
      
      await supabaseAdmin
        .from('connector_authorizations')
        .update({
          access_token_encrypted: EncryptionHelper.encrypt(mockToken),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('workspace_id', workspaceId)
        .eq('connector_id', 'google');
        
      return mockToken;
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
      const newAccessToken = data.access_token;
      
      await supabaseAdmin
        .from('connector_authorizations')
        .update({
          access_token_encrypted: EncryptionHelper.encrypt(newAccessToken),
          expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('workspace_id', workspaceId)
        .eq('connector_id', 'google');

      return newAccessToken;
    }
  } catch (err) {
    console.error('[Inline Refresh Error]', err);
  }
  return null;
}

// 2. Fetch Google Workspace connection health/status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = await SessionResolver.resolve(req);

    const { data: record, error } = await supabaseAdmin
      .from('connector_authorizations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'google')
      .maybeSingle();

    if (error) throw error;

    if (!record) {
      return res.json({ success: true, isConnected: false, status: 'disconnected' });
    }

    let isExpired = false;
    if (record.expires_at) {
      const expiry = new Date(record.expires_at).getTime();
      isExpired = Date.now() >= expiry - 300000; // Refresh if expiring within 5 minutes
    }

    let accessToken = '';
    if (isExpired && record.refresh_token_encrypted) {
      console.log('[Google Connection Check] Token nearing expiry. Launching inline refresh...');
      const refreshed = await refreshAccessToken(workspaceId, record.refresh_token_encrypted);
      if (refreshed) {
        accessToken = refreshed;
      } else {
        // Refresh failed, set status to expired
        await supabaseAdmin
          .from('connector_authorizations')
          .update({ status: 'expired' })
          .eq('workspace_id', workspaceId)
          .eq('connector_id', 'google');
        return res.json({ success: true, isConnected: false, status: 'expired', error: 'Token refresh failed.' });
      }
    } else {
      accessToken = EncryptionHelper.decrypt(record.access_token_encrypted);
    }

    if (!accessToken) {
      return res.json({ success: true, isConnected: false, status: 'expired' });
    }

    return res.json({
      success: true,
      isConnected: true,
      status: record.status || 'connected',
      expiresAt: record.expires_at,
      scopes: record.granted_scopes
    });
  } catch (error: any) {
    console.error('[Google Connection Status Error]', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to verify status.' });
  }
});

// 3. Disconnect Google Workspace
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = await SessionResolver.resolve(req);
    console.log(`[Google Disconnect] Removing credentials for workspace: ${workspaceId}`);

    const { error } = await supabaseAdmin
      .from('connector_authorizations')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'google');

    if (error) throw error;

    return res.json({ success: true, message: 'Google Workspace successfully disconnected.' });
  } catch (error: any) {
    console.error('[Google Disconnect Error]', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to disconnect.' });
  }
});

// 4. Backend Proxy Sync endpoint
router.get('/sync', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = await SessionResolver.resolve(req);

    const { data: record } = await supabaseAdmin
      .from('connector_authorizations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'google')
      .maybeSingle();

    if (!record) {
      return res.status(401).json({ success: false, error: 'Google Workspace not connected.' });
    }

    let accessToken = EncryptionHelper.decrypt(record.access_token_encrypted);
    let expiry = record.expires_at ? new Date(record.expires_at).getTime() : 0;

    if (Date.now() >= expiry - 300000 && record.refresh_token_encrypted) {
      console.log('[Google Proxy Sync] Token expired. Launching auto-refresh prior to fetch request...');
      const refreshed = await refreshAccessToken(workspaceId, record.refresh_token_encrypted);
      if (refreshed) {
        accessToken = refreshed;
      }
    }

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'Google access token expired.' });
    }

    return res.json({
      success: true,
      accessToken
    });
  } catch (error: any) {
    console.error('[Google Proxy Sync Error]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
