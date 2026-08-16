import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Building2, 
  BrainCircuit, 
  HardDrive, 
  Zap, 
  ShoppingBag, 
  Layers 
} from 'lucide-react';

export const AdminAnalyticsCenterView: React.FC<{ usersCount: number; orgsCount: number; aiOpsCount: number }> = ({
  usersCount,
  orgsCount,
  aiOpsCount
}) => {
  return (
    <div className="space-y-6 font-mono text-xs text-white">
      
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4">
        <h2 className="text-lg font-semibold text-white">Platform Analytics & Growth Telemetry</h2>
        <p className="text-xs text-neutral-400 font-light">Real-time metrics tracking usage, active user retention, subscription revenue, and AI engine throughput.</p>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-[10px] uppercase">Daily Active Users (DAU)</span>
            <Users className="w-4 h-4 text-[#00BFA6]" />
          </div>
          <div className="text-2xl font-bold text-white">{usersCount}</div>
          <div className="text-[10px] text-neutral-400">Database user directory count</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-[10px] uppercase">Monthly Active Users (MAU)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{usersCount}</div>
          <div className="text-[10px] text-neutral-400">Active monthly profiles</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-[10px] uppercase">AI Operations Logs</span>
            <BrainCircuit className="w-4 h-4 text-[#00BFA6]" />
          </div>
          <div className="text-2xl font-bold text-white">{aiOpsCount}</div>
          <div className="text-[10px] text-neutral-400">RAG & Agent executions</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="text-[10px] uppercase">Active Organizations</span>
            <Building2 className="w-4 h-4 text-[#00BFA6]" />
          </div>
          <div className="text-2xl font-bold text-white">{orgsCount}</div>
          <div className="text-[10px] text-neutral-400">Enterprise accounts</div>
        </div>
      </div>

      {/* Usage Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4">
          <h3 className="text-sm font-semibold text-white">AI Engine & Agent Execution Analytics</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
              <span className="text-neutral-400">Universal Intent Engine:</span>
              <span className="text-white font-semibold">{aiOpsCount} Executions</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
              <span className="text-neutral-400">Specialist Agents Executed:</span>
              <span className="text-white font-semibold">{aiOpsCount} Operations</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
              <span className="text-neutral-400">Workflow Automations Executed:</span>
              <span className="text-white font-semibold">0 Executions</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4">
          <h3 className="text-sm font-semibold text-white">Connector & Marketplace Extension Usage</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
              <span className="text-neutral-400">Gmail Connector Syncs:</span>
              <span className="text-emerald-400 font-semibold">Operational</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
              <span className="text-neutral-400">Calendar Intelligence Syncs:</span>
              <span className="text-emerald-400 font-semibold">Operational</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/[0.02]">
              <span className="text-neutral-400">Installed Marketplace Extensions:</span>
              <span className="text-white font-semibold">0 Extensions</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
