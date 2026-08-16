// Contril AI OS - Integrations Hub REST Router
import { Router, Request, Response } from 'express';
import { IntegrationsService } from './IntegrationsService';
import { supabaseAdmin } from '../database/supabaseAdmin';
import { SessionResolver } from '../database/SessionResolver';

const router = Router();

// 1. Get All Integrations
router.get('/', (req: Request, res: Response) => {
  const user = (req as any).user;
  const integrations = IntegrationsService.listIntegrations(user?.id || 'usr_suman_exec_01');
  return res.json({ success: true, count: integrations.length, integrations });
});

// 1b. Get status map of all integrations from database
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = await SessionResolver.resolve(req);

    // Get all authorized integrations from the database for this workspace
    const { data: authorizations, error } = await supabaseAdmin
      .from('connector_authorizations')
      .select('connector_id, status')
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    const statusMap: Record<string, { connected: boolean }> = {};

    // 1. Google Workspace (Gmail, Calendar, Drive, Docs, Meet)
    const googleAuth = authorizations?.find(a => a.connector_id === 'google');
    const isGoogleConnected = Boolean(googleAuth && googleAuth.status === 'authorized');
    statusMap['gmail'] = { connected: isGoogleConnected };
    statusMap['google_calendar'] = { connected: isGoogleConnected };
    statusMap['google_drive'] = { connected: isGoogleConnected };
    statusMap['google_docs'] = { connected: isGoogleConnected };
    statusMap['google_meet'] = { connected: isGoogleConnected };

    // 2. Microsoft (Outlook, Calendar, OneDrive, Teams)
    const msAuth = authorizations?.find(a => a.connector_id === 'microsoft_outlook');
    const isMsConnected = Boolean(msAuth && msAuth.status === 'authorized');
    statusMap['outlook'] = { connected: isMsConnected };
    statusMap['microsoft_calendar'] = { connected: isMsConnected };
    statusMap['onedrive'] = { connected: isMsConnected };
    statusMap['msteams'] = { connected: isMsConnected };

    // 3. GitHub
    const githubAuth = authorizations?.find(a => a.connector_id === 'github');
    const isGithubConnected = Boolean(githubAuth && githubAuth.status === 'authorized');
    statusMap['github'] = { connected: isGithubConnected };

    // 4. Slack
    const slackAuth = authorizations?.find(a => a.connector_id === 'slack');
    const isSlackConnected = Boolean(slackAuth && slackAuth.status === 'authorized');
    statusMap['slack'] = { connected: isSlackConnected };

    return res.json({ success: true, status: statusMap });
  } catch (error: any) {
    console.error('[Integrations Status Router Error]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Connect / Disconnect Integration
router.post('/toggle', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { provider, status } = req.body;
  if (!provider) return res.status(400).json({ success: false, error: 'Provider is required.' });

  const updated = IntegrationsService.toggleIntegration(user?.id || 'usr_suman_exec_01', provider, status || 'connected');
  if (!updated) return res.status(404).json({ success: false, error: 'Integration provider not found' });
  return res.json({ success: true, integration: updated });
});

// 3. Generate OAuth Authorization URL
router.get('/oauth/authorize/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  const authUrl = IntegrationsService.getOAuthAuthorizeUrl(provider);
  return res.json({ success: true, provider, authUrl });
});

// 4. Handle OAuth Callback
router.post('/oauth/callback', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { provider, code, state } = req.body;
  if (!provider) return res.status(400).json({ success: false, error: 'Provider is required.' });

  const result = IntegrationsService.handleOAuthCallback(user?.id || 'usr_suman_exec_01', provider, code, state);
  return res.json({ success: true, ...result });
});

// 5. Trigger Real-time Data Sync
router.post('/sync/:provider', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { provider } = req.params;
  const syncResult = IntegrationsService.syncIntegrationData(user?.id || 'usr_suman_exec_01', provider);
  return res.json({ success: true, ...syncResult });
});

// 6. Check Integration Configuration Status
router.get('/config-check/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  const missingSettings: string[] = [];
  let configured = false;

  const getEnv = (key: string): string => process.env[key] || '';

  if (provider.toLowerCase() === 'github') {
    const diagnostics = IntegrationsService.getGithubDiagnostics();
    console.log('[Github Config Check] Running diagnostic audit...');
    console.log(JSON.stringify(diagnostics, null, 2));
    
    return res.json({
      success: true,
      provider,
      configured: diagnostics.isConsistent,
      missingSettings: diagnostics.warnings,
      diagnostics
    });
  } else if (provider.toLowerCase() === 'gmail' || provider.toLowerCase() === 'google') {
    const clientId = getEnv('VITE_GOOGLE_CLIENT_ID');
    if (!clientId || clientId === 'CONTRIL_GOOGLE_CLIENT_ID') missingSettings.push('VITE_GOOGLE_CLIENT_ID');
    configured = missingSettings.length === 0;
  } else if (provider.toLowerCase() === 'slack') {
    const clientId = getEnv('VITE_SLACK_CLIENT_ID');
    if (!clientId || clientId === 'CONTRIL_SLACK_CLIENT_ID') missingSettings.push('VITE_SLACK_CLIENT_ID');
    configured = missingSettings.length === 0;
  } else if (provider.toLowerCase() === 'outlook' || provider.toLowerCase() === 'microsoft') {
    const clientId = getEnv('VITE_MICROSOFT_CLIENT_ID');
    if (!clientId || clientId === 'CONTRIL_MS_CLIENT_ID') missingSettings.push('VITE_MICROSOFT_CLIENT_ID');
    configured = missingSettings.length === 0;
  } else {
    configured = true;
  }

  return res.json({
    success: true,
    provider,
    configured,
    missingSettings
  });
});

export default router;
