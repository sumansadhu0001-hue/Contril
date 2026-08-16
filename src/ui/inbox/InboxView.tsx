import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  CornerUpLeft
} from 'lucide-react';
import { UrgentEmail } from '../../types';
import { 
  checkAndVerifyGmailConnection, 
  initiateGoogleOAuth, 
  GmailVerificationResult 
} from '../../lib/gmailAuthService';
import { ContrilApiClient } from '../../lib/apiClient';

interface InboxViewProps {
  emails: UrgentEmail[];
  onSendReply: (emailId: string, replyText: string) => void;
  onOpenSettings?: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  emails: propsEmails,
  onSendReply,
  onOpenSettings
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'urgent' | 'action' | 'vip'>('all');
  const [activeEmails, setActiveEmails] = useState<UrgentEmail[]>(propsEmails || []);
  const [selectedEmail, setSelectedEmail] = useState<UrgentEmail | null>(null);
  const [draftReply, setDraftReply] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<'concise' | 'firm' | 'warm' | 'decline'>('concise');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentStatus, setSentStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live Gmail Auth Verification State
  const [verification, setVerification] = useState<GmailVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const runVerification = async () => {
    setIsVerifying(true);
    try {
      const res = await checkAndVerifyGmailConnection();
      setVerification(res);

      if (res.hasValidConnection) {
        const displayList = res.emails && res.emails.length > 0 ? res.emails : propsEmails;
        setActiveEmails(displayList);
        if (displayList.length > 0 && !selectedEmail) {
          setSelectedEmail(displayList[0]);
          setDraftReply(displayList[0].draftReply || '');
        }
      }
    } catch (err) {
      console.error('Error verifying Gmail connection:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    runVerification();
  }, []);

  useEffect(() => {
    if (activeEmails.length > 0 && !selectedEmail) {
      setSelectedEmail(activeEmails[0]);
      setDraftReply(activeEmails[0].draftReply || '');
    }
  }, [activeEmails]);

  const handleConnectOrReconnect = async () => {
    await initiateGoogleOAuth();
    runVerification();
  };

  const handleRegenerateReply = async (tone: 'concise' | 'firm' | 'warm' | 'decline') => {
    if (!selectedEmail) return;
    setSelectedTone(tone);
    setIsGenerating(true);

    try {
      const data = await ContrilApiClient.postAiEmailReply({
        sender: selectedEmail.sender,
        subject: selectedEmail.subject,
        preview: selectedEmail.preview,
        tone
      });
      if (data.draft) {
        setDraftReply(data.draft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (!selectedEmail) return;
    onSendReply(selectedEmail.id, draftReply);
    setSentStatus(`Reply sent to ${selectedEmail.senderEmail}`);
    setTimeout(() => setSentStatus(null), 4000);
  };

  const filteredEmails = activeEmails.filter(e => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      e.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.08] pb-6">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            INTELLIGENT MAIL
          </div>
          <h1 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
            Inbox Workspace
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runVerification}
            className="h-9 px-4 rounded-xl bg-white dark:bg-[#0D1117] hover:bg-[#F0F6FF] dark:hover:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-[#2563EB]' : ''}`} />
            <span>Sync Gmail</span>
          </button>
        </div>
      </div>

      {/* Verification Notice if disconnected */}
      {verification && !verification.hasValidConnection && (
        <div className="p-6 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                  Connect Google Workspace
                </h3>
                <p className="text-xs text-[#475569] dark:text-slate-300">
                  Connect your Gmail account to manage threads and auto-draft responses.
                </p>
              </div>
            </div>

            <button
              onClick={handleConnectOrReconnect}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Connect Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Master-Detail Email Workspace */}
      <div className="bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Column: Email List */}
        <div className="lg:col-span-5 border-r border-[#E2E8F0] dark:border-white/[0.08] flex flex-col justify-between">
          
          <div className="p-4 space-y-3 border-b border-[#E2E8F0] dark:border-white/[0.06]">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06] text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'urgent', label: 'Urgent' },
                { id: 'action', label: 'Action Required' },
                { id: 'vip', label: 'VIP' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F0F6FF] dark:bg-[#161F30] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email Item List */}
          <div className="divide-y divide-[#E2E8F0] dark:divide-white/[0.04] overflow-y-auto flex-1 max-h-[560px]">
            {filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    setDraftReply(email.draftReply || '');
                    setSentStatus(null);
                  }}
                  className={`p-4 transition-all cursor-pointer flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EFF6FF] dark:bg-blue-950/30 border-l-4 border-[#2563EB]'
                      : 'hover:bg-[#F8FAFC] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                      {email.sender}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#64748B] font-mono">
                      {email.time}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#1E293B] dark:text-[#CBD5E1] line-clamp-1">
                    {email.subject}
                  </div>

                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {email.preview}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    {email.category === 'urgent' && (
                      <span className="text-[9px] font-mono uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">
                        Urgent
                      </span>
                    )}
                    {email.draftReply && (
                      <span className="text-[9px] font-mono uppercase bg-[#F0F6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Draft Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredEmails.length === 0 && (
              <div className="p-8 text-center text-xs text-[#64748B]">
                No matching messages found.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Email Reading Pane & AI Reply Composer */}
        <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-6">
          {selectedEmail ? (
            <>
              {/* Message Header */}
              <div className="space-y-4 border-b border-[#E2E8F0] dark:border-white/[0.06] pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-[#0F172A] dark:text-white">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span>From: <strong>{selectedEmail.sender}</strong> ({selectedEmail.senderEmail || 'partner@workspace.com'})</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-[#64748B] shrink-0">
                    {selectedEmail.time}
                  </span>
                </div>

                {/* Email Body text */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed space-y-2">
                  <p>{selectedEmail.preview}</p>
                  <p className="text-[#64748B] text-[11px] pt-2">
                    Looking forward to aligning on timelines and confirming next steps.
                  </p>
                </div>
              </div>

              {/* AI Draft & Reply Action Container */}
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#0F172A] dark:text-white font-bold">
                      Contril AI Reply Composer
                    </span>
                  </div>

                  {/* Tone buttons */}
                  <div className="flex items-center gap-1 text-[11px]">
                    {(['concise', 'firm', 'warm', 'decline'] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => handleRegenerateReply(tone)}
                        className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                          selectedTone === tone
                            ? 'bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 font-bold'
                            : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Textarea */}
                <div className="relative">
                  <textarea
                    value={draftReply}
                    onChange={(e) => setDraftReply(e.target.value)}
                    placeholder="Draft reply on your behalf..."
                    rows={5}
                    className="w-full p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06] text-xs text-[#0F172A] dark:text-white leading-relaxed focus:outline-none focus:border-[#2563EB] transition-colors resize-none"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-xs rounded-2xl flex items-center justify-center gap-2 text-xs font-mono text-[#2563EB] dark:text-[#3B82F6]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing response...</span>
                    </div>
                  )}
                </div>

                {/* Sent Status Message */}
                {sentStatus && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{sentStatus}</span>
                  </div>
                )}

                {/* Bottom Send & Action Controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <CornerUpLeft className="w-3.5 h-3.5" />
                    <span>Reply will be sent via Gmail</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleRegenerateReply(selectedTone)}
                      disabled={isGenerating}
                      className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-white/[0.08] text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F0F6FF] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Regenerate
                    </button>

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!draftReply.trim() || isGenerating}
                      className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[#64748B] text-xs">
              Select a message to view details and draft replies.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
