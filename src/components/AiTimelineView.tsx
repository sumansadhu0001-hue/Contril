import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  BrainCircuit, 
  Layers, 
  Bot, 
  Zap, 
  ArrowRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { ExecutionGraph, ExecutionDagNode } from '../backend/intelligence/PlanningEngine';

interface AiTimelineViewProps {
  graph?: ExecutionGraph;
  onBack?: () => void;
}

export const AiTimelineView: React.FC<AiTimelineViewProps> = ({ graph, onBack }) => {
  const sampleGraph: ExecutionGraph = graph || {
    workflowId: 'wf-sample-101',
    title: 'Travel & Meeting Coordination Pipeline',
    goalPrompt: 'Schedule meeting tomorrow, check flight prices to Mumbai, and find 4-star hotel near venue.',
    createdAt: new Date().toISOString(),
    nodes: [
      {
        id: 'step-1',
        agentId: 'workspace',
        connectorId: 'gcal',
        operation: 'read_calendar_schedule',
        title: 'Read Google Calendar',
        description: 'Read upcoming meeting details and venue location from Google Calendar.',
        dependencies: [],
        status: 'completed',
        durationMs: 140,
        outputPayload: { venue: 'BKC Executive Center, Mumbai', meetingTime: '2026-08-07T10:00:00Z' }
      },
      {
        id: 'step-2',
        agentId: 'travel',
        connectorId: 'makemytrip',
        operation: 'search_flights',
        title: 'Query Flight Options',
        description: 'Searched MakeMyTrip connector for DEL → BOM direct flights.',
        dependencies: ['step-1'],
        status: 'completed',
        durationMs: 310,
        outputPayload: { route: 'DEL-BOM', bestPriceINR: 4999, flight: 'IndiGo 6E-204' }
      },
      {
        id: 'step-3',
        agentId: 'travel',
        connectorId: 'airbnb',
        operation: 'search_hotels',
        title: 'Search Hotel Stays',
        description: 'Searched 4-star & 5-star hotels within 2 km of BKC venue.',
        dependencies: ['step-1'],
        status: 'completed',
        durationMs: 280,
        outputPayload: { hotelName: 'Trident BKC', priceINR: 8500, distanceKm: 0.8 }
      },
      {
        id: 'step-4',
        agentId: 'executive',
        operation: 'synthesize_travel_recommendation',
        title: 'Synthesize Executive Dossier',
        description: 'Cross-aggregated flights, hotel proximity, and meeting timing.',
        dependencies: ['step-2', 'step-3'],
        status: 'completed',
        durationMs: 190,
        outputPayload: { recommendation: 'Book IndiGo 6E-204 + Trident BKC Stay' }
      },
      {
        id: 'step-5',
        agentId: 'automation',
        operation: 'dispatch_user_notification',
        title: 'Dispatch Unified Alert',
        description: 'Pushed completion notification to Notification Center.',
        dependencies: ['step-4'],
        status: 'completed',
        durationMs: 45,
        outputPayload: { notificationSent: true }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      
      {/* Top Header */}
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          {onBack && (
            <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
              ← Back to Overview
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#00BFA6]" />
            <span>AI Activity & Execution Timeline</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Trace real-time planning graphs, specialist agent steps, and connector executions.</p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00BFA6] animate-pulse" />
          <span className="text-neutral-400">Pipeline ID:</span>
          <span className="font-semibold text-white">{sampleGraph.workflowId}</span>
        </div>
      </div>

      {/* Goal Summary Card */}
      <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-2">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Goal Prompt</span>
        <div className="text-base font-light text-white italic">"{sampleGraph.goalPrompt}"</div>
      </div>

      {/* Vertical Step Timeline */}
      <div className="max-w-4xl mx-auto space-y-6 relative pl-6 border-l-2 border-white/[0.08] ml-2 sm:ml-4">
        {sampleGraph.nodes.map((node, index) => (
          <div key={node.id} className="relative space-y-3">
            
            {/* Timeline Node Badge */}
            <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-[#0D0D11] border-2 border-[#00BFA6] flex items-center justify-center text-[#00BFA6] text-[10px] font-mono font-bold">
              {index + 1}
            </div>

            {/* Node Card */}
            <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] hover:border-white/[0.14] transition-all space-y-3">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#00BFA6]/15 text-[#00BFA6] border border-[#00BFA6]/30 flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    <span>{node.agentId} agent</span>
                  </span>

                  {node.connectorId && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.04] text-neutral-300 border border-white/[0.08] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#00BFA6]" />
                      <span>{node.connectorId}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-neutral-500">{node.durationMs}ms</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{node.status}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">{node.title}</h3>
                <p className="text-xs text-neutral-400 font-light mt-0.5">{node.description}</p>
              </div>

              {/* Output Payload JSON Preview */}
              {node.outputPayload && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] text-[11px] font-mono text-neutral-300 overflow-x-auto">
                  <span className="text-[9px] uppercase text-neutral-500 block mb-1">Step Output Payload</span>
                  <pre className="text-neutral-300 leading-relaxed font-mono">
                    {JSON.stringify(node.outputPayload, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
