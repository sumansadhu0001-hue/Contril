import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Video
} from 'lucide-react';
import { MeetingItem } from '../../types';
import { ContrilApiClient } from '../../lib/apiClient';

interface MeetingsViewProps {
  meetings: MeetingItem[];
  onAddMeetingIntelligence?: (meetingId: string, intelligence: any) => void;
  onUpdateMeeting?: (meeting: MeetingItem) => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetings = [],
  onAddMeetingIntelligence,
  onUpdateMeeting
}) => {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(meetings[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [intelligenceResult, setIntelligenceResult] = useState<any | null>(null);

  const handleGenerateIntelligence = async () => {
    if (!selectedMeeting) return;
    setIsGenerating(true);

    try {
      const data = await ContrilApiClient.postAiMeetingSummary({
        title: selectedMeeting.title,
        transcript: selectedMeeting.transcript || `Strategic alignment meeting covering ${selectedMeeting.title}. Attendees agreed on deliverables, timeline, and resource allocation.`,
        attendees: selectedMeeting.attendees || ['Alex Morgan', 'Marcus Vance (CFO)', 'Elena Rostova (CLO)'],
        tone: 'Executive & Professional'
      });

      setIntelligenceResult(data);
      if (onAddMeetingIntelligence) {
        onAddMeetingIntelligence(selectedMeeting.id, data);
      }
    } catch (err) {
      console.error('Error generating meeting intelligence:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.08] pb-6">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            INTELLIGENT CALENDAR
          </div>
          <h1 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
            Meetings & Executive Briefs
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google Calendar Synced</span>
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Timeline List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] px-1">
            Today & Upcoming ({meetings.length})
          </div>

          <div className="space-y-3">
            {meetings.map((meeting) => {
              const isSelected = selectedMeeting?.id === meeting.id;
              return (
                <div
                  key={meeting.id}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    setIntelligenceResult(null);
                  }}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white dark:bg-[#0D1117] border-[#2563EB] dark:border-blue-500/50 shadow-[0_8px_32px_rgba(37,99,235,0.08)] ring-2 ring-blue-500/10'
                      : 'bg-white/80 dark:bg-[#0D1117]/60 border-[#E2E8F0] dark:border-white/[0.06] hover:bg-white dark:hover:bg-[#111827]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#2563EB] dark:text-[#3B82F6]">
                      {meeting.time}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] dark:text-[#64748B]">
                      {meeting.platform || 'Google Meet'}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                    {meeting.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] pt-2 border-t border-[#E2E8F0] dark:border-white/[0.04]">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{meeting.attendees?.length || 2} attendees</span>
                    </div>

                    {meeting.decisions && meeting.decisions.length > 0 && (
                      <span className="text-[10px] font-mono text-[#2563EB] dark:text-[#3B82F6] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Brief Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Meeting Context & Intelligence Generator */}
        <div className="lg:col-span-7">
          {selectedMeeting ? (
            <div className="bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.06] pb-6">
                <div>
                  <span className="text-xs font-mono font-semibold text-[#2563EB] dark:text-[#3B82F6]">
                    {selectedMeeting.time}
                  </span>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white mt-1">
                    {selectedMeeting.title}
                  </h2>
                </div>

                <button
                  onClick={() => window.open('https://meet.google.com', '_blank')}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Call</span>
                </button>
              </div>

              {/* Attendees List */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Participants
                </div>
                <div className="flex flex-wrap gap-2">
                  {(selectedMeeting.attendees || ['Alex Morgan (CEO)', 'Marcus Vance (CFO)', 'Elena Rostova (CLO)']).map((att, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-[#F0F6FF] dark:bg-[#161F30] text-xs font-medium text-[#1E293B] dark:text-[#CBD5E1]">
                      {att}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contril Meeting Intelligence Generator */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#0F172A] dark:text-white font-bold">
                      Meeting Intelligence & Action Items
                    </span>
                  </div>

                  <button
                    onClick={handleGenerateIntelligence}
                    disabled={isGenerating}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#F0F6FF] dark:hover:bg-[#1E293B] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{intelligenceResult ? 'Regenerate Brief' : 'Generate Brief'}</span>
                  </button>
                </div>

                {intelligenceResult ? (
                  <div className="space-y-4 text-xs text-[#334155] dark:text-[#CBD5E1] animate-fade-in">
                    
                    {/* Summary */}
                    <div className="space-y-1">
                      <div className="font-semibold text-[#0F172A] dark:text-white">Executive Summary</div>
                      <p className="leading-relaxed">{intelligenceResult.summary || selectedMeeting.summary}</p>
                    </div>

                    {/* Decisions */}
                    {(intelligenceResult.decisions || selectedMeeting.decisions)?.length > 0 && (
                      <div className="space-y-1">
                        <div className="font-semibold text-[#0F172A] dark:text-white">Key Decisions Approved</div>
                        <ul className="list-disc list-inside space-y-1 text-[#64748B] dark:text-[#94A3B8]">
                          {(intelligenceResult.decisions || selectedMeeting.decisions).map((d: string, i: number) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action items */}
                    {(intelligenceResult.actionItems || selectedMeeting.actionItems)?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-white/[0.04]">
                        <div className="font-semibold text-[#0F172A] dark:text-white">Assigned Action Items</div>
                        <div className="space-y-2">
                          {(intelligenceResult.actionItems || selectedMeeting.actionItems).map((act: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between gap-2">
                              <span className="font-medium text-[#0F172A] dark:text-white">{act.task}</span>
                              <span className="text-[10px] font-mono text-[#2563EB] dark:text-[#3B82F6] shrink-0 font-semibold">{act.owner}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    Contril will ingest meeting notes or live audio, extract key approvals, assign action item owners, and synthesize personalized follow-up email drafts.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[#64748B] text-xs">
              Select a meeting to view attendees and intelligence.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
