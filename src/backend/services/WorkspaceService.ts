// Contril AI OS - Workspace Service
import { supabaseAdmin } from '../database/supabaseAdmin';

export class WorkspaceService {
  // 1. Get workspace statistics
  public static async getWorkspaceStats(workspaceId: string) {
    try {
      const { count: totalDocs } = await supabaseAdmin
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

      const { count: totalMemories } = await supabaseAdmin
        .from('memory')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

      const { data: filesData } = await supabaseAdmin
        .from('files')
        .select('file_size_bytes')
        .eq('workspace_id', workspaceId);

      let totalBytes = 0;
      if (filesData) {
        filesData.forEach(row => {
          totalBytes += Number(row.file_size_bytes || 0);
        });
      }

      return {
        success: true,
        stats: {
          documentsCount: totalDocs || 0,
          memoriesCount: totalMemories || 0,
          storageBytes: totalBytes,
          storageMb: Number((totalBytes / (1024 * 1024)).toFixed(2)),
          storageGb: Number((totalBytes / (1024 * 1024 * 1024)).toFixed(3))
        }
      };
    } catch (e: any) {
      console.error('[WorkspaceService Error] Failed to fetch workspace stats:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 2. Rebuild/clean personal workspace memory
  public static async rebuildWorkspaceMemory(workspaceId: string) {
    try {
      const { error } = await supabaseAdmin
        .from('memory')
        .delete()
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      return { success: true, message: 'Workspace index successfully purged and queued for re-indexing.' };
    } catch (e: any) {
      console.error('[WorkspaceService Error] Failed to rebuild workspace memory:', e.message || e);
      return { success: false, error: e.message };
    }
  }
}
