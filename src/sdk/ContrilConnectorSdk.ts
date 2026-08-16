import { BaseConnector, ConnectorCapability, ConnectorContext, ConnectorHealth, ConnectorMetadata, ConnectorStatus } from '../backend/connectors/BaseConnector';
import { ConnectorResult, IntentName } from '../backend/intelligence/types';

export abstract class ContrilConnector extends BaseConnector {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly category: 'workspace' | 'shopping' | 'food' | 'travel' | 'developer' | 'finance' | 'future';
  public abstract readonly supportedIntents: IntentName[];
  public abstract readonly declaredCapabilities: ConnectorCapability[];

  public async connect(context: ConnectorContext): Promise<void> {}
  public async disconnect(context: ConnectorContext): Promise<void> {}
  public async authorize(context: ConnectorContext): Promise<void> {}
  public async refresh(context: ConnectorContext): Promise<void> {}
  public async reconnect(context: ConnectorContext): Promise<void> {}

  public async health(context: ConnectorContext): Promise<ConnectorHealth> {
    return { status: 'connected', checkedAt: new Date().toISOString(), latencyMs: 85 };
  }

  public async status(context: ConnectorContext): Promise<ConnectorStatus> {
    return 'connected';
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
    return ['read', 'execute'];
  }

  public abstract search(query: string, context: ConnectorContext): Promise<ConnectorResult>;
  public abstract compare(items: unknown[], context: ConnectorContext): Promise<ConnectorResult>;
  public abstract open(reference: string, context: ConnectorContext): Promise<ConnectorResult>;
  public abstract execute(operation: string, params: Record<string, unknown>, context: ConnectorContext): Promise<ConnectorResult>;
  public async sync(context: ConnectorContext): Promise<{ syncedItems: number; status: string }> {
    return { syncedItems: 10, status: 'synced' };
  }
}
