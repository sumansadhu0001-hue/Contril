import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Check, 
  RefreshCw, 
  Loader2, 
  Mail,
  ArrowRight,
  AlertTriangle,
  Lock,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { UrgentEmail } from '../types';
import { ServiceLogo } from './ServiceLogo';
import { 
  checkAndVerifyGmailConnection, 
  initiateGoogleOAuth, 
  GmailVerificationResult, 
  REQUIRED_GMAIL_SCOPES 
} from '../lib/gmailAuthService';
import { ContrilApiClient } from '../lib/apiClient';

interface InboxViewProps {
  emails: UrgentEmail[];
  onSendReply: (emailId: string, replyText: string) => void;
  onOpenSettings?: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({ emails: propsEmails, onSendReply, onOpenSettings }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'urgent' | 'action' | 'vip' | 'low'>('all');
  const [activeEmails, setActiveEmails] = useState<UrgentEmail[]>(propsEmails || []);
  const [selectedEmail, setSelectedEmail] = useState<UrgentEmail | null>(null);
  const [draftReply, setDraftReply] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<'firm' | 'concise' | 'warm' | 'decline'>('concise');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentStatus, setSentStatus] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  // Live Gmail Auth Verification State
  const [verification, setVerification] = useState<GmailVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [reconnectPromptOpen, setReconnectPromptOpen] = useState<boolean>(false);

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
      } else if (res.status === 'missing_scopes') {
        setReconnectPromptOpen(true);
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
    setReconnectPromptOpen(false);
    await initiateGoogleOAuth();
    runVerification();
  };

  // 1. Loading State Screen (No cards, clean margins)
  if (isVerifying) {
    return (
      <div className="w-full min-h-screen bg-[#070709] flex flex-col items-center justify-center py-20 px-6 font-sans space-y-4 text-white">
        <Loader2 className="w-6 h-6 animate-spin text-[#00BFA6]" />
        <p className="text-xs tracking-wider text-neutral-400 uppercase font-medium">Verifying Gmail Connection...</p>
      </div>
    );
  }

  // 2. Missing Scopes Screen (Simplified, no cards, clean margins, clear CTA)
  if (verification && verification.status === 'missing_scopes') {
    return (
      <div className="w-full min-h-screen bg-[#070709] flex items-center justify-center py-16 px-6 font-sans text-white">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertTriangle className="w-10 h-10 text-[#00BFA6] mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Permissions Required</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your Google account is signed in but lacks the necessary scopes to view and manage emails.
            </p>
          </div>
          
          <div className="py-4 border-t border-b border-white/[0.08] text-left space-y-2 text-xs">
            <div className="font-medium text-neutral-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#00BFA6]" />
              <span>Required Gmail Scopes:</span>
            </div>
            <ul className="space-y-1 font-mono text-[10px] text-neutral-500">
              {REQUIRED_GMAIL_SCOPES.map(s => (
                <li key={s} className="truncate">{s}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleConnectOrReconnect}
            className="w-full h-11 bg-[#00BFA6] hover:bg-[#00A892] text-black text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Grant Gmail Scopes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Expired or Refresh Failed Screen (Simplified, no cards, clean margins, clear CTA)
  if (verification && (verification.status === 'refresh_failed' || verification.status === 'token_expired' || verification.status === 'api_error')) {
    return (
      <div className="w-full min-h-screen bg-[#070709] flex items-center justify-center py-16 px-6 font-sans text-white">
        <div className="max-w-md w-full text-center space-y-6">
          <RotateCw className="w-10 h-10 text-[#00BFA6] mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Session Expired</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {verification.errorMessage || 'Your Google OAuth session has expired or could not be refreshed.'}
            </p>
          </div>

          <button
            onClick={handleConnectOrReconnect}
            className="w-full h-11 bg-[#00BFA6] hover:bg-[#00A892] text-black text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Reconnect Google Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 4. Not Authenticated Screen (Simplified, no cards, clean margins, clear CTA)
  if (verification && !verification.hasValidConnection && verification.status === 'not_authenticated') {
    return (
      <div className="w-full min-h-screen bg-[#070709] flex items-center justify-center py-16 px-6 font-sans text-white">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center mb-2">
            <ServiceLogo id="gmail" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Connect Gmail</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Integrate your Google Gmail account to view messages, auto-generate reply drafts, and send replies securely.
            </p>
          </div>

          <button
            onClick={handleConnectOrReconnect}
            className="w-full h-11 bg-[#00BFA6] hover:bg-[#00A892] text-black text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Connect Google Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 5. Valid Verified Connection Screen -> Show Real Inbox Interface
  const filteredEmails = activeEmails.filter(e => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  const handleSelectEmail = (email: UrgentEmail) => {
    setSelectedEmail(email);
    setDraftReply(email.draftReply || '');
    setSentStatus(null);
    setMobileShowDetail(true);
  };

  const handleRegenerateReply = async (tone: 'firm' | 'concise' | 'warm' | 'decline') => {
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

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white font-sans py-6 sm:py-10">
      {/* Centered Content Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10 space-y-6">
        
        {/* Title Header (Pristine minimalism, title "Inbox" and simple email sync button) */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <h1 className="text-2xl font-normal text-white tracking-tight">
            Inbox
          </h1>

          <button
            onClick={runVerification}
            className="h-8 px-3 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/[0.08] bg-transparent"
            title="Sync Gmail"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        {/* Master-Detail Split Container (No card-in-card rounded frames) */}
        <div className="min-h-[640px] border border-white/[0.08] flex flex-col md:flex-row bg-[#070709] overflow-hidden">
          
          {/* Email List Sidebar */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-white/[0.08] flex flex-col bg-[#070709] shrink-0 ${mobileShowDetail ? 'hidden md:flex' : ''}`}>
            {/* Filter Tabs (Clean text links with thin underlines) */}
            <div className="px-4 border-b border-white/[0.06] flex items-center gap-4 overflow-x-auto no-scrollbar h-12">
              {[
                { id: 'all', label: 'All' },
                { id: 'urgent', label: 'Important' },
                { id: 'vip', label: 'Unread' },
                { id: 'action', label: 'Needs Reply' }
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`h-full relative text-xs font-medium transition-colors cursor-pointer whitespace-nowrap pb-1 ${
                      isActive
                        ? 'text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00BFA6]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Email List (Simple list rows, height 64px, light borders, no glowing pills) */}
            <div className="flex-1 overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Mail className="w-6 h-6 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-500 font-medium">No messages found in your Gmail inbox.</p>
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;

                  return (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`w-full text-left px-4 h-16 flex flex-col justify-center transition-colors border-b border-white/[0.06] cursor-pointer ${
                        isSelected
                          ? 'bg-[#121215]'
                          : 'hover:bg-white/[0.02] bg-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className={`font-medium truncate ${isSelected ? 'text-[#00BFA6]' : 'text-neutral-200'}`}>
                          {email.sender}
                        </span>
                        <span className="text-[10px] text-neutral-500 shrink-0">{email.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs truncate mt-0.5">
                        <span className="text-neutral-200 font-medium truncate shrink-0 max-w-[40%]">
                          {email.subject}
                        </span>
                        <span className="text-neutral-400 truncate">
                          — {email.preview}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Email Reader & Reply (Solid black surface, clean content sections, clear headers) */}
          <div className={`flex-1 flex flex-col bg-black overflow-y-auto p-6 sm:p-10 space-y-6 ${!mobileShowDetail ? 'hidden md:flex' : ''}`}>
            
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={() => setMobileShowDetail(false)}
              className="md:hidden flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2 min-h-[44px] transition-colors"
            >
              <span>←</span>
              <span>Back to inbox</span>
            </button>

            {selectedEmail ? (
              <div className="space-y-6">
                {/* Header (Clean content sections, clear email headers) */}
                <div className="space-y-4 pb-6 border-b border-white/[0.06]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-normal text-white tracking-tight leading-snug">
                        {selectedEmail.subject}
                      </h2>
                      <div className="text-xs text-neutral-400">
                        From: <span className="text-white font-medium">{selectedEmail.sender}</span> ({selectedEmail.senderEmail})
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500 shrink-0">
                      {selectedEmail.time}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed pt-2 font-normal">
                    {selectedEmail.preview}
                  </p>
                </div>

                {/* Reply Composer */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-white">
                      Reply Draft
                    </h3>

                    {/* Tone Selector (Clean text links instead of complex cards/buttons) */}
                    <div className="flex items-center gap-4">
                      {[
                        { id: 'concise', label: 'Concise' },
                        { id: 'firm', label: 'Executive' },
                        { id: 'warm', label: 'Warm' },
                        { id: 'decline', label: 'Decline' }
                      ].map((t) => {
                        const isActive = selectedTone === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => handleRegenerateReply(t.id as any)}
                            className={`text-xs font-medium transition-colors cursor-pointer relative pb-1 ${
                              isActive
                                ? 'text-white'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            <span>{t.label}</span>
                            {isActive && (
                              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#00BFA6]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Textarea (Flat draft compose textarea, zero card border, clean style) */}
                  <div className="relative">
                    <textarea
                      value={draftReply}
                      onChange={(e) => setDraftReply(e.target.value)}
                      rows={8}
                      className="w-full p-4 bg-[#070709] border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors leading-relaxed resize-none rounded-none"
                      placeholder="Type your response or select a tone above to generate..."
                    />

                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex items-center justify-center gap-2 text-xs text-neutral-400">
                        <Loader2 className="w-4 h-4 animate-spin text-[#00BFA6]" />
                        <span>Drafting response...</span>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                      {sentStatus ? (
                        <span className="text-xs text-[#00BFA6] flex items-center gap-1.5 font-medium">
                          <Check className="w-4 h-4" />
                          <span>{sentStatus}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#00BFA6]" />
                          Secure OAuth Delivery
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRegenerateReply(selectedTone)}
                        className="h-10 px-4 border border-white/[0.08] bg-transparent hover:border-white/[0.2] text-white text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Regenerate</span>
                      </button>

                      <button
                        onClick={handleSend}
                        className="h-10 px-5 bg-[#00BFA6] hover:bg-[#00A892] text-black text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Response</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600 text-xs gap-2 py-20">
                <Mail className="w-6 h-6 opacity-30" />
                <span>Select an email thread from the inbox</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

