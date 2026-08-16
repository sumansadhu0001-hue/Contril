import React from 'react';
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Calendar
} from 'lucide-react';
import { UserProfile, DecisionItem, DocumentItem, MeetingItem } from '../../types';

interface WorkspaceViewProps {
  userProfile?: UserProfile;
  decisions?: DecisionItem[];
  currentDecisionIndex?: number;
  documents?: DocumentItem[];
  meetings?: MeetingItem[];
  onSelectMode: (mode: string) => void;
  isDemoMode?: boolean;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  userProfile,
  decisions = [],
  documents = [],
  meetings = [],
  onSelectMode
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.08] pb-6">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            OPERATING ENVIRONMENT
          </div>
          <h1 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
            Workspace Hub
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Active strategic initiatives, delegated workflows, and coordinated tasks.
          </p>
        </div>

        <button
          onClick={() => onSelectMode('focus')}
          className="h-9 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Command</span>
        </button>
      </div>

      {/* Grid of Workspaces and Projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active Projects */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Projects & Milestones
            </span>
            <span className="text-xs font-mono text-[#2563EB] dark:text-[#3B82F6] font-semibold">3 Active</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Series B Capital Raise', progress: 75, due: 'Aug 20' },
              { title: 'Q3 Board Expansion Review', progress: 40, due: 'Aug 28' },
              { title: 'APAC Regional Go-to-Market', progress: 90, due: 'Sep 05' }
            ].map((p, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#0F172A] dark:text-white">
                  <span>{p.title}</span>
                  <span className="font-mono text-[#2563EB] dark:text-[#3B82F6]">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E2E8F0] dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="text-[10px] text-[#64748B] font-mono">Target Deadline: {p.due}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Autonomous Queue */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Autonomous Operations
            </span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">Synced</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { task: 'Triage and summarize morning inbox threads', status: 'Completed', time: '8:00 AM' },
              { task: 'Ingest and index board pitch deck exhibit B', status: 'Indexed', time: '9:30 AM' },
              { task: 'Draft executive update to Sequoia capital', status: 'Pending Review', time: '11:00 AM' }
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] space-y-1">
                <div className="font-medium text-[#0F172A] dark:text-white">{t.task}</div>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#64748B] pt-1">
                  <span className="text-[#2563EB] dark:text-[#3B82F6] font-semibold">{t.status}</span>
                  <span>{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Connected Knowledge Assets */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Workspace Artifacts
            </span>
            <button onClick={() => onSelectMode('docs')} className="text-xs font-mono text-[#2563EB] dark:text-[#3B82F6] hover:underline">
              All ({documents.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelectMode('docs')}
                className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] hover:bg-[#F0F6FF] dark:hover:bg-[#182234] border border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between gap-2 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{doc.name}</div>
                  <div className="text-[10px] text-[#64748B] font-mono">{doc.fileType || 'Document'}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
