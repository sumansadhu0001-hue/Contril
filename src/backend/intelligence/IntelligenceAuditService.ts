import { supabaseAdmin } from '../database/supabaseAdmin';
import { IntentClassification } from './types';

export class IntelligenceAuditService {
  public static async logIntent(workspaceId: string, userId: string, classification: IntentClassification, status: 'accepted' | 'rejected'): Promise<void> {
    const { error } = await supabaseAdmin.from('intent_logs').insert({
      workspace_id: workspaceId,
      user_id: userId,
      intent: classification.name,
      category: classification.category,
      entities: classification.entities,
      context: classification.context,
      confidence: classification.confidence,
      status
    });
    if (error) console.warn('[IntelligenceAudit] intent log not persisted:', error.message);
  }

  public static async logAgent(workspaceId: string, userId: string, agentId: string, intent: string, status: 'started' | 'completed' | 'failed', error?: string): Promise<void> {
    const { error: insertError } = await supabaseAdmin.from('agent_logs').insert({ workspace_id: workspaceId, user_id: userId, agent_id: agentId, intent, status, error });
    if (insertError) console.warn('[IntelligenceAudit] agent log not persisted:', insertError.message);
  }

  public static async logToolCall(workspaceId: string, userId: string, agentId: string, connectorId: string, status: 'completed' | 'failed' | 'unavailable', error?: string): Promise<void> {
    const { error: insertError } = await supabaseAdmin.from('tool_calls').insert({
      workspace_id: workspaceId,
      user_id: userId,
      agent_id: agentId,
      connector_id: connectorId,
      operation: 'search',
      status,
      error,
      completed_at: new Date().toISOString()
    });
    if (insertError) console.warn('[IntelligenceAudit] tool call not persisted:', insertError.message);
  }
}
