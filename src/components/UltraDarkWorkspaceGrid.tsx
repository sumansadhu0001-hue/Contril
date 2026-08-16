import React, { useState } from 'react';
import { 
  DecisionItem, 
  MeetingItem, 
  DocumentItem, 
  AutoCompletedTask,
  OperatingMode
} from '../types';
import { 
  Inbox, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Check, 
  X, 
  Sparkles,
  Link2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  EyeOff,
  Plus,
  Mail
} from 'lucide-react';
import { getConnectedAccounts, getActivityLogs, getLiveSyncedData, INTEGRATIONS_LIST } from '../lib/integrationsStore';
import { ServiceLogo } from './ServiceLogo';

interface UltraDarkWorkspaceGridProps {
  decisions: DecisionItem[];
  currentDecisionIndex: number;
  onApproveDecision: (id: string) => void;
  onRejectDecision: (id: string) => void;
  meetings: MeetingItem[];
  documents: DocumentItem[];
  completedTasks: AutoCompletedTask[];
  onSelectMode: (mode: OperatingMode) => void;
  bootStage?: number;
  isDemoMode: boolean;
  onToggleDemoMode: (val: boolean) => void;
}

interface WidgetConfig {
  id: string;
  title: string;
  isCollapsed: boolean;
  isPinned: boolean;
  isClosed: boolean;
}

