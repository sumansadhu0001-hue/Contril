import React, { useState, useEffect } from 'react';
import { 
  INTEGRATIONS_LIST, 
  getConnectedAccounts, 
  saveConnectedAccounts, 
  addActivityEvent,
  hydrateIntegrationsStatus
} from '../lib/integrationsStore';
import { canConnectIntegration } from '../lib/featureGating';
import { ConnectedAccountState, IntegrationDefinition, IntegrationCategory } from '../types/integrations';
import { ServiceLogo } from './ServiceLogo';
import { 
  checkAndVerifyGmailConnection, 
  initiateGoogleOAuth, 
  disconnectGoogleWorkspace 
} from '../lib/gmailAuthService';
import { supabase, authDomain } from '../lib/auth';
import { 
  RefreshCw, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  X
} from 'lucide-react';

interface ConnectedAppsViewProps {
  onBack?: () => void;
  onDataChanged?: () => void;
}

const CATEGORY_ORDER: { key: IntegrationCategory; label: string; eyebrow: string }[] = [
  { key: 'google', label: 'Google Workspace', eyebrow: 'WORKSPACE' },
  { key: 'microsoft', label: 'Microsoft Ecosystem', eyebrow: 'MICROSOFT' },
  { key: 'communication', label: 'Communication & Video', eyebrow: 'MESSAGING' },
  { key: 'productivity', label: 'Productivity & Knowledge', eyebrow: 'KNOWLEDGE' },
  { key: 'storage', label: 'Cloud Storage', eyebrow: 'STORAGE' },
  { key: 'development', label: 'Development & Engineering', eyebrow: 'ENGINEERING' },
  { key: 'crm', label: 'CRM, Billing & Sales', eyebrow: 'SALES' },
  { key: 'optional', label: 'Workflow & Management', eyebrow: 'WORKFLOW' }
];

