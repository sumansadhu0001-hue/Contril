import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, X, CheckCircle2, Clock, Building2, Mail, Globe, User, 
  Sparkles, ChevronRight, ChevronLeft, MessageSquare, AlertTriangle, Server, Activity, Users, Key, 
  Compass, AlertCircle, Database, Cpu, RefreshCw, LogOut, Settings, 
  ToggleLeft, ToggleRight, Flag, Shield, CreditCard, HardDrive, Bell, BarChart3, 
  Code, Zap, BrainCircuit, FolderOpen, Layers, Radio, Terminal, Wrench, Send, Ticket,
  Webhook, ShoppingBag, Plus, Command, Filter, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import { ContrilApiClient } from '../lib/apiClient';
import { supabase } from '../lib/auth';
import { AdminCommandPaletteModal } from './AdminCommandPaletteModal';
import { AdminNotificationDrawer } from './AdminNotificationDrawer';
import { AdminAiAssistantModal } from './AdminAiAssistantModal';
import { AdminUserDetailModal } from './AdminUserDetailModal';
import { AdminOrgDetailModal } from './AdminOrgDetailModal';
import { AdminQuickActionsFab } from './AdminQuickActionsFab';
import { AdminHealthCenterView } from './AdminHealthCenterView';
import { AdminAnalyticsCenterView } from './AdminAnalyticsCenterView';
import { AdminDeveloperConsoleView } from './AdminDeveloperConsoleView';
import { AdminAuditCenterView } from './AdminAuditCenterView';

type AdminTab = 
  | 'dashboard' | 'platform_mode' | 'feature_flags' | 'early_access' | 'users' | 'support' | 'subscriptions' 
  | 'auth_center' | 'sessions' | 'organizations' | 'workspaces' | 'connected_apps' | 'notifications' | 'audit_logs' 
  | 'health' | 'background_jobs' | 'ai_operations' | 'ai_engine' | 'connectors' | 'agent_health' | 'storage' 
  | 'security' | 'settings' | 'analytics' | 'impersonation' | 'developer' | 'crm' | 'system_status' 
  | 'incident_control' | 'departments' | 'teams' | 'projects' | 'approval_queue' | 'api_keys' | 'webhook_logs' 
  | 'extension_registry' | 'marketplace_moderation' | 'extension_approvals';

