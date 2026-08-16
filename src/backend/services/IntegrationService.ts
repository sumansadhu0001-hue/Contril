// Contril AI OS - Connected Integrations Service
import { supabaseAdmin } from '../database/supabaseAdmin';

export class IntegrationService {
  // 1. Get connected integrations list
  public static async getConnectedIntegrations(workspaceId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('integrations')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      return { success: true, integrations: data || [] };
    } catch (e: any) {
      console.error('[IntegrationService Error] Failed to get integrations:', e.message || e);
      return { success: false, integrations: [], error: e.message };
    }
  }

  // 2. Disconnect/Revoke an integration channel
  public static async disconnectIntegration(integrationId: string, workspaceId: string) {
    try {
      const { error } = await supabaseAdmin
        .from('integrations')
        .delete()
        .eq('id', integrationId)
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      return { success: true, message: 'Integration disconnected.' };
    } catch (e: any) {
      console.error('[IntegrationService Error] Failed to disconnect integration:', e.message || e);
      return { success: false, error: e.message };
    }
  }
}
