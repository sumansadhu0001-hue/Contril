// Contril AI OS - Support Actions Service
import { supabaseAdmin } from '../database/supabaseAdmin';

export class SupportService {
  // 1. Log administrative support operations
  public static async logSupportAction(params: {
    workspaceId: string;
    userId: string;
    actionType: string;
    notes?: string;
    createdBy: string;
  }) {
    try {
      const { data, error } = await supabaseAdmin
        .from('support_actions')
        .insert({
          workspace_id: params.workspaceId,
          user_id: params.userId,
          action_type: params.actionType,
          notes: params.notes || null,
          created_by: params.createdBy
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, action: data };
    } catch (e: any) {
      console.error('[SupportService Error] Failed to log support action:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 2. Fetch support action log entries
  public static async listSupportActions(workspaceId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('support_actions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, actions: data || [] };
    } catch (e: any) {
      console.error('[SupportService Error] Failed to list support logs:', e.message || e);
      return { success: false, actions: [], error: e.message };
    }
  }
}
