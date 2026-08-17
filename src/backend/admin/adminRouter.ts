// Contril AI OS - Admin REST API Router
import { Router, Request, Response } from 'express';
import { AdminService } from './AdminService';
import { SecurityMiddleware } from '../security/SecurityMiddleware';
import { supabaseAdmin } from '../database/supabaseAdmin';
import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { registerDefaultAgents } from '../intelligence/registerDefaultAgents';
import { universalAgentRouter } from '../intelligence/AgentRouter';

const router = Router();

// Middleware: Admin Guard (Owner & Super Admin authorization)
router.use(SecurityMiddleware.requireRole(['super_admin', 'org_admin']));

router.get('/ai-engine', async (_req: Request, res: Response) => {
  registerDefaultAgents();
  return res.json({ success: true, agents: universalAgentRouter.list(), connectors: connectorRegistry.list().map(connector => ({ id: connector.id, name: connector.name })) });
});

router.get('/connectors', async (req: Request, res: Response) => {
  const workspaceId = String(req.query.workspaceId || (req as any).user?.organizationId || '');
  const connectors = await Promise.all(connectorRegistry.list().map(async connector => ({ id: connector.id, name: connector.name, ...(await connector.health({ workspaceId, userId: (req as any).user.id, permissions: [] })) })));
  return res.json({ success: true, connectors });
});

router.get('/agent-health', async (_req: Request, res: Response) => {
  registerDefaultAgents();
  return res.json({ success: true, agents: universalAgentRouter.list() });
});

// 1. Live Admin Overview Dashboard Metrics
router.get('/dashboard', async (req: Request, res: Response) => {
  const stats = await AdminService.getAdminDashboardStats();
  return res.json(stats);
});

// 2. Search & List Users
router.get('/users', async (req: Request, res: Response) => {
  const { search } = req.query;
  const users = await AdminService.searchUsers(search as string);
  return res.json({ success: true, count: users.length, users });
});

// 3. Suspend / Activate User
router.patch('/users/:id/status', async (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = await AdminService.setUserStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
  SecurityMiddleware.logSecurityEvent('USER_STATUS_MUTATED', (req as any).user?.id || 'admin', { userId: req.params.id, status });
  return res.json({ success: true, user: updated });
});

// 4. Grant / Revoke Admin Role
router.patch('/users/:id/role', async (req: Request, res: Response) => {
  const { role } = req.body;
  const updated = await AdminService.setUserRole(req.params.id, role);
  if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
  SecurityMiddleware.logSecurityEvent('USER_ROLE_MUTATED', (req as any).user?.id || 'admin', { userId: req.params.id, role });
  return res.json({ success: true, user: updated });
});

// 5. Change User Plan Tier
router.patch('/users/:id/plan', async (req: Request, res: Response) => {
  const { plan } = req.body;
  const updated = await AdminService.setUserPlan(req.params.id, plan);
  if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
  SecurityMiddleware.logSecurityEvent('USER_PLAN_MUTATED', (req as any).user?.id || 'admin', { userId: req.params.id, plan });
  return res.json({ success: true, user: updated });
});

// 6. Reset User AI Memory Bank
router.post('/users/:id/reset-memory', async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('memory').delete().eq('user_id', req.params.id);
    SecurityMiddleware.logSecurityEvent('USER_MEMORY_WIPED', (req as any).user?.id || 'admin', { userId: req.params.id });
    return res.json({ success: true, message: `Memory cleared for user ${req.params.id}` });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 7. Delete User Conversations
router.post('/users/:id/delete-conversations', async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('conversations').delete().eq('user_id', req.params.id);
    SecurityMiddleware.logSecurityEvent('USER_CONVERSATIONS_DELETED', (req as any).user?.id || 'admin', { userId: req.params.id });
    return res.json({ success: true, message: `Conversations deleted for user ${req.params.id}` });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 8. Delete User
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    SecurityMiddleware.logSecurityEvent('USER_DELETED', (req as any).user?.id || 'admin', { userId: req.params.id });
    return res.json({ success: true, message: 'User deleted' });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 9. Active Sessions Management
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const sessions = await AdminService.getActiveSessions();
    return res.json({ success: true, count: sessions.length, sessions });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message || 'Sessions unavailable' });
  }
});

