import React from 'react';
import { Clock, CheckCircle2, Sparkles, Heart, Trophy, Briefcase } from 'lucide-react';
import { WorkspaceType } from '../types';

interface OutcomeSummaryCardProps {
  workspaceType?: WorkspaceType;
}

export const OutcomeSummaryCard: React.FC<OutcomeSummaryCardProps> = ({
  workspaceType = 'business'
}) => {
  const outcomesByWorkspace: Record<WorkspaceType, { timeSaved: string; items: { label: string; icon: React.FC<{ className?: string }> }[] }> = {
    business: {
      timeSaved: '2h 21m saved today',
      items: [
        { label: 'You spent this time closing 2 deals instead', icon: Briefcase },
        { label: 'Had uninterrupted dinner with family', icon: Heart },
        { label: 'Finished Q3 strategic growth presentation early', icon: Trophy }
      ]
    },
    creator: {
      timeSaved: '2h 15m saved today',
      items: [
        { label: 'You spent this time finalizing 2 sponsor deals instead', icon: Trophy },
        { label: 'Filmed & edited YouTube video script', icon: Briefcase },
        { label: 'Took a full unplugged evening', icon: Heart }
      ]
    },
    freelancer: {
      timeSaved: '2h 30m saved today',
      items: [
        { label: 'You spent this time winning 2 retainer clients instead', icon: Briefcase },
        { label: 'Cleared all pending invoice approvals', icon: Trophy },
        { label: 'Enjoyed a 2-hour midday gym session', icon: Heart }
      ]
    },
    student: {
      timeSaved: '2h 10m saved today',
      items: [
        { label: 'You spent this time mastering 2 research topics instead', icon: Trophy },
        { label: 'Submitted Machine Learning assignment early', icon: Briefcase },
        { label: 'Reconnected with old friends over coffee', icon: Heart }
      ]
    },
    personal: {
      timeSaved: '1h 50m saved today',
      items: [
        { label: 'You spent this time planning family travel instead', icon: Trophy },
        { label: 'Audited & saved $340 on unused subscriptions', icon: Briefcase },
        { label: 'Spent quality afternoon outdoors', icon: Heart }
      ]
    }
  };

  const current = outcomesByWorkspace[workspaceType] || outcomesByWorkspace.business;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-[28px] bg-[#111114]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden select-none font-sans my-8 group">
      
      {/* Background ambient corner blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#34D399]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-4 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#34D399]" />
          <span className="text-xs font-mono uppercase text-neutral-300 font-medium tracking-wider">
            Time Saved This Week
          </span>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#34D399]/10 border border-[#34D399]/30 text-xs font-mono text-[#34D399] font-medium">
          {current.timeSaved} Recovered
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-light text-white tracking-tight">
          Here's what that time enabled:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {current.items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors space-y-2"
              >
                <div className="w-7 h-7 rounded-xl bg-[#34D399]/10 text-[#34D399] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs font-light text-neutral-200 leading-relaxed">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <span>Contril AI OS • High-Efficiency Focus Tracking</span>
        <span className="text-[#34D399] flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Zero Distraction Operating System
        </span>
      </div>

    </div>
  );
};
