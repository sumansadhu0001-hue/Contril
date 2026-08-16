export type IntentCategory = 'workspace' | 'shopping' | 'food' | 'travel' | 'general';

export type IntentName =
  | 'email' | 'calendar' | 'documents' | 'search'
  | 'product_search' | 'compare_products'
  | 'food_search' | 'compare_restaurants'
  | 'flight_search' | 'hotel_search'
  | 'research' | 'writing' | 'coding' | 'brainstorming' | 'translation' | 'file_analysis' | 'ai_chat';

export interface IntentEntity {
  type: string;
  value: string;
}

export interface IntentClassification {
  name: IntentName;
  category: IntentCategory;
  entities: IntentEntity[];
  context: Record<string, string>;
  confidence: number;
}

export interface IntelligenceRequest {
  workspaceId: string;
  userId: string;
  prompt: string;
  permissions?: string[];
  enabledFeatures?: string[];
  requestedAgentId?: string;
  contextData?: Record<string, unknown>;
}

export interface ConnectorResult<T = Record<string, unknown>> {
  connectorId: string;
  status: 'success' | 'unavailable' | 'failed';
  data: T[];
  error?: string;
}

export interface AggregatedResult<T = Record<string, unknown>> {
  results: T[];
  failures: Array<{ connectorId: string; error: string }>;
  unavailableConnectorIds: string[];
}

export interface AgentDescriptor {
  id: string;
  name: string;
  supportedIntents: IntentName[];
  requiredPermissions: string[];
}
