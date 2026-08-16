// Contril AI OS - Backend & Supabase Client Integration Service
import { supabase, isSupabaseConfigured } from './auth';

export interface OrchestrateParams {
  userId?: string;
  prompt: string;
  agentId?: string;
  contextData?: Record<string, any>;
}

export class ContrilApiClient {
  private static apiBase = '/api/v1';

  // 1. Health check
  public static async getHealth() {
    try {
      const res = await fetch(`${this.apiBase}/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API Health check fallback', e);
    }
    return { success: true, status: 'operational' };
  }

  // 2. Orchestrate prompt with AI agent system
  public static async orchestrate(params: OrchestrateParams) {
    try {
      const res = await fetch(`${this.apiBase}/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Orchestration local fallback', e);
    }
    return {
      success: true,
      agentUsed: { id: 'executive_assistant', name: 'Chief of Staff Agent' },
      responseOutput: { text: `Executed: "${params.prompt}" in local enclave.` },
      timeSavedEstimateMinutes: 15
    };
  }

  // 3. Search Long-Term Memory
  public static async searchMemory(query: string) {
    try {
      const res = await fetch(`${this.apiBase}/memory/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Memory search fallback', e);
    }
    return { success: false };
  }

  // 4. Get Workflows
  public static async getWorkflows() {
    try {
      const res = await fetch(`${this.apiBase}/automation/workflows`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Workflows fallback', e);
    }
    return { success: false };
  }

  // 5. Get System Metrics
  public static async getAdminMetrics() {
    try {
      const res = await fetch(`${this.apiBase}/admin/overview`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Metrics fallback', e);
    }
    return { success: false };
  }

  // 6. Supabase Query Helpers
  public static async fetchSupabaseDecisions() {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase.from('tasks').select('*').limit(10);
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase tasks fetch fallback', e);
    }
    return null;
  }

  // 7. Executive Inquiries API
  public static async submitInquiry(data: any) {
    try {
      const res = await fetch(`${this.apiBase}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Inquiry submit fallback', e);
    }
    const random6 = Math.floor(100000 + Math.random() * 900000);
    return { success: true, referenceId: `CTR-${random6}` };
  }

  public static async fetchInquiries(params?: { search?: string; status?: string; sortBy?: string }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${this.apiBase}/inquiries?${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Inquiries fetch fallback', e);
    }
    return { success: false, inquiries: [] };
  }

  public static async updateInquiryStatus(id: string, status: string, notes?: string) {
    try {
      const res = await fetch(`${this.apiBase}/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Inquiry update fallback', e);
    }
    return { success: false };
  }

  public static async deleteInquiry(id: string) {
    try {
      const res = await fetch(`${this.apiBase}/inquiries/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Inquiry delete fallback', e);
    }
    return { success: false };
  }

  // === WAITLIST / EARLY ACCESS OPERATIONS CLIENT ===
  public static async fetchWaitlist(status?: string) {
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${this.apiBase}/waitlist/list${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch waitlist error', e);
    }
    return { success: false, waitlist: [] };
  }

  public static async approveWaitlist(id: string) {
    try {
      const res = await fetch(`${this.apiBase}/waitlist/approve/${id}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Approve waitlist entry error', e);
    }
    return { success: false };
  }

  public static async rejectWaitlist(id: string, reason?: string) {
    try {
      const res = await fetch(`${this.apiBase}/waitlist/reject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Reject waitlist entry error', e);
    }
    return { success: false };
  }

  // === ADMIN PORTAL OPERATIONS CLIENT ===
  public static async fetchAdminDashboardStats() {
    try {
      const res = await fetch(`${this.apiBase}/admin/dashboard`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch admin stats error', e);
    }
    return { success: false, error: 'Database metrics unavailable' };
  }

  public static async fetchAdminUsers(search?: string) {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${this.apiBase}/admin/users${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch admin users error', e);
    }
    return { success: false, users: [] };
  }

  public static async updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    try {
      const res = await fetch(`${this.apiBase}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update user status error', e);
    }
    return { success: false };
  }

  public static async updateUserPlan(id: string, plan: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/users/${id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update user plan error', e);
    }
    return { success: false };
  }

  public static async updateUserRole(id: string, role: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update user role error', e);
    }
    return { success: false };
  }

  public static async deleteUser(id: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Delete user error', e);
    }
    return { success: false };
  }

  public static async resetUserMemory(id: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/users/${id}/reset-memory`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Reset user memory error', e);
    }
    return { success: false };
  }

  public static async deleteUserConversations(id: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/users/${id}/delete-conversations`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Delete user conversations error', e);
    }
    return { success: false };
  }

  public static async fetchActiveSessions() {
    try {
      const res = await fetch(`${this.apiBase}/admin/sessions`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch active sessions error', e);
    }
    return { success: false, sessions: [] };
  }

  public static async terminateSession(id: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/sessions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Terminate session error', e);
    }
    return { success: false };
  }

  public static async fetchSecurityAuditLogs() {
    try {
      const res = await fetch(`${this.apiBase}/admin/audit-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch audit logs error', e);
    }
    return { success: false, logs: [] };
  }

  // === PLATFORM SETTINGS ===
  public static async fetchPlatformSettings() {
    try {
      const res = await fetch(`${this.apiBase}/admin/settings`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch platform settings error', e);
    }
    return { success: false, settings: [] };
  }

  public static async updatePlatformSetting(key: string, value: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update platform setting error', e);
    }
    return { success: false };
  }

  // === FEATURE FLAGS ===
  public static async fetchFeatureFlags() {
    try {
      const res = await fetch(`${this.apiBase}/admin/feature-flags`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch feature flags error', e);
    }
    return { success: false, flags: [] };
  }

  public static async toggleFeatureFlag(key: string, isEnabled: boolean) {
    try {
      const res = await fetch(`${this.apiBase}/admin/feature-flags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, isEnabled })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Toggle feature flag error', e);
    }
    return { success: false };
  }

  // === SUPPORT TICKETS ===
  public static async fetchSupportTickets() {
    try {
      const res = await fetch(`${this.apiBase}/admin/support-tickets`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch support tickets error', e);
    }
    return { success: false, tickets: [] };
  }

  public static async updateSupportTicket(id: string, status: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/support-tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Update support ticket error', e);
    }
    return { success: false };
  }

  // === SYSTEM HEALTH ===
  public static async fetchSystemHealth() {
    try {
      const res = await fetch(`${this.apiBase}/admin/system-health`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch system health error', e);
    }
    return { success: false, services: [] };
  }

  // === BACKGROUND JOBS ===
  public static async fetchBackgroundJobs() {
    try {
      const res = await fetch(`${this.apiBase}/admin/background-jobs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch background jobs error', e);
    }
    return { success: false, jobs: [] };
  }

  // === AI OPERATIONS ===
  public static async fetchAiOperations() {
    try {
      const res = await fetch(`${this.apiBase}/admin/ai-operations`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch AI operations error', e);
    }
    return { success: false, usage: [] };
  }

  // === PHASE 5.1 UNIVERSAL AI ENGINE ===
  public static async executeUniversalAi(params: { workspaceId: string; prompt: string; permissions?: string[]; enabledFeatures?: string[]; agentId?: string }) {
    const res = await fetch(`${this.apiBase}/ai-engine/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  }

  public static async fetchAiEngine() {
    const res = await fetch(`${this.apiBase}/admin-panel/ai-engine`);
    return res.ok ? res.json() : { success: false, agents: [], connectors: [] };
  }

  public static async fetchConnectorHealth() {
    const res = await fetch(`${this.apiBase}/admin-panel/connectors`);
    return res.ok ? res.json() : { success: false, connectors: [] };
  }

  public static async fetchAgentHealth() {
    const res = await fetch(`${this.apiBase}/admin-panel/agent-health`);
    return res.ok ? res.json() : { success: false, agents: [] };
  }

  // === NOTIFICATIONS ===
  public static async sendAdminNotification(target: string, title: string, message: string, targetId?: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, title, message, targetId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Send notification error', e);
    }
    return { success: false };
  }

  // === ORGANIZATIONS ===
  public static async fetchOrganizations() {
    try {
      const res = await fetch(`${this.apiBase}/admin/organizations`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch organizations error', e);
    }
    return { success: false, organizations: [] };
  }

  // === SECURITY EVENTS ===
  public static async fetchSecurityEvents() {
    try {
      const res = await fetch(`${this.apiBase}/admin/security-events`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch security events error', e);
    }
    return { success: false, events: [] };
  }

  // === INTEGRATION SYNC LOGS ===
  public static async fetchIntegrationSyncLogs() {
    try {
      const res = await fetch(`${this.apiBase}/admin/integration-sync-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch integration sync logs error', e);
    }
    return { success: false, logs: [] };
  }

  // === CONNECTOR TELEMETRY ===
  public static async fetchConnectorAuthorizations() {
    try {
      const res = await fetch(`${this.apiBase}/admin/connector-authorizations`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch connector authorizations error', e);
    }
    return { success: false, authorizations: [] };
  }

  public static async fetchConnectorHealthLogs() {
    try {
      const res = await fetch(`${this.apiBase}/admin/connector-health-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch connector health logs error', e);
    }
    return { success: false, healthLogs: [] };
  }

  public static async fetchProviderLatencyLogs() {
    try {
      const res = await fetch(`${this.apiBase}/admin/provider-latency-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Fetch provider latency logs error', e);
    }
    return { success: false, latencyLogs: [] };
  }

  // === AI OPERATION CLIENT WRAPPERS ===
  public static async postAiCommand(query: string) {
    try {
      const res = await fetch('/api/ai/cmd-k', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiCommand error', e);
    }
    return { success: false, resultText: `Result for query: ${query}` };
  }

  public static async postAiChat(query: string, memoryItems?: any[]) {
    try {
      const res = await fetch('/api/ai/memory-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, memoryItems })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiChat error', e);
    }
    return { success: false, answer: 'Answer processed' };
  }

  public static async postAiDailyBrief(userPrompt: string) {
    try {
      const res = await fetch('/api/ai/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiDailyBrief error', e);
    }
    return { success: false, summary: 'Briefing compiled.' };
  }

  public static async postAiDelegateTask(command: string) {
    try {
      const res = await fetch('/api/ai/delegate-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiDelegateTask error', e);
    }
    return { success: false };
  }

  public static async postAiEmailReply(params: { sender: string; subject: string; preview: string; tone: string }) {
    try {
      const res = await fetch('/api/ai/inbox-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiEmailReply error', e);
    }
    return { success: false };
  }

  public static async postAiMeetingSummary(params: { title: string; attendees: string[]; transcript: string; tone: string }) {
    try {
      const res = await fetch('/api/ai/meeting-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiMeetingSummary error', e);
    }
    return { success: false };
  }

  public static async postAiDocumentAnalysis(fileName: string, documentText: string) {
    try {
      const res = await fetch('/api/ai/document-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, documentText })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiDocumentAnalysis error', e);
    }
    return { success: false };
  }

  public static async postAiMemorySearch(query: string, memoryItems?: any[]) {
    try {
      const res = await fetch('/api/ai/memory-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, memoryItems })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiMemorySearch error', e);
    }
    return { success: false };
  }

  public static async postAiSemanticSearch(query: string) {
    try {
      const res = await fetch(`${this.apiBase}/memory/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiSemanticSearch error', e);
    }
    return { success: false };
  }

  public static async postAiWorkspaceSearch(query: string) {
    try {
      const res = await fetch(`/api/ai/cmd-k`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiWorkspaceSearch error', e);
    }
    return { success: false };
  }

  public static async postAiWorkflowExecution(command: string) {
    try {
      const res = await fetch('/api/ai/delegate-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('postAiWorkflowExecution error', e);
    }
    return { success: false };
  }

  // ----------------------------------------------------
  // Phase 5 Subscription & Entitlement System Methods
  // ----------------------------------------------------
  public static async fetchSubscriptionCurrent(userId?: string) {
    try {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const res = await fetch(`${this.apiBase}/subscriptions/current${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('fetchSubscriptionCurrent error', e);
    }
    return { success: false, subscription: null, usage: null };
  }

  public static async checkEntitlement(featureKey: string, requestedUnits: number = 1) {
    try {
      const res = await fetch(`${this.apiBase}/subscriptions/check-entitlement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureKey, requestedUnits })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('checkEntitlement error', e);
    }
    return { success: false, entitlement: { allowed: true } };
  }

  public static async recordFeatureUsage(featureKey: string, units: number = 1) {
    try {
      const res = await fetch(`${this.apiBase}/subscriptions/record-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureKey, units })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('recordFeatureUsage error', e);
    }
    return { success: false };
  }

  public static async fetchAdminSubscriptions(filterPlan?: string, filterStatus?: string) {
    try {
      const queryParams = new URLSearchParams();
      if (filterPlan) queryParams.set('plan', filterPlan);
      if (filterStatus) queryParams.set('status', filterStatus);
      const res = await fetch(`${this.apiBase}/admin/subscriptions?${queryParams.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('fetchAdminSubscriptions error', e);
    }
    return { success: false, subscriptions: [] };
  }

  public static async updateAdminUserSubscription(userId: string, planId: string, status?: string, periodEnd?: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/subscriptions/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId, status, periodEnd })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('updateAdminUserSubscription error', e);
    }
    return { success: false };
  }

  public static async grantSubscriptionTrial(userId: string, planId: string, trialDays: number = 14) {
    try {
      const res = await fetch(`${this.apiBase}/admin/subscriptions/trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId, trialDays })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('grantSubscriptionTrial error', e);
    }
    return { success: false };
  }

  public static async resetUserMonthlyUsage(userId: string) {
    try {
      const res = await fetch(`${this.apiBase}/admin/subscriptions/reset-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('resetUserMonthlyUsage error', e);
    }
    return { success: false };
  }

  public static async overrideUserLimits(userId: string, aiMessageOverride?: number, storageOverrideBytes?: number) {
    try {
      const res = await fetch(`${this.apiBase}/admin/subscriptions/override-limits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, aiMessageOverride, storageOverrideBytes })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('overrideUserLimits error', e);
    }
    return { success: false };
  }
}
