import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Filter, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  Eye 
} from 'lucide-react';

export const AdminAuditCenterView: React.FC<{ auditLogs: any[] }> = ({ auditLogs }) => {
  const [filterQuery, setFilterQuery] = useState('');

  const safeLogs = Array.isArray(auditLogs) ? auditLogs : [];

  const filteredLogs = safeLogs.filter(l => 
    !filterQuery || 
    (l && l.action && l.action.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (l && l.actor && l.actor.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Actor', 'IP Address'];
    const rows = filteredLogs.map(l => [l.created_at || '', l.action || '', l.actor || '', l.ip_address || '']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contril_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `contril_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-mono text-xs text-white">
      
      {/* Header */}
      <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Security & Regulatory Audit Center</h2>
          <p className="text-xs text-neutral-400 font-light">Immutable security audit trails, user access history, and CSV/JSON export utility.</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-mono border border-white/[0.06] flex items-center gap-1.5 cursor-pointer">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Export CSV</span>
          </button>

          <button onClick={exportJSON} className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-mono border border-white/[0.06] flex items-center gap-1.5 cursor-pointer">
            <FileText className="w-3.5 h-3.5 text-[#00BFA6]" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter audit logs by action or actor email..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full bg-[#17171B] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6]"
        />
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No audit logs found matching query filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-neutral-400 border-b border-white/[0.06]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="p-3 text-neutral-400">{log.created_at || 'Just now'}</td>
                    <td className="p-3 font-semibold text-white">{log.action || 'AUTH_EVENT'}</td>
                    <td className="p-3 text-neutral-300">{log.actor || 'System'}</td>
                    <td className="p-3 font-mono text-neutral-500">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
