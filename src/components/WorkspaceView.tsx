import React, { useState } from 'react';
import { 
  OperatingMode, 
  UserProfile, 
  DecisionItem, 
  DocumentItem, 
  MeetingItem 
} from '../types';
import { 
  Search, 
  ChevronRight, 
  Folder, 
  Clock, 
  Shield, 
  LayoutGrid,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WorkspaceViewProps {
  userProfile: UserProfile;
  decisions: DecisionItem[];
  currentDecisionIndex: number;
  documents: DocumentItem[];
  meetings: MeetingItem[];
  onSelectMode: (mode: OperatingMode) => void;
  isDemoMode: boolean;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  userProfile,
  decisions,
  currentDecisionIndex,
  documents,
  meetings,
  onSelectMode,
  isDemoMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample static projects list for workspace structure
  const projects = [
    { name: 'Tokyo Lease Agreement', status: 'In Progress', updated: '2h ago' },
    { name: 'Acme Proposal & Budget', status: 'Needs Sign-off', updated: 'Yesterday' },
    { name: 'Q3 Financial Audit', status: 'Completed', updated: '3 days ago' }
  ];

  const pendingDecisions = decisions.slice(currentDecisionIndex);

  // Filter projects/activity based on search
  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full max-w-3xl mx-auto py-2 sm:py-6 space-y-8 select-none font-sans text-left px-4 sm:px-6 md:px-0">
      
      {/* HEADER & SEARCH */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">Workspace</h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            Business context, documents, and active automated agents.
          </p>
        </div>

        {/* Minimal Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search workspace context..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#0D0D11] border border-white/[0.06] text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors"
          />
        </div>
      </div>

      {/* OVERVIEW LIST */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-bold font-mono">Overview</h2>
        <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Environment</span>
            <span className="text-white font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00BFA6]" />
              <span>Secure Enclave</span>
            </span>
          </div>
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Sync Status</span>
            <span className="text-white font-mono">
              {userProfile.connectedTools.length > 0 
                ? `${userProfile.connectedTools.length} channels active` 
                : 'No apps connected'}
            </span>
          </div>
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-neutral-400">AI Processing Engine</span>
            <span className="text-[#00BFA6] font-mono">Contril Pro Core v1.2</span>
          </div>
        </div>
      </div>

      {/* ACTIVE PROJECTS */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-bold font-mono">Active Projects</h2>
        {filteredProjects.length > 0 ? (
          <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
            {filteredProjects.map((p, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-neutral-400 shrink-0">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{p.name}</h3>
                    <p className="text-[11px] text-neutral-500 font-light">Updated {p.updated}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                  p.status === 'Completed' ? 'bg-[#00BFA6]/10 text-[#00BFA6]' : 
                  p.status === 'Needs Sign-off' ? 'bg-amber-500/10 text-amber-400' : 
                  'bg-white/[0.04] text-neutral-400'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 italic py-2">No active projects found.</p>
        )}
      </div>

      {/* PENDING SIGN-OFFS & TASKS */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-bold font-mono">Pending Tasks</h2>
        {pendingDecisions.length > 0 ? (
          <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
            {pendingDecisions.slice(0, 2).map((task) => (
              <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium text-white">{task.title}</h3>
                  <p className="text-xs text-neutral-400 font-light line-clamp-1 leading-normal">{task.summary}</p>
                </div>
                <button
                  onClick={() => onSelectMode('inbox')}
                  className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-[#FAFAFA] border border-white/[0.06] flex items-center gap-1 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <span>Review</span>
                  <ChevronRight className="w-3 h-3 text-[#00BFA6]" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-neutral-400 py-3">
            <CheckCircle2 className="w-4 h-4 text-[#00BFA6]" />
            <span>Workspace is clear — no pending approvals.</span>
          </div>
        )}
      </div>

      {/* RECENT FEED & CONTEXT */}
      <div className="space-y-3 pb-6">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-bold font-mono">Recent Activity Logs</h2>
        <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
          {[
            { log: ' японский договор аренды index building complete', time: '1h ago', icon: LayoutGrid },
            { log: 'Google Workspace database context refresh successful', time: '4h ago', icon: Clock },
            { log: 'AI Chief of Staff scheduled Q3 financial audit follow-ups', time: '1 day ago', icon: Clock }
          ].map((act, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 truncate mr-3">
                <act.icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="text-neutral-300 truncate font-mono text-[11px]">{act.log}</span>
              </div>
              <span className="text-neutral-500 text-[10px] shrink-0 font-mono">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
