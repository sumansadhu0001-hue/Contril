import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckSquare, 
  Loader2, 
  Copy, 
  Check, 
  ArrowRight, 
  FileCheck
} from 'lucide-react';
import { MeetingItem } from '../types';
import { ServiceLogo } from './ServiceLogo';
import { ContrilApiClient } from '../lib/apiClient';

interface MeetingIntelligenceViewProps {
  meetings: MeetingItem[];
  onAddMeetingIntelligence: (meeting: MeetingItem) => void;
  onUpdateMeeting?: (meeting: MeetingItem) => void;
  onOpenSettings?: () => void;
}

export const MeetingIntelligenceView: React.FC<MeetingIntelligenceViewProps> = ({
  meetings,
  onAddMeetingIntelligence,
  onUpdateMeeting,
  onOpenSettings
}) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  
  // Custom form input states
  const [customTitle, setCustomTitle] = useState('');
  const [customAttendees, setCustomAttendees] = useState('');
  const [customTranscript, setCustomTranscript] = useState('');
  const [selectedTone, setSelectedTone] = useState<'executive' | 'urgent' | 'detailed' | 'collaborative'>('executive');
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'broadcast' | 'personalized' | 'decisions'>('broadcast');
  const [selectedAttendeeIndex, setSelectedAttendeeIndex] = useState(0);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState<string | null>(null);

  if (!meetings || meetings.length === 0) {
    return (
      <div className="w-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center py-16 px-6 font-sans bg-[#070709]">
        <div className="max-w-xl w-full p-8 border border-white/[0.08] bg-[#070709] text-center space-y-8">
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
              <ServiceLogo id="google_calendar" size={32} />
            </div>
            <div className="w-14 h-14 border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
              <ServiceLogo id="zoom" size={32} />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00BFA6]">
              Calendar & Meetings
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Connect Google Calendar
            </h2>
            <p className="text-xs text-neutral-400 font-normal leading-relaxed max-w-sm mx-auto">
              See upcoming meetings, agendas, and action items in one place. Connect Google Calendar to prepare briefs and follow-ups automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenSettings}
              className="w-full sm:w-auto h-10 px-5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer rounded-none"
            >
              <span>Connect Google Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-full sm:w-auto h-10 px-5 bg-transparent hover:bg-white/[0.03] text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/[0.08] rounded-none"
            >
              <span>Connect Outlook Calendar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];
  const personalizedEmails = selectedMeeting?.personalizedFollowUps || selectedMeeting?.personalizedEmails || [];
  const activeAttendeeIndex = Math.min(selectedAttendeeIndex, Math.max(0, personalizedEmails.length - 1));
  const activeAttendeeEmail = personalizedEmails[activeAttendeeIndex];

  const handleProcessTranscript = async () => {
    if (!customTitle || !customTranscript) return;
    setIsProcessing(true);

    try {
      const data = await ContrilApiClient.postAiMeetingSummary({
        title: customTitle,
        attendees: customAttendees ? customAttendees.split(',').map(s => s.trim()) : ['Executive Team'],
        transcript: customTranscript,
        tone: selectedTone
      });

      const newMeeting: MeetingItem = {
        id: `meeting-${Date.now()}`,
        title: customTitle,
        time: 'Today',
        attendees: customAttendees ? customAttendees.split(',').map(s => s.trim()) : ['Executive Team'],
        platform: 'zoom',
        status: 'completed',
        summary: data.summary,
        decisions: data.keyDecisions || [],
        keyDecisions: data.keyDecisions || [],
        actionItems: data.actionItems || [],
        followUpEmailDraft: data.followUpEmailDraft || '',
        personalizedFollowUps: data.personalizedFollowUps || []
      };

      onAddMeetingIntelligence(newMeeting);
      setSelectedMeetingId(newMeeting.id);
      setCustomTitle('');
      setCustomAttendees('');
      setCustomTranscript('');
      setToastMessage('Meeting transcript processed successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyDraft = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(id);
    setTimeout(() => setCopiedDraft(null), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white font-sans py-4 sm:py-10 md:py-16">
      {/* Centered Content Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00BFA6]">
              Calendar & Meetings
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Upcoming Meetings
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed max-w-xl">
              Automatic transcripts, key decision logs, and personalized follow-up emails for your meetings.
            </p>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Meeting Selector & Quick Input */}
          <div className={`lg:col-span-4 space-y-6 ${mobileShowDetail ? 'hidden md:block' : ''}`}>
            
            {/* Recent Meetings Selector Container */}
            <div className="p-6 border border-white/[0.08] bg-[#070709] space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Recent Meetings
              </h3>

              <div className="flex flex-col border-t border-white/[0.08]">
                {meetings.map((m) => {
                  const isSelected = m.id === selectedMeetingId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedMeetingId(m.id); setMobileShowDetail(true); }}
                      className={`w-full py-4 px-3 text-left transition-all space-y-2 cursor-pointer border-b border-white/[0.08] rounded-none ${
                        isSelected
                          ? 'bg-white/[0.03] text-[#00BFA6]'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ServiceLogo id={m.platform || 'zoom'} size={16} />
                          <span className="text-[10px] text-neutral-500 font-medium">{m.time}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 font-mono uppercase tracking-wider ${
                          isSelected ? 'bg-[#00BFA6]/10 text-[#00BFA6]' : 'bg-white/[0.05] text-neutral-400'
                        }`}>
                          {m.status}
                        </span>
                      </div>

                      <div className="text-xs font-semibold line-clamp-1">
                        {m.title}
                      </div>

                      <div className="text-[10px] truncate text-neutral-500">
                        {m.attendees?.join(', ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paste Transcript Form Container */}
            <div className="p-6 border border-white/[0.08] bg-[#070709] space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Process New Transcript
                </h3>
                <p className="text-[10px] text-neutral-500">Paste transcript notes to extract action items.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Board Strategy Sync"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-none bg-[#070709] border border-white/[0.08] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00BFA6] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Attendees
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alice, Bob (comma-separated)"
                    value={customAttendees}
                    onChange={e => setCustomAttendees(e.target.value)}
                    className="w-full h-10 px-3 rounded-none bg-[#070709] border border-white/[0.08] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00BFA6] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Analysis Tone
                  </label>
                  <select
                    value={selectedTone}
                    onChange={e => setSelectedTone(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-none bg-[#070709] border border-white/[0.08] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00BFA6] transition-colors cursor-pointer"
                  >
                    <option value="executive">Executive</option>
                    <option value="urgent">Urgent</option>
                    <option value="detailed">Detailed</option>
                    <option value="collaborative">Collaborative</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Transcript
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Paste meeting notes or transcript..."
                    value={customTranscript}
                    onChange={e => setCustomTranscript(e.target.value)}
                    className="w-full p-3 rounded-none bg-[#070709] border border-white/[0.08] text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#00BFA6] resize-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleProcessTranscript}
                  disabled={isProcessing || !customTitle || !customTranscript}
                  className="w-full h-10 rounded-none bg-transparent hover:bg-white/[0.03] disabled:opacity-50 text-white border border-[#00BFA6] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#00BFA6]" />
                      <span className="text-[#00BFA6]">Processing Transcript...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#00BFA6]" />
                      <span className="text-[#00BFA6]">Analyze Meeting Intelligence</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Selected Meeting Breakdown Details Panel */}
          <div className={`lg:col-span-8 space-y-6 ${!mobileShowDetail ? 'hidden md:block' : ''}`}>
            {selectedMeeting ? (
              <div className="p-6 border border-white/[0.08] bg-[#070709] space-y-6">
                
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="md:hidden flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2 min-h-[44px] transition-colors rounded-none"
                >
                  <span>←</span>
                  <span>Back to meetings</span>
                </button>
                
                {/* Title & Metadata */}
                <div className="space-y-4 pb-4 border-b border-white/[0.08]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ServiceLogo id={selectedMeeting.platform || 'zoom'} size={18} />
                        <span className="text-[10px] text-neutral-400 font-medium">{selectedMeeting.time}</span>
                      </div>
                      <h2 className="text-xl font-semibold text-white tracking-tight">
                        {selectedMeeting.title}
                      </h2>
                    </div>

                    <span className="px-2.5 py-0.5 bg-[#00BFA6]/10 border border-[#00BFA6]/30 text-[10px] font-mono text-[#00BFA6] uppercase tracking-wider self-start sm:self-auto">
                      AI Summarized
                    </span>
                  </div>
                </div>

                {/* Plain Tabs */}
                <div className="flex border-b border-white/[0.08]">
                  {(['broadcast', 'personalized', 'decisions'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer rounded-none ${
                        activeTab === tab
                          ? 'border-[#00BFA6] text-[#00BFA6]'
                          : 'border-transparent text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                {activeTab === 'broadcast' && (
                  <div className="space-y-6">
                    {/* Summary Section */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                        Meeting Executive Summary
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                        {selectedMeeting.summary}
                      </p>
                    </div>

                    {/* Broadcast Follow-up Draft */}
                    <div className="space-y-3 pt-6 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                          Broadcast Email Draft
                        </span>
                        <button
                          onClick={() => handleCopyDraft(selectedMeeting.followUpEmailDraft || '', 'main')}
                          className="h-8 px-3 text-[11px] font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer border border-white/[0.08] hover:bg-white/[0.03] rounded-none"
                        >
                          {copiedDraft === 'main' ? <Check className="w-3.5 h-3.5 text-[#00BFA6]" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                          <span>{copiedDraft === 'main' ? 'Copied' : 'Copy Email'}</span>
                        </button>
                      </div>

                      <div className="p-4 border border-white/[0.08] text-xs text-neutral-300 font-sans leading-relaxed whitespace-pre-wrap">
                        {selectedMeeting.followUpEmailDraft}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'personalized' && (
                  <div className="space-y-6">
                    {personalizedEmails.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-3">
                          {personalizedEmails.map((email, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedAttendeeIndex(idx)}
                              className={`px-3 py-1.5 text-xs transition-all cursor-pointer rounded-none ${
                                activeAttendeeIndex === idx
                                  ? 'bg-white/[0.05] text-[#00BFA6]'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              {email.recipient}
                            </button>
                          ))}
                        </div>

                        {activeAttendeeEmail && (
                          <div className="space-y-6">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase tracking-wider text-[#00BFA6] font-semibold">
                                To: {activeAttendeeEmail.recipient} {activeAttendeeEmail.recipientEmail ? `<${activeAttendeeEmail.recipientEmail}>` : ''}
                              </span>
                              <h4 className="text-sm font-semibold text-white">
                                Subject: {activeAttendeeEmail.subject}
                              </h4>
                            </div>

                            {activeAttendeeEmail.assignedActionItems && activeAttendeeEmail.assignedActionItems.length > 0 && (
                              <div className="p-4 border border-white/[0.08] space-y-2">
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
                                  Assigned Action Items
                                </span>
                                <ul className="space-y-1.5">
                                  {activeAttendeeEmail.assignedActionItems.map((item, index) => (
                                    <li key={index} className="text-xs text-neutral-300 flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-[#00BFA6] mt-1.5 shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                                  Email Content
                                </span>
                                <button
                                  onClick={() => handleCopyDraft(activeAttendeeEmail.emailText, `personalized-${activeAttendeeIndex}`)}
                                  className="h-8 px-3 text-[11px] font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer border border-white/[0.08] hover:bg-white/[0.03] rounded-none"
                                >
                                  {copiedDraft === `personalized-${activeAttendeeIndex}` ? (
                                    <Check className="w-3.5 h-3.5 text-[#00BFA6]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                                  )}
                                  <span>{copiedDraft === `personalized-${activeAttendeeIndex}` ? 'Copied' : 'Copy Email'}</span>
                                </button>
                              </div>
                              <div className="p-4 border border-white/[0.08] text-xs text-neutral-300 font-sans leading-relaxed whitespace-pre-wrap">
                                {activeAttendeeEmail.emailText}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500 text-xs">
                        No personalized emails available for this meeting.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'decisions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Key Decisions */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#00BFA6]" />
                        <span>Key Decisions</span>
                      </h3>
                      <ul className="divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
                        {selectedMeeting.keyDecisions && selectedMeeting.keyDecisions.length > 0 ? (
                          selectedMeeting.keyDecisions.map((dec, idx) => (
                            <li key={idx} className="py-3 text-xs text-neutral-300 flex items-start gap-3 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6] shrink-0 mt-1.5" />
                              <span>{dec}</span>
                            </li>
                          ))
                        ) : (
                          <li className="py-4 text-xs text-neutral-500 italic">No key decisions logged.</li>
                        )}
                      </ul>
                    </div>

                    {/* Action Items */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-[#00BFA6]" />
                        <span>Action Items</span>
                      </h3>
                      <ul className="divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
                        {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 ? (
                          selectedMeeting.actionItems.map((act, idx) => (
                            <li key={idx} className="py-3 text-xs text-neutral-300 flex items-start gap-3 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mt-1.5" />
                              <div>
                                <span className="font-semibold text-white">{act.owner}: </span>
                                <span>{act.task}</span>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="py-4 text-xs text-neutral-500 italic">No action items logged.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              </div>
            ) : null}
          </div>

        </div>
      </div>

      {/* Subtle toast status notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#070709] border border-[#00BFA6] px-4 py-3 text-xs text-[#00BFA6] tracking-wider uppercase font-semibold z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

