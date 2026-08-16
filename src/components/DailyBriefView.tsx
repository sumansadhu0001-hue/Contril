import React, { useState } from 'react';
import { 
  Sun, Moon, Sunset,
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Mail, 
  AlertTriangle, 
  Plane, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { DailyBriefingData, PendingApproval, UrgentEmail } from '../types';
import { useLocalGreeting } from '../hooks/useLocalGreeting';
import { ContrilApiClient } from '../lib/apiClient';

interface DailyBriefViewProps {
  data: DailyBriefingData;
  onApproveItem: (id: string) => void;
  onRejectItem: (id: string) => void;
  onNavigateToInbox: () => void;
  onNavigateToMeetings: () => void;
  onNavigateToTravel: () => void;
}

export const DailyBriefView: React.FC<DailyBriefViewProps> = ({
  data,
  onApproveItem,
  onRejectItem,
  onNavigateToInbox,
  onNavigateToMeetings,
  onNavigateToTravel
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [briefSummary, setBriefSummary] = useState(data.executiveSummary);
  const greetingData = useLocalGreeting();

  const handleRefreshAI = async () => {
    setIsRefreshing(true);
    try {
      const result = await ContrilApiClient.postAiDailyBrief('Regenerate executive intelligence briefing');
      if (result.summary) {
        setBriefSummary(result.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderTimeIcon = () => {
    if (greetingData.timeOfDay === 'morning') return <Sun className="w-3.5 h-3.5 text-amber-400" />;
    if (greetingData.timeOfDay === 'afternoon') return <Sunset className="w-3.5 h-3.5 text-amber-400" />;
    return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Executive Welcome & AI Synthesis Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-[#13151a] to-neutral-900 border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono font-medium flex items-center gap-1.5">
                {renderTimeIcon()}
                {greetingData.badgeLabel}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {greetingData.formattedTime} ({greetingData.timeZone})
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
              {greetingData.subGreeting}
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              {briefSummary}
            </p>
          </div>

          {/* Workload Indicator & Refresh */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-right space-y-0.5">
              <div className="text-[10px] font-mono uppercase text-neutral-400">Estimated Workload</div>
              <div className="text-xs font-semibold text-amber-300 font-mono">
                {data.workloadScore}
              </div>
            </div>

            <button
              onClick={handleRefreshAI}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition-all shadow-sm"
            >
              {isRefreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Re-Synthesize Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Strategic Priorities */}
      <div className="bg-[#121418] border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Top 3 Daily Priorities</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">Zero decision fatigue focus</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.top3Priorities?.map((priority, index) => (
            <div 
              key={index}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex items-start gap-3 group"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                0{index + 1}
              </div>
              <p className="text-xs text-neutral-200 font-medium leading-normal group-hover:text-white transition-colors">
                {priority}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Layout: Pending Approvals & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module A: Pending Approvals (Requires Action) */}
        <div className="bg-[#121418] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Pending Executive Approvals</span>
              {(data.pendingApprovals?.length || 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                  {data.pendingApprovals?.length} Action Needed
                </span>
              )}
            </div>
          </div>

          {(data.pendingApprovals?.length || 0) === 0 ? (
            <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/5 text-neutral-400 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All pending approvals resolved. No bottlenecks!</span>
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingApprovals?.map((approval) => (
                <div 
                  key={approval.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{approval.title}</h4>
                      <p className="text-[11px] text-neutral-400">
                        Requested by <span className="text-neutral-200">{approval.requestedBy}</span> • {approval.type}
                      </p>
                    </div>
                    {approval.amount && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs font-bold shrink-0">
                        {approval.amount}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-300 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    {approval.details}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onRejectItem(approval.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => onApproveItem(approval.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>One-Click Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Module B: Today's Meetings & Schedule */}
        <div className="bg-[#121418] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Today's Executive Meetings</span>
            </div>
            <button
              onClick={onNavigateToMeetings}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <span>Meeting Intelligence</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {data.meetings?.map((meeting) => (
              <div 
                key={meeting.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{meeting.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-neutral-300">
                    {meeting.platform}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-amber-300 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{meeting.time}</span>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2">
                  {meeting.summary}
                </p>

                <div className="text-[10px] text-neutral-500">
                  Attendees: {meeting.attendees?.join(', ') || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Layout: Urgent Emails & Travel + Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent Inbox Column */}
        <div className="lg:col-span-2 bg-[#121418] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Urgent Emails (Pre-Drafted AI Replies Ready)</span>
            </div>
            <button
              onClick={onNavigateToInbox}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              <span>Open AI Inbox</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {data.urgentEmails?.map((email) => (
              <div 
                key={email.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{email.sender}</span>
                    <span className="text-[10px] text-neutral-400">({email.senderEmail})</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{email.time}</span>
                </div>

                <div className="text-xs font-medium text-neutral-200">{email.subject}</div>
                <p className="text-[11px] text-neutral-400">{email.preview}</p>

                {email.draftReply && (
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs space-y-1">
                    <div className="text-[10px] font-mono text-purple-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Pre-Drafted Executive Reply:</span>
                    </div>
                    <p className="italic text-[11px] text-neutral-300">{email.draftReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Travel & Bills Sidebar */}
        <div className="space-y-6">
          
          {/* Upcoming Travel */}
          {data.upcomingTravelSnippet && (
            <div className="bg-[#121418] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Plane className="w-4 h-4 text-emerald-400" />
                  <span>Upcoming Executive Travel</span>
                </div>
                <button
                  onClick={onNavigateToTravel}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="text-xs font-semibold text-emerald-300">
                  {data.upcomingTravelSnippet.flight}
                </div>
                <div className="text-[11px] text-neutral-300 font-mono">
                  {data.upcomingTravelSnippet.route}
                </div>
                <div className="text-[10px] text-emerald-400/90 font-mono">
                  {data.upcomingTravelSnippet.time}
                </div>
              </div>
            </div>
          )}

          {/* Bills & Financial Reminders */}
          <div className="bg-[#121418] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Bills & Financial Monitoring</span>
            </div>

            <div className="space-y-2">
              {data.billsDue?.map((bill, index) => (
                <div key={index} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="block font-medium text-white">{bill.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Due: {bill.dueDate}</span>
                  </div>
                  <span className="font-mono font-semibold text-amber-300">{bill.amount}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
