import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertTriangle, Bug, Sparkles, Zap } from 'lucide-react';
import { supabase } from '../lib/auth';

interface FeedbackSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackSubmissionModal: React.FC<FeedbackSubmissionModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState<'bug_report' | 'feature_request' | 'ai_feedback' | 'connector_issue' | 'general'>('feature_request');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id || null;

      await supabase.from('user_feedback_submissions').insert({
        user_id: userId,
        category,
        title,
        description,
        user_email: userEmail || session?.data?.session?.user?.email || null,
        status: 'open'
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setTitle('');
        setDescription('');
        onClose();
      }, 1500);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 font-sans animate-modal-overlay">
      <div className="w-full max-w-lg bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 sm:p-8 relative space-y-6 text-white backdrop-blur-xl animate-modal-content">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
          <MessageSquare className="w-6 h-6 text-[#00BFA6]" />
          <div>
            <h2 className="text-lg font-semibold text-white">Submit User Feedback & Bug Report</h2>
            <p className="text-xs text-neutral-400 font-light">Help refine Contril AI OS. All entries are reviewed by the core engineering team.</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3 font-mono">
            <CheckCircle2 className="w-12 h-12 text-[#00BFA6] mx-auto animate-bounce" />
            <h3 className="text-base font-semibold text-white">Feedback Received!</h3>
            <p className="text-xs text-neutral-400">Thank you for contributing to Contril Public Beta.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase">Feedback Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'feature_request', label: 'Feature Request', icon: Sparkles },
                  { id: 'bug_report', label: 'Bug Report', icon: Bug },
                  { id: 'ai_feedback', label: 'AI Feedback', icon: MessageSquare },
                  { id: 'connector_issue', label: 'Connector Problem', icon: Zap },
                  { id: 'general', label: 'General', icon: MessageSquare },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id as any)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                        category === c.id
                          ? 'bg-[#00BFA6]/15 border-[#00BFA6] text-[#00BFA6] font-semibold'
                          : 'bg-[#17171B] border-white/[0.06] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase">Title / Subject</label>
              <input
                type="text"
                required
                placeholder="Brief summary of feedback or issue..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-neutral-400 uppercase">Detailed Description</label>
              <textarea
                rows={4}
                required
                placeholder="Provide steps to reproduce or detailed suggestions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
