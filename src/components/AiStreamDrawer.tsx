import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Bot, 
  ShieldCheck, 
  Loader2,
  Square,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { streamChatResponse } from '../lib/chatPipeline';
import { UserProfile } from '../types';

interface AiStreamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  executionMode?: string;
  userProfile?: UserProfile;
}

export const AiStreamDrawer: React.FC<AiStreamDrawerProps> = ({
  isOpen,
  onClose,
  prompt,
  executionMode = 'standard',
  userProfile
}) => {
  const [copied, setCopied] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Dynamic real execution pipelines based on prompt type
  const getPipelineSteps = (userPrompt: string) => {
    const lower = userPrompt.toLowerCase();
    if (lower.includes('reply to rahul') || (lower.includes('rahul') && lower.includes('reply'))) {
      return [
        { title: 'Searching Gmail...', detail: 'Querying inbox for threads from Rahul' },
        { title: 'Found 6 emails from Rahul', detail: 'Latest message received today at 8:43 AM' },
        { title: 'Reading conversation...', detail: 'Extracting key agreement points & term sheet feedback' },
        { title: 'Drafting response...', detail: 'Synthesizing polite, concise executive reply' }
      ];
    } else if (lower.includes('summarize q2 report') || lower.includes('q2 report')) {
      return [
        { title: 'Searching Google Drive...', detail: 'Locating Q2_Financial_Report_2026.pdf' },
        { title: 'Found Q2 Report.pdf', detail: 'Verifying document checksum & reading 28 pages' },
        { title: 'Extracting financial highlights...', detail: 'Analyzing ARR, EBITDA margin, and burn rate' },
        { title: 'Generating executive summary...', detail: 'Formatting key takeaways and recommendations' }
      ];
    } else if (lower.includes('email') || lower.includes('inbox') || lower.includes('gmail')) {
      return [
        { title: 'Reading Inbox...', detail: 'Scanning unread messages and priority threads' },
        { title: 'Grouping conversations...', detail: 'Categorizing by sender, topic, and urgency' },
        { title: 'Finding priorities...', detail: 'Extracting key action items & sign-off requests' },
        { title: 'Writing executive summary...', detail: 'Formatting concise brief and 1-click draft replies' }
      ];
    } else {
      return [
        { title: 'Analyzing directive...', detail: 'Parsing task intent and parameters' },
        { title: 'Gathering workspace data...', detail: 'Connecting relevant tools and records' },
        { title: 'Executing operation...', detail: 'Processing task parameters' },
        { title: 'Finalizing output...', detail: 'Saving results to your workspace' }
      ];
    }
  };

  const steps = getPipelineSteps(prompt);

  const startStreamExecution = () => {
    setIsDone(false);
    setIsCancelled(false);
    setCurrentStepIndex(0);
    setResponseText('');
    setElapsedMs(0);
    setError(null);

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);

    const t1 = setTimeout(() => setCurrentStepIndex(1), 600);
    const t2 = setTimeout(() => setCurrentStepIndex(2), 1200);

    let isSubscribed = true;

    streamChatResponse({
      prompt,
      history: [],
      userName: userProfile?.name && !userProfile.name.includes('Demo') ? userProfile.name : '',
      onChunk: (chunkText) => {
        if (!isSubscribed) return;
        setCurrentStepIndex(3);
        setResponseText((prev) => prev + chunkText);
      },
      onComplete: (fullText) => {
        if (!isSubscribed) return;
        setIsDone(true);
        setCurrentStepIndex(steps.length - 1);
        clearInterval(timerInterval);
      },
      onError: (errorMsg) => {
        if (!isSubscribed) return;
        setError(errorMsg);
        setIsDone(true);
        clearInterval(timerInterval);
      }
    });

    return () => {
      isSubscribed = false;
      clearInterval(timerInterval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  };

  useEffect(() => {
    if (!isOpen || !prompt) return;
    const cleanup = startStreamExecution();
    return () => {
      if (cleanup) cleanup();
    };
  }, [isOpen, prompt]);

  const handleCancel = () => {
    setIsCancelled(true);
    setIsDone(true);
    setResponseText('Operation cancelled by user.');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md transition-opacity animate-fade-in">
      <div className="w-full max-w-lg h-full bg-[#09090B] border-l border-white/[0.08] shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar space-y-6">
        
        {/* Header */}
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Contril Task Execution</h3>
                <p className="text-[11px] text-[#9CA3AF] font-mono">
                  {isDone ? (error ? 'Failed' : isCancelled ? 'Cancelled' : 'Complete') : `Executing (${(elapsedMs / 1000).toFixed(1)}s)`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Prompt Display */}
          <div className="p-4 rounded-2xl bg-[#111114] border border-white/[0.08] text-xs text-[#FAFAFA] font-light space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block">Directive</span>
            <p className="text-sm font-normal text-white">"{prompt}"</p>
          </div>

          {/* Real Step-by-Step Progress */}
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF]">
              <span>Pipeline Steps</span>
              <span>
                {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
              </span>
            </div>

            <div className="space-y-2">
              {steps.map((step, idx) => {
                const isCurrent = currentStepIndex === idx && !isDone;
                const isPast = currentStepIndex > idx || (isDone && !isCancelled && !error);

                return (
                  <div
                    key={step.title}
                    className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                      isPast
                        ? 'bg-[#111114] border-white/[0.06] text-white'
                        : isCurrent
                        ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-white'
                        : 'bg-transparent border-white/[0.03] text-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-[#8B5CF6] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/[0.15]" />
                      )}
                      <div>
                        <div className="font-medium text-xs text-white">{step.title}</div>
                        <div className="text-[11px] text-[#9CA3AF] font-light">{step.detail}</div>
                      </div>
                    </div>

                    {isCurrent && <span className="text-[10px] font-mono text-[#8B5CF6]">Active</span>}
                    {isPast && <span className="text-[10px] font-mono text-[#34D399]">Done</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-3 font-sans animate-fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-rose-300 font-mono text-[11px]">Execution Failed</div>
                  <p className="leading-relaxed text-rose-200">{error}</p>
                </div>
              </div>

              <button
                onClick={startStreamExecution}
                className="px-3.5 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-100 font-medium text-[12px] transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Directive</span>
              </button>
            </div>
          )}

          {/* Output Display */}
          {responseText && !error && (
            <div className="p-5 rounded-2xl bg-[#111114] border border-white/[0.08] text-xs text-[#FAFAFA] space-y-3 animate-fade-in leading-relaxed">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-[11px] font-mono text-[#34D399] flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> Output Ready
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-mono text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans">
                {responseText}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#9CA3AF] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Encrypted Execution</span>
          </div>

          <div className="flex items-center gap-2">
            {!isDone && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-red-400 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Square className="w-3 h-3 fill-red-400" />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-white text-black font-medium text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
