export type IntegrationCategory = 
  | 'google'
  | 'microsoft'
  | 'communication'
  | 'productivity'
  | 'storage'
  | 'development'
  | 'crm'
  | 'optional';

export interface IntegrationDefinition {
  id: string;
  name: string;
  category: IntegrationCategory;
  categoryLabel: string;
  description: string;
  iconName: string; // Lucide icon or brand identifier
  accentColor: string;
  permissions: string[];
  oauthSupported: boolean;
}

export interface ConnectedAccountState {
  integrationId: string;
  isConnected: boolean;
  accountEmail?: string;
  lastSyncTime?: string;
  statusMessage?: string;
}

export interface IntegrationActivityEvent {
  id: string;
  time: string;
  timestamp: number;
  integrationId: string;
  integrationName: string;
  action: string;
  details: string;
  category: 'sync' | 'action' | 'creation' | 'draft';
}
