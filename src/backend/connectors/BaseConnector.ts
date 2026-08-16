import { ConnectorResult, IntentName } from '../intelligence/types';

export type ConnectorStatus = 'unconfigured' | 'connected' | 'degraded' | 'disconnected';

export type ConnectorCapability = 
  | 'search' 
  | 'compare' 
  | 'open' 
  | 'authorize' 
  | 'sync' 
  | 'notifications' 
  | 'execute' 
  | 'status' 
  | 'health' 
  | 'metadata' 
  | 'background_tasks';

export interface ConnectorContext {
  workspaceId: string;
  userId: string;
  permissions: string[];
}

export interface ConnectorHealth {
  status: ConnectorStatus;
  checkedAt: string;
  error?: string;
  latencyMs?: number;
}

export interface ConnectorMetadata {
  id: string;
  name: string;
  category: 'workspace' | 'shopping' | 'food' | 'travel' | 'developer' | 'finance' | 'future';
  version: string;
  supportedIntents: IntentName[];
  capabilities: ConnectorCapability[];
  iconUrl?: string;
  description?: string;
}

export abstract class BaseConnector {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly category: 'workspace' | 'shopping' | 'food' | 'travel' | 'developer' | 'finance' | 'future';
  public abstract readonly supportedIntents: IntentName[];
  public abstract readonly declaredCapabilities: ConnectorCapability[];

  public getCapabilities(): ConnectorCapability[] {
    return this.declaredCapabilities || ['search', 'status', 'health'];
  }

  public supportsCapability(capability: ConnectorCapability): boolean {
    return this.getCapabilities().includes(capability);
  }

  public abstract connect(context: ConnectorContext): Promise<void>;
  public abstract disconnect(context: ConnectorContext): Promise<void>;
  public abstract authorize(context: ConnectorContext): Promise<void>;
  public abstract refresh(context: ConnectorContext): Promise<void>;
  public abstract health(context: ConnectorContext): Promise<ConnectorHealth>;
  public abstract search(query: string, context: ConnectorContext): Promise<ConnectorResult>;
  public abstract compare(items: unknown[], context: ConnectorContext): Promise<ConnectorResult>;
  public abstract open(reference: string, context: ConnectorContext): Promise<ConnectorResult>;
  public abstract status(context: ConnectorContext): Promise<ConnectorStatus>;
  public abstract metadata(context: ConnectorContext): Promise<ConnectorMetadata>;
  public abstract permissions(context: ConnectorContext): Promise<string[]>;
  public abstract execute(operation: string, params: Record<string, unknown>, context: ConnectorContext): Promise<ConnectorResult>;
  public abstract reconnect(context: ConnectorContext): Promise<void>;
  public abstract sync(context: ConnectorContext): Promise<{ syncedItems: number; status: string }>;

  public async isConfigured(context?: ConnectorContext): Promise<boolean> {
    return true;
  }
  public async isAvailable(context?: ConnectorContext): Promise<boolean> {
    return true;
  }
  public async isEnabled(context?: ConnectorContext): Promise<boolean> {
    return true;
  }
}
