import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Globe, 
  Image, 
  FileText, 
  Mail, 
  ShoppingBag, 
  MapPin, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface UniversalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  initialType?: 'webpage' | 'image' | 'pdf' | 'email' | 'product' | 'location';
}

export const UniversalShareModal: React.FC<UniversalShareModalProps> = ({
  isOpen,
  onClose,
  initialContent = '',
  initialType = 'webpage'
}) => {
  const [contentType, setContentType] = useState<'webpage' | 'image' | 'pdf' | 'email' | 'product' | 'location'>(initialType);
  const [shareData, setShareData] = useState(initialContent);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareData) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessedResult(`Successfully indexed shared ${contentType}. Contril AI OS extracted 3 key executive insights and saved to Memory Vault.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-modal-overlay">
      <div className="w-full max-w-lg bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 sm:p-8 relative space-y-6 text-white animate-modal-content backdrop-blur-xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00BFA6]/15 text-[#00BFA6] text-xs font-mono font-medium">
            <Share2 className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Universal Share Extension</span>
          </div>

          <h2 className="text-xl font-light text-white">Share Content to Contril AI OS</h2>
          <p className="text-xs text-neutral-400 font-light">Index web pages, documents, images, and products directly into memory.</p>
        </div>

        {/* Content Type Selector */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          {[
            { id: 'webpage', label: 'Webpage', icon: Globe },
            { id: 'pdf', label: 'PDF / Document', icon: FileText },
            { id: 'product', label: 'Product URL', icon: ShoppingBag },
            { id: 'email', label: 'Email Draft', icon: Mail },
            { id: 'image', label: 'Image / OCR', icon: Image },
            { id: 'location', label: 'Map Location', icon: MapPin }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = contentType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setContentType(item.id as any)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#00BFA6] text-black border-[#00BFA6] font-semibold'
                    : 'bg-white/[0.02] border-white/[0.06] text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Share Form */}
        <form onSubmit={handleProcessShare} className="space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-neutral-400">Content / URL / Shared Payload</label>
            <textarea
              rows={3}
              required
              placeholder="Paste link, snippet, or shared content..."
              value={shareData}
              onChange={(e) => setShareData(e.target.value)}
              className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl p-3 text-white focus:outline-none focus:border-[#00BFA6] font-mono leading-relaxed"
            />
          </div>

          {processedResult ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Content Indexed Successfully</span>
              </div>
              <p className="text-neutral-300 font-light text-[11px] leading-relaxed">{processedResult}</p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#00BFA6]/20"
            >
              {isProcessing ? (
                <span>Indexing & Analyzing Content...</span>
              ) : (
                <>
                  <span>Process Shared Content</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </form>

      </div>
    </div>
  );
};
