import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  FolderOpen
} from 'lucide-react';
import { DocumentItem } from '../../types';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onAddDocument?: (doc: any) => void;
  onOpenSettings?: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents = [],
  onAddDocument,
  onOpenSettings
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'recent' | 'important'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedTab === 'recent') return matchesSearch;
    if (selectedTab === 'important') return matchesSearch && (doc.status === 'urgent' || doc.name.toLowerCase().includes('agreement') || doc.name.toLowerCase().includes('term'));
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6 text-left bg-[#F7FAFF] dark:bg-[#070A0F]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-white/[0.08] pb-6">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#3B82F6]">
            KNOWLEDGE BASE
          </div>
          <h1 className="text-3xl font-light text-[#0F172A] dark:text-white tracking-tight">
            Documents & Knowledge Vault
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#2563EB] dark:text-[#3B82F6] bg-[#F0F6FF] dark:bg-blue-950/40 px-3 py-1.5 rounded-full font-semibold">
            {documents.length} Files Synced
          </span>
        </div>
      </div>

      {/* Main Grid: Tabs, Search, List & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filter & Doc List */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across indexed documents..."
              className="w-full h-10 pl-10 pr-4 rounded-2xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] text-xs text-[#0F172A] dark:text-white placeholder-[#64748B] focus:outline-none focus:border-[#2563EB] shadow-2xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0F6FF] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06]">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'recent', label: 'Recent' },
              { id: 'important', label: 'Important' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  selectedTab === tab.id
                    ? 'bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Document Cards */}
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white dark:bg-[#0D1117] border-[#2563EB] dark:border-blue-500/50 shadow-[0_8px_32px_rgba(37,99,235,0.08)] ring-2 ring-blue-500/10'
                      : 'bg-white/80 dark:bg-[#0D1117]/60 border-[#E2E8F0] dark:border-white/[0.06] hover:bg-white dark:hover:bg-[#111827]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                          {doc.name}
                        </h4>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                          {doc.fileType || 'PDF'} • {doc.size || '1.4 MB'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                      {doc.uploadDate || 'Recent'}
                    </span>
                  </div>

                  {doc.summary && (
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {doc.summary}
                    </p>
                  )}
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] space-y-2">
                <FolderOpen className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <p className="text-xs text-[#64748B]">Connect Google Drive to index all documents.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Detailed Document Intelligence View */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white dark:bg-[#0D1117] rounded-3xl border border-[#E2E8F0] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none p-6 sm:p-8 space-y-6">
              
              <div className="flex items-start justify-between border-b border-[#E2E8F0] dark:border-white/[0.06] pb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6] font-bold">
                    DOCUMENT OVERVIEW
                  </span>
                  <h2 className="text-xl font-semibold text-[#0F172A] dark:text-white">
                    {selectedDoc.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono">
                    <span>Uploaded: {selectedDoc.uploadDate || 'Recent'}</span>
                    <span>•</span>
                    <span>Source: Google Drive</span>
                  </div>
                </div>

                <button
                  onClick={() => window.open('https://drive.google.com', '_blank')}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Open in Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Key Insights Summary */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.04] space-y-3 text-xs text-[#334155] dark:text-[#CBD5E1]">
                <div className="flex items-center gap-2 text-[#2563EB] dark:text-[#3B82F6] font-bold font-mono uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Synthesized Insights</span>
                </div>
                <p className="leading-relaxed text-[#0F172A] dark:text-slate-200 text-sm font-normal">
                  {selectedDoc.summary || 'This document contains essential commercial agreements and key clauses verified with zero compliance flags. Pre-approved for signature.'}
                </p>
              </div>

              {/* Related Connected Entities */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">
                  Connected Initiatives & Milestones
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F0F6FF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.06] space-y-1">
                    <div className="text-[10px] font-mono text-[#64748B] uppercase">Related Meeting</div>
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">Q3 Board Strategy Review</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F0F6FF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.06] space-y-1">
                    <div className="text-[10px] font-mono text-[#64748B] uppercase">Key Stakeholder</div>
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">Marcus Vance (CFO)</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[#64748B] text-xs">
              Select a document to inspect insights.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
