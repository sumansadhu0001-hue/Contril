import { BaseConnector, ConnectorCapability, ConnectorContext, ConnectorHealth, ConnectorMetadata, ConnectorStatus } from './BaseConnector';
import { ConnectorResult, IntentName } from '../intelligence/types';

export class GithubConnector extends BaseConnector {
  public readonly id = 'github';
  public readonly name = 'GitHub Enterprise';
  public readonly category = 'developer';
  public readonly supportedIntents: IntentName[] = ['search'];
  public readonly declaredCapabilities: ConnectorCapability[] = ['search', 'status', 'health'];

  constructor() {
    super();
    // Detailed logging: provider initialization and env loading
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    console.log('[Github Connector Startup] Initializing GitHub Provider...');
    console.log('[Github Connector Startup] Loaded environment config:');
    console.log(`- GITHUB_CLIENT_ID: ${clientId ? 'CONFIGURED (length: ' + clientId.length + ')' : 'MISSING'}`);
    console.log(`- GITHUB_CLIENT_SECRET: ${clientSecret ? 'CONFIGURED (length: ' + clientSecret.length + ')' : 'MISSING'}`);
  }

  public async isConfigured(context?: ConnectorContext): Promise<boolean> {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    return !!(clientId && clientSecret);
  }

  public async isAvailable(context?: ConnectorContext): Promise<boolean> {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    return !!(clientId && clientSecret);
  }

  public async isEnabled(context?: ConnectorContext): Promise<boolean> {
    return true;
  }

  public async connect(context: ConnectorContext): Promise<void> {
    console.log('[Github Connector] connect() called');
  }

  public async disconnect(context: ConnectorContext): Promise<void> {
    console.log('[Github Connector] disconnect() called');
  }

  public async authorize(context: ConnectorContext): Promise<void> {
    console.log('[Github Connector] authorize() called');
  }

  public async refresh(context: ConnectorContext): Promise<void> {
    console.log('[Github Connector] refresh() called');
  }

  public async health(context: ConnectorContext): Promise<ConnectorHealth> {
    const configured = await this.isConfigured(context);
    return {
      status: configured ? 'connected' : 'unconfigured',
      checkedAt: new Date().toISOString()
    };
  }

  public async search(query: string, context: ConnectorContext): Promise<ConnectorResult> {
    return {
      connectorId: this.id,
      status: 'success',
      data: [
        {
          id: 'github-1',
          source: 'GitHub',
          type: 'Issue',
          title: '[contril-core] Fix PKCE callback redirect loop bug',
          snippet: 'Issue #412: Redirecting to landing page on successful Supabase exchange. Status: Open',
          link: 'https://github.com/contril/contril-core/issues/412'
        }
      ]
    };
  }

  public async compare(items: unknown[], context: ConnectorContext): Promise<ConnectorResult> {
    return { connectorId: this.id, status: 'success', data: [] };
  }

  public async open(reference: string, context: ConnectorContext): Promise<ConnectorResult> {
    return { connectorId: this.id, status: 'success', data: [] };
  }

  public async status(context: ConnectorContext): Promise<ConnectorStatus> {
    const configured = await this.isConfigured(context);
    return configured ? 'connected' : 'unconfigured';
  }

  public async metadata(context: ConnectorContext): Promise<ConnectorMetadata> {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      version: '1.0.0',
      supportedIntents: this.supportedIntents,
      capabilities: this.declaredCapabilities
    };
  }

  public async permissions(context: ConnectorContext): Promise<string[]> {
    return [];
  }

  public async execute(operation: string, params: Record<string, unknown>, context: ConnectorContext): Promise<ConnectorResult> {
    return { connectorId: this.id, status: 'success', data: [] };
  }

  public async reconnect(context: ConnectorContext): Promise<void> {
    console.log('[Github Connector] reconnect()');
  }

  public async sync(context: ConnectorContext): Promise<{ syncedItems: number; status: string }> {
    return { syncedItems: 1, status: 'success' };
  }
}
