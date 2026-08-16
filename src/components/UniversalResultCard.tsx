import React from 'react';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Plane, 
  FileText, 
  ExternalLink, 
  Star, 
  Clock, 
  Truck, 
  Tag, 
  Heart, 
  Bell, 
  Share2, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { currencyService } from '../lib/currencyService';

export type ResultDomain = 'shopping' | 'food' | 'travel' | 'workspace';

export interface UniversalResultItem {
  id: string;
  domain: ResultDomain;
  title: string;
  provider: string; // Amazon, Flipkart, Swiggy, MakeMyTrip, Gmail, etc.
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  priceINR?: number;
  rating?: number;
  deliveryEta?: string;
  availability?: string;
  cancellationPolicy?: string;
  distanceKm?: number;
  priority?: 'High' | 'Medium' | 'Low';
  supportedActions: Array<{
    id: string;
    label: string;
    actionType: 'open' | 'buy' | 'book' | 'order' | 'compare' | 'save' | 'watch_price' | 'notify_me';
  }>;
  metadata?: Record<string, any>;
}

interface UniversalResultCardProps {
  item: UniversalResultItem;
  onExecuteAction: (item: UniversalResultItem, actionId: string) => void;
}

export const UniversalResultCard: React.FC<UniversalResultCardProps> = ({ item, onExecuteAction }) => {
  const formatPrice = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return currencyService.formatINR(amount);
  };

  return (
    <div className="rounded-2xl p-5 bg-[#0D0D11] border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-4 shadow-lg group">
      
      {/* Top Header: Provider Badge & Domain Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            {item.domain === 'shopping' && <ShoppingBag className="w-3 h-3 text-[#00BFA6]" />}
            {item.domain === 'food' && <UtensilsCrossed className="w-3 h-3 text-[#00BFA6]" />}
            {item.domain === 'travel' && <Plane className="w-3 h-3 text-[#00BFA6]" />}
            {item.domain === 'workspace' && <FileText className="w-3 h-3 text-[#00BFA6]" />}
            <span>{item.provider}</span>
          </div>

          {item.priority && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
              item.priority === 'High' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              {item.priority} Priority
            </span>
          )}
        </div>

        {item.rating && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-mono">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4">
        {item.imageUrl && (
          <div className="w-20 h-20 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden shrink-0">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}

        <div className="space-y-1.5 flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-snug truncate">{item.title}</h3>
          {item.subtitle && <p className="text-xs text-neutral-400 font-light truncate">{item.subtitle}</p>}
          {item.description && <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-light">{item.description}</p>}
        </div>
      </div>

      {/* Metadata Metrics Row */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
        {item.priceINR !== undefined && (
          <div>
            <span className="text-[9px] uppercase text-neutral-500 block">Price</span>
            <span className="text-white font-semibold text-sm">{formatPrice(item.priceINR)}</span>
          </div>
        )}

        {item.deliveryEta && (
          <div>
            <span className="text-[9px] uppercase text-neutral-500 block flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#00BFA6]" /> Delivery / ETA
            </span>
            <span className="text-neutral-200 text-xs">{item.deliveryEta}</span>
          </div>
        )}

        {item.availability && (
          <div>
            <span className="text-[9px] uppercase text-neutral-500 block">Availability</span>
            <span className="text-emerald-400 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {item.availability}
            </span>
          </div>
        )}

        {item.cancellationPolicy && (
          <div>
            <span className="text-[9px] uppercase text-neutral-500 block">Policy</span>
            <span className="text-neutral-300 text-xs">{item.cancellationPolicy}</span>
          </div>
        )}

        {item.distanceKm !== undefined && (
          <div>
            <span className="text-[9px] uppercase text-neutral-500 block">Distance</span>
            <span className="text-neutral-300 text-xs">{item.distanceKm} km away</span>
          </div>
        )}
      </div>

      {/* Universal Action Center */}
      <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-2">
        {item.supportedActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onExecuteAction(item, action.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              action.actionType === 'buy' || action.actionType === 'book' || action.actionType === 'order'
                ? 'bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold shadow-md'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]'
            }`}
          >
            {action.actionType === 'watch_price' && <Bell className="w-3.5 h-3.5 text-[#00BFA6]" />}
            {action.actionType === 'save' && <Heart className="w-3.5 h-3.5 text-[#00BFA6]" />}
            {action.actionType === 'open' && <ExternalLink className="w-3.5 h-3.5" />}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

    </div>
  );
};
