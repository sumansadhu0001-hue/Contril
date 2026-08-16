import React from 'react';
import { Star, Clock, ShoppingBag, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ComparisonOption {
  id: string;
  name: string;
  source: string;
  price: string;
  fees?: string;
  totalPrice?: string;
  rating?: string;
  distance?: string;
  eta?: string;
  status: 'FOUND' | 'RECOMMENDED' | 'AVAILABLE' | 'READY TO ORDER' | 'NOT VERIFIED';
  details?: string;
}

interface UniversalComparisonCardProps {
  query: string;
  options: ComparisonOption[];
  onSelectOption: (option: ComparisonOption) => void;
}

export const UniversalComparisonCard: React.FC<UniversalComparisonCardProps> = ({
  query,
  options,
  onSelectOption
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#0F0F12] border border-white/[0.08] space-y-4 font-sans select-none text-left shadow-lg">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00BFA6]">
            Contril Intelligence Options
          </span>
          <h4 className="text-sm font-semibold text-white">Results for "{query}"</h4>
        </div>
        <span className="text-[10px] font-mono text-neutral-500">{options.length} Verified Sources</span>
      </div>

      <div className="space-y-3">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-[#00BFA6]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white truncate">{opt.name}</span>
                <span className="text-[9px] font-mono text-[#00BFA6] bg-[#00BFA6]/10 px-1.5 py-0.5 rounded uppercase">
                  {opt.status}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-light">
                <span>{opt.source}</span>
                {opt.eta && <span>• {opt.eta}</span>}
                {opt.rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{opt.rating}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-white">{opt.price}</div>
                {opt.fees && <div className="text-[9px] font-mono text-neutral-500">{opt.fees}</div>}
              </div>

              <button
                type="button"
                onClick={() => onSelectOption(opt)}
                className="px-3.5 py-1.5 rounded-lg bg-[#00BFA6] hover:bg-[#00E5FF] text-black text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>Select</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
