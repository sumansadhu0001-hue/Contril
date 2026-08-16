import React, { useState, useEffect } from 'react';
import { 
  Workflow, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Bot, 
  Plus, 
  Activity,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/auth';

interface WorkflowsDashboardViewProps {
  onBack?: () => void;
  onViewTimeline?: (workflowId: string) => void;
}

export const WorkflowsDashboardView: React.FC<WorkflowsDashboardViewProps> = ({ onBack, onViewTimeline }) => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'running' | 'completed' | 'watchers'>('workflows');
  const [workflowsList, setWorkflowsList] = useState<any[]>([
    {
      id: 'wf-101',
      title: 'Travel & Meeting Coordination Pipeline',
      goalPrompt: 'Schedule meeting tomorrow, check flight prices to Mumbai, and find 4-star hotel near venue.',
      status: 'completed',
      totalSteps: 5,
      completedSteps: 5,
      durationMs: 2400,
      createdAt: '10 mins ago'
    },
    {
      id: 'wf-102',
      title: 'Multi-Provider Shopping Aggregation Pipeline',
      goalPrompt: 'Compare MacBook Air M3 prices across Amazon and Flipkart and set price drop watcher.',
      status: 'completed',
      totalSteps: 4,
      completedSteps: 4,
      durationMs: 1850,
      createdAt: '30 mins ago'
    },
    {
      id: 'wf-103',
      title: 'Workspace Document & Risk Audit Pipeline',
      goalPrompt: 'Audit uploaded contract PDF, extract key financial terms, and vectorize embeddings.',
      status: 'completed',
      totalSteps: 3,
      completedSteps: 3,
      durationMs: 1420,
      createdAt: '2 hours ago'
    }
  ]);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error && data.length > 0) {
        setWorkflowsList(data.map(w => ({
          id: w.id,
          title: w.title,
          goalPrompt: w.goal_prompt,
          status: w.status || 'completed',
          totalSteps: 4,
          completedSteps: w.status === 'completed' ? 4 : 2,
          durationMs: 1950,
          createdAt: new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          {onBack && (
            <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
              ← Back to Overview
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
            <Workflow className="w-6 h-6 text-[#00BFA6]" />
            <span>My Autonomous Workflows & Pipelines</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Manage active DAG execution graphs, running tasks, and completed automation history.</p>
        </div>

        <button
          onClick={fetchWorkflows}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-mono transition-colors cursor-pointer flex items-center gap-2"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#00BFA6]" />
          <span>Refresh Workflows</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto flex items-center gap-2 border-b border-white/[0.06] pb-3">
        {[
          { id: 'workflows', label: 'All Workflows' },
          { id: 'running', label: 'Running Tasks' },
          { id: 'completed', label: 'Completed History' },
          { id: 'watchers', label: 'Watch Lists' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#00BFA6] text-black font-semibold shadow-md'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 border border-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workflows List */}
      <div className="max-w-6xl mx-auto space-y-4">
        {workflowsList.map((wf) => (
          <div
            key={wf.id}
            className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] hover:border-white/[0.14] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{wf.status}</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">ID: {wf.id}</span>
              </div>

              <h3 className="text-base font-semibold text-white">{wf.title}</h3>
              <p className="text-xs text-neutral-400 font-light italic">"{wf.goalPrompt}"</p>

              <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 pt-1">
                <span>Steps: {wf.completedSteps}/{wf.totalSteps} Completed</span>
                <span>Duration: {(wf.durationMs / 1000).toFixed(1)}s</span>
                <span>Created: {wf.createdAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => onViewTimeline ? onViewTimeline(wf.id) : alert(`Viewing timeline for ${wf.id}`)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-[#00BFA6]" />
                <span>View AI Timeline</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
