import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { 
  getConnectedAccounts, 
  hydrateIntegrationsStatus 
} from '../../lib/integrationsStore';
import { 
  checkAndVerifyGmailConnection, 
  initiateGoogleOAuth, 
  disconnectGoogleWorkspace 
} from '../../lib/gmailAuthService';

interface IntegrationsViewProps {
  onBack?: () => void;
  onDataChanged?: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ onBack, onDataChanged }) => {
  const [connections, setConnections] = useState<Record<string, any>>(() => getConnectedAccounts());
  const [isVerifying, setIsVerifying] = useState(false);

  const refreshAll = async () => {
    setIsVerifying(true);
    try {
      await hydrateIntegrationsStatus();
      await checkAndVerifyGmailConnection();
      setConnections(getConnectedAccounts());
      if (onDataChanged) onDataChanged();
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleConnectGoogle = async () => {
    await initiateGoogleOAuth();
    refreshAll();
  };

  const handleDisconnectGoogle = async () => {
    if (window.confirm('Disconnect Google Workspace? Contril will stop syncing Gmail, Calendar, and Drive.')) {
      await disconnectGoogleWorkspace();
      refreshAll();
    }
  };

  const googleServices = [
    {
      id: 'gmail',
      name: 'Google Gmail',
      description: 'Read unread inbox threads, extract priorities, and generate executive reply drafts.',
      isConnected: Boolean(connections['gmail']?.isConnected)
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync daily agendas, discover scheduling conflicts, and prepare meeting briefs.',
      isConnected: Boolean(connections['google_calendar']?.isConnected)
    },
    {
      id: 'google_drive',
      name: 'Google Drive & Docs',
      description: 'Index documents, search meeting attachments, and extract relevant knowledge context.',
      isConnected: Boolean(connections['google_drive']?.isConnected)
    }
  ];

  const additionalConnectors = [
    {
      id: 'outlook',
      name: 'Microsoft 365 (Outlook)',
      description: 'Corporate email & calendar support via Microsoft Graph API.',
      status: 'Available'
    },
    {
      id: 'slack',
      name: 'Slack Workspaces',
      description: 'Channel summaries, direct messages context, and notifications.',
      status: 'Coming Soon'
    },
    {
      id: 'notion',
      name: 'Notion Knowledge Base',
      description: 'Index team wikis, project roadmaps, and meeting notes.',
      status: 'Coming Soon'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.08] pb-6">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            SECURE CONNECTORS
          </div>
          <h1 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
            Integrations & Service Enclave
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Connect your primary digital workspace. Tokens are encrypted and never exposed.
          </p>
        </div>

        <button
          onClick={refreshAll}
          className="h-9 px-4 rounded-xl bg-white dark:bg-[#0D1117] hover:bg-[#F0F6FF] dark:hover:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-[#2563EB]' : ''}`} />
          <span>Verify Health</span>
        </button>
      </div>

      {/* Primary Google Workspace Enclave */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Google Workspace Enclave
          </div>
          
          {googleServices.some(s => s.isConnected) ? (
            <button
              onClick={handleDisconnectGoogle}
              className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Disconnect Google
            </button>
          ) : (
            <button
              onClick={handleConnectGoogle}
              className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Connect Google</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {googleServices.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F6FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {service.name.charAt(0)}
                  </div>
                  
                  <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                    service.isConnected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-[#F1F5F9] dark:bg-[#161F30] text-[#64748B]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${service.isConnected ? 'bg-emerald-500' : 'bg-[#94A3B8]'}`} />
                    <span>{service.isConnected ? 'Connected' : 'Offline'}</span>
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
                  {service.name}
                </h3>

                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between text-[11px] text-[#64748B]">
                <span className="font-mono text-[10px]">OAuth 2.0 PKCE</span>
                <span className="text-[#2563EB] dark:text-[#3B82F6] font-medium">Encrypted</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Connectors */}
      <div className="space-y-4 pt-4">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Ecosystem & Team Tools
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {additionalConnectors.map((tool) => (
            <div
              key={tool.id}
              className="p-6 rounded-3xl bg-white/70 dark:bg-[#0D1117]/60 border border-[#E2E8F0] dark:border-white/[0.06] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#64748B]">
                    {tool.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">
                  {tool.name}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <button
                disabled
                className="w-full py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#161F30] text-[#64748B] text-xs font-semibold cursor-not-allowed"
              >
                {tool.status}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
