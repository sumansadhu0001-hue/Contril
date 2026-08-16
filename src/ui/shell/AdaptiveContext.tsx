import React from 'react';
import { 
  Calendar, 
  FileText, 
  Mail, 
  ExternalLink, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { ContrilLogo } from '../../components/ContrilLogo';
import { MeetingItem, DocumentItem, EmailItem } from '../../types';

interface AdaptiveContextProps {
  isOpen: boolean;
  onClose: () => void;
  meetings?: MeetingItem[];
  emails?: EmailItem[];
  documents?: DocumentItem[];
  onSelectMode?: (mode: string) => void;
}

export const AdaptiveContext: React.FC<AdaptiveContextProps> = ({
  isOpen,
  onClose,
  meetings = [],
  emails = [],
  documents = [],
  onSelectMode
}) => {
  if (!isOpen) return null;

  const nextMeeting = meetings[0];
  const urgentCount = emails.filter(e => e.category === 'urgent').length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-[#0D1117] border-l border-[#E2E8F0] dark:border-white/[0.08] shadow-2xl p-6 flex flex-col justify-between space-y-6 overflow-y-auto font-sans select-none text-left animate-slide-left">
      
      {/* Top Header with Close */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-4">
        <div className="flex items-center gap-2">
          <ContrilLogo size="xs" strokeColor="#2563EB" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
            Workspace Context
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F0F6FF] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 flex-1">
        
        {/* Section 1: Next Up on Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
              Next Up on Schedule
            </span>
            {nextMeeting && (
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">{nextMeeting.time}</span>
            )}
          </div>

          {nextMeeting ? (
            <div className="p-4 rounded-2xl bg-[#F0F6FF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.04] space-y-2">
              <h4 className="text-xs font-semibold text-[#0F172A] dark:text-white">
                {nextMeeting.title}
              </h4>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                {nextMeeting.summary || 'Context synced from Google Calendar.'}
              </p>
              {onSelectMode && (
                <button
                  onClick={() => {
                    onSelectMode('meetings');
                    onClose();
                  }}
                  className="text-[11px] text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>View meeting brief</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] text-xs text-[#64748B] text-center">
              No meetings scheduled.
            </div>
          )}
        </div>

        {/* Section 2: Priority Signals */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            Inbox Priorities
          </span>

          <div 
            onClick={() => {
              if (onSelectMode) {
                onSelectMode('inbox');
                onClose();
              }
            }}
            className="p-4 rounded-2xl bg-[#F0F6FF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between cursor-pointer hover:bg-[#E0EDFF] dark:hover:bg-[#161F30] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center text-[#2563EB] dark:text-blue-400 font-bold text-xs shadow-2xs">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0F172A] dark:text-white">Urgent Messages</div>
                <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">{urgentCount} threads need your response</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
          </div>
        </div>

        {/* Section 3: Recent Documents Vault */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            Indexed Documents
          </span>

          <div className="space-y-2">
            {documents.slice(0, 2).map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  if (onSelectMode) {
                    onSelectMode('docs');
                    onClose();
                  }
                }}
                className="p-3 rounded-xl border border-[#E2E8F0] dark:border-white/[0.04] hover:bg-[#F0F6FF] dark:hover:bg-[#111827] flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                    {doc.name}
                  </div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">{doc.fileType || 'Document'}</div>
                </div>
                <ExternalLink className="w-3 h-3 text-[#64748B] shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Service Health Check */}
      <div className="p-3.5 rounded-2xl bg-[#F0F6FF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-[#0F172A] dark:text-white">Workspace Enclave</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">OPERATIONAL</span>
      </div>

    </div>
  );
};
