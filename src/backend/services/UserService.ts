// Contril AI OS - User Management Service
import { supabaseAdmin } from '../database/supabaseAdmin';

export class UserService {
  // 1. Get profile details
  public static async getUserById(userId: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (e: any) {
      console.error('[UserService Error] Failed to get user profile:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 2. Set active/suspended status
  public static async updateUserStatus(userId: string, isActive: boolean) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (e: any) {
      console.error('[UserService Error] Failed to update user status:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 3. Update security role
  public static async updateUserRole(userId: string, role: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (e: any) {
      console.error('[UserService Error] Failed to update user role:', e.message || e);
      return { success: false, error: e.message };
    }
  }

  // 4. Delete user context (soft/hard deletes based on policy)
  public static async deleteUser(userId: string) {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      console.error('[UserService Error] Failed to delete user:', e.message || e);
      return { success: false, error: e.message };
    }
  }
}
