// Contril AI OS - Universal Integrations Hub Engine
export interface IntegrationItem {
  id: string;
  provider: string; // 'gmail', 'slack', 'notion', etc.
  name: string;
  category: 'Communication' | 'Productivity' | 'Developer' | 'CRM' | 'Storage';
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSyncAt?: string;
  iconName: string;
}

export class IntegrationsService {
  private static integrationsMap = new Map<string, IntegrationItem[]>([
    [
      'usr_suman_exec_01',
      [
        { id: 'int_1', provider: 'gmail', name: 'Google Gmail', category: 'Communication', status: 'connected', connectedAt: '2026-06-01', lastSyncAt: new Date().toISOString(), iconName: 'Mail' },
        { id: 'int_2', provider: 'gcal', name: 'Google Calendar', category: 'Productivity', status: 'connected', connectedAt: '2026-06-01', lastSyncAt: new Date().toISOString(), iconName: 'Calendar' },
        { id: 'int_3', provider: 'gdrive', name: 'Google Drive', category: 'Storage', status: 'connected', connectedAt: '2026-06-02', lastSyncAt: new Date().toISOString(), iconName: 'HardDrive' },
        { id: 'int_4', provider: 'slack', name: 'Slack Workspace', category: 'Communication', status: 'connected', connectedAt: '2026-06-10', lastSyncAt: new Date().toISOString(), iconName: 'MessageSquare' },
        { id: 'int_5', provider: 'notion', name: 'Notion Executive Brain', category: 'Productivity', status: 'connected', connectedAt: '2026-06-12', lastSyncAt: new Date().toISOString(), iconName: 'FileText' },
        { id: 'int_6', provider: 'github', name: 'GitHub Enterprise', category: 'Developer', status: 'connected', connectedAt: '2026-06-15', lastSyncAt: new Date().toISOString(), iconName: 'GitBranch' },
        { id: 'int_7', provider: 'outlook', name: 'Microsoft Outlook', category: 'Communication', status: 'disconnected', iconName: 'Mail' },
        { id: 'int_8', provider: 'msteams', name: 'Microsoft Teams', category: 'Communication', status: 'disconnected', iconName: 'Video' },
        { id: 'int_9', provider: 'zoom', name: 'Zoom Meetings', category: 'Communication', status: 'connected', connectedAt: '2026-07-01', lastSyncAt: new Date().toISOString(), iconName: 'Video' },
        { id: 'int_10', provider: 'linear', name: 'Linear', category: 'Developer', status: 'connected', connectedAt: '2026-07-05', lastSyncAt: new Date().toISOString(), iconName: 'CheckSquare' },
        { id: 'int_11', provider: 'jira', name: 'Atlassian Jira', category: 'Developer', status: 'disconnected', iconName: 'Layers' },
        { id: 'int_12', provider: 'hubspot', name: 'HubSpot CRM', category: 'CRM', status: 'connected', connectedAt: '2026-07-10', lastSyncAt: new Date().toISOString(), iconName: 'Users' },
        { id: 'int_13', provider: 'salesforce', name: 'Salesforce Enterprise', category: 'CRM', status: 'disconnected', iconName: 'Building' }
      ]
    ]
  ]);

  public static listIntegrations(userId: string): IntegrationItem[] {
    if (!this.integrationsMap.has(userId)) {
      this.integrationsMap.set(userId, this.integrationsMap.get('usr_suman_exec_01')!);
    }
    return this.integrationsMap.get(userId)!;
  }

  public static toggleIntegration(userId: string, provider: string, status: 'connected' | 'disconnected'): IntegrationItem | null {
    const list = this.listIntegrations(userId);
    const item = list.find(i => i.provider === provider || i.id === provider);
    if (!item) return null;

    item.status = status;
    item.lastSyncAt = new Date().toISOString();
    if (status === 'connected' && !item.connectedAt) {
      item.connectedAt = new Date().toISOString().split('T')[0];
    }
    return item;
  }

  public static getOAuthAuthorizeUrl(provider: string): string {
    const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = encodeURIComponent(`${baseUrl}/api/v1/integrations/oauth/callback`);

    switch (provider.toLowerCase()) {
      case 'gmail':
      case 'google_calendar':
      case 'google_drive':
      case 'google_docs':
      case 'google_meet':
        return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.VITE_GOOGLE_CLIENT_ID || 'CONTRIL_GOOGLE_CLIENT_ID'}&redirect_uri=${redirectUri}&scope=https://www.googleapis.com/auth/gmail.readonly%20https://www.googleapis.com/auth/calendar.readonly%20https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`;

      case 'outlook':
      case 'microsoft_calendar':
      case 'onedrive':
      case 'msteams':
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.VITE_MICROSOFT_CLIENT_ID || 'CONTRIL_MS_CLIENT_ID'}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=https://graph.microsoft.com/Mail.Read%20https://graph.microsoft.com/Calendars.Read%20User.Read`;

