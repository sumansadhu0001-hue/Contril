import React from 'react';
import { 
  Star, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export interface StructuredOption {
  id: string;
  title: string;
  subtitle: string;
  price?: string;
  rating?: number;
  deliveryTime?: string;
  source: string;
  isRecommended?: boolean;
  consequenceWarning?: string;
  onSelect?: () => void;
}

interface ResultCardProps {
  option: StructuredOption;
}

export const ResultCard: React.FC<ResultCardProps> = ({ option }) => {
  return (
    <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 text-left ${
      option.isRecommended
        ? 'bg-white dark:bg-[#0D1117] border-[#2563EB] shadow-[0_8px_32px_rgba(37,99,235,0.08)] ring-2 ring-blue-500/15'
        : 'bg-white/80 dark:bg-[#0D1117]/60 border-[#E2E8F0] dark:border-white/[0.06] hover:bg-white dark:hover:bg-[#111827]'
    }`}>
      
      <div className="space-y-3">
        {/* Recommended Badge & Source */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            {option.source}
          </span>
          {option.isRecommended && (
            <span className="text-[9px] font-mono uppercase bg-[#F0F6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Recommended</span>
            </span>
          )}
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-[#0F172A] dark:text-white leading-snug">
            {option.title}
          </h4>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed line-clamp-2">
            {option.subtitle}
          </p>
        </div>

        {/* Price & ETA Badges */}
        <div className="flex items-center gap-3 text-xs font-mono pt-1">
          {option.price && (
            <span className="font-bold text-[#0F172A] dark:text-white text-base">
              {option.price}
            </span>
          )}
          {option.deliveryTime && (
            <span className="flex items-center gap-1 text-[#64748B]">
              <Clock className="w-3 h-3" />
              <span>{option.deliveryTime}</span>
            </span>
          )}
          {option.rating && (
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{option.rating}</span>
            </span>
          )}
        </div>
      </div>

      {/* Select / Approve Button */}
      {option.onSelect && (
        <button
          onClick={option.onSelect}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            option.isRecommended
              ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
              : 'bg-[#F0F6FF] dark:bg-[#161F30] hover:bg-[#E0EDFF] text-[#2563EB] dark:text-blue-300'
          }`}
        >
          <span>Select & Prepare</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}

    </div>
  );
};
