import { Request } from 'express';
import { supabaseAdmin } from './supabaseAdmin';

export class SessionResolver {
  public static async resolve(req: Request): Promise<{ userId: string; workspaceId: string; email: string }> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    let userId: string | null = null;
    let email = 'suman@contril.ai';

    if (token && token !== 'undefined') {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
          email = user.email || email;
        }
      } catch (e) {
        console.warn('[SessionResolver] Failed to resolve user from Supabase JWT:', e);
      }
    }

    // Fallback to deterministic UUID for mock/dev environment
    if (!userId) {
      userId = '00000000-0000-0000-0000-000000000001'; 
    }

    // Ensure user exists in public.users to satisfy foreign-key references
    try {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingUser) {
        console.info(`[SessionResolver] User record missing in DB. Seeding mock user: ${userId}`);
        await supabaseAdmin.from('users').insert({
          id: userId,
          email,
          full_name: email.split('@')[0],
          role: 'super_admin'
        });
      }
    } catch (e) {
      console.warn('[SessionResolver] Error syncing user record in DB:', e);
    }

    // Resolve or create workspace for user
    let workspaceId: string | null = null;
    try {
      const { data: ws } = await supabaseAdmin
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId)
        .limit(1)
        .maybeSingle();

      if (ws) {
        workspaceId = ws.id;
      } else {
        // Find or seed a base organization
        let orgId = '00000000-0000-0000-0000-000000000002';
        const { data: existingOrg } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('id', orgId)
          .maybeSingle();

        if (!existingOrg) {
          await supabaseAdmin.from('organizations').insert({
            id: orgId,
            name: 'Contril Enterprise',
            slug: 'contril-enterprise'
          });
        }

        // Seed a default workspace
        workspaceId = '00000000-0000-0000-0000-000000000003';
        console.info(`[SessionResolver] Seeding default workspace for mock user in DB: ${workspaceId}`);
        await supabaseAdmin.from('workspaces').insert({
          id: workspaceId,
          owner_id: userId,
          organization_id: orgId,
          name: 'Main Workspace'
        });
      }
    } catch (e) {
      console.warn('[SessionResolver] Error resolving/creating workspace in DB:', e);
      workspaceId = '00000000-0000-0000-0000-000000000003';
    }

    return { userId, workspaceId, email };
  }
}
