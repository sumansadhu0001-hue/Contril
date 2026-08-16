import { IntentClassification, IntentName } from './types';

interface IntentRule {
  name: IntentName;
  category: IntentClassification['category'];
  keywords: string[];
  requiredPermission?: string;
  requiredFeature?: string;
}

const INTENT_RULES: IntentRule[] = [
  { name: 'file_analysis', category: 'general', keywords: ['attached file', 'attached document', 'pasted content', 'analyze this text', 'review this text'] },
  { name: 'translation', category: 'general', keywords: ['translate', 'translation'] },
  { name: 'brainstorming', category: 'general', keywords: ['brainstorm', 'ideas for', 'idea generation'] },
  { name: 'coding', category: 'general', keywords: ['write code', 'code review', 'typescript', 'javascript', 'python', 'debug'] },
  { name: 'writing', category: 'general', keywords: ['write an email', 'draft an email', 'compose an email', 'write email', 'write a', 'draft', 'compose', 'generate text', 'rewrite'] },
  { name: 'email', category: 'workspace', keywords: ['email', 'inbox', 'mail', 'reply'], requiredPermission: 'read_inbox' },
  { name: 'calendar', category: 'workspace', keywords: ['calendar', 'schedule', 'meeting', 'availability'], requiredPermission: 'read_calendar' },
  { name: 'documents', category: 'workspace', keywords: ['document', 'file', 'drive', 'pdf', 'doc'], requiredPermission: 'read_documents' },
  { name: 'search', category: 'workspace', keywords: ['workspace search', 'find in workspace'], requiredPermission: 'read_workspace' },
  { name: 'compare_products', category: 'shopping', keywords: ['compare product', 'compare prices', 'product comparison'], requiredFeature: 'shopping' },
  { name: 'product_search', category: 'shopping', keywords: ['product', 'buy', 'shopping', 'price'], requiredFeature: 'shopping' },
  { name: 'compare_restaurants', category: 'food', keywords: ['compare restaurant', 'compare food'], requiredFeature: 'food' },
  { name: 'food_search', category: 'food', keywords: ['restaurant', 'food', 'delivery', 'menu'], requiredFeature: 'food' },
  { name: 'flight_search', category: 'travel', keywords: ['flight', 'fly', 'airfare'], requiredFeature: 'travel' },
  { name: 'hotel_search', category: 'travel', keywords: ['hotel', 'stay', 'accommodation'], requiredFeature: 'travel' },
  { name: 'research', category: 'general', keywords: ['research', 'investigate', 'sources'] }
];

export function requiresExternalConnector(intent: IntentClassification): boolean {
  return intent.category !== 'general';
}

export function connectorRequirementLabel(intent: IntentClassification): string {
  switch (intent.category) {
    case 'workspace': return `${intent.name.replace('_', ' ')} connector`;
    case 'shopping': return 'shopping connector';
    case 'food': return 'food connector';
    case 'travel': return 'travel connector';
    default: return 'connector';
  }
}

export class UniversalIntentEngine {
  public static classify(prompt: string): IntentClassification {
    const normalized = prompt.trim().toLowerCase();
    const matched = INTENT_RULES
      .map(rule => ({ rule, hits: rule.keywords.filter(keyword => normalized.includes(keyword)).length }))
      .filter(candidate => candidate.hits > 0)
      .sort((a, b) => b.hits - a.hits)[0];

    if (!matched) {
      return { name: 'ai_chat', category: 'general', entities: this.extractEntities(prompt), context: {}, confidence: 0.5 };
    }

    return {
      name: matched.rule.name,
      category: matched.rule.category,
      entities: this.extractEntities(prompt),
      context: {},
      confidence: Math.min(0.95, 0.65 + (matched.hits * 0.15))
    };
  }

  public static validate(classification: IntentClassification, workspaceId: string, permissions: string[] = [], enabledFeatures: string[] = []): string | null {
    if (!workspaceId.trim()) return 'A workspace is required.';
    const rule = INTENT_RULES.find(item => item.name === classification.name);
    if (rule?.requiredPermission && !permissions.includes(rule.requiredPermission)) return 'The current user does not have permission for this request.';
    if (rule?.requiredFeature && !enabledFeatures.includes(rule.requiredFeature)) return 'This feature is not enabled for the current workspace.';
    return null;
  }

  private static extractEntities(prompt: string) {
    const entities: IntentClassification['entities'] = [];
    const quoted = prompt.match(/["“]([^"”]+)["”]/g) || [];
    quoted.forEach(value => entities.push({ type: 'quoted_text', value: value.replace(/["“”]/g, '') }));
    return entities;
  }
}
