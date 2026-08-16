import React, { useState } from 'react';
import { 
  Bot, 
  Bell, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShoppingBag, 
  Plane, 
  UtensilsCrossed, 
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { currencyService } from '../lib/currencyService';

export interface BackgroundRule {
  id: string;
  title: string;
  domain: 'shopping' | 'travel' | 'food' | 'workspace';
  condition: string;
  provider: string;
  thresholdINR?: number;
  isEnabled: boolean;
  lastRunTimestamp: string;
  totalTriggers: number;
}

interface BackgroundAutomationsViewProps {
  onBack?: () => void;
}

export const BackgroundAutomationsView: React.FC<BackgroundAutomationsViewProps> = ({ onBack }) => {
  const [rules, setRules] = useState<BackgroundRule[]>([
    {
      id: 'rule-1',
      title: 'Laptop Price Drop Watcher',
      domain: 'shopping',
      condition: 'Price drops below ₹50,000 on Amazon or Flipkart',
      provider: 'Amazon / Flipkart',
      thresholdINR: 50000,
      isEnabled: true,
      lastRunTimestamp: '15 mins ago',
      totalTriggers: 14
    },
    {
      id: 'rule-2',
      title: 'Goa Flight Discount Alert',
      domain: 'travel',
      condition: 'Flight fares decrease by > 15% on MakeMyTrip',
      provider: 'MakeMyTrip',
      isEnabled: true,
      lastRunTimestamp: '1 hour ago',
      totalTriggers: 6
    },
    {
      id: 'rule-3',
      title: 'Executive Hotel Price Monitor',
      domain: 'travel',
      condition: 'Notify when 5-star hotel near meeting drops below ₹8,000/night',
      provider: 'Airbnb / Oyo',
      thresholdINR: 8000,
      isEnabled: true,
      lastRunTimestamp: '2 hours ago',
      totalTriggers: 3
    },
    {
      id: 'rule-4',
      title: 'Weekly Grocery Reorder Reminder',
      domain: 'food',
      condition: 'Remind every Sunday at 10:00 AM to restock BigBasket basket',
      provider: 'BigBasket / Swiggy',
      isEnabled: true,
      lastRunTimestamp: '3 days ago',
      totalTriggers: 28
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState<'shopping' | 'travel' | 'food' | 'workspace'>('shopping');
  const [newCondition, setNewCondition] = useState('');
  const [newThreshold, setNewThreshold] = useState('');

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCondition) return;

    const newRule: BackgroundRule = {
      id: `rule-${Date.now()}`,
      title: newTitle,
      domain: newDomain,
      condition: newCondition,
      provider: newDomain === 'shopping' ? 'Amazon' : newDomain === 'travel' ? 'MakeMyTrip' : 'Swiggy',
      thresholdINR: newThreshold ? Number(newThreshold) : undefined,
      isEnabled: true,
      lastRunTimestamp: 'Just created',
      totalTriggers: 0
    };

    setRules(prev => [newRule, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewCondition('');
    setNewThreshold('');
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
            <Bell className="w-6 h-6 text-[#00BFA6]" />
            <span>Background Automations & Watchers</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Configure price drop monitors, flight discount alerts, and automated reorder rules.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-[#00BFA6]/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* Rules Table / Cards */}
      <div className="max-w-6xl mx-auto space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl bg-[#0D0D11] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              rule.isEnabled
                ? 'border-white/[0.08] hover:border-[#00BFA6]/40'
                : 'border-white/[0.04] opacity-60'
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#00BFA6]/15 text-[#00BFA6] border border-[#00BFA6]/30 flex items-center gap-1">
                  {rule.domain === 'shopping' && <ShoppingBag className="w-3 h-3" />}
                  {rule.domain === 'travel' && <Plane className="w-3 h-3" />}
                  {rule.domain === 'food' && <UtensilsCrossed className="w-3 h-3" />}
                  <span>{rule.domain}</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">Provider: {rule.provider}</span>
              </div>

              <h3 className="text-base font-semibold text-white">{rule.title}</h3>
              <p className="text-xs text-neutral-400 font-light">{rule.condition}</p>

              {rule.thresholdINR && (
                <div className="text-xs font-mono text-[#00BFA6]">
                  Threshold: {currencyService.formatINR(rule.thresholdINR)}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <div className="text-right text-[10px] font-mono text-neutral-500 hidden md:block">
                <div>Last Check: {rule.lastRunTimestamp}</div>
                <div>Triggers: {rule.totalTriggers}</div>
              </div>

              <button
                onClick={() => toggleRule(rule.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  rule.isEnabled
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 border-white/[0.08]'
                }`}
                title={rule.isEnabled ? 'Pause Rule' : 'Activate Rule'}
              >
                {rule.isEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => deleteRule(rule.id)}
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                title="Delete Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D0D11] border border-white/[0.1] rounded-3xl p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-light text-white">Create Background Automation</h2>
              <p className="text-xs text-neutral-400">Set up automated price drop watchers and alert monitors.</p>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-neutral-400">Rule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Price Drop Alert"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00BFA6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Domain Category</label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value as any)}
                  className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00BFA6]"
                >
                  <option value="shopping">Shopping (Amazon / Flipkart)</option>
                  <option value="travel">Travel (MakeMyTrip / Airbnb)</option>
                  <option value="food">Food (Swiggy / BigBasket)</option>
                  <option value="workspace">Workspace (Gmail / Calendar)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Trigger Condition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Price drops below ₹40,000"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00BFA6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Target Price Threshold (₹ INR optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 40000"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00BFA6]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Save Background Automation Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
