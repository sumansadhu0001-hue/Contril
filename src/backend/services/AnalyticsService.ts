// Contril AI OS - Analytics Management Service
import { supabaseAdmin } from '../database/supabaseAdmin';

export class AnalyticsService {
  // 1. Record/Increment tokens usage metric
  public static async recordApiUsage(params: {
    workspaceId: string;
    tokensUsed: number;
    apiCallsCount: number;
    createdBy?: string;
  }) {
    try {
      const { data, error } = await supabaseAdmin
        .from('api_usage')
        .insert({
          workspace_id: params.workspaceId,
          tokens_used: params.tokensUsed,
          requests_count: params.apiCallsCount,
          recorded_date: new Date().toISOString().slice(0, 10),
          created_by: params.createdBy || null
        })
        .select();

      if (error) throw error;
      return { success: true, usage: data };
    } catch (e: any) {
      console.error('[AnalyticsService Error] Failed to log API usage metrics:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 2. Fetch workspace usage history list
  public static async fetchWorkspaceUsage(workspaceId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('api_usage')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('recorded_date', { ascending: false });

      if (error) throw error;
      return { success: true, usage: data || [] };
    } catch (e: any) {
      console.error('[AnalyticsService Error] Failed to fetch workspace usage analytics:', e.message || e);
      return { success: false, usage: [], error: e.message };
    }
  }
}
