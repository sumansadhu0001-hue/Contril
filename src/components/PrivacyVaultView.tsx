import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Server, 
  EyeOff, 
  CheckCircle2, 
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { AuditLog } from '../types';

interface PrivacyVaultViewProps {
  auditLogs: AuditLog[];
}

export const PrivacyVaultView: React.FC<PrivacyVaultViewProps> = ({ auditLogs }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#121418] to-[#121418] border border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <span>Contril Zero-Knowledge Privacy Architecture</span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Your Data Belongs Strictly to You</h2>

        <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
          Contril employs zero-knowledge client-side encryption and strict hardware enclaves. Customer data is NEVER sold, exported, or used to train foundation models.
        </p>
      </div>

      {/* 4 Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121418] border border-white/10 space-y-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          <h4 className="text-xs font-bold text-white">AES-256 Encryption</h4>
          <p className="text-[11px] text-neutral-400">Encrypted at rest and in transit via TLS 1.3 hardware acceleration.</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121418] border border-white/10 space-y-2">
          <EyeOff className="w-5 h-5 text-amber-400" />
          <h4 className="text-xs font-bold text-white">Zero Model Training</h4>
          <p className="text-[11px] text-neutral-400">Strict zero-data logging contract with Contril Intelligence Enclave.</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121418] border border-white/10 space-y-2">
          <Server className="w-5 h-5 text-purple-400" />
          <h4 className="text-xs font-bold text-white">Local-First Enclave</h4>
          <p className="text-[11px] text-neutral-400">Memory vectors stored in private client sandbox with optional cloud sync.</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121418] border border-white/10 space-y-2">
          <Key className="w-5 h-5 text-blue-400" />
          <h4 className="text-xs font-bold text-white">Custom API Keys</h4>
          <p className="text-[11px] text-neutral-400">Option to bring your own dedicated Contril API Enterprise key.</p>
        </div>
      </div>

      {/* Audit Trail Logs */}
      <div className="bg-[#121418] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Transparent System Audit Logs</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Tamper-Proof Audit Trail</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-neutral-500">{log.timestamp}</span>
                <span className="text-white font-medium">{log.action}</span>
                <span className="text-neutral-400">[{log.module}]</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
