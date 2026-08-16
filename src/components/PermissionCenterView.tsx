import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mic, 
  Bell, 
  Calendar, 
  Users, 
  FolderOpen, 
  RefreshCw, 
  MapPin, 
  Camera, 
  Image, 
  Eye, 
  Clipboard, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Lock
} from 'lucide-react';

export interface DevicePermission {
  key: string;
  name: string;
  purpose: string;
  icon: React.ElementType;
  status: 'granted' | 'denied';
  lastUsedAt: string;
}

interface PermissionCenterViewProps {
  onBack?: () => void;
}

export const PermissionCenterView: React.FC<PermissionCenterViewProps> = ({ onBack }) => {
  const [permissions, setPermissions] = useState<DevicePermission[]>([
    { key: 'mic', name: 'Microphone Access', purpose: 'Voice briefing and push-to-talk natural conversation mode.', icon: Mic, status: 'granted', lastUsedAt: '10 mins ago' },
    { key: 'notifications', name: 'System Notifications', purpose: 'Deliver urgent workflow completion, price drop, and flight alerts.', icon: Bell, status: 'granted', lastUsedAt: 'Just now' },
    { key: 'calendar', name: 'Calendar Access', purpose: 'Read meetings and stage calendar briefings.', icon: Calendar, status: 'granted', lastUsedAt: '1 hour ago' },
    { key: 'contacts', name: 'Contacts Directory', purpose: 'Identify meeting attendees and recipient emails.', icon: Users, status: 'denied', lastUsedAt: 'Never' },
    { key: 'files', name: 'File Storage', purpose: 'Search uploaded contract proposals and document brain indexing.', icon: FolderOpen, status: 'granted', lastUsedAt: '2 hours ago' },
    { key: 'background', name: 'Background Activity', purpose: 'Background price drop monitors and flight discount watchers.', icon: RefreshCw, status: 'granted', lastUsedAt: '5 mins ago' },
    { key: 'location', name: 'Location Proximity', purpose: 'Find hotels and restaurants near meeting venues.', icon: MapPin, status: 'granted', lastUsedAt: '3 hours ago' },
    { key: 'camera', name: 'Camera Access', purpose: 'OCR document scanning and physical receipt indexing.', icon: Camera, status: 'denied', lastUsedAt: 'Never' },
    { key: 'photos', name: 'Photo Library', purpose: 'Universal share extension image analysis.', icon: Image, status: 'denied', lastUsedAt: 'Never' },
    { key: 'accessibility', name: 'Accessibility Service', purpose: 'Cross-app context assistance and screen reading.', icon: Eye, status: 'denied', lastUsedAt: 'Never' },
    { key: 'clipboard', name: 'Clipboard Integration', purpose: 'Detect copied URLs and tracking numbers for quick actions.', icon: Clipboard, status: 'granted', lastUsedAt: '30 mins ago' }
  ]);

  const togglePermission = (key: string) => {
    setPermissions(prev => prev.map(p => {
      if (p.key === key) {
        const nextStatus = p.status === 'granted' ? 'denied' : 'granted';
        return { ...p, status: nextStatus, lastUsedAt: nextStatus === 'granted' ? 'Just updated' : p.lastUsedAt };
      }
      return p;
    }));
  };

  const grantedCount = permissions.filter(p => p.status === 'granted').length;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          {onBack && (
            <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
              ← Back to Privacy Settings
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#00BFA6]" />
            <span>Centralized Permission Manager</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Granular hardware, background, and OS permission controls with explicit purpose disclosures.</p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
          <span className="text-neutral-400">Permissions Granted:</span>
          <span className="ml-2 text-[#00BFA6] font-semibold">{grantedCount} / {permissions.length}</span>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((perm) => {
          const Icon = perm.icon;
          const isGranted = perm.status === 'granted';
          return (
            <div
              key={perm.key}
              className={`p-5 rounded-2xl bg-[#0D0D11] border transition-all flex items-start justify-between gap-4 ${
                isGranted
                  ? 'border-white/[0.08] hover:border-[#00BFA6]/40'
                  : 'border-white/[0.04] opacity-70'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  isGranted
                    ? 'bg-[#00BFA6]/10 text-[#00BFA6] border-[#00BFA6]/30'
                    : 'bg-white/[0.02] text-neutral-500 border-white/[0.06]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{perm.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${
                      isGranted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-500'
                    }`}>
                      {perm.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 font-light leading-relaxed">{perm.purpose}</p>
                  <span className="text-[10px] font-mono text-neutral-500 block pt-1">Last Used: {perm.lastUsedAt}</span>
                </div>
              </div>

              <button
                onClick={() => togglePermission(perm.key)}
                className="p-1 cursor-pointer shrink-0 text-neutral-400 hover:text-white transition-colors"
                title={isGranted ? 'Revoke Permission' : 'Grant Permission'}
              >
                {isGranted ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-neutral-600" />}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