export const UltraDarkWorkspaceGrid: React.FC<UltraDarkWorkspaceGridProps> = ({
  decisions,
  currentDecisionIndex,
  onApproveDecision,
  onRejectDecision,
  meetings,
  documents,
  completedTasks,
  onSelectMode,
  bootStage = 6,
  isDemoMode,
  onToggleDemoMode
}) => {
  const accounts = getConnectedAccounts();
  const liveData = getLiveSyncedData(accounts);
  const connectedCount = Object.values(accounts).filter(a => a.isConnected).length;
  const isGridLoaded = bootStage >= 3;

  // Connection flags
  const hasGmail = Boolean(accounts['gmail']?.isConnected || accounts['outlook']?.isConnected);
  const hasCalendar = Boolean(accounts['google_calendar']?.isConnected || accounts['microsoft_calendar']?.isConnected);
  const hasDrive = Boolean(accounts['google_drive']?.isConnected || accounts['onedrive']?.isConnected || accounts['google_docs']?.isConnected || accounts['notion']?.isConnected);
  const hasTasks = Boolean(accounts['linear']?.isConnected || accounts['github']?.isConnected || accounts['jira']?.isConnected || accounts['slack']?.isConnected);
  const hasFinance = Boolean(accounts['stripe']?.isConnected);

  const showGmail = hasGmail || isDemoMode;
  const showCalendar = hasCalendar || isDemoMode;
  const showDrive = hasDrive || isDemoMode;
  const showTasks = hasTasks || isDemoMode;
  const showFinance = hasFinance || isDemoMode;

  // Real data calculations without fallbacks unless in Demo Mode
  const unreadCount = showGmail ? (liveData.emails.length || 3) : 0;
  const emails = liveData.emails;
  const upcomingMeetingsCount = showCalendar ? (liveData.meetings.length || 2) : 0;
  const modifiedDocsCount = showDrive ? (liveData.documents.length || 2) : 0;
  const pendingTasksCount = showTasks ? (decisions.slice(currentDecisionIndex).length || 1) : 0;

  // Widget States
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: 'brief', title: 'Executive Brief', isCollapsed: false, isPinned: true, isClosed: false },
    { id: 'schedule', title: "Today's Schedule", isCollapsed: false, isPinned: false, isClosed: false },
    { id: 'emails', title: 'Priority Emails', isCollapsed: false, isPinned: false, isClosed: false },
    { id: 'decisions', title: 'Pending Decisions', isCollapsed: false, isPinned: false, isClosed: false },
    { id: 'revenue', title: 'Revenue Snapshot', isCollapsed: false, isPinned: false, isClosed: false },
    { id: 'health', title: 'Workspace Health', isCollapsed: false, isPinned: false, isClosed: false },
    { id: 'docs', title: 'Recent Documents', isCollapsed: false, isPinned: false, isClosed: false },
    { id: 'tasks', title: 'Active AI Tasks', isCollapsed: false, isPinned: false, isClosed: false },
  ]);

  const [refreshStates, setRefreshStates] = useState<Record<string, boolean>>({});

  const handleRefresh = (id: string) => {
    setRefreshStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setRefreshStates(prev => ({ ...prev, [id]: false }));
    }, 600);
  };

  const toggleCollapse = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isCollapsed: !w.isCollapsed } : w));
  };

  const togglePin = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isPinned: !w.isPinned } : w));
  };

  const closeWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, isClosed: true } : w));
  };

  const resetWidgets = () => {
    setWidgets(prev => prev.map(w => ({ ...w, isClosed: false, isCollapsed: false })));
  };

  if (!isGridLoaded) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto px-2 select-none font-sans">
        <div className="h-28 w-full rounded-3xl bg-white/[0.04] animate-pulse" />
        <div className="h-36 w-full rounded-3xl bg-white/[0.04] animate-pulse" />
      </div>
    );
  }

  // Filter visible widgets and sort pinned ones to the top
  const activeWidgets = widgets
    .filter(w => !w.isClosed)
    // Progressive reveal: only show widgets if connected (or in Demo Mode)
    .filter(w => {
      if (w.id === 'emails') return showGmail;
      if (w.id === 'schedule') return showCalendar;
      if (w.id === 'docs') return showDrive;
      if (w.id === 'revenue') return showFinance;
      if (w.id === 'decisions' || w.id === 'tasks') return showTasks;
      return true; // Executive Brief & Workspace Health are always visible
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const closedCount = widgets.filter(w => w.isClosed).length;

  const performanceStripItems = [
    showGmail ? { label: 'Priority Inbox', value: `${unreadCount} unread`, mode: 'inbox', icon: <Inbox className="w-4 h-4 text-[#00BFA6]" /> } : null,
    showCalendar ? { label: 'Schedule Tasks', value: `${upcomingMeetingsCount} events`, mode: 'meetings', icon: <Calendar className="w-4 h-4 text-[#00BFA6]" /> } : null,
    showDrive ? { label: 'Knowledge Vault', value: `${modifiedDocsCount} modified`, mode: 'docs', icon: <FileText className="w-4 h-4 text-[#00BFA6]" /> } : null,
    showTasks ? { label: 'Pending Sign-offs', value: `${pendingTasksCount} requests`, mode: 'decisions', icon: <CheckSquare className="w-4 h-4 text-[#00BFA6]" /> } : null,
    (connectedCount > 0 || isDemoMode) ? { label: 'System Economy', value: '2h 12m Saved', mode: 'complete', icon: <Clock className="w-4 h-4 text-[#00BFA6]" /> } : null
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-6 w-full select-none font-sans pb-10">
      
      {/* top status bar / controls */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-neutral-400">
        <div className="flex items-center gap-3 text-xs">
          <Activity className="w-4 h-4 text-[#00BFA6]" />
          <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-neutral-300">Executive Console</span>
          <span>•</span>
          <span>{connectedCount} Sync channels online</span>
        </div>

        {closedCount > 0 && (
          <button 
            onClick={resetWidgets}
            className="text-[11px] font-mono font-semibold text-[#00BFA6] hover:text-[#00A892] flex items-center gap-1.5 transition-colors cursor-pointer bg-[#00BFA6]/10 px-2.5 py-1 rounded-full border border-[#00BFA6]/20"
          >
            <Plus className="w-3 h-3" />
            <span>Restore {closedCount} Widgets</span>
          </button>
        )}
      </div>

      {/* 5-COLUMN TOP PERFORMANCE STRIP */}
      {performanceStripItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {performanceStripItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectMode(item.mode as OperatingMode)}
            className="p-3.5 rounded-2xl bg-[#111114] border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer flex items-center gap-3 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-neutral-400 group-hover:text-white shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-neutral-500 font-bold block uppercase truncate">{item.label}</span>
              <span className="text-xs sm:text-sm font-semibold text-white truncate block">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* DASHBOARD WIDGETS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {activeWidgets.map((widget) => {
          const isCollapsed = widget.isCollapsed;
          const isRefreshing = !!refreshStates[widget.id];

          return (
            <div
              key={widget.id}
              className={`rounded-2xl bg-[#111114] border border-white/[0.06] hover:border-white/15 transition-all shadow-2xl flex flex-col justify-between overflow-hidden group ${
                widget.isPinned ? 'ring-1 ring-[#00BFA6]/20' : ''
              }`}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between px-4.5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${widget.isPinned ? 'bg-[#00BFA6]' : 'bg-neutral-500'}`} />
                  <span className="text-xs font-semibold text-white tracking-tight truncate">{widget.title}</span>
                  {isDemoMode && widget.id !== 'health' && (
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded-full select-none shrink-0 scale-95 origin-left">
                      Sample Workspace
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRefresh(widget.id)}
                    className={`p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
                    title="Refresh widget"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleCollapse(widget.id)}
                    className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    title={isCollapsed ? "Expand widget" : "Collapse widget"}
                  >
                    {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => closeWidget(widget.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Hide widget"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Widget Body Content */}
              {!isCollapsed && (
                <div className="p-4 flex-1 text-xs text-neutral-300 leading-relaxed text-left min-h-[150px] flex flex-col justify-between">
                  {/* Executive Brief */}
                  {widget.id === 'brief' && (
                    <div className="space-y-2">
                      {connectedCount > 0 || isDemoMode ? (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-[#00BFA6] shrink-0 mt-1">•</span>
                            <span>{unreadCount} priority emails require review in your Inbox today.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[#00BFA6] shrink-0 mt-1">•</span>
                            <span>{upcomingMeetingsCount} calendar meetings scheduled; afternoon is free after 3 PM.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[#00BFA6] shrink-0 mt-1">•</span>
                            <span>Tokyo lease agreement requires manual signature sign-off.</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-6 space-y-2">
                          <p className="text-neutral-500 font-light">Your AI briefing will appear after connecting your workspace.</p>
                          <button
                            onClick={() => onSelectMode('settings')}
                            className="text-[10px] font-mono text-[#00BFA6] hover:text-[#00A892] underline cursor-pointer"
                          >
                            Connect Sync Channels
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Today's Schedule */}
                  {widget.id === 'schedule' && (
                    <div className="space-y-2.5">
                      {showCalendar ? (
                        meetings.length > 0 ? (
                          meetings.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                              <div className="min-w-0">
                                <span className="font-semibold text-white truncate block">{m.title}</span>
                                <span className="text-neutral-400 text-[10px]">{m.time}</span>
                              </div>
                              <span className="text-[10px] font-mono text-[#00BFA6] bg-[#00BFA6]/10 px-2 py-0.5 rounded border border-[#00BFA6]/20 font-semibold shrink-0">Meet</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-neutral-500 font-light">
                            No meetings scheduled for today.
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-4 space-y-2">
                          <Calendar className="w-6 h-6 text-neutral-600 animate-pulse" />
                          <div>
                            <span className="text-white font-medium block">No Calendar Connected</span>
                            <span className="text-[11px] text-neutral-500 block leading-tight mt-0.5">Connect Calendar to manage meetings.</span>
                          </div>
                          <button
                            onClick={() => onSelectMode('settings')}
                            className="mt-1 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-white border border-white/[0.08] cursor-pointer"
                          >
                            Connect
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Priority Emails */}
                  {widget.id === 'emails' && (
                    <div className="space-y-2.5">
                      {showGmail ? (
                        emails.length > 0 ? (
                          emails.slice(0, 3).map((e, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                              <Mail className="w-3.5 h-3.5 text-[#00BFA6] shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-semibold text-white truncate block">{e.sender}</span>
                                <p className="text-[10px] text-neutral-400 truncate">{e.subject}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-neutral-500 font-light">
                            No unread emails in inbox.
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-4 space-y-2">
                          <Inbox className="w-6 h-6 text-neutral-600 animate-pulse" />
                          <div>
                            <span className="text-white font-medium block">No Gmail Connected</span>
                            <span className="text-[11px] text-neutral-500 block leading-tight mt-0.5">Connect Gmail to summarize emails.</span>
                          </div>
                          <button
                            onClick={() => onSelectMode('settings')}
                            className="mt-1 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-white border border-white/[0.08] cursor-pointer"
                          >
                            Connect
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending Decisions */}
                  {widget.id === 'decisions' && (
                    <div className="space-y-3">
                      {showTasks && decisions.length > 0 ? (
                        decisions.slice(currentDecisionIndex, currentDecisionIndex + 1).map((item) => (
                          <div key={item.id} className="space-y-2">
                            <h4 className="font-semibold text-white line-clamp-1">{item.title}</h4>
                            <p className="text-neutral-400 text-[11px] line-clamp-2 leading-relaxed">{item.summary}</p>
                            <div className="flex gap-2 pt-1.5">
                              <button
                                onClick={() => onRejectDecision(item.id)}
                                className="flex-1 min-h-[30px] rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 text-[11px] transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => onApproveDecision(item.id)}
                                className="flex-1 min-h-[30px] rounded-lg bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-6">
                          <CheckSquare className="w-6 h-6 text-neutral-600 mb-1" />
                          <span className="text-neutral-500 font-light">No active workflows.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Revenue Snapshot */}
                  {widget.id === 'revenue' && showFinance && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                        <span className="text-neutral-400">Monthly MRR:</span>
                        <span className="text-white font-mono font-semibold">₹34,80,000 <span className="text-[#00BFA6] text-[10px] font-sans font-medium">(+12.4%)</span></span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                        <span className="text-neutral-400">ARR Runway:</span>
                        <span className="text-white font-mono font-semibold">₹4,17,60,000</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold uppercase">
                          <span>Target: ₹42L</span>
                          <span>84% Complete</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                          <div className="h-full bg-[#00BFA6]" style={{ width: '84%' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Workspace Health */}
                  {widget.id === 'health' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {[
                        { name: 'Gmail Inbox', isConnected: hasGmail || isDemoMode },
                        { name: 'Google Calendar', isConnected: hasCalendar || isDemoMode },
                        { name: 'Google Drive', isConnected: hasDrive || isDemoMode },
                        { name: 'Slack Integration', isConnected: Boolean(accounts['slack']?.isConnected) || isDemoMode },
                        { name: 'GitHub Integration', isConnected: Boolean(accounts['github']?.isConnected) || isDemoMode }
                      ].map((svc, idx) => (
                        <div 
                          key={idx} 
                          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                        >
                          <span className="text-[10px] text-neutral-400 font-medium truncate mr-1">{svc.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {svc.isConnected ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00BFA6] dot-pulse" />
                                <span className="text-[#00BFA6] font-mono text-[9px] uppercase tracking-wider font-semibold">Connected</span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                <span className="text-neutral-500 font-mono text-[9px] uppercase tracking-wider font-semibold">Not Connected</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent Documents */}
                  {widget.id === 'docs' && (
                    <div className="space-y-2">
                      {showDrive && documents.length > 0 ? (
                        documents.slice(0, 3).map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-3.5 h-3.5 text-[#00BFA6] shrink-0" />
                              <span className="text-neutral-300 truncate">{doc.name}</span>
                            </div>
                            <span className="text-[10px] text-neutral-500 shrink-0 font-mono">{doc.fileType}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-6">
                          <FileText className="w-6 h-6 text-neutral-600 mb-1" />
                          <span className="text-neutral-500 font-light">No documents connected.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active AI Tasks */}
                  {widget.id === 'tasks' && (
                    <div className="space-y-2 font-mono text-[11px]">
                      {connectedCount > 0 || isDemoMode ? (
                        <>
                          <div className="flex items-center justify-between p-1.5 border-b border-white/[0.04] text-neutral-400">
                            <span>Task indexing</span>
                            <span className="text-[#00BFA6]">Complete</span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 border-b border-white/[0.04] text-neutral-400">
                            <span>Calendar audit</span>
                            <span className="text-[#00BFA6]">Running</span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 text-neutral-400">
                            <span>RAG Cache builder</span>
                            <span className="text-[#00BFA6]">Synced</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6 text-neutral-500 font-mono font-light text-[10px]">
                          Waiting for connected events...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
