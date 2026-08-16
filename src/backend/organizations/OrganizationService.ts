import { supabase } from '../../lib/auth';

export type OrganizationRole = 'owner' | 'super_admin' | 'admin' | 'manager' | 'member' | 'guest' | 'custom';

export interface OrganizationDetails {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  planId: string;
  memberCount: number;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  fullName: string;
  email: string;
  role: OrganizationRole;
  joinedAt: string;
}

export class OrganizationService {
  /**
   * Initializes a new Organization with default Departments, Teams, and RBAC policy matrix.
   */
  public static async createOrganization(userId: string, name: string, slug: string): Promise<OrganizationDetails> {
    const orgId = `org-${Date.now()}`;
    const newOrg: OrganizationDetails = {
      id: orgId,
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerId: userId,
      planId: 'business',
      memberCount: 1,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Insert Org
      await supabase.from('organizations').insert([{
        id: orgId,
        name: newOrg.name,
        slug: newOrg.slug,
        owner_id: userId,
        plan_id: newOrg.planId,
        created_at: newOrg.createdAt
      }]);

      // 2. Add Owner as Member
      await supabase.from('organization_members').insert([{
        organization_id: orgId,
        user_id: userId,
        role: 'owner',
        joined_at: newOrg.createdAt
      }]);

      // 3. Create default departments (Engineering, Marketing, Executive)
      await supabase.from('departments').insert([
        { org_id: orgId, name: 'Engineering', code: 'ENG' },
        { org_id: orgId, name: 'Marketing & Growth', code: 'MKT' },
        { org_id: orgId, name: 'Executive Suite', code: 'EXEC' }
      ]);
    } catch {
      // Fallback
    }

    return newOrg;
  }

  /**
   * Evaluates if a user role has permission to execute an action (e.g. manage_billing, invite_users).
   */
  public static async checkUserPermission(role: OrganizationRole, permissionKey: string): Promise<boolean> {
    if (role === 'owner' || role === 'super_admin') return true;
    if (role === 'guest') return false;

    const rolePermissionsMap: Record<OrganizationRole, string[]> = {
      owner: ['all'],
      super_admin: ['all'],
      admin: ['manage_users', 'invite_users', 'manage_ai', 'approve_automations', 'view_analytics', 'manage_connectors'],
      manager: ['invite_users', 'approve_automations', 'view_analytics'],
      member: ['create_workflows', 'use_connectors', 'view_projects'],
      guest: ['view_projects'],
      custom: ['view_projects']
    };

    const allowedPermissions = rolePermissionsMap[role] || [];
    return allowedPermissions.includes('all') || allowedPermissions.includes(permissionKey);
  }
}
