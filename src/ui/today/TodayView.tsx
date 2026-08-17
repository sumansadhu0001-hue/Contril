import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  FileText, 
  Sparkles,
  Search,
  Volume2
} from 'lucide-react';
import { CommandCenter } from './CommandCenter';
import { UserProfile, MeetingItem, EmailItem, DocumentItem } from '../../types';

interface TodayViewProps {
  userProfile?: UserProfile;
  meetings: MeetingItem[];
  emails: EmailItem[];
  recentDocs: DocumentItem[];
  onSelectMode: (mode: any) => void;
  onOpenSpotlight?: () => void;
  onOpenVoiceBriefing?: () => void;
  onStartChat?: (prompt: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  userProfile,
  meetings = [],
  emails = [],
  recentDocs = [],
  onSelectMode,
  onOpenSpotlight,
  onOpenVoiceBriefing,
  onStartChat
}) => {
  // Compute greeting dynamically based on local time
  const [greeting, setGreeting] = useState<{ eyebrow: string; salutation: string }>({
    eyebrow: 'YOUR AI CHIEF OF STAFF',
    salutation: 'Good evening,'
  });

  const rawName = userProfile?.name?.trim() || '';
  const firstName = rawName ? rawName.split(' ')[0] : '';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting({ eyebrow: 'YOUR AI CHIEF OF STAFF', salutation: 'Good morning,' });
    } else if (hour >= 12 && hour < 17) {
      setGreeting({ eyebrow: 'YOUR AI CHIEF OF STAFF', salutation: 'Good afternoon,' });
    } else if (hour >= 17 && hour < 22) {
      setGreeting({ eyebrow: 'YOUR AI CHIEF OF STAFF', salutation: 'Good evening,' });
    } else {
      setGreeting({ eyebrow: 'WORKING LATE', salutation: 'Good night,' });
    }
  }, []);

  const urgentEmails = emails.filter(e => e.category === 'urgent');
  const todayMeetings = meetings.filter(m => 
    m.time?.toLowerCase().includes('today') || 
    m.time?.toLowerCase().includes('am') || 
    m.time?.toLowerCase().includes('pm')
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-12 text-left bg-[#F7FAFF] dark:bg-[#070A0F] transition-colors duration-200">
      
      {/* 1. EDITORIAL HERO */}
      <section className="space-y-3 relative">
        <div className="text-[11px] font-mono font-bold tracking-widest text-[#2563EB] dark:text-[#3B82F6] uppercase">
          {greeting.eyebrow}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-[#0F172A] dark:text-white tracking-tight leading-tight">
          {greeting.salutation} <br />
          <span className="font-semibold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            {firstName || 'Executive'}.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#475569] dark:text-[#94A3B8] font-normal max-w-xl leading-relaxed">
          Here's what Contril thinks deserves your attention today.
        </p>
      </section>

      {/* 2. CONTRIL COMMAND CENTER (THE HEART OF CONTRIL) */}
      <section>
        <CommandCenter
          userName={firstName}
          onStartChat={onStartChat}
          onSelectMode={onSelectMode}
        />
      </section>

      {/* 3. ATTENTION & AGENDA COMPOSITION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Dominant Attention Block */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none flex flex-col justify-between space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                ATTENTION METRIC
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{urgentEmails.length} urgent</span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-light text-[#0F172A] dark:text-white tracking-tight">
                {urgentEmails.length + todayMeetings.length}{' '}
                <span className="text-xl sm:text-2xl font-normal text-[#64748B] dark:text-[#94A3B8]">
                  items require your review
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed pt-1">
                Contril has pre-screened your unread messages, flagged schedule conflicts, and drafted 3 responses ready for your 1-click confirmation.
              </p>
            </div>
          </div>

          {/* Quick Action Pills */}
          <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-white/[0.06]">
            <div className="text-[10px] font-mono font-bold uppercase text-[#64748B] dark:text-[#94A3B8] tracking-wider">
              Priority Actions
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => onSelectMode('inbox')}
                className="p-3.5 rounded-2xl bg-[#F0F6FF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between hover:bg-[#E0EDFF] dark:hover:bg-[#161F30] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
                    Review {urgentEmails.length || 3} Email Drafts
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
              </div>

              <div 
                onClick={() => onSelectMode('meetings')}
                className="p-3.5 rounded-2xl bg-[#F0F6FF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between hover:bg-[#E0EDFF] dark:hover:bg-[#161F30] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
                    Prepare Agenda Brief
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
              </div>
            </div>
          </div>

        </div>

        {/* Schedule & Agenda Timeline */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
                UPCOMING AGENDA
              </span>
              <button 
                onClick={() => onSelectMode('meetings')}
                className="text-xs font-mono font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline cursor-pointer"
              >
                View all ({meetings.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {meetings.slice(0, 3).map((m) => (
                <div 
                  key={m.id}
                  onClick={() => onSelectMode('meetings')}
                  className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.04] flex items-start gap-3 cursor-pointer hover:bg-[#EFF6FF] dark:hover:bg-[#161F30] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] mt-1.5 shrink-0" />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                      {m.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      <span>{m.time}</span>
                      <span>•</span>
                      <span>{m.platform || 'Google Meet'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
            <span>Google Calendar Synced</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
          </div>

        </div>

      </section>

      {/* 4. CONTRIL RECENT ACTIVITY STREAM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#06B6D4]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0F172A] dark:text-white">
              CONTRIL ACTIVITY LOG
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            3 actions prepared in background
          </span>
        </div>

        <div className="bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none divide-y divide-[#E2E8F0] dark:divide-white/[0.04]">
          {[
            {
              time: '11:42 AM',
              action: 'Drafted reply to Marcus Vance regarding Q3 Financials Review',
              category: 'Email',
              status: 'Ready for Review'
            },
            {
              time: '10:15 AM',
              action: 'Indexed Board Pitch Deck Exhibit B from Google Drive',
              category: 'Knowledge',
              status: 'Indexed'
            },
            {
              time: '09:00 AM',
              action: 'Prepared daily agenda briefing and flagged 1 afternoon overlap',
              category: 'Calendar',
              status: 'Briefed'
            }
          ].map((act, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#06B6D4] shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium text-[#0F172A] dark:text-white truncate">
                    {act.action}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    <span>{act.time}</span>
                    <span>•</span>
                    <span className="uppercase text-[#2563EB] dark:text-[#3B82F6] font-semibold">{act.category}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#F0F6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 shrink-0">
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
