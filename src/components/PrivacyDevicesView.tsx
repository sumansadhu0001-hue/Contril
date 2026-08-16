import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Globe, 
  Battery, 
  BatteryCharging, 
  LogOut, 
  Trash2, 
  Clock,
  Sparkles,
  Lock
} from 'lucide-react';

export interface UserDeviceItem {
  id: string;
  deviceName: string;
  platform: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';
  osVersion: string;
  appVersion: string;
  isActive: boolean;
  batteryLevel: number;
  lastActiveAt: string;
}

interface PrivacyDevicesViewProps {
  onBack?: () => void;
  onOpenPermissions?: () => void;
}

export const PrivacyDevicesView: React.FC<PrivacyDevicesViewProps> = ({ onBack, onOpenPermissions }) => {
  const [devices, setDevices] = useState<UserDeviceItem[]>([
    { id: 'dev-1', deviceName: 'MacBook Pro 16" (M3 Max)', platform: 'macos', osVersion: 'macOS 14.5', appVersion: '2.4.0', isActive: true, batteryLevel: 92, lastActiveAt: 'Active Now' },
    { id: 'dev-2', deviceName: 'iPhone 15 Pro Max', platform: 'ios', osVersion: 'iOS 17.5', appVersion: '2.4.0', isActive: true, batteryLevel: 78, lastActiveAt: '10 mins ago' },
    { id: 'dev-3', deviceName: 'Samsung Galaxy S24 Ultra', platform: 'android', osVersion: 'Android 14', appVersion: '2.3.9', isActive: false, batteryLevel: 45, lastActiveAt: '3 hours ago' },
    { id: 'dev-4', deviceName: 'Windows Workstation', platform: 'windows', osVersion: 'Windows 11 Enterprise', appVersion: '2.4.0', isActive: false, batteryLevel: 100, lastActiveAt: '1 day ago' }
  ]);

  const handleRemoteSignOut = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          {onBack && (
            <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
              ← Back to Overview
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#00BFA6]" />
            <span>Connected Devices & Remote Revocation</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Inspect signed-in cross-platform client devices, battery telemetry, and trigger remote sign-out.</p>
        </div>

        {onOpenPermissions && (
          <button
            onClick={onOpenPermissions}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-mono transition-colors cursor-pointer flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-[#00BFA6]" />
            <span>Permission Manager</span>
          </button>
        )}
      </div>

      {/* Devices Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => {
          const isMac = device.platform === 'macos' || device.platform === 'windows' || device.platform === 'linux';
          return (
            <div
              key={device.id}
              className={`p-5 rounded-2xl bg-[#0D0D11] border transition-all flex flex-col justify-between space-y-4 ${
                device.isActive
                  ? 'border-[#00BFA6]/40 shadow-[0_0_20px_rgba(0,191,166,0.08)]'
                  : 'border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/[0.04] text-neutral-300 border border-white/[0.08]">
                    {device.platform}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                    device.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-500'
                  }`}>
                    {device.isActive ? 'Active Session' : 'Idle'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#00BFA6]">
                    {isMac ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white">{device.deviceName}</h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">{device.osVersion} • v{device.appVersion}</p>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Battery className="w-4 h-4 text-[#00BFA6]" />
                  <span>{device.batteryLevel}%</span>
                  <span className="text-neutral-600">•</span>
                  <span>{device.lastActiveAt}</span>
                </div>

                <button
                  onClick={() => handleRemoteSignOut(device.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Remote Sign Out</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
