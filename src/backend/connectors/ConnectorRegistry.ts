import { BaseConnector, ConnectorCapability } from './BaseConnector';

export class ConnectorRegistry {
  private readonly connectors = new Map<string, BaseConnector>();

  public register(connector: BaseConnector): void {
    this.connectors.set(connector.id, connector);
  }

  public get(id: string): BaseConnector | null {
    return this.connectors.get(id) || null;
  }

  public list(): BaseConnector[] {
    return [...this.connectors.values()];
  }

  public getByCategory(category: 'workspace' | 'shopping' | 'food' | 'travel' | 'developer' | 'finance' | 'future'): BaseConnector[] {
    return this.list().filter(c => c.category === category);
  }

  public getByCapability(capability: ConnectorCapability): BaseConnector[] {
    return this.list().filter(c => c.supportsCapability(capability));
  }

  public getSupportedCapabilities(): ConnectorCapability[] {
    const all = new Set<ConnectorCapability>();
    this.list().forEach(c => {
      c.getCapabilities().forEach(cap => all.add(cap));
    });
    return Array.from(all);
  }
}

export const connectorRegistry = new ConnectorRegistry();

// Auto-register default connectors at application startup
import { GithubConnector } from './GithubConnector';
console.log('[Connector Startup] Auto-registering GithubConnector into ConnectorRegistry');
connectorRegistry.register(new GithubConnector());
