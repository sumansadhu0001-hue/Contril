import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  CreditCard, 
  FileText, 
  Key,
  ShieldCheck
} from 'lucide-react';
import { LifeAdminItem } from '../types';

interface LifeAdminViewProps {
  items: LifeAdminItem[];
  onRenewItem: (id: string) => void;
}

export const LifeAdminView: React.FC<LifeAdminViewProps> = ({ items, onRenewItem }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121418] border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400">
            <Shield className="w-4 h-4" />
            <span>AI Life Admin Auto-Monitor</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Insurances, Subscriptions, Passports, Tax & Warranties</h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Automated Proactive Safeguards Active</span>
        </div>
      </div>

      {/* Grid of Monitored Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#121418] border border-white/10 hover:border-white/20 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-neutral-400 block">{item.category}</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                <p className="text-xs text-neutral-400">{item.provider}</p>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold block ${
                  item.daysRemaining < 30 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {item.daysRemaining} Days Left
                </span>
                {item.amount && <span className="text-xs font-mono text-neutral-300 block mt-1">{item.amount}</span>}
              </div>
            </div>

            {item.actionPrompt && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-300 leading-normal">
                {item.actionPrompt}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-neutral-500">Due Date: {item.dueDate}</span>

              <button
                onClick={() => onRenewItem(item.id)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-medium transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>1-Click Renew</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
