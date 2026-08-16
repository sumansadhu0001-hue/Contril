import React, { useState } from 'react';
import { 
  BrainCircuit, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Terminal, 
  RefreshCw 
} from 'lucide-react';

interface AdminAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAiAssistantModal: React.FC<AdminAiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const samplePrompts = [
    'Show failed logins today',
    'Who uses the most storage?',
    'Generate today executive report',
    'Restart failed background workers',
    'Which organizations exceeded storage limits?',
    'Summarize platform incidents'
  ];

  const handleExecute = async (inputPrompt?: string) => {
    const activeQuery = inputPrompt || prompt;
    if (!activeQuery) return;

    setIsLoading(true);
    setResponse(null);

    setTimeout(() => {
      setIsLoading(false);
      setResponse(`[Admin AI Executive Response for "${activeQuery}"]\n\n- System Status: All 6 infrastructure clusters operating nominally.\n- Active Sessions: 1,420 users.\n- DB Pool Latency: 24ms.\n- Zero critical vulnerability flags detected in current audit window.`);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 font-sans animate-modal-overlay">
      <div className="w-full max-w-2xl bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 sm:p-8 relative space-y-6 text-white backdrop-blur-xl animate-modal-content">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-6 h-6 text-[#00BFA6]" />
            <div>
              <h2 className="text-lg font-semibold text-white">AI Executive Operations Assistant</h2>
              <p className="text-xs text-neutral-400">Ask queries or trigger operational commands across system logs, metrics, and resources.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Chips */}
        <div className="space-y-2 font-mono text-xs">
          <span className="text-[10px] text-neutral-500 uppercase">Suggested Prompts</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p);
                  handleExecute(p);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-[#00BFA6]/15 text-neutral-300 hover:text-[#00BFA6] border border-white/[0.06] hover:border-[#00BFA6]/30 transition-colors text-left cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Admin AI Assistant..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            className="flex-1 bg-[#17171B] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6] font-mono"
          />
          <button
            onClick={() => handleExecute()}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Response Box */}
        {response && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#00BFA6]/30 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
            {response}
          </div>
        )}

      </div>
    </div>
  );
};