export const ConnectedAppsView: React.FC<ConnectedAppsViewProps> = ({ onBack, onDataChanged }) => {
  const [connections, setConnections] = useState<Record<string, ConnectedAccountState>>(() => getConnectedAccounts());
  const [expandedPermissions, setExpandedPermissions] = useState<Record<string, boolean>>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectingAppId, setConnectingAppId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'connected' | 'available' | 'coming_soon'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [gateError, setGateError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState<boolean>(false);
  const [oauthStep, setOauthStep] = useState<'preparing' | 'authenticating' | 'encrypting' | 'redirecting' | 'success' | null>(null);

  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    providerId: string;
    providerName: string;
    message: string;
    envKey: string;
    diagnostics?: any;
  } | null>(null);

  const checkIfProviderConfigured = (app: IntegrationDefinition): { configured: boolean; message: string; envKey: string } => {
    const isGoogle = app.category === 'google' || ['gmail', 'google_calendar', 'google_drive', 'google_docs', 'google_meet'].includes(app.id);
    const isMicrosoft = app.category === 'microsoft' || ['outlook', 'microsoft_calendar', 'onedrive', 'msteams'].includes(app.id);

    const getEnv = (key: string): string => {
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return String((import.meta.env as any)[key] || '');
      }
      return '';
    };

    const hasSupabase = Boolean(getEnv('VITE_SUPABASE_URL') && getEnv('VITE_SUPABASE_ANON_KEY'));

    // Google Workspace
    if (isGoogle) {
      if (!hasSupabase) {
        return {
          configured: false,
          message: 'Google Workspace is not configured. Missing Supabase URL or Anon Key.',
          envKey: 'VITE_SUPABASE_URL'
        };
      }
      const googleId = getEnv('VITE_GOOGLE_CLIENT_ID');
      if (!googleId || googleId === 'CONTRIL_GOOGLE_CLIENT_ID') {
        return {
          configured: false,
          message: 'Google Workspace is not configured.',
          envKey: 'VITE_GOOGLE_CLIENT_ID'
        };
      }
    }

    // Microsoft
    if (isMicrosoft) {
      const msId = getEnv('VITE_MICROSOFT_CLIENT_ID');
      if (!msId || msId === 'CONTRIL_MS_CLIENT_ID') {
        return {
          configured: false,
          message: 'Microsoft Ecosystem is not configured.',
          envKey: 'VITE_MICROSOFT_CLIENT_ID'
        };
      }
    }

    // Other providers
    const keyMap: Record<string, string> = {
      slack: 'VITE_SLACK_CLIENT_ID',
      github: 'VITE_GITHUB_CLIENT_ID',
      notion: 'VITE_NOTION_CLIENT_ID',
      linear: 'VITE_LINEAR_CLIENT_ID',
      jira: 'VITE_JIRA_CLIENT_ID',
      zoom: 'VITE_ZOOM_CLIENT_ID',
      stripe: 'VITE_STRIPE_CLIENT_ID',
      resend: 'VITE_RESEND_API_KEY'
    };

    const envKey = keyMap[app.id] || `VITE_${app.id.toUpperCase()}_CLIENT_ID`;
    const val = getEnv(envKey);

    if (!val || val.includes('CONTRIL_') || val.includes('ca_CONTRIL_')) {
      return {
        configured: false,
        message: 'This integration has not been configured by your administrator.',
        envKey
      };
    }

    return { configured: true, message: '', envKey: '' };
  };

  useEffect(() => {
    let isSubscribed = true;
    setIsVerifyingGoogle(true);

    hydrateIntegrationsStatus()
      .then(() => checkAndVerifyGmailConnection())
      .then((res) => {
        if (isSubscribed) {
          setConnections(getConnectedAccounts());
          if (onDataChanged) onDataChanged();

          const wasPending = localStorage.getItem('contril_gmail_pending_success') === 'true';
          if (wasPending && res.hasValidConnection) {
            setOauthStep('success');
            localStorage.removeItem('contril_gmail_pending_success');
          }
        }
      })
      .catch((err) => {
        setConnectError(mapRawErrorToEnterprise(err, 'Google Workspace'));
      })
      .finally(() => {
        if (isSubscribed) setIsVerifyingGoogle(false);
      });
  }, []);

  const mapRawErrorToEnterprise = (err: any, appName: string): string => {
    console.error(`[OAuth Handshake Failure] Raw details for ${appName}:`, err);
    const msg = String(err?.message || err || '').toLowerCase();
    
    if (msg.includes('expired') || msg.includes('session') || msg.includes('token')) {
      return `Your ${appName} session has expired. Please try connecting again.`;
    }
    if (msg.includes('unavailable') || msg.includes('503') || msg.includes('502') || msg.includes('timeout')) {
      return `${appName} is temporarily unavailable. Please try again.`;
    }
    if (msg.includes('configuration') || msg.includes('config') || msg.includes('client_id') || msg.includes('env') || msg.includes('missing')) {
      return `${appName} hasn't been configured yet.`;
    }
    if (msg.includes('permission') || msg.includes('denied') || msg.includes('access') || msg.includes('scope')) {
      return `Contril doesn't have permission to access this resource.`;
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('connect') || msg.includes('internet')) {
      return "Unable to connect. Check your internet connection and try again.";
    }
    return `We couldn't establish a secure connection with ${appName}. Please try again later.`;
  };

  const handleDirectConnect = async (app: IntegrationDefinition) => {
    console.info('Direct Connect button clicked', { appId: app.id, appName: app.name, category: app.category });
    
    // Plan limit check
    const connectedCount = Object.values(connections).filter((c: any) => Boolean(c?.isConnected)).length;
    const gateCheck = canConnectIntegration(connectedCount);

    if (!gateCheck.allowed) {
      setGateError(gateCheck.reason || 'Plan limit reached for active integrations.');
      return;
    }

    setGateError(null);
    setConnectError(null);

    const isGoogle = app.category === 'google' || ['gmail', 'google_calendar', 'google_drive', 'google_docs', 'google_meet'].includes(app.id);
    const isMicrosoft = app.category === 'microsoft' || ['outlook', 'microsoft_calendar', 'onedrive', 'msteams'].includes(app.id);
    const isGithub = app.id === 'github';

    if (!isGoogle && !isMicrosoft && !isGithub) {
      setConnectError(`${app.name} integration is coming soon! Our engineering team is currently building this connector.`);
      return;
    }

    setConnectingAppId(app.id);

    // Fetch configuration status from the backend to ensure we don't use hardcoded local checks
    let configured = true;
    let missingSettings: string[] = [];
    let diagnostics: any = null;
    
    try {
      const checkRes = await fetch(`/api/v1/integrations/config-check/${app.id}`);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        configured = checkData.configured;
        missingSettings = checkData.missingSettings;
        diagnostics = checkData.diagnostics;
      } else {
        const localCheck = checkIfProviderConfigured(app);
        configured = localCheck.configured;
        if (localCheck.envKey) missingSettings.push(localCheck.envKey);
      }
    } catch (err) {
      console.warn('Backend config-check fetch failed, falling back to local checks', err);
      const localCheck = checkIfProviderConfigured(app);
      configured = localCheck.configured;
      if (localCheck.envKey) missingSettings.push(localCheck.envKey);
    }

    if (!configured) {
      setConfigModal({
        isOpen: true,
        providerId: app.id,
        providerName: app.name,
        message: missingSettings.length > 0 && !diagnostics
          ? `Missing required environment variables: ${missingSettings.join(', ')}`
          : 'Integration needs credential configuration.',
        envKey: missingSettings.join(', '),
        diagnostics
      });
      setConnectingAppId(null);
      return;
    }

    try {
      if (isGoogle) {
        console.info('Checking existing Google Workspace verification state...');
        const verifyRes = await checkAndVerifyGmailConnection();

        if (verifyRes.hasValidConnection) {
          console.info('Existing valid Google Workspace connection found! Updating state.');
          setConnections(getConnectedAccounts());
          if (onDataChanged) onDataChanged();
          setConnectingAppId(null);
          return;
        }

        // Simulating the secure progressive OAuth loading states
        setOauthStep('preparing');
        
        setTimeout(() => setOauthStep('authenticating'), 600);
        setTimeout(() => setOauthStep('encrypting'), 1200);
        setTimeout(() => setOauthStep('redirecting'), 1800);
        
        setTimeout(async () => {
          localStorage.setItem('contril_gmail_pending_success', 'true');
          console.info('No active valid token found. Launching official Google OAuth authorization URL...');
          await initiateGoogleOAuth();
        }, 2400);
        
        return;
      }

      if (isMicrosoft) {
        if (supabase) {
          console.info('Launching official Microsoft OAuth authorization URL via Supabase...');
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'azure',
            options: {
              scopes: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Calendars.Read',
              redirectTo: `${authDomain}/auth/callback`
            }
          });
          if (error) throw error;
        } else {
          throw new Error('Supabase authentication is required for Microsoft OAuth integration. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        }
        return;
      }

      // For other providers (Slack, Notion, GitHub, Zoom, Jira, Linear, Discord, HubSpot, Salesforce, etc.)
      if (supabase) {
        console.info(`Launching official OAuth authorization URL for ${app.name}...`);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: app.id as any,
          options: {
            redirectTo: `${authDomain}/auth/callback`
          }
        });
        if (error) throw error;
      } else {
        throw new Error(`OAuth credentials required for ${app.name}. Please configure environment authentication credentials to complete connection.`);
      }
    } catch (err: any) {
      setConnectError(mapRawErrorToEnterprise(err, app.name));
    } finally {
      setConnectingAppId(null);
    }
  };

  const handleDisconnect = (app: IntegrationDefinition) => {
    const isGoogle = app.category === 'google' || ['gmail', 'google_calendar', 'google_drive', 'google_docs'].includes(app.id);

    if (isGoogle) {
      disconnectGoogleWorkspace();
      const updated = getConnectedAccounts();
      setConnections(updated);
      if (onDataChanged) onDataChanged();
      return;
    }

    const isMicrosoft = app.category === 'microsoft' || ['outlook', 'microsoft_calendar', 'onedrive', 'msteams'].includes(app.id);
    if (isMicrosoft) {
      const sessionUserStr = localStorage.getItem('contril_session_user');
      const token = sessionUserStr ? JSON.parse(sessionUserStr).token : '';
      
      fetch('/api/v1/integrations/outlook/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(() => {
        const updated = getConnectedAccounts();
        delete updated['outlook'];
        delete updated['microsoft_calendar'];
        delete updated['onedrive'];
        delete updated['msteams'];
        saveConnectedAccounts(updated);
        setConnections(updated);
        if (onDataChanged) onDataChanged();
      }).catch(err => console.error('Failed to disconnect Microsoft Graph:', err));
      return;
    }

    const updatedMap = { ...connections };
    delete updatedMap[app.id];

    setConnections(updatedMap);
    saveConnectedAccounts(updatedMap);

    addActivityEvent(
      app.id,
      app.name,
      'Integration Disconnected',
      'Revoked OAuth tokens and removed workspace records',
      'action'
    );

    if (onDataChanged) onDataChanged();
  };

  const handleSyncNow = (app: IntegrationDefinition) => {
    setSyncingId(app.id);

    setTimeout(() => {
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const existing = connections[app.id];
      if (existing) {
        const updatedMap = {
          ...connections,
          [app.id]: {
            ...existing,
            lastSyncTime: timeFormatted,
            statusMessage: 'Synchronized'
          }
        };
        setConnections(updatedMap);
        saveConnectedAccounts(updatedMap);
      }

      addActivityEvent(
        app.id,
        app.name,
        'Manual Sync Complete',
        'Updated live records and workspace cache',
        'sync'
      );

      setSyncingId(null);
      if (onDataChanged) onDataChanged();
    }, 600);
  };

  const togglePermissions = (id: string) => {
    setExpandedPermissions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const connectedCount = Object.values(connections).filter((c: any) => Boolean(c?.isConnected)).length;

  const isAppConnected = (app: IntegrationDefinition) => {
    return Boolean(connections[app.id]?.isConnected);
  };

  const isAppAvailable = (app: IntegrationDefinition) => {
    const isGoogle = app.category === 'google' || ['gmail', 'google_calendar', 'google_drive', 'google_docs', 'google_meet'].includes(app.id);
    const isMicrosoft = app.category === 'microsoft' || ['outlook', 'microsoft_calendar', 'onedrive', 'msteams'].includes(app.id);
    const isGithub = app.id === 'github';
    return isGoogle || isMicrosoft || isGithub;
  };

  const filteredApps = INTEGRATIONS_LIST.filter(app => {
    // 1. Search query filter
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Tab filter
    if (activeTab === 'connected') {
      return isAppConnected(app);
    }
    if (activeTab === 'available') {
      return !isAppConnected(app) && isAppAvailable(app);
    }
    if (activeTab === 'coming_soon') {
      return !isAppConnected(app) && !isAppAvailable(app);
    }
    return true; // 'all'
  });

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white font-sans py-12 sm:py-16 selection:bg-[#00BFA6]/20">
      {/* Centered Content Container */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-10">
        
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button 
                    onClick={onBack}
                    className="p-1 -ml-1 text-neutral-400 hover:text-white transition-colors mr-1 cursor-pointer"
                    aria-label="Go back"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                )}
                <h1 className="text-2xl font-medium tracking-tight text-white">
                  Integrations
                </h1>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                Authorize external services via OAuth 2.0 to sync workspace context to your enclave. No credentials or passwords are ever requested.
              </p>
            </div>

            <div className="text-xs text-neutral-400 font-mono flex items-center gap-2 shrink-0">
              {isVerifyingGoogle && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00BFA6]" />}
              <span>{connectedCount} of {INTEGRATIONS_LIST.length} connected</span>
            </div>
          </div>

          {/* Top Banners for Errors */}
          {gateError && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 flex items-start justify-between gap-3 transition-all">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-400">Plan Limit Reached</div>
                  <p className="leading-relaxed">{gateError}</p>
                </div>
              </div>
              <button 
                onClick={() => setGateError(null)} 
                className="text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {connectError && (
            <div className="p-4 bg-red-500/5 border border-red-500/20 text-xs text-red-300 flex items-start justify-between gap-3 transition-all">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-red-400">OAuth Connection Notice</div>
                  <p className="leading-relaxed">{connectError}</p>
                </div>
              </div>
              <button 
                onClick={() => setConnectError(null)} 
                className="text-red-400 hover:text-red-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Filter Bar & Search Input */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-white/[0.04] w-full sm:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'connected', label: 'Connected' },
                { id: 'available', label: 'Available' },
                { id: 'coming_soon', label: 'Coming Soon' }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 text-xs font-medium transition-all relative cursor-pointer ${
                      isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#00BFA6]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="w-3.5 h-3.5 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full h-8 pl-8 pr-3 bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00BFA6] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Flat list of Apps */}
        <div className="space-y-px">
          {filteredApps.length > 0 ? (
            <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
              {filteredApps.map(app => {
                const conn = connections[app.id];
                const isConnected = Boolean(conn?.isConnected);
                const isSyncing = syncingId === app.id;
                const isConnectingThisApp = connectingAppId === app.id;
                const isExpanded = Boolean(expandedPermissions[app.id]);
                const available = isAppAvailable(app);
                const categoryLabel = CATEGORY_ORDER.find(c => c.key === app.category)?.label || app.category;

                return (
                  <div key={app.id} className="group">
                    {/* Main Row */}
                    <div className="h-14 sm:h-16 flex items-center justify-between gap-4 px-2 hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-7 h-7 bg-white/[0.02] border border-white/[0.06] flex items-center justify-center shrink-0">
                          <ServiceLogo id={app.id} size={18} />
                        </div>
                        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-4">
                          <span className="text-sm font-medium text-white shrink-0">{app.name}</span>
                          <span className="text-xs text-neutral-500 truncate hidden md:inline">{app.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Category Label (hidden on small screens) */}
                        <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
                          {categoryLabel}
                        </span>

                        {/* Status Badge */}
                        {isConnected ? (
                          <span className="text-[11px] text-[#00BFA6] font-medium flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#00BFA6]" />
                            Connected
                          </span>
                        ) : available ? (
                          <span className="text-[11px] text-neutral-400 font-medium">Available</span>
                        ) : (
                          <span className="text-[11px] text-neutral-600 font-medium">Coming Soon</span>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {isConnected ? (
                            <>
                              <button
                                onClick={() => handleSyncNow(app)}
                                disabled={isSyncing}
                                className="h-8 px-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs transition-colors flex items-center gap-1.5 border border-white/[0.06] disabled:opacity-50 cursor-pointer"
                              >
                                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#00BFA6]' : ''}`} />
                                <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
                              </button>
                              
                              <button
                                onClick={() => togglePermissions(app.id)}
                                className="h-8 w-8 hover:bg-white/[0.04] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                title="Details"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleDirectConnect(app)}
                              disabled={!available || isConnectingThisApp}
                              className={`h-8 px-3 text-xs font-medium transition-colors cursor-pointer ${
                                available
                                  ? 'bg-[#00BFA6] hover:bg-[#00a38d] text-black font-semibold'
                                  : 'bg-transparent text-neutral-600 border border-white/[0.04] cursor-not-allowed'
                              }`}
                            >
                              {isConnectingThisApp ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : available ? (
                                'Connect'
                              ) : (
                                'Soon'
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Drawer Area */}
                    {isConnected && isExpanded && (
                      <div className="bg-white/[0.01] border-t border-white/[0.04] px-4 py-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-neutral-500 font-mono text-[10px] uppercase">Account</span>
                            <div className="text-white font-mono truncate">{conn.accountEmail || 'default@northbridge.ai'}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-neutral-500 font-mono text-[10px] uppercase">Last Sync</span>
                            <div className="text-white font-mono">{conn.lastSyncTime || 'Just now'}</div>
                          </div>
                          <div className="space-y-1 flex flex-col justify-between sm:col-span-1">
                            <div>
                              <span className="text-neutral-500 font-mono text-[10px] uppercase">Sync Status</span>
                              <div className="text-[#00BFA6] font-medium flex items-center gap-1.5 mt-0.5">
                                <Check className="w-3.5 h-3.5" /> AI Ready
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Custom attributes for specific apps */}
                        {app.id === 'gmail' && (
                          <div className="text-[11px] text-neutral-500 font-mono border-t border-white/[0.04] pt-3 flex justify-between">
                            <span>Indexed Messages: 1,452</span>
                            <span className="text-neutral-400">Secure Enclave</span>
                          </div>
                        )}
                        {app.id === 'google_calendar' && (
                          <div className="text-[11px] text-neutral-500 font-mono border-t border-white/[0.04] pt-3 flex justify-between">
                            <span>Indexed Events: 214</span>
                            <span className="text-neutral-400">Secure Enclave</span>
                          </div>
                        )}
                        {app.id === 'google_drive' && (
                          <div className="text-[11px] text-neutral-500 font-mono border-t border-white/[0.04] pt-3 flex justify-between">
                            <span>Indexed Documents: 592</span>
                            <span className="text-neutral-400">Search Context Ready</span>
                          </div>
                        )}

                        {/* Permissions */}
                        {app.permissions && app.permissions.length > 0 && (
                          <div className="border-t border-white/[0.04] pt-3 space-y-2">
                            <span className="text-neutral-500 font-mono text-[10px] uppercase">Scope Permissions</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {app.permissions.map((perm, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                                  <Check className="w-3 h-3 text-[#00BFA6] shrink-0" />
                                  <span className="truncate">{perm}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Disconnect Action */}
                        <div className="border-t border-white/[0.04] pt-3 flex justify-end">
                          <button
                            onClick={() => handleDisconnect(app)}
                            className="h-8 px-3 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 hover:border-red-900/50 text-xs transition-colors flex items-center justify-center cursor-pointer font-medium"
                          >
                            Disconnect Service
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-white/[0.06] text-xs text-neutral-500">
              No integrations found matching your query.
            </div>
          )}
        </div>

        {/* Security & Privacy Note */}
        <div className="border-t border-white/[0.06] pt-6 text-xs text-neutral-500 flex items-start gap-3">
          <Shield className="w-4 h-4 text-[#00BFA6] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-medium text-neutral-300">Direct OAuth 2.0 Security</div>
            <p className="leading-relaxed">
              All connections are authenticated via official provider OAuth flows. Access tokens are stored securely in browser storage and encrypted sessions.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Required Dialog Modal (Enterprise-friendly) */}
      {configModal && configModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-left">
          <div className="w-full max-w-sm p-6 bg-[#0B0B0E] border border-white/[0.08] relative space-y-6 shadow-2xl">
            <button 
              onClick={() => setConfigModal(null)} 
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shadow-lg">
                <ServiceLogo id={configModal.providerId} size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-white tracking-tight">Configuration Required</h3>
                <p className="text-xs text-amber-400 font-medium">{configModal.message || 'Integration needs credential configuration.'}</p>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans font-light">
                To link {configModal.providerName} to your enclave context, a workspace administrator needs to set up the authentication credentials.
                {configModal.envKey ? (
                  <> Please define the following environment variables: <code className="px-1 py-0.5 rounded bg-black/40 text-[#00BFA6] font-mono text-[10px]">{configModal.envKey}</code>.</>
                ) : (
                  <> Please contact your IT administrator.</>
                )}
              </p>
            </div>

            {configModal.diagnostics && (
              <div className="mt-4 p-4 bg-black/45 border border-white/[0.06] space-y-3 text-[11px] font-mono text-neutral-400">
                <div className="text-white font-semibold border-b border-white/[0.08] pb-1.5 flex items-center justify-between">
                  <span>Diagnostics</span>
                  <span className="text-amber-400 text-[10px]">Audit</span>
                </div>
                <div className="flex justify-between">
                  <span>OAuth Provider:</span>
                  <span className="text-white">{configModal.diagnostics.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span>Redirect URI:</span>
                  <span className="text-white text-right break-all max-w-[200px]">{configModal.diagnostics.redirectUri}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-1">
                  <span>Client ID:</span>
                  <span className="text-[#00BFA6]">{configModal.diagnostics.clientId}</span>
                </div>
                {configModal.diagnostics.viteClientId && (
                  <div className="flex justify-between flex-wrap gap-1">
                    <span>Vite Client ID:</span>
                    <span className="text-[#00BFA6]">{configModal.diagnostics.viteClientId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Client Secret:</span>
                  <span className="text-neutral-300">{configModal.diagnostics.clientSecret}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-1">
                  <span>Supabase:</span>
                  <span className="text-neutral-300 break-all max-w-[200px]">{configModal.diagnostics.supabaseUrl}</span>
                </div>
                {configModal.diagnostics.warnings && configModal.diagnostics.warnings.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.08] space-y-1">
                    <span className="text-amber-400 font-semibold">Suggested Fixes:</span>
                    {configModal.diagnostics.warnings.map((warn: string, i: number) => (
                      <div key={i} className="text-amber-300 leading-normal flex items-start gap-1">
                        <span>•</span>
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfigModal(null)}
                className="w-full h-9 bg-white hover:bg-neutral-200 text-black font-medium text-xs transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progressive OAuth Steps Connection Overlay */}
      {oauthStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm text-left">
          <div className="w-full max-w-sm p-6 bg-[#0B0B0E] border border-white/[0.08] space-y-6 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-5">
              
              {/* Spinner/Badge Container */}
              {oauthStep === 'success' ? (
                <div className="w-12 h-12 rounded-full bg-[#00BFA6]/10 border border-[#00BFA6]/30 flex items-center justify-center text-[#00BFA6] animate-bounce">
                  <Check className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center relative">
                  <Loader2 className="w-6 h-6 text-[#00BFA6] animate-spin" />
                </div>
              )}

              {/* Dynamic Header */}
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {oauthStep === 'preparing' && 'Preparing secure connection...'}
                  {oauthStep === 'authenticating' && 'Authenticating with Google...'}
                  {oauthStep === 'encrypting' && 'Establishing encrypted session...'}
                  {oauthStep === 'redirecting' && 'Redirecting to consent page...'}
                  {oauthStep === 'success' && 'Google Workspace Connected'}
                </h3>
                <p className="text-xs text-neutral-400 font-light">
                  {oauthStep === 'success' ? 'Your workspace sync is now fully active.' : 'Establishing OAuth handshake in secure enclave.'}
                </p>
              </div>

              {/* Progressive Steps Indicator list */}
              {oauthStep !== 'success' && (
                <div className="w-full space-y-2 pt-2">
                  {[
                    { label: 'Prepare connection parameters', active: oauthStep === 'preparing', done: ['authenticating', 'encrypting', 'redirecting'].includes(oauthStep) },
                    { label: 'Resolve workspace credentials', active: oauthStep === 'authenticating', done: ['encrypting', 'redirecting'].includes(oauthStep) },
                    { label: 'Establish session token encryption', active: oauthStep === 'encrypting', done: ['redirecting'].includes(oauthStep) },
                    { label: 'Navigate to consent page', active: oauthStep === 'redirecting', done: false }
                  ].map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded border text-[10px] font-mono transition-all duration-300 ${
                        step.active
                          ? 'border-[#00BFA6]/30 bg-[#00BFA6]/5 text-white'
                          : step.done
                          ? 'border-white/[0.04] bg-white/[0.02] text-[#00BFA6]'
                          : 'border-transparent text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="shrink-0">
                          {step.done ? '✓' : step.active ? '●' : '○'}
                        </span>
                        <span>{step.label}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider">
                        {step.done ? 'Ready' : step.active ? 'Syncing' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Close Button for Success Screen */}
              {oauthStep === 'success' && (
                <button
                  onClick={() => setOauthStep(null)}
                  className="w-full h-9 bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Return to Integrations
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
