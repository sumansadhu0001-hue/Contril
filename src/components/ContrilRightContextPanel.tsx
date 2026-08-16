import React from 'react';
import { MeetingItem, EmailItem, DocumentItem } from '../types';
import { Calendar, FileText, UserCheck, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { ServiceLogo } from './ServiceLogo';
import { getConnectedAccounts } from '../lib/integrationsStore';

interface ContrilRightContextPanelProps {
  nextMeeting?: MeetingItem;
  recentDocs: DocumentItem[];
  urgentEmailsCount: number;
  onSelectMode: (mode: any) => void;
}

export const ContrilRightContextPanel: React.FC<ContrilRightContextPanelProps> = ({
  nextMeeting,
  recentDocs,
  urgentEmailsCount,
  onSelectMode
}) => {
  const accounts = getConnectedAccounts();
  const gmailConnected = Boolean(accounts['gmail']?.isConnected);
  const calendarConnected = Boolean(accounts['google_calendar']?.isConnected);

  return (
    <aside className="w-80 h-screen fixed right-0 top-0 bottom-0 z-30 bg-[#F8F8FA] dark:bg-[#0A0A0D] border-l border-black/[0.08] dark:border-white/[0.08] p-5 space-y-6 overflow-y-auto font-sans select-none hidden xl:block shrink-0 transition-colors duration-200">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] pb-3 pt-2">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71717A] dark:text-neutral-400">
          Context
        </span>
        <span className="text-[10px] font-mono text-[#7C3AED] dark:text-[#00BFA6] bg-[#7C3AED]/10 dark:bg-[#00BFA6]/10 px-2 py-0.5 rounded font-medium">
          Active Workspace
        </span>
      </div>

      {/* 1. UP NEXT MEETING */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#52525B] dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#71717A] dark:text-neutral-400 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#7C3AED] dark:text-[#00BFA6]" />
            <span>Up Next</span>
          </div>
          <button onClick={() => onSelectMode('meetings')} className="text-[10px] font-mono text-[#7C3AED] dark:text-[#00BFA6] hover:underline cursor-pointer">
            Calendar →
          </button>
        </div>

        {nextMeeting ? (
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F0F12] border border-black/[0.06] dark:border-white/[0.08] space-y-2 shadow-xs dark:shadow-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#7C3AED] dark:text-[#00BFA6] font-semibold">{nextMeeting.time}</span>
              <span className="text-[9px] font-mono text-[#71717A] dark:text-neutral-400">{nextMeeting.platform || 'Google Meet'}</span>
            </div>
            <div className="text-xs font-semibold text-[#111113] dark:text-white leading-tight">{nextMeeting.title}</div>
            
            <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[10px] text-[#71717A] dark:text-neutral-400 font-mono">
              <span>{nextMeeting.attendees?.length || 2} attendees</span>
              <button
                onClick={() => window.open('https://meet.google.com', '_blank')}
                className="text-[#7C3AED] dark:text-[#00BFA6] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
              >
                <span>Join</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] text-xs text-[#52525B] dark:text-neutral-400 font-light italic">
            Clear for the rest of the day.
          </div>
        )}
      </div>

      {/* 2. RECENT DOCUMENTS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#52525B] dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#71717A] dark:text-neutral-400 font-semibold">
            <FileText className="w-3.5 h-3.5 text-[#7C3AED] dark:text-[#00BFA6]" />
            <span>Documents</span>
          </div>
          <button onClick={() => onSelectMode('docs')} className="text-[10px] font-mono text-[#7C3AED] dark:text-[#00BFA6] hover:underline cursor-pointer">
            All Docs →
          </button>
        </div>

        <div className="space-y-1.5">
          {recentDocs.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectMode('docs')}
              className="p-2.5 rounded-lg bg-white dark:bg-white/[0.02] hover:bg-[#F2F1F6] dark:hover:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-2 cursor-pointer transition-colors shadow-xs dark:shadow-none"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#111113] dark:text-white truncate">{doc.name}</div>
                <div className="text-[10px] text-[#71717A] dark:text-neutral-400 font-mono truncate">{doc.fileType || 'Document'}</div>
              </div>
              <ArrowRight className="w-3 h-3 text-[#71717A] dark:text-neutral-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. CONNECTED SERVICES STATUS */}
      <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#71717A] dark:text-neutral-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED] dark:text-[#00BFA6]" />
            <span>Integrations</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2 shadow-xs dark:shadow-none">
            <ServiceLogo id="gmail" size={16} />
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#111113] dark:text-white truncate">Gmail</div>
              <div className="text-[9px] font-mono text-[#00BFA6]">{gmailConnected ? 'Connected' : 'Offline'}</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2 shadow-xs dark:shadow-none">
            <ServiceLogo id="google_calendar" size={16} />
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#111113] dark:text-white truncate">Calendar</div>
              <div className="text-[9px] font-mono text-[#00BFA6]">{calendarConnected ? 'Connected' : 'Offline'}</div>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};
