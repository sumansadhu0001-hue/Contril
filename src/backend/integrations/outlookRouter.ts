import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../database/supabaseAdmin';
import { SessionResolver } from '../database/SessionResolver';
import { EncryptionHelper } from '../security/EncryptionHelper';
import { OutlookAuthService } from './outlookAuthService';

const router = Router();

// 1. Save / Complete Microsoft Graph integration
router.post('/save', async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, expiresAt } = req.body;
    if (!accessToken) {
      return res.status(400).json({ success: false, error: 'AccessToken is required.' });
    }

    const { workspaceId } = await SessionResolver.resolve(req);
    const expiresAtMs = expiresAt || (Date.now() + 3600000);

    const success = await OutlookAuthService.saveTokens(workspaceId, accessToken, refreshToken || null, expiresAtMs);
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to write tokens to database.' });
    }

    console.log('[Outlook Router] Successfully stored Microsoft Graph credentials in database.');
    return res.json({ success: true, message: 'Microsoft integration successfully configured.' });
  } catch (error: any) {
    console.error('[Outlook Router Save Error]', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to persist credentials.' });
  }
});

// 2. Microsoft code exchange callback fallback helper
router.post('/oauth/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Authorization code is required.' });

    const { workspaceId } = await SessionResolver.resolve(req);
    const result = await OutlookAuthService.exchangeCodeForSession(workspaceId, code);
    
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Status Check
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = await SessionResolver.resolve(req);

    const { data: record, error } = await supabaseAdmin
      .from('connector_authorizations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'microsoft_outlook')
      .maybeSingle();

    if (error) throw error;
    if (!record) {
      return res.json({ success: true, isConnected: false, status: 'disconnected' });
    }

    const expiry = record.expires_at ? new Date(record.expires_at).getTime() : 0;
    const now = Date.now();

    let accessToken = '';
    if (now >= expiry - 300000 && record.refresh_token_encrypted) {
      console.log('[Outlook Router Status] Microsoft token expiring/expired. Refreshing...');
      const refreshToken = EncryptionHelper.decrypt(record.refresh_token_encrypted);
      const refreshed = await OutlookAuthService.refreshAccessToken(record.id, workspaceId, refreshToken);
      if (refreshed) {
        accessToken = refreshed;
      } else {
        return res.json({ success: true, isConnected: false, status: 'expired' });
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
      expiresAt: record.expires_at
    });
  } catch (error: any) {
    console.error('[Outlook Router Status Error]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Disconnect Microsoft Integration
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = await SessionResolver.resolve(req);
    console.log(`[Outlook Disconnect] Removing credentials for workspace: ${workspaceId}`);

    const { error } = await supabaseAdmin
      .from('connector_authorizations')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'microsoft_outlook');

    if (error) throw error;

    return res.json({ success: true, message: 'Microsoft integration disconnected.' });
  } catch (error: any) {
    console.error('[Outlook Disconnect Error]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Proxy token getter
router.get('/sync', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = await SessionResolver.resolve(req);

    const { data: record } = await supabaseAdmin
      .from('connector_authorizations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'microsoft_outlook')
      .maybeSingle();

    if (!record) {
      return res.status(401).json({ success: false, error: 'Microsoft integration not connected.' });
    }

    let accessToken = EncryptionHelper.decrypt(record.access_token_encrypted);
    const expiry = record.expires_at ? new Date(record.expires_at).getTime() : 0;

    if (Date.now() >= expiry - 300000 && record.refresh_token_encrypted) {
      console.log('[Outlook Proxy Sync] Token expired. Launching auto-refresh...');
      const refreshToken = EncryptionHelper.decrypt(record.refresh_token_encrypted);
      const refreshed = await OutlookAuthService.refreshAccessToken(record.id, workspaceId, refreshToken);
      if (refreshed) {
        accessToken = refreshed;
      }
    }

    if (!accessToken) {
      return res.status(401).json({ success: false, error: 'Microsoft access token expired.' });
    }

    return res.json({
      success: true,
      accessToken
    });
  } catch (error: any) {
    console.error('[Outlook Proxy Sync Error]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
