import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ListChecks, 
  Table, 
  FileText, 
  Calendar, 
  Loader2,
  Zap,
  Play
} from 'lucide-react';
import { DelegateWorkflow } from '../types';
import { ContrilApiClient } from '../lib/apiClient';

export const DelegateView: React.FC = () => {
  const [prompt, setPrompt] = useState('Research top 10 logistics companies, compare fleet sizes & SLA, create comparison table and schedule follow-up calls.');
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflow, setWorkflow] = useState<DelegateWorkflow | null>({
    id: 'wf-initial',
    title: 'Top 10 Logistics Companies Research & Benchmarking',
    prompt: 'Research top 10 logistics companies, compare fleet sizes & SLA, create comparison table and schedule follow-up calls.',
    status: 'completed',
    progressPercent: 100,
    currentStep: 'Workflow completed successfully.',
    steps: [
      { label: 'Deep web research & market benchmark database scan', status: 'completed', output: 'Gathered financial & operational data for 10 freight leaders.' },
      { label: 'Synthesizing structured comparison matrix', status: 'completed', output: 'Generated 3-column operational breakdown.' },
      { label: 'Initializing agent orchestration', status: 'pending' },
      { label: 'Querying workspace documents & databases', status: 'pending' },
      { label: 'Synthesizing contract briefing logs', status: 'pending' }
    ]
  });

  const handleExecuteDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsExecuting(true);
    setWorkflow({
      id: `wf-${Date.now()}`,
      title: prompt,
      prompt,
      status: 'running',
      progressPercent: 35,
      currentStep: 'Conducting deep research via Contril Intelligence...',
      steps: [
        { label: 'Initializing autonomous agent framework', status: 'completed' },
        { label: 'Querying market benchmarks and live web data', status: 'in_progress' },
        { label: 'Generating comparison matrix & executive report', status: 'pending' }
      ]
    });

    try {
      const data = await ContrilApiClient.postAiDelegateTask(prompt);

      setWorkflow({
        id: `wf-${Date.now()}`,
        title: prompt,
        prompt,
        status: 'completed',
        progressPercent: 100,
        currentStep: 'Workflow completed.',
        steps: [
          { label: 'Deep web research & database scan', status: 'completed' },
          { label: 'Synthesized structured comparison matrix', status: 'completed' },
          { label: 'Executed action items & scheduled follow-ups', status: 'completed' }
        ],
        finalResult: {
          summary: data.summary,
          comparisonTable: data.comparisonTable,
          actionsTaken: data.actionsTaken
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Executive Command Input Box */}
      <div className="bg-[#121418] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400">
            <Bot className="w-4 h-4" />
            <span>AI Executive Delegate (Autonomous Workflows)</span>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Executes multi-step tasks without hand-holding
          </span>
        </div>

        <form onSubmit={handleExecuteDelegate} className="space-y-3">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a high-level executive instruction e.g. 'Research top 10 logistics companies, compare SLAs, generate PDF report and schedule calls.'"
            className="w-full p-4 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <div className="text-[11px] text-neutral-400 font-mono">
              Examples: "Prepare competitor pricing analysis" • "Draft board resolution memo"
            </div>

            <button
              type="submit"
              disabled={isExecuting || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing Workflow...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Delegate & Execute</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Workflow Progress & Output */}
      {workflow && (
        <div className="bg-[#121418] border border-white/10 rounded-2xl p-6 space-y-6">
          
          {/* Header & Status Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">{workflow.title}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{workflow.currentStep}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                workflow.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {workflow.status.toUpperCase()} ({workflow.progressPercent}%)
              </span>
            </div>
          </div>

          {/* Steps Progress Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workflow.steps.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${step.status === 'completed' ? 'text-emerald-400' : 'text-neutral-600'}`} />
                  <span className="text-xs font-semibold text-white">Step 0{idx + 1}</span>
                </div>
                <p className="text-[11px] text-neutral-300">{step.label}</p>
              </div>
            ))}
          </div>

          {/* Final Results Comparison Matrix */}
          {workflow.finalResult && (
            <div className="space-y-6 pt-2">
              
              {/* Summary */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-neutral-200 leading-relaxed">
                <span className="font-bold text-amber-400 block mb-1">Executive Workflow Summary:</span>
                {workflow.finalResult.summary}
              </div>

              {/* Comparison Table */}
              {workflow.finalResult.comparisonTable && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Table className="w-4 h-4 text-amber-400" />
                    <span>Generated Comparison Matrix</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-neutral-400 font-mono text-[11px]">
                        <tr>
                          <th className="p-3">Company / Provider</th>
                          <th className="p-3">Fleet Capacity / Scale</th>
                          <th className="p-3">Key Differentiator / SLA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-neutral-200">
                        {workflow.finalResult.comparisonTable.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-medium text-white">{row.column1}</td>
                            <td className="p-3 font-mono text-neutral-300">{row.column2}</td>
                            <td className="p-3 text-emerald-300">{row.column3}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions Automated List */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ListChecks className="w-4 h-4 text-emerald-400" />
                  <span>Automated System Actions Executed</span>
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {workflow.finalResult.actionsTaken?.map((act, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