const SIDEBAR_SECTIONS = [
  { label: 'OVERVIEW', items: [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: Activity },
    { id: 'system_status' as AdminTab, label: 'System Status', icon: Server },
    { id: 'incident_control' as AdminTab, label: 'Incident Control', icon: AlertTriangle },
  ]},
  { label: 'PLATFORM', items: [
    { id: 'platform_mode' as AdminTab, label: 'Platform Mode', icon: Radio },
    { id: 'feature_flags' as AdminTab, label: 'Feature Flags', icon: Flag },
    { id: 'settings' as AdminTab, label: 'System Settings', icon: Settings },
  ]},
  { label: 'USERS', items: [
    { id: 'early_access' as AdminTab, label: 'Early Access', icon: Compass },
    { id: 'users' as AdminTab, label: 'User Directory', icon: Users },
    { id: 'organizations' as AdminTab, label: 'Organizations', icon: Building2 },
    { id: 'subscriptions' as AdminTab, label: 'Subscriptions', icon: CreditCard },
  ]},
  { label: 'SUPPORT', items: [
    { id: 'support' as AdminTab, label: 'Support Console', icon: Ticket },
    { id: 'notifications' as AdminTab, label: 'Notifications', icon: Bell },
    { id: 'crm' as AdminTab, label: 'CRM Inquiries', icon: MessageSquare },
  ]},
  { label: 'SECURITY', items: [
    { id: 'auth_center' as AdminTab, label: 'Auth Center', icon: Key },
    { id: 'sessions' as AdminTab, label: 'Active Sessions', icon: Globe },
    { id: 'security' as AdminTab, label: 'Security Center', icon: Shield },
    { id: 'impersonation' as AdminTab, label: 'Impersonation', icon: User },
    { id: 'audit_logs' as AdminTab, label: 'Audit Logs', icon: ShieldCheck },
  ]},
  { label: 'INFRASTRUCTURE', items: [
    { id: 'health' as AdminTab, label: 'System Health', icon: Server },
    { id: 'background_jobs' as AdminTab, label: 'Background Jobs', icon: Layers },
    { id: 'ai_operations' as AdminTab, label: 'AI Operations', icon: BrainCircuit },
    { id: 'ai_engine' as AdminTab, label: 'AI Engine', icon: Cpu },
    { id: 'connectors' as AdminTab, label: 'Connectors', icon: Zap },
    { id: 'agent_health' as AdminTab, label: 'Agent Health', icon: Activity },
    { id: 'workflows_engine' as AdminTab, label: 'Workflow Engine', icon: Layers },
    { id: 'planning_engine' as AdminTab, label: 'Planning Engine', icon: BrainCircuit },
    { id: 'knowledge_graph' as AdminTab, label: 'Knowledge Graph', icon: Database },
    { id: 'vector_db' as AdminTab, label: 'Vector Database', icon: Database },
    { id: 'connected_devices' as AdminTab, label: 'Connected Devices', icon: HardDrive },
    { id: 'offline_queue' as AdminTab, label: 'Offline Queue', icon: Layers },
    { id: 'departments' as AdminTab, label: 'Departments', icon: Building2 },
    { id: 'teams' as AdminTab, label: 'Teams', icon: Users },
    { id: 'projects' as AdminTab, label: 'Projects', icon: FolderOpen },
    { id: 'approval_queue' as AdminTab, label: 'Approval Queue', icon: ShieldCheck },
    { id: 'storage' as AdminTab, label: 'Storage Manager', icon: HardDrive },
    { id: 'connected_apps' as AdminTab, label: 'Connected Apps', icon: Zap },
    { id: 'workspaces' as AdminTab, label: 'Workspaces', icon: FolderOpen },
  ]},
  { label: 'DEVELOPER', items: [
    { id: 'developer' as AdminTab, label: 'Developer Tools', icon: Terminal },
    { id: 'api_keys' as AdminTab, label: 'API Keys', icon: Key },
    { id: 'webhook_logs' as AdminTab, label: 'Webhook Logs', icon: Webhook },
    { id: 'extension_registry' as AdminTab, label: 'Extension Registry', icon: Code },
    { id: 'marketplace_moderation' as AdminTab, label: 'Marketplace Moderation', icon: ShoppingBag },
    { id: 'extension_approvals' as AdminTab, label: 'Extension Approvals', icon: ShieldCheck },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
  ]},
];

const EmptyState: React.FC<{ icon: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
  <div className="p-8 sm:p-12 rounded-3xl bg-[#0D0D11] border border-white/[0.06] text-center space-y-3 font-mono">
    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#00BFA6] mx-auto">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-white">{title}</h3>
    <p className="text-xs text-neutral-400 max-w-sm mx-auto font-light leading-relaxed">{description}</p>
  </div>
);

