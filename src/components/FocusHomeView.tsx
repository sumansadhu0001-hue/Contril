import React, { useState } from 'react';
import { AutoCompletedTask, UserProfile } from '../types';
import { ArrowRight, CheckCircle2, ChevronDown, Clock, Search, Sparkles } from 'lucide-react';
import { useLocalGreeting } from '../hooks/useLocalGreeting';

interface FocusHomeViewProps {
  completedTasks: AutoCompletedTask[];
  pendingDecisionCount: number;
  onStartDecisions: () => void;
  onExecutePrompt?: (prompt: string) => void;
  onOpenSpotlight?: () => void;
  userProfile?: UserProfile;
}

export const FocusHomeView: React.FC<FocusHomeViewProps> = ({
  completedTasks,
  pendingDecisionCount,
  onStartDecisions,
  onExecutePrompt,
  onOpenSpotlight,
  userProfile
}) => {
  const [showTaskLog, setShowTaskLog] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const userName = userProfile?.name?.trim() || '';
  const greetingData = useLocalGreeting(userName);

  const searchExamples = [
    "Summarize unread emails",
    "Prepare tomorrow's meeting",
    "Book my travel",
    "Find Samsung agreement",
    "Draft reply to Rahul"
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onExecutePrompt?.(searchInput);
      setSearchInput('');
    }
  };

  const handleChipClick = (chip: string) => {
    onExecutePrompt?.(chip);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between p-6 sm:p-10 md:p-16 max-w-5xl mx-auto selection:bg-[#7C3AED] selection:text-white space-y-12">
      
      {/* Top Section: Editorial Greeting & Today's Status */}
      <div className="space-y-10 my-auto">
        
        {/* Calm Status Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-600 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Today • {greetingData.formattedTime} ({greetingData.timeZone})</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-xs text-[#7C3AED] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="capitalize">{userProfile?.workspaceType || 'Business'} Workspace Active</span>
          </div>
        </div>

        {/* Large Display Typography Headline */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight text-neutral-900 tracking-tight leading-[1.05] font-sans">
            {greetingData.greeting}
          </h1>

          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-neutral-600 leading-snug font-sans">
            {greetingData.subGreeting}
          </p>

          <p className="text-base sm:text-lg md:text-xl font-light text-neutral-500 pt-2">
            Only <span className="text-neutral-900 font-medium border-b border-[#7C3AED] pb-0.5">{pendingDecisionCount} decisions</span> require your final sign-off today.
          </p>
        </div>

        {/* PRIMARY SEARCH & PROMPT INTERACTION BAR */}
        <div className="space-y-3 pt-2 max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 absolute left-4.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full pl-12 pr-28 py-4 rounded-full bg-white border border-neutral-200/90 text-sm md:text-base font-normal text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#7C3AED] shadow-sm transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
            >
              Ask Contril
            </button>
          </form>

          {/* Interactive Search Examples */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-neutral-400">Try asking:</span>
            {searchExamples.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-mono font-normal transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <button
            onClick={onStartDecisions}
            className="group px-8 py-4 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-base md:text-lg transition-all duration-300 flex items-center gap-3 shadow-xl hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Review Decisions ({pendingDecisionCount})</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-2.5 text-xs font-mono text-neutral-500 bg-white px-5 py-3.5 rounded-full border border-neutral-200 shadow-xs">
            <Clock className="w-4 h-4 text-[#7C3AED]" />
            <span>Estimated time saved: <strong className="text-neutral-900 font-medium">135 minutes</strong></span>
          </div>
        </div>

      </div>

      {/* Bottom Section: Timeline of Completed Work */}
      <div className="pt-8 border-t border-neutral-200/80 space-y-4">
        
        <button
          onClick={() => setShowTaskLog(!showTaskLog)}
          className="w-full flex items-center justify-between text-xs font-mono text-neutral-500 hover:text-neutral-900 transition-colors group py-2"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            <span className="uppercase font-medium tracking-wider text-neutral-700">Execution Log ({completedTasks.length})</span>
          </div>

          <div className="flex items-center gap-1.5 group-hover:translate-y-0.5 transition-transform text-neutral-500">
            <span>{showTaskLog ? 'Hide Log' : 'View Log'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTaskLog ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showTaskLog && (
          <div className="space-y-3 pt-1 animate-fade-in">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-[20px] bg-white border border-neutral-200/80 hover:border-[#7C3AED]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono uppercase px-3 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                      {task.category}
                    </span>
                    <h4 className="text-sm font-medium text-neutral-900">{task.title}</h4>
                  </div>
                  <p className="text-xs text-neutral-500 font-light">{task.detail}</p>
                </div>

                <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                  {task.time}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};



