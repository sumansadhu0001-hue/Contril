import React, { useState } from 'react';
import { 
  ShoppingBag, 
  X, 
  CheckCircle2, 
  Star, 
  Download, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Sparkles,
  Bot,
  Zap,
  Layers
} from 'lucide-react';
import { ExtensionItem } from '../backend/marketplace/MarketplaceService';

interface ExtensionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  extension?: ExtensionItem;
  isInstalled?: boolean;
  onInstall?: (ext: ExtensionItem) => void;
  onUninstall?: (ext: ExtensionItem) => void;
}

export const ExtensionDetailModal: React.FC<ExtensionDetailModalProps> = ({
  isOpen,
  onClose,
  extension,
  isInstalled = false,
  onInstall,
  onUninstall
}) => {
  const [installedState, setInstalledState] = useState(isInstalled);

  if (!isOpen || !extension) return null;

  const handleInstallToggle = () => {
    if (installedState) {
      if (onUninstall) onUninstall(extension);
      setInstalledState(false);
    } else {
      if (onInstall) onInstall(extension);
      setInstalledState(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-modal-overlay">
      <div className="w-full max-w-xl bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 sm:p-8 relative space-y-6 text-white animate-modal-content backdrop-blur-xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-white/[0.06] pb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#00BFA6] shrink-0">
            <Zap className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">{extension.name}</h2>
              {extension.isVerified && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#00BFA6]/15 text-[#00BFA6] border border-[#00BFA6]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 font-mono">By {extension.developerName} • v{extension.version}</p>
            
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 pt-1">
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{extension.rating.toFixed(1)}</span>
              </span>
              <span>•</span>
              <span>{extension.downloadsCount.toLocaleString()} Downloads</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase text-neutral-400 tracking-wider">Overview</h3>
          <p className="text-xs text-neutral-300 font-light leading-relaxed">{extension.description}</p>
        </div>

        {/* Permission Guard Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Lock className="w-4 h-4 text-[#00BFA6]" />
            <span>Requested Extension Permissions</span>
          </div>

          <p className="text-[11px] text-neutral-400 font-light">By installing, you authorize this extension to access the following permissions:</p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {extension.permissions.map((perm, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-neutral-300 text-[10px]">
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Install / Uninstall Button */}
        <div className="pt-2">
          <button
            onClick={handleInstallToggle}
            className={`w-full py-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              installedState
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                : 'bg-[#00BFA6] hover:bg-[#00A892] text-black shadow-lg shadow-[#00BFA6]/20'
            }`}
          >
            {installedState ? 'Uninstall Extension' : 'Approve & Install Extension'}
          </button>
        </div>

      </div>
    </div>
  );
};