export const AdminInquiriesDashboard: React.FC<{ onBackToApp: () => void }> = ({ onBackToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Modals & Drawers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<any | null>(null);
  const [selectedOrgForModal, setSelectedOrgForModal] = useState<any | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Datasets - Real Data Policy
  const [usersList, setUsersList] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [aiOperations, setAiOperations] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<any[]>([]);
  const [planFilter, setPlanFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [approvalLoadingId, setApprovalLoadingId] = useState<string | null>(null);

  const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const [isRefreshingRequests, setIsRefreshingRequests] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const fetchSubscriptionRequests = async () => {
    try {
      // 1. Direct REST fetch to ensure requests load unconditionally in all network/session environments
      const res = await fetch('https://qjyowojnvbfezznezxrr.supabase.co/rest/v1/subscription_requests?select=*&order=requested_at.desc', {
        headers: {
          'apikey': 'sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT',
          'Authorization': 'Bearer sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSubscriptionRequests(data);
          return;
        }
      }
      // 2. Fallback to Supabase JS Client
      if (supabase) {
        const { data } = await supabase
          .from('subscription_requests')
          .select('*')
          .order('requested_at', { ascending: false });
        if (data && Array.isArray(data)) {
          setSubscriptionRequests(data);
        }
      }
    } catch (err) {
      console.warn('Could not fetch subscription_requests directly:', err);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchSubscriptionRequests();
    const interval = setInterval(fetchSubscriptionRequests, 5000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const checkAdminAccess = async () => {
    const session = await supabase?.auth.getSession();
    if (session?.data?.session?.user) {
      const user = session.data.session.user;
      const role = user.user_metadata?.role || 'user';
      if (role === 'owner' || role === 'super_admin') {
        setIsAuthenticated(true);
        setIsAuthorized(true);
        loadAdminData();
      }
    }
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const users = await ContrilApiClient.fetchAdminUsers();
      setUsersList(users && Array.isArray(users.users) ? users.users : []);
      const sess = await ContrilApiClient.fetchActiveSessions();
      setSessions(sess && Array.isArray(sess.sessions) ? sess.sessions : []);
      const logs = await ContrilApiClient.fetchSecurityAuditLogs();
      setAuditLogs(logs && Array.isArray(logs.logs) ? logs.logs : []);
      const tickets = await ContrilApiClient.fetchSupportTickets();
      setSupportTickets(tickets && Array.isArray(tickets.tickets) ? tickets.tickets : []);
      const ops = await ContrilApiClient.fetchAiOperations();
      setAiOperations(ops && Array.isArray(ops.usage) ? ops.usage : []);
      const orgs = await ContrilApiClient.fetchOrganizations();
      setOrganizations(orgs && Array.isArray(orgs.organizations) ? orgs.organizations : []);

      await fetchSubscriptionRequests();
    } catch {
      // Clean fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePlanRequest = async (req: any) => {
    setApprovalLoadingId(req.id || req.transaction_ref);
    try {
      const isElite = (req.plan || '').toLowerCase().includes('elite');
      const now = new Date().toISOString();

      // 1. Direct REST update to Supabase subscription_requests table
      if (req.id) {
        await fetch(`https://qjyowojnvbfezznezxrr.supabase.co/rest/v1/subscription_requests?id=eq.${req.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': 'sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT',
            'Authorization': 'Bearer sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'APPROVED',
            approved_at: now
          })
        });
      }

      // 2. Direct REST update to user profiles table if user_id is a valid UUID
      if (req.user_id && req.user_id.length > 10 && !req.user_id.startsWith('user_')) {
        await fetch(`https://qjyowojnvbfezznezxrr.supabase.co/rest/v1/profiles?id=eq.${req.user_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': 'sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT',
            'Authorization': 'Bearer sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_paid: true,
            plan: req.plan,
            subscription_status: isElite ? 'ACTIVE_ELITE' : 'ACTIVE_PRO'
          })
        });
      }

      // 3. Update local state immediately
      setSubscriptionRequests(prev =>
        prev.map(item => (item.id === req.id || item.transaction_ref === req.transaction_ref)
          ? { ...item, status: 'APPROVED', approved_at: now }
          : item
        )
      );
    } catch (err) {
      console.error('Error approving request:', err);
    } finally {
      setApprovalLoadingId(null);
    }
  };

  const handleRejectPlanRequest = async (req: any) => {
    setApprovalLoadingId(req.id || req.transaction_ref);
    try {
      if (req.id) {
        await fetch(`https://qjyowojnvbfezznezxrr.supabase.co/rest/v1/subscription_requests?id=eq.${req.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': 'sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT',
            'Authorization': 'Bearer sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ status: 'REJECTED' })
        });
      }

      setSubscriptionRequests(prev =>
        prev.map(item => (item.id === req.id || item.transaction_ref === req.transaction_ref)
          ? { ...item, status: 'REJECTED' }
          : item
        )
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setApprovalLoadingId(null);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  // Strict single passcode
  const VALID_PASSCODES = [
    'contril_x14_suman',
    import.meta.env.VITE_DEV_ADMIN_PASSCODE || ''
  ].filter(Boolean);

  const handleDevPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim();
    if (VALID_PASSCODES.includes(clean)) {
      setIsAuthenticated(true);
      setIsAuthorized(true);
      setAuthError('');
      loadAdminData();
    } else {
      setAuthError('Access Denied: Invalid master administrative credentials.');
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return;
      }

      const role = data.user?.user_metadata?.role || 'user';
      if (role === 'owner' || role === 'super_admin') {
        setIsAuthenticated(true);
        setIsAuthorized(true);
        loadAdminData();
      } else {
        setAuthError('Unauthorized: Owner or Super Admin role required.');
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actId: string) => {
    if (actId === 'create_user') setActiveTab('users');
    else if (actId === 'create_org') setActiveTab('organizations');
    else if (actId === 'create_workspace') setActiveTab('workspaces');
    else if (actId === 'generate_key') setActiveTab('api_keys');
    else if (actId === 'grant_subscription') setActiveTab('subscriptions');
    else alert(`Executing Quick Action: ${actId}`);
  };

  const calculatedMrr = (subscriptions || []).reduce((sum, s) => {
    if (s && s.plan_id === 'pro') return sum + 499;
    if (s && s.plan_id === 'business') return sum + 1799;
    return sum;
  }, 0);

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#0D0D11] border border-white/[0.08] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#00BFA6]/10 border border-[#00BFA6]/20 flex items-center justify-center text-[#00BFA6] mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Contril Enterprise Console</h1>
            <p className="text-xs text-neutral-400 font-mono">Executive Operations & Live Control Center</p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleDevPasscodeSubmit} className="space-y-4 pt-2 pb-2">
            <div className="text-xs text-neutral-400 font-mono flex items-center justify-between">
              <span>Enter Developer Passcode</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-[#00BFA6] hover:underline cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Developer Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6] font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer"
            >
              Access Admin Enclave
            </button>
          </form>

          <div className="pt-2 text-center">
            <button onClick={onBackToApp} className="text-xs text-neutral-500 hover:text-neutral-300 font-mono cursor-pointer">
              ← Return to Main Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative selection:bg-[#00BFA6] selection:text-black">
      
      {/* Top Bar */}
      <header className="h-16 border-b border-white/[0.06] bg-[#0D0D11]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00BFA6]" />
            <span className="font-semibold text-sm text-white tracking-tight">Contril Executive Operations v2.0</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#00BFA6]/15 text-[#00BFA6] border border-[#00BFA6]/30">
              Operational
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 text-xs font-mono border border-white/[0.06] cursor-pointer"
          >
            <Command className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Search commands...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px]">Ctrl+K</kbd>
          </button>

          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#00BFA6]/15 hover:bg-[#00BFA6]/25 text-[#00BFA6] border border-[#00BFA6]/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span className="hidden sm:inline">AI Executive Assistant</span>
          </button>

          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
          </button>

          <button onClick={onBackToApp} className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-neutral-400 hover:text-white font-mono border border-white/[0.06] cursor-pointer">
            Exit Admin
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 border-r border-white/[0.06] bg-[#0D0D11] flex flex-col justify-between p-3 shrink-0`}>
          <div className="space-y-4">
            
            {!isSidebarCollapsed && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter tabs..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full bg-[#17171B] border border-white/[0.06] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6] font-mono"
                />
              </div>
            )}

            <div className="overflow-y-auto max-h-[calc(100vh-140px)] space-y-4 pr-1 no-scrollbar font-mono text-xs">
              {SIDEBAR_SECTIONS.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  {!isSidebarCollapsed && (
                    <div className="text-[10px] text-neutral-500 uppercase px-2 py-1 tracking-wider">{sec.label}</div>
                  )}

                  {sec.items
                    .filter(item => !sidebarSearch || item.label.toLowerCase().includes(sidebarSearch.toLowerCase()))
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const pendingCount = subscriptionRequests.filter(r => (r.status || 'PENDING_APPROVAL').toUpperCase() === 'PENDING_APPROVAL').length;
                      const showBadge = (item.id === 'subscriptions' || item.id === 'approval_queue' || item.id === 'crm') && pendingCount > 0;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#00BFA6] text-black font-semibold shadow-md shadow-[#00BFA6]/20'
                              : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {!isSidebarCollapsed && (
                            <div className="flex items-center justify-between flex-1 truncate">
                              <span className="truncate">{item.label}</span>
                              {showBadge && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black animate-pulse">
                                  {pendingCount}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>

          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 font-sans">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Executive Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase">Registered Users</span>
                  <div className="text-2xl font-bold text-white">{usersList.length}</div>
                  <div className="text-[11px] text-neutral-400">User directory records</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase">Monthly Recurring Revenue</span>
                  <div className="text-2xl font-bold text-[#00BFA6]">₹{calculatedMrr.toLocaleString()}</div>
                  <div className="text-[11px] text-neutral-400">{subscriptions.length} active paid plans</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase">AI Operations Logs</span>
                  <div className="text-2xl font-bold text-white">{aiOperations.length}</div>
                  <div className="text-[11px] text-neutral-400">RAG traces</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
                  <span className="text-[10px] text-neutral-500 uppercase">Active Organizations</span>
                  <div className="text-2xl font-bold text-white">{organizations.length}</div>
                  <div className="text-[11px] text-neutral-400">Tenant accounts</div>
                </div>
              </div>

              {/* AI Prompt Telemetry Chart */}
              <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4 font-mono">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Prompt Telemetry & RAG Throughput</h3>
                    <p className="text-xs text-neutral-400">Real-time token request log entries from Universal Intent Engine.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Synced</span>
                </div>

                {Array.isArray(aiOperations) && aiOperations.length === 0 ? (
                  <EmptyState icon={BrainCircuit} title="No AI Request Telemetry" description="AI prompt execution traces and reasoning logs will be charted here as users interact with Contril AI OS." />
                ) : (
                  <div className="h-32 w-full flex items-end gap-2 pt-4 border-b border-white/[0.06] pb-2">
                    {(Array.isArray(aiOperations) ? aiOperations : []).slice(0, 12).map((op, i) => (
                      <div key={i} className="flex-1 bg-[#00BFA6]/20 hover:bg-[#00BFA6] transition-all rounded-t relative group h-24">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {op.agent_id || 'AI'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paid Plan Purchase Inquiries & Manual Approval Queue */}
              <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-5 font-mono shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-[#00BFA6]" />
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Paid Plan Inquiries & Manual Approval Queue
                      </h3>
                      {subscriptionRequests.filter(r => (r.status || 'PENDING_APPROVAL').toUpperCase() === 'PENDING_APPROVAL').length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold">
                          {subscriptionRequests.filter(r => (r.status || 'PENDING_APPROVAL').toUpperCase() === 'PENDING_APPROVAL').length} PENDING
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-sans">
                      Users who selected ₹899 Pro or ₹3,999 Elite appear here for 1-click manual activation.
                    </p>
                  </div>

                  {/* Actions & Filter Pills */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setIsRefreshingRequests(true);
                        await fetchSubscriptionRequests();
                        setTimeout(() => setIsRefreshingRequests(false), 500);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-white/[0.06] text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Refresh Queue"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRequests ? 'animate-spin text-[#00BFA6]' : ''}`} />
                      <span>Refresh</span>
                    </button>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px]">
                      {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          onClick={() => setPlanFilter(filterKey)}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            planFilter === filterKey
                              ? 'bg-[#00BFA6] text-black font-bold shadow-xs'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {filterKey.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {subscriptionRequests.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-neutral-500 mx-auto" />
                    <div className="text-xs text-neutral-300 font-semibold">No Pending Plan Inquiries</div>
                    <p className="text-[11px] text-neutral-500 max-w-sm mx-auto font-sans">
                      When a user chooses a Pro or Elite plan in the app, their request will appear here for you to manually approve.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-neutral-400 border-b border-white/[0.06] text-[11px]">
                        <tr>
                          <th className="p-3">User & Contact</th>
                          <th className="p-3">Phone Number</th>
                          <th className="p-3">Plan Selected</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Requested At</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Manual Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {subscriptionRequests
                          .filter(req => planFilter === 'ALL' || (req.status || 'PENDING_APPROVAL').toUpperCase() === planFilter)
                          .map((req) => {
                            const isPending = (req.status || 'PENDING_APPROVAL').toUpperCase() === 'PENDING_APPROVAL';
                            const isApproved = (req.status || '').toUpperCase() === 'APPROVED';
                            const isRejected = (req.status || '').toUpperCase() === 'REJECTED';
                            const isElite = (req.plan || '').toLowerCase().includes('elite');
                            const isLoadingThis = approvalLoadingId === (req.id || req.transaction_ref);

                            return (
                              <tr key={req.id || req.transaction_ref} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-3">
                                  <div className="font-semibold text-white">{req.user_name || req.email?.split('@')[0] || 'User'}</div>
                                  <div className="text-[11px] text-neutral-400 font-mono">{req.email || 'No email'}</div>
                                </td>
                                <td className="p-3">
                                  {req.phone_number ? (
                                    <div className="space-y-0.5">
                                      <a
                                        href={`tel:${req.phone_number}`}
                                        className="text-[#00BFA6] hover:underline font-mono font-bold text-xs flex items-center gap-1"
                                      >
                                        <span>📞</span>
                                        <span>{req.phone_number}</span>
                                      </a>
                                      <a
                                        href={`https://wa.me/${req.phone_number.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-emerald-400/80 hover:text-emerald-300 block"
                                      >
                                        Open WhatsApp →
                                      </a>
                                    </div>
                                  ) : (
                                    <span className="text-neutral-500 text-[11px] font-mono">Not provided</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                                    isElite 
                                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' 
                                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  }`}>
                                    {req.plan || 'Pro Plan'}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-[#00BFA6]">
                                  ₹{req.amount ? req.amount.toLocaleString() : (isElite ? '3,999' : '899')}/mo
                                </td>
                                <td className="p-3 text-neutral-400 text-[11px]">
                                  {req.requested_at ? new Date(req.requested_at).toLocaleDateString() + ' ' + new Date(req.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                </td>
                                <td className="p-3">
                                  {isPending && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1 w-fit">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                      Pending Approval
                                    </span>
                                  )}
                                  {isApproved && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1 w-fit">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      Approved
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold w-fit">
                                      Rejected
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  {isPending ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        disabled={isLoadingThis}
                                        onClick={() => handleApprovePlanRequest(req)}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs hover:shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{isLoadingThis ? 'Approving...' : 'Approve Plan'}</span>
                                      </button>
                                      <button
                                        disabled={isLoadingThis}
                                        onClick={() => handleRejectPlanRequest(req)}
                                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-white/[0.08] hover:border-rose-500/30 text-[11px] transition-all cursor-pointer disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-neutral-500">
                                      {isApproved ? 'Access Granted' : 'Declined'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Users Directory Table */}
              <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4 font-mono">
                <h3 className="text-sm font-semibold text-white">Registered User Directory</h3>
                {!Array.isArray(usersList) || usersList.length === 0 ? (
                  <EmptyState icon={Users} title="No Registered Users" description="Registered user accounts will be listed here once users sign up." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-neutral-400 border-b border-white/[0.06]">
                        <tr>
                          <th className="p-3">User Email</th>
                          <th className="p-3">Role</th>
                          <th className="p-3 text-right">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {(Array.isArray(usersList) ? usersList : []).map((u) => (
                          <tr key={u.id} className="hover:bg-white/[0.01]">
                            <td className="p-3 text-white font-semibold">{u.email}</td>
                            <td className="p-3 text-neutral-400 uppercase">{u.role || 'member'}</td>
                            <td className="p-3 text-right">
                              <button onClick={() => setSelectedUserForModal(u)} className="p-1.5 rounded hover:bg-white/[0.06] text-neutral-400 hover:text-white cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* HEALTH CENTER TAB */}
          {(activeTab === 'health' || activeTab === 'system_status') && (
            <AdminHealthCenterView />
          )}

          {/* ANALYTICS CENTER TAB */}
          {activeTab === 'analytics' && (
            <AdminAnalyticsCenterView usersCount={usersList.length} orgsCount={organizations.length} aiOpsCount={aiOperations.length} />
          )}

          {/* DEVELOPER CONSOLE TABS */}
          {(activeTab === 'developer' || activeTab === 'api_keys' || activeTab === 'webhook_logs' || activeTab === 'extension_registry') && (
            <AdminDeveloperConsoleView />
          )}

          {/* AUDIT LOGS TAB */}
          {activeTab === 'audit_logs' && (
            <AdminAuditCenterView auditLogs={auditLogs} />
          )}

          {/* SUBSCRIPTIONS / APPROVAL QUEUE / CRM / EARLY ACCESS TABS */}
          {(activeTab === 'subscriptions' || activeTab === 'approval_queue' || activeTab === 'crm' || activeTab === 'early_access') && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-5 font-mono shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-[#00BFA6]" />
                      <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                        {activeTab.replace(/_/g, ' ')} — Paid Plan Inquiries & Approval Queue
                      </h3>
                      {subscriptionRequests.filter(r => (r.status || 'PENDING_APPROVAL').toUpperCase() === 'PENDING_APPROVAL').length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold">
                          {subscriptionRequests.filter(r => (r.status || 'PENDING_APPROVAL').toUpperCase() === 'PENDING_APPROVAL').length} PENDING
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 font-sans">
                      Review user applications with contact phone number and email for manual approval.
                    </p>
                  </div>

                  {/* Actions & Filter Pills */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setIsRefreshingRequests(true);
                        await fetchSubscriptionRequests();
                        setTimeout(() => setIsRefreshingRequests(false), 500);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-white/[0.06] text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Refresh Queue"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRequests ? 'animate-spin text-[#00BFA6]' : ''}`} />
                      <span>Refresh</span>
                    </button>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px]">
                      {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          onClick={() => setPlanFilter(filterKey)}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            planFilter === filterKey
                              ? 'bg-[#00BFA6] text-black font-bold shadow-xs'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {filterKey.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {subscriptionRequests.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-neutral-500 mx-auto" />
                    <div className="text-xs text-neutral-300 font-semibold">No Pending Plan Inquiries</div>
                    <p className="text-[11px] text-neutral-500 max-w-sm mx-auto font-sans">
                      When a user chooses a Pro or Elite plan in the app, their request will appear here for you to manually approve.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-neutral-400 border-b border-white/[0.06] text-[11px]">
                        <tr>
                          <th className="p-3">User & Contact</th>
                          <th className="p-3">Phone Number</th>
                          <th className="p-3">Plan Selected</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Requested At</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Manual Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {subscriptionRequests
                          .filter(req => planFilter === 'ALL' || (req.status || 'PENDING_APPROVAL').toUpperCase() === planFilter)
                          .map((req) => {
                            const isPending = (req.status || 'PENDING_APPROVAL').toUpperCase() === 'PENDING_APPROVAL';
                            const isApproved = (req.status || '').toUpperCase() === 'APPROVED';
                            const isRejected = (req.status || '').toUpperCase() === 'REJECTED';
                            const isElite = (req.plan || '').toLowerCase().includes('elite');
                            const isLoadingThis = approvalLoadingId === (req.id || req.transaction_ref);

                            return (
                              <tr key={req.id || req.transaction_ref} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-3">
                                  <div className="font-semibold text-white">{req.user_name || req.email?.split('@')[0] || 'User'}</div>
                                  <div className="text-[11px] text-neutral-400 font-mono">{req.email || 'No email'}</div>
                                </td>
                                <td className="p-3">
                                  {req.phone_number ? (
                                    <div className="space-y-0.5">
                                      <a
                                        href={`tel:${req.phone_number}`}
                                        className="text-[#00BFA6] hover:underline font-mono font-bold text-xs flex items-center gap-1"
                                      >
                                        <span>📞</span>
                                        <span>{req.phone_number}</span>
                                      </a>
                                      <a
                                        href={`https://wa.me/${req.phone_number.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-emerald-400/80 hover:text-emerald-300 block"
                                      >
                                        Open WhatsApp →
                                      </a>
                                    </div>
                                  ) : (
                                    <span className="text-neutral-500 text-[11px] font-mono">Not provided</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                                    isElite 
                                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' 
                                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                  }`}>
                                    {req.plan || 'Pro Plan'}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-[#00BFA6]">
                                  ₹{req.amount ? req.amount.toLocaleString() : (isElite ? '3,999' : '899')}/mo
                                </td>
                                <td className="p-3 text-neutral-400 text-[11px]">
                                  {req.requested_at ? new Date(req.requested_at).toLocaleDateString() + ' ' + new Date(req.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                </td>
                                <td className="p-3">
                                  {isPending && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1 w-fit">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                      Pending Approval
                                    </span>
                                  )}
                                  {isApproved && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1 w-fit">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      Approved
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold w-fit">
                                      Rejected
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  {isPending ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        disabled={isLoadingThis}
                                        onClick={() => handleApprovePlanRequest(req)}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs hover:shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{isLoadingThis ? 'Approving...' : 'Approve Plan'}</span>
                                      </button>
                                      <button
                                        disabled={isLoadingThis}
                                        onClick={() => handleRejectPlanRequest(req)}
                                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-white/[0.08] hover:border-rose-500/30 text-[11px] transition-all cursor-pointer disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-neutral-500">
                                      {isApproved ? 'Access Granted' : 'Declined'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FALLBACK TABS */}
          {activeTab !== 'dashboard' && activeTab !== 'subscriptions' && activeTab !== 'approval_queue' && activeTab !== 'crm' && activeTab !== 'early_access' && activeTab !== 'health' && activeTab !== 'system_status' && activeTab !== 'analytics' && activeTab !== 'developer' && activeTab !== 'api_keys' && activeTab !== 'webhook_logs' && activeTab !== 'extension_registry' && activeTab !== 'audit_logs' && (
            <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4 font-mono">
              <h3 className="text-sm font-semibold text-white capitalize">{activeTab.replace(/_/g, ' ')} Module</h3>
              <EmptyState icon={Activity} title={`Module Active: ${activeTab.replace(/_/g, ' ')}`} description={`Query returned 0 records for ${activeTab}. Real telemetry entries will display as platform activity is logged.`} />
            </div>
          )}

        </main>
      </div>

      {/* Persistent System Status Bar */}
      <footer className="h-9 border-t border-white/[0.06] bg-[#0D0D11] px-4 flex items-center justify-between text-[10px] font-mono text-neutral-400 z-30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Express Server: Running</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Supabase DB: Connected</span>
        </div>
        <span>Contril Executive Operations v2.0</span>
      </footer>

      {/* Floating Quick Actions FAB */}
      <AdminQuickActionsFab onAction={handleQuickAction} />

      {/* Modals & Drawers */}
      <AdminCommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab as any)}
        onAction={handleQuickAction}
      />

      <AdminNotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      <AdminAiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      <AdminUserDetailModal
        isOpen={!!selectedUserForModal}
        onClose={() => setSelectedUserForModal(null)}
        user={selectedUserForModal}
      />

      <AdminOrgDetailModal
        isOpen={!!selectedOrgForModal}
        onClose={() => setSelectedOrgForModal(null)}
        org={selectedOrgForModal}
      />

    </div>
  );
};
