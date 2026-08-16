import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BrainCircuit, 
  MessageSquare, 
  Database, 
  FileText, 
  Calendar, 
  Layers, 
  Settings, 
  CreditCard 
} from 'lucide-react';

interface InteractiveProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const InteractiveProductTourModal: React.FC<InteractiveProductTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    { title: 'Welcome to Contril AI OS', description: 'Your unified Executive AI platform. Let us guide you through the core capabilities.', icon: Sparkles, tab: 'focus' },
    { title: 'AI Universal Chat', description: 'Ask complex reasoning queries, execute code, or manage projects in natural language.', icon: MessageSquare, tab: 'chat' },
    { title: 'RAG AI Memory Bank', description: 'Your AI remembers key context across meetings, decisions, and preferences in a private RAG database.', icon: Database, tab: 'memory' },
    { title: 'Document & Knowledge Brain', description: 'Upload PDFs, Word docs, and markdown specs to index into your RAG pipeline.', icon: FileText, tab: 'docs' },
    { title: 'Meeting Intelligence', description: 'Automated transcript summarization, action item extraction, and calendar integration.', icon: Calendar, tab: 'meetings' },
    { title: 'Background Automations', description: 'Schedule recurring AI workflows and automatic triggers with zero manual intervention.', icon: Layers, tab: 'automations' },
    { title: 'Workspace Settings', description: 'Manage domain connectors (Gmail, Calendar, Drive, Slack, GitHub) and device permissions.', icon: Settings, tab: 'settings' },
    { title: 'Subscriptions & Upgrade', description: 'Transparent INR pricing with Pro, Business, and Enterprise plans.', icon: CreditCard, tab: 'pricing' },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      onNavigateTab(steps[nextIdx].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      onNavigateTab(steps[prevIdx].tab);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 font-sans animate-modal-overlay">
      <div className="w-full max-w-lg bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 sm:p-8 relative space-y-6 text-white backdrop-blur-xl animate-modal-content">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
          <span>Product Tour Step {currentStep + 1} of {steps.length}</span>
          <span className="text-[#00BFA6]">Contril Guided Tour</span>
        </div>

        <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#00BFA6]/10 border border-[#00BFA6]/20 flex items-center justify-center text-[#00BFA6] shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{current.title}</h2>
            <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">{current.description}</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-1.5 pt-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                idx === currentStep ? 'bg-[#00BFA6]' : idx < currentStep ? 'bg-[#00BFA6]/40' : 'bg-white/[0.08]'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-xs font-mono text-white flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
