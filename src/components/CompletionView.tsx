import React from 'react';
import { ShieldCheck, Search, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

interface CompletionViewProps {
  timeSavedMinutes: number;
  onOpenSpotlight: () => void;
  onViewMemory: () => void;
  onResetDemo: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  timeSavedMinutes,
  onOpenSpotlight,
  onViewMemory,
  onResetDemo
}) => {
  const hours = Math.floor(timeSavedMinutes / 60);
  const mins = timeSavedMinutes % 60;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center p-6 text-center max-w-2xl mx-auto space-y-8 select-none">
      
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
        <ShieldCheck className="w-8 h-8 text-emerald-600" />
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-5xl font-extralight text-neutral-900 tracking-tight font-sans">
          All Decisions Resolved.
        </h1>
        <p className="text-base md:text-lg font-light text-neutral-600">
          Your workspace is clear. Contril saved you <span className="text-neutral-900 font-semibold">{hours}h {mins}m</span> today.
        </p>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full max-w-md">
        <button
          onClick={onOpenSpotlight}
          className="w-full py-3.5 px-6 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Search className="w-4 h-4" />
          <span>Spotlight Search ( Press / )</span>
        </button>

        <button
          onClick={onViewMemory}
          className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 font-medium text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <span>Query Memory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Reset Demo Option */}
      <div className="pt-8">
        <button
          onClick={onResetDemo}
          className="text-xs font-mono text-neutral-400 hover:text-neutral-700 transition-colors flex items-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Demo Flow & Reload Decisions</span>
        </button>
      </div>

    </div>
  );
};