router.delete('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const result = await AdminService.terminateSession(req.params.id);
    SecurityMiddleware.logSecurityEvent('SESSION_TERMINATED', (req as any).user?.id || 'admin', { targetSessionId: req.params.id });
    return res.json({ success: result, message: result ? 'Session revoked' : 'Session not found' });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 10. Audit Logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const logs = SecurityMiddleware.getRecentSecurityLogs();
    return res.json({ success: true, logs });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 11. System Settings
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await AdminService.getSystemSettings();
    return res.json({ success: true, settings });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'Key is required' });
    const adminId = (req as any).user?.id || 'admin';
    const result = await AdminService.updateSystemSetting(key, value, adminId);
    SecurityMiddleware.logSecurityEvent('SYSTEM_SETTING_UPDATED', adminId, { key, value });
    return res.json({ success: !!result, setting: result });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 12. Feature Flags
router.get('/feature-flags', async (req: Request, res: Response) => {
  try {
    const flags = await AdminService.getFeatureFlags();
    return res.json({ success: true, flags });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/feature-flags', async (req: Request, res: Response) => {
  try {
    const { key, isEnabled } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'Key is required' });
    const adminId = (req as any).user?.id || 'admin';
    const result = await AdminService.toggleFeatureFlag(key, isEnabled, adminId);
    SecurityMiddleware.logSecurityEvent('FEATURE_FLAG_TOGGLED', adminId, { key, isEnabled });
    return res.json({ success: !!result, flag: result });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 13. Support Tickets
router.get('/support-tickets', async (req: Request, res: Response) => {
  try {
    const tickets = await AdminService.getSupportTickets();
    return res.json({ success: true, tickets });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/support-tickets', async (req: Request, res: Response) => {
  try {
    const ticket = await AdminService.createSupportTicket(req.body);
    if (!ticket) return res.status(500).json({ success: false, error: 'Failed to create ticket' });
    SecurityMiddleware.logSecurityEvent('SUPPORT_TICKET_CREATED', (req as any).user?.id || 'admin', { ticketId: ticket.id });
    return res.json({ success: true, ticket });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.patch('/support-tickets/:id', async (req: Request, res: Response) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = await AdminService.updateSupportTicketStatus(req.params.id, status, assignedTo);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    SecurityMiddleware.logSecurityEvent('SUPPORT_TICKET_UPDATED', (req as any).user?.id || 'admin', { ticketId: req.params.id, status });
    return res.json({ success: true, ticket });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 14. System Health
router.get('/system-health', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('system_health').select('*');
    return res.json({ success: true, services: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 15. Background Jobs
router.get('/background-jobs', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('background_jobs').select('*').order('created_at', { ascending: false });
    return res.json({ success: true, jobs: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 16. AI Operations
router.get('/ai-operations', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('api_usage').select('*').order('created_at', { ascending: false });
    return res.json({ success: true, usage: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 17. Notifications
router.post('/notifications', async (req: Request, res: Response) => {
  try {
    const { title, message, target, targetId } = req.body;
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        workspace_id: '00000000-0000-0000-0000-000000000000',
        user_id: targetId || '00000000-0000-0000-0000-000000000000',
        type: target || 'broadcast',
        title,
        message,
        is_read: false,
        created_by: (req as any).user?.id || 'admin'
      })
      .select()
      .single();

    if (error) throw error;
    SecurityMiddleware.logSecurityEvent('NOTIFICATION_SENT', (req as any).user?.id || 'admin', { target, title });
    return res.json({ success: true, notification: data });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 18. Organizations
router.get('/organizations', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('organizations').select('*').order('created_at', { ascending: false });
    return res.json({ success: true, organizations: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 19. Integration Sync Logs
router.get('/integration-sync-logs', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.from('integration_sync_logs').select('*').order('created_at', { ascending: false });
    return res.json({ success: true, logs: data || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 21. Connector Authorizations
router.get('/connector-authorizations', async (req: Request, res: Response) => {
  try {
    const authorizations = await AdminService.getConnectorAuthorizations();
    return res.json({ success: true, authorizations });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 22. Connector Health Logs
router.get('/connector-health-logs', async (req: Request, res: Response) => {
  try {
    const healthLogs = await AdminService.getConnectorHealthLogs();
    return res.json({ success: true, healthLogs });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 24. Subscription Management Endpoints
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const filterPlan = req.query.plan as string;
    const filterStatus = req.query.status as string;
    const subscriptions = await AdminService.getAdminSubscriptions(filterPlan, filterStatus);
    return res.json({ success: true, subscriptions });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/subscriptions/update', async (req: Request, res: Response) => {
  try {
    const { userId, planId, status, periodEnd } = req.body;
    if (!userId || !planId) return res.status(400).json({ success: false, error: 'userId and planId required' });
    const result = await AdminService.updateUserSubscription(userId, planId, status, periodEnd);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/subscriptions/trial', async (req: Request, res: Response) => {
  try {
    const { userId, planId, trialDays } = req.body;
    if (!userId || !planId) return res.status(400).json({ success: false, error: 'userId and planId required' });
    const result = await AdminService.grantSubscriptionTrial(userId, planId, trialDays || 14);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/subscriptions/reset-usage', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'userId required' });
    const result = await AdminService.resetUserMonthlyUsage(userId);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/subscriptions/override-limits', async (req: Request, res: Response) => {
  try {
    const { userId, aiMessageOverride, storageOverrideBytes } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'userId required' });
    const result = await AdminService.overrideUserLimits(userId, aiMessageOverride, storageOverrideBytes);
    return res.json(result);
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 25. Subscription Manual Approval Endpoints (One-Click Verification Flow)
router.get('/subscriptions/pending', async (req: Request, res: Response) => {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('subscription_requests')
      .select('*')
      .eq('status', 'PENDING_APPROVAL')
      .order('requested_at', { ascending: false });

    if (error) {
      // Fallback query against profiles
      const { data: profileReqs } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, subscription_status, updated_at')
        .eq('subscription_status', 'PENDING_APPROVAL');
      return res.json({ success: true, pendingRequests: profileReqs || [] });
    }

    return res.json({ success: true, pendingRequests: requests || [] });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/subscriptions/approve', async (req: Request, res: Response) => {
  try {
    const { userId, email, requestId } = req.body;
    if (!userId && !email && !requestId) {
      return res.status(400).json({ success: false, error: 'userId, email, or requestId required' });
    }

    // 1. Update subscription_requests table if requestId or userId is provided
    if (requestId) {
      await supabaseAdmin
        .from('subscription_requests')
        .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
        .eq('id', requestId);
    } else if (userId) {
      await supabaseAdmin
        .from('subscription_requests')
        .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
        .eq('user_id', userId);
    }

    // 2. Activate Pro status in profiles table
    let profileUpdateQuery = supabaseAdmin
      .from('profiles')
      .update({
        is_paid: true,
        plan: 'Pro',
        subscription_status: 'ACTIVE_PRO',
        updated_at: new Date().toISOString()
      });

    if (userId) {
      profileUpdateQuery = profileUpdateQuery.eq('id', userId);
    } else if (email) {
      profileUpdateQuery = profileUpdateQuery.eq('email', email);
    }

    const { error: profileError } = await profileUpdateQuery;
    if (profileError) throw profileError;

    SecurityMiddleware.logSecurityEvent('SUBSCRIPTION_APPROVED', (req as any).user?.id || 'admin', {
      targetUser: userId || email,
      action: 'APPROVE_PRO_UPGRADE'
    });

    return res.json({
      success: true,
      message: `Pro subscription successfully approved and activated for ${userId || email}.`
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/subscriptions/reject', async (req: Request, res: Response) => {
  try {
    const { userId, email, requestId, reason } = req.body;
    if (!userId && !email && !requestId) {
      return res.status(400).json({ success: false, error: 'userId, email, or requestId required' });
    }

    if (requestId) {
      await supabaseAdmin
        .from('subscription_requests')
        .update({ status: 'REJECTED', rejection_reason: reason || 'Payment not verified' })
        .eq('id', requestId);
    }

    let profileUpdateQuery = supabaseAdmin
      .from('profiles')
      .update({
        is_paid: false,
        subscription_status: 'REJECTED',
        updated_at: new Date().toISOString()
      });

    if (userId) {
      profileUpdateQuery = profileUpdateQuery.eq('id', userId);
    } else if (email) {
      profileUpdateQuery = profileUpdateQuery.eq('email', email);
    }

    await profileUpdateQuery;

    return res.json({ success: true, message: `Subscription request rejected for ${userId || email}.` });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

export default router;

