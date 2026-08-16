import { supabase } from '../../lib/auth';

export type MarketplaceCategory = 
  | 'ai_agents' 
  | 'workspace' 
  | 'shopping' 
  | 'food' 
  | 'travel' 
  | 'finance' 
  | 'healthcare' 
  | 'education' 
  | 'developer_tools' 
  | 'automations' 
  | 'themes';

export interface ExtensionItem {
  id: string;
  name: string;
  category: MarketplaceCategory;
  type: 'connector' | 'agent' | 'workflow' | 'theme' | 'app';
  version: string;
  developerName: string;
  description: string;
  iconUrl?: string;
  permissions: string[];
  capabilities: string[];
  downloadsCount: number;
  rating: number;
  isFeatured: boolean;
  isVerified: boolean;
  isEnterprisePrivate: boolean;
  status: 'draft' | 'pending_approval' | 'published' | 'deprecated';
}

export class MarketplaceService {
  /**
   * Installs an extension for user after permissions are granted.
   */
  public static async installExtension(userId: string, extensionId: string, grantedPermissions: string[]): Promise<boolean> {
    try {
      await supabase.from('user_installed_extensions').insert([{
        user_id: userId,
        extension_id: extensionId,
        status: 'enabled',
        granted_permissions: grantedPermissions,
        installed_at: new Date().toISOString()
      }]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Uninstalls an extension and revokes permissions.
   */
  public static async uninstallExtension(userId: string, extensionId: string): Promise<boolean> {
    try {
      await supabase
        .from('user_installed_extensions')
        .delete()
        .eq('user_id', userId)
        .eq('extension_id', extensionId);
      return true;
    } catch {
      return false;
    }
  }
}