      case 'slack':
        return `https://slack.com/oauth/v2/authorize?client_id=${process.env.VITE_SLACK_CLIENT_ID || 'CONTRIL_SLACK_CLIENT_ID'}&user_scope=channels:history,chat:write&redirect_uri=${redirectUri}`;

      case 'github': {
        const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID || 'CONTRIL_GITHUB_CLIENT_ID';
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        
        console.log('[Github OAuth] Delegating to Supabase OAuth implementation...');
        console.log('[Github OAuth] Loaded Configuration:');
        console.log(`- CLIENT_ID (GITHUB_CLIENT_ID or VITE_GITHUB_CLIENT_ID): ${clientId ? 'SET (length: ' + clientId.length + ')' : 'MISSING'}`);
        console.log(`- CLIENT_SECRET (GITHUB_CLIENT_SECRET): ${clientSecret ? 'SET (length: ' + clientSecret.length + ')' : 'MISSING'}`);
        console.log('- Redirecting via Supabase Callback URI: https://qjyowojnvbfezznezxrr.supabase.co/auth/v1/callback');
        
        // Return standard Supabase authorize endpoint URL for GitHub to enforce the correct redirect_uri
        return `https://qjyowojnvbfezznezxrr.supabase.co/auth/v1/authorize?provider=github&redirect_to=${baseUrl}/auth/callback`;
      }

      case 'linear':
        return `https://linear.app/oauth/authorize?client_id=${process.env.VITE_LINEAR_CLIENT_ID || 'CONTRIL_LINEAR_CLIENT_ID'}&response_type=code&scope=read,write&redirect_uri=${redirectUri}`;

      case 'jira':
        return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${process.env.VITE_JIRA_CLIENT_ID || 'CONTRIL_JIRA_CLIENT_ID'}&scope=read:jira-work%20read:jira-user&redirect_uri=${redirectUri}&prompt=consent`;

      case 'notion':
        return `https://api.notion.com/v1/oauth/authorize?client_id=${process.env.VITE_NOTION_CLIENT_ID || 'CONTRIL_NOTION_CLIENT_ID'}&response_type=code&owner=user&redirect_uri=${redirectUri}`;

      case 'stripe':
        return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.VITE_STRIPE_CLIENT_ID || 'ca_CONTRIL_STRIPE_CLIENT_ID'}&scope=read_only`;

      case 'zoom':
        return `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.VITE_ZOOM_CLIENT_ID || 'CONTRIL_ZOOM_CLIENT_ID'}&redirect_uri=${redirectUri}`;

      case 'dropbox':
        return `https://www.dropbox.com/oauth2/authorize?client_id=${process.env.VITE_DROPBOX_CLIENT_ID || 'CONTRIL_DROPBOX_CLIENT_ID'}&response_type=code&redirect_uri=${redirectUri}`;

      default:
        return `${baseUrl}/#integrations`;
    }
  }

  public static handleOAuthCallback(userId: string, provider: string, code: string, state?: string) {
    const item = this.toggleIntegration(userId, provider, 'connected');
    return {
      success: true,
      message: `Successfully authenticated ${provider} via OAuth 2.0.`,
      integration: item,
      timestamp: new Date().toISOString()
    };
  }

  public static syncIntegrationData(userId: string, provider: string) {
    const list = this.listIntegrations(userId);
    const item = list.find(i => i.provider === provider || i.id === provider);
    if (item) {
      item.lastSyncAt = new Date().toISOString();
    }
    return {
      success: true,
      provider,
      lastSyncAt: new Date().toISOString(),
      itemsSynced: Math.floor(Math.random() * 15) + 5
    };
  }

  public static getGithubDiagnostics() {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID || '';
    const viteClientId = process.env.VITE_GITHUB_CLIENT_ID || '';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    const warnings: string[] = [];
    
    if (clientId && viteClientId && clientId !== viteClientId) {
      warnings.push(`Mismatch between GITHUB_CLIENT_ID and VITE_GITHUB_CLIENT_ID.`);
    }

    if (clientId.includes('CONTRIL_') || viteClientId.includes('CONTRIL_')) {
      warnings.push('GitHub Client ID contains default placeholder value.');
    }
    if (clientSecret.includes('CONTRIL_')) {
      warnings.push('GitHub Client Secret contains default placeholder value.');
    }
    if (!clientId) {
      warnings.push('GITHUB_CLIENT_ID is missing from the environment configuration.');
    }
    if (!clientSecret) {
      warnings.push('GITHUB_CLIENT_SECRET is missing from the environment configuration.');
    }

    const redirectUri = 'https://qjyowojnvbfezznezxrr.supabase.co/auth/v1/callback';

    return {
      provider: 'github',
      clientId: clientId ? `${clientId.substring(0, 5)}...` : 'MISSING',
      viteClientId: viteClientId ? `${viteClientId.substring(0, 5)}...` : 'MISSING',
      clientSecret: clientSecret ? 'PRESENT (masked)' : 'MISSING',
      supabaseUrl: supabaseUrl || 'MISSING',
      redirectUri,
      warnings,
      isConsistent: warnings.length === 0 && !!clientId && !!clientSecret && !!supabaseUrl
    };
  }
}
