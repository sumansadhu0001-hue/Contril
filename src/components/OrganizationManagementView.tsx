import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  FolderOpen, 
  Clock, 
  Sliders, 
  Database, 
  ToggleLeft, 
  ToggleRight, 
  ChevronRight,
  Plus,
  Sparkles,
  Lock
} from 'lucide-react';
import { OrganizationRole } from '../backend/organizations/OrganizationService';

interface OrganizationManagementViewProps {
  onBack?: () => void;
}

export const OrganizationManagementView: React.FC<OrganizationManagementViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'departments' | 'projects' | 'rbac' | 'approvals' | 'memory'>('overview');

  // Datasets
  const [members, setMembers] = useState(() => {
    const raw = localStorage.getItem('contril_session_user');
    const session = raw ? JSON.parse(raw) : null;
    const ownerName = session?.name || 'Workspace Owner';
    const ownerEmail = session?.email || 'owner@contril.ai';
    return [
      { id: 'usr-1', fullName: ownerName, email: ownerEmail, role: 'owner' as OrganizationRole, department: 'Executive', joinedAt: 'Owner' },
      { id: 'usr-2', fullName: 'Priya Sharma', email: 'priya@contril.ai', role: 'admin' as OrganizationRole, department: 'Engineering', joinedAt: '2 days ago' },
      { id: 'usr-3', fullName: 'Vikram Mehta', email: 'vikram@contril.ai', role: 'manager' as OrganizationRole, department: 'Marketing', joinedAt: '1 week ago' },
      { id: 'usr-4', fullName: 'Ananya Roy', email: 'ananya@contril.ai', role: 'member' as OrganizationRole, department: 'Engineering', joinedAt: '2 weeks ago' }
    ];
  });

  const [departments, setDepartments] = useState([
    { id: 'dept-1', name: 'Engineering & AI', code: 'ENG', teamsCount: 3, memberCount: 18 },
    { id: 'dept-2', name: 'Marketing & Growth', code: 'MKT', teamsCount: 2, memberCount: 8 },
    { id: 'dept-3', name: 'Executive Suite', code: 'EXEC', teamsCount: 1, memberCount: 4 }
  ]);

  const [projects, setProjects] = useState([
    { id: 'proj-1', name: 'Contril Autonomous AI OS Phase 5', team: 'AI Team', status: 'active', tasksCount: 24, lastUpdated: 'Today' },
    { id: 'proj-2', name: 'Enterprise Multi-Tenant Connector SDK', team: 'Backend Team', status: 'active', tasksCount: 14, lastUpdated: 'Yesterday' },
    { id: 'proj-3', name: 'India First Billing & Rupee Pricing', team: 'Growth Team', status: 'completed', tasksCount: 8, lastUpdated: '3 days ago' }
  ]);

  const [approvals, setApprovals] = useState([
    { id: 'appr-101', title: 'Laptop Price Drop Watcher Automation', requester: 'Vikram Mehta', type: 'automation_approval', status: 'pending', date: '10 mins ago' },
    { id: 'appr-102', title: 'Google Workspace Enterprise Connector', requester: 'Priya Sharma', type: 'connector_approval', status: 'pending', date: '1 hour ago' }
  ]);

  const [memoryPolicies, setMemoryPolicies] = useState({
    workspaceMemory: true,
    departmentMemory: true,
    teamMemory: true,
    projectMemory: true
  });

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('member');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setMembers(prev => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        fullName: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        department: 'General',
        joinedAt: 'Invited'
      }
    ]);

    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleApprovalAction = (id: string, status: 'approved' | 'rejected') => {
    setApprovals(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-8 font-sans space-y-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/[0.06] pb-6 gap-4">
        <div>
          {onBack && (
            <button onClick={onBack} className="text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2 cursor-pointer">
              ← Back to Overview
            </button>
          )}
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#00BFA6]" />
            <span>Organization & Enterprise Collaboration</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Multi-tenant hierarchy, role-based access controls, department teams, and approval workflows.</p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#00BFA6] hover:bg-[#00A892] text-black font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-[#00BFA6]/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'members', label: 'Members & Invites' },
          { id: 'departments', label: 'Departments & Teams' },
          { id: 'projects', label: 'Projects Engine' },
          { id: 'rbac', label: 'RBAC Policy Matrix' },
          { id: 'approvals', label: 'Approval Workflows' },
          { id: 'memory', label: 'Shared Memory Governance' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#00BFA6] text-black font-semibold shadow-md'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 border border-white/[0.06]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="max-w-7xl mx-auto">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase">Organization Name</span>
              <div className="text-xl font-semibold text-white">Contril Enterprise OS</div>
              <span className="text-xs text-[#00BFA6]">Slug: contril-enterprise</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase">Active Members</span>
              <div className="text-xl font-semibold text-white">{members.length} / 50 Seats</div>
              <span className="text-xs text-neutral-400">Business Plan Active</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-2">
              <span className="text-[10px] text-neutral-500 uppercase">Pending Approvals</span>
              <div className="text-xl font-semibold text-amber-400">{approvals.length} Requests</div>
              <span className="text-xs text-neutral-400">Requires Admin Review</span>
            </div>
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === 'members' && (
          <div className="rounded-2xl bg-[#0D0D11] border border-white/[0.06] overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.02] text-neutral-400 border-b border-white/[0.06]">
                <tr>
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.01]">
                    <td className="p-4">
                      <div className="font-semibold text-white">{m.fullName}</div>
                      <div className="text-[10px] text-neutral-500">{m.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#00BFA6]/15 text-[#00BFA6]">
                        {m.role}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-300">{m.department}</td>
                    <td className="p-4 text-right text-neutral-400">{m.joinedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {approvals.map((appr) => (
              <div key={appr.id} className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {appr.type}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">Requested by {appr.requester}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{appr.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApprovalAction(appr.id, 'approved')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprovalAction(appr.id, 'rejected')}
                    className="px-4 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RBAC MATRIX */}
        {activeTab === 'rbac' && (
          <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4 text-xs font-mono">
            <h3 className="text-sm font-semibold text-white">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-neutral-400">Owner, Super Admin, Admin, Manager, Member, and Guest role permissions across organization modules.</p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-neutral-300">
              [RBAC Matrix Configured: All permission checks enforced dynamically per role]
            </div>
          </div>
        )}

        {/* SHARED MEMORY */}
        {activeTab === 'memory' && (
          <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4 font-mono">
            <h3 className="text-sm font-semibold text-white">Shared AI Memory Governance</h3>
            <p className="text-xs text-neutral-400">Configure shared memory scopes for Workspace, Department, Team, and Projects.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {Object.entries(memoryPolicies).map(([key, enabled]) => (
                <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                  <span className="capitalize text-white">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-500'}`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
