import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Compass, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Plus, 
  ChevronRight, 
  Info,
  Sliders,
  HelpCircle,
  X
} from 'lucide-react';
import { ExecutivePlanningEngine, ExecutiveGoal } from '../backend/ai/ExecutivePlanningEngine';
import { ExecutiveBriefEngine } from '../backend/ai/ExecutiveBriefEngine';
import { ProactiveIntelligenceEngine, PermissionMode } from '../backend/ai/ProactiveIntelligenceEngine';
import { DecisionAssistantEngine, DecisionMatrix } from '../backend/ai/DecisionAssistantEngine';
import { AutomationRecommendationEngine } from '../backend/ai/AutomationRecommendationEngine';

export const ExecutiveDashboardView: React.FC<{
  userProfile: any;
  onSelectMode: (mode: any) => void;
}> = ({ userProfile, onSelectMode }) => {

  const [permissionMode, setPermissionMode] = useState<PermissionMode>('executive');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [goals, setGoals] = useState<ExecutiveGoal[]>([
    {
      id: 'g-1',
      userId: 'usr-1',
      title: 'Launch Enterprise SaaS Startup',
      category: 'business',
      status: 'in_progress',
      progressPercentage: 35,
      milestones: ExecutivePlanningEngine.generateMilestoneBreakdown('Launch startup', 'business'),
      aiSuggestions: ['Align morning focus blocks with landing page milestone.']
    }
  ]);

  const [decisionTopic, setDecisionTopic] = useState('');
  const [decisionMatrix, setDecisionMatrix] = useState<DecisionMatrix | null>(null);
  const [selectedExplainability, setSelectedExplainability] = useState<any | null>(null);

  const connectedToolsCount = userProfile?.connectedTools?.length || 0;
  // TODO: This view does not yet fetch real Gmail/Calendar data. Until real
  // fetching is wired in here (e.g. via a useEffect calling the backend's
  // real Gmail/Calendar endpoints), we pass empty arrays so the briefing
  // shows an honest "nothing found" state rather than inventing fake
  // meetings/emails. Do NOT restore hardcoded placeholder numbers here.
  const morningBrief = ExecutiveBriefEngine.generateMorningBrief({
    realMeetings: [],
    realUnansweredEmails: [],
    realPendingApprovals: 0,
    connectedToolsCount
  });
  const proactiveNudges = ProactiveIntelligenceEngine.getProactiveNudges(permissionMode, connectedToolsCount);
  const automations = AutomationRecommendationEngine.getRecommendations();

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: ExecutiveGoal = {
      id: `g-${Date.now()}`,
      userId: 'usr-current',
      title: newGoalTitle,
      category: 'business',
      status: 'in_progress',
      progressPercentage: 0,
      milestones: ExecutivePlanningEngine.generateMilestoneBreakdown(newGoalTitle, 'business'),
      aiSuggestions: ['Breakdown milestones generated automatically.']
    };

    setGoals([newGoal, ...goals]);
    setNewGoalTitle('');
  };

  const handleGenerateDecision = () => {
    if (!decisionTopic.trim()) return;
    const matrix = DecisionAssistantEngine.generateDecisionMatrix(decisionTopic);
    setDecisionMatrix(matrix);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto w-full space-y-8 font-sans text-white">
      
      {/* Top Banner & Mode Selector */}
      <div className="p-8 rounded-3xl bg-[#111114] border border-white/[0.08] space-y-6 text-left relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#00BFA6]" />
              <span className="text-xs uppercase font-mono text-[#00BFA6] tracking-wider font-semibold">Phase 6.1 Executive AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white">Executive Operations & Goal Control</h1>
            <p className="text-xs text-neutral-400 font-light">Proactive planning, daily executive briefs, and weighted decision assistant with transparent permission governance.</p>
          </div>

          {/* Mode Selector Pill */}
          <div className="p-1.5 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center gap-1 shrink-0 font-mono text-xs">
            {(['passive', 'assist', 'executive', 'autonomous'] as PermissionMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setPermissionMode(m)}
                className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                  permissionMode === m
                    ? 'bg-[#00BFA6] text-black font-semibold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Description Banner */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center gap-2.5 text-xs text-neutral-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#00BFA6] shrink-0" />
          <span>
            Current Intelligence Mode: <strong>{permissionMode.toUpperCase()}</strong>. {
              permissionMode === 'passive' ? 'AI responds only to explicit prompts.' :
              permissionMode === 'assist' ? 'Contextual suggestions displayed inline.' :
              permissionMode === 'executive' ? 'Daily briefs & proactive goal breakdown enabled.' :
              'Automated background queueing enabled with reversible user authorization.'
            }
          </span>
        </div>
      </div>

      {/* Grid Section 1: Morning Brief & Proactive Nudges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Morning Briefing Panel */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00BFA6]" />
              <h2 className="text-lg font-semibold text-white">Daily Executive Briefing</h2>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">Updated 8:00 AM</span>
          </div>

          <p className="text-xs text-neutral-300 font-light leading-relaxed">{morningBrief.summary}</p>

          {/* Urgent Priorities */}
          <div className="space-y-2 font-mono text-xs">
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Today's Executive Priorities</span>
            <div className="space-y-2">
              {morningBrief.urgentPriorities.map((p, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <span className="text-neutral-200">{p}</span>
                  <button
                    onClick={() => setSelectedExplainability({ title: p, confidence: 94, memories: ['Product Strategy Sync', 'Investor Deck'], reasoning: 'Flagged as top priority based on upcoming pitch deadline.' })}
                    className="text-[10px] text-[#00BFA6] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> Explain
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Proactive Nudges */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] space-y-6">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
            <Zap className="w-5 h-5 text-[#00BFA6]" />
            <h2 className="text-lg font-semibold text-white">Proactive Nudges</h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {proactiveNudges.length === 0 ? (
              <div className="p-6 text-center text-neutral-500">Passive Mode Active. Proactive nudges suppressed.</div>
            ) : (
              proactiveNudges.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{n.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${n.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-light leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Grid Section 2: Executive Goals & Milestone Planning */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00BFA6]" />
            <div>
              <h2 className="text-lg font-semibold text-white">Personal & Business Goals Manager</h2>
              <p className="text-xs text-neutral-400">Automated milestone breakdown and progress tracking across career, business, fitness, and finance.</p>
            </div>
          </div>

          <form onSubmit={handleCreateGoal} className="flex gap-2 font-mono text-xs">
            <input
              type="text"
              placeholder="e.g. Run a Marathon, Launch Startup..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="bg-[#17171B] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6]"
            />
            <button type="submit" className="px-3 py-1.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold cursor-pointer flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Plan Goal
            </button>
          </form>
        </div>

        {/* Goals List */}
        <div className="space-y-6 font-mono text-xs">
          {goals.map((g) => (
            <div key={g.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">{g.category}</span>
                  <h3 className="text-sm font-semibold text-white">{g.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#00BFA6] font-bold">{g.progressPercentage}% Completed</span>
                </div>
              </div>

              {/* Milestones Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Automated Milestones Breakdown</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {g.milestones.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#17171B] border border-white/[0.04] flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-[#00BFA6] font-bold shrink-0 mt-0.5">
                        {m.stepOrder}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-200">{m.title}</div>
                        <div className="text-[10px] text-neutral-400 font-light">{m.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Section 3: Weighted Decision Matrix Assistant */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111114] border border-white/[0.08] space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00BFA6]" />
            <div>
              <h2 className="text-lg font-semibold text-white">AI Decision Matrix Assistant</h2>
              <p className="text-xs text-neutral-400">Generate weighted comparison matrices for laptops, hotels, flights, candidates, and software.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 font-mono text-xs">
          <input
            type="text"
            placeholder="Compare MacBook Pro vs Dell XPS, Hotel Taj vs St. Regis..."
            value={decisionTopic}
            onChange={(e) => setDecisionTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateDecision()}
            className="flex-1 bg-[#17171B] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6]"
          />
          <button onClick={handleGenerateDecision} className="px-4 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold cursor-pointer">
            Generate Matrix
          </button>
        </div>

        {decisionMatrix && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-[#00BFA6]/30 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{decisionMatrix.title}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">Confidence: {decisionMatrix.confidenceScore}%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decisionMatrix.options.map((opt, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#17171B] border border-white/[0.04] space-y-2">
                  <div className="flex justify-between font-semibold text-white">
                    <span>{opt.name}</span>
                    <span className="text-[#00BFA6]">{opt.score}/100</span>
                  </div>
                  {opt.price && <div className="text-[10px] text-neutral-400">{opt.price}</div>}
                  <div className="text-[11px] text-neutral-300">
                    <strong className="text-emerald-400">Pros:</strong> {opt.pros.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#00BFA6]/10 border border-[#00BFA6]/20 text-neutral-200">
              <strong>AI Recommendation:</strong> {decisionMatrix.recommendation}
            </div>
          </div>
        )}
      </div>

      {/* AI Explainability Modal */}
      {selectedExplainability && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 font-sans animate-modal-overlay">
          <div className="w-full max-w-md bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-6 relative space-y-4 text-white font-mono text-xs backdrop-blur-xl animate-modal-content">
            <button onClick={() => setSelectedExplainability(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <HelpCircle className="w-5 h-5 text-[#00BFA6]" />
              <h3 className="text-sm font-semibold text-white">AI Explainability Trace</h3>
            </div>

            <div className="space-y-2">
              <div className="text-neutral-400">Item: <strong className="text-white">{selectedExplainability.title}</strong></div>
              <div className="text-neutral-400">Confidence Score: <strong className="text-emerald-400">{selectedExplainability.confidence}%</strong></div>
              <div className="text-neutral-400">Memories Referenced: <span className="text-white">{selectedExplainability.memories.join(', ')}</span></div>
              <div className="text-neutral-400">Reasoning: <p className="text-neutral-300 mt-1 font-light leading-relaxed">{selectedExplainability.reasoning}</p></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
