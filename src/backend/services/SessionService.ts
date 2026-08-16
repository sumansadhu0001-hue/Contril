// Contril AI OS - Session Management Service
import { supabaseAdmin } from '../database/supabaseAdmin';

export interface CreateSessionParams {
  userId: string;
  workspaceId: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
  ipAddress?: string;
  location?: string;
  expiresAt?: string;
}

export class SessionService {
  // 1. Create session record in active_sessions table
  public static async createSession(params: CreateSessionParams) {
    try {
      const { data, error } = await supabaseAdmin
        .from('active_sessions')
        .insert({
          user_id: params.userId,
          workspace_id: params.workspaceId,
          device: params.device || 'Desktop',
          browser: params.browser || 'Unknown Browser',
          operating_system: params.operatingSystem || 'Unknown OS',
          ip_address: params.ipAddress || '127.0.0.1',
          location: params.location || 'Local Workspace',
          expires_at: params.expiresAt || new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days
          is_revoked: false
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: data };
    } catch (e: any) {
      console.error('[SessionService Error] Failed to create session:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 2. Terminate session (Global sign out)
  public static async terminateSession(sessionId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('active_sessions')
        .update({ is_revoked: true })
        .eq('id', sessionId)
        .select();

      if (error) throw error;
      return { success: true, session: data };
    } catch (e: any) {
      console.error('[SessionService Error] Failed to terminate session:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 3. List active sessions for user or workspace
  public static async listActiveSessions(workspaceId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('active_sessions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('is_revoked', false);

      if (error) throw error;
      return { success: true, sessions: data || [] };
    } catch (e: any) {
      console.error('[SessionService Error] Failed to list sessions:', e.message || e);
      return { success: false, sessions: [], error: e.message };
    }
  }

  // 4. Record login event in login_history table
  public static async recordLoginHistory(params: {
    userId?: string;
    workspaceId: string;
    email: string;
    loginMethod: string;
    ipAddress?: string;
    browser?: string;
    operatingSystem?: string;
    location?: string;
    isSuccess: boolean;
    failureReason?: string;
  }) {
    try {
      const { error } = await supabaseAdmin
        .from('login_history')
        .insert({
          workspace_id: params.workspaceId,
          user_id: params.userId || null,
          email: params.email,
          login_method: params.loginMethod,
          ip_address: params.ipAddress || '127.0.0.1',
          browser: params.browser || 'Unknown',
          operating_system: params.operatingSystem || 'Unknown',
          approximate_location: params.location || 'Unknown',
          is_success: params.isSuccess,
          failure_reason: params.failureReason || null
        });

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error('[SessionService Error] Failed to record login history:', e.message || e);
      return { success: false, error: e.message };
    }
  }
}
