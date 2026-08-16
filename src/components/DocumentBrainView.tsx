import React, { useState } from 'react';
import { 
  Upload, 
  Calendar, 
  DollarSign, 
  Loader2,
  FolderOpen,
  Plus,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { DocumentItem } from '../types';
import { ServiceLogo } from './ServiceLogo';
import { showGooglePicker, createGoogleDoc } from '../lib/googlePickerService';
import { getStoredGoogleTokens } from '../lib/googleApi';
import { ContrilApiClient } from '../lib/apiClient';

interface DocumentBrainViewProps {
  documents: DocumentItem[];
  onAddDocument: (doc: DocumentItem) => void;
  onOpenSettings?: () => void;
}

export const DocumentBrainView: React.FC<DocumentBrainViewProps> = ({
  documents,
  onAddDocument,
  onOpenSettings
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const handleOpenGooglePicker = async () => {
    const tokens = getStoredGoogleTokens();
    const token = tokens?.accessToken || '';

    setIsPicking(true);
    try {
      const success = await showGooglePicker({
        accessToken: token,
        onPicked: (file) => {
          const newDoc: DocumentItem = {
            id: file.id,
            name: file.name,
            fileType: file.mimeType.includes('document') ? 'Google Doc' : 'Google Drive File',
            size: file.sizeBytes ? `${Math.round(file.sizeBytes / 1024)} KB` : 'Cloud File',
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'ready',
            summary: `Selected via Google Picker from Drive. Document ID: ${file.id}`,
            risk: 'Low'
          };
          onAddDocument(newDoc);
          setSelectedDoc(newDoc);
        },
        onCancel: () => {
          setIsPicking(false);
        }
      });

      if (!success) {
        alert('Could not open Google Picker. Ensure Google Workspace is connected with permissions.');
      }
    } catch (err) {
      console.error('Error with Google Picker:', err);
    } finally {
      setIsPicking(false);
    }
  };

  const handleCreateNewGoogleDoc = async () => {
    const title = prompt('Enter new Google Doc title:', 'New Strategy Memo') || 'New Strategy Memo';
    if (!title.trim()) return;

    const tokens = getStoredGoogleTokens();
    const token = tokens?.accessToken || '';

    setIsCreatingDoc(true);
    try {
      let docUrl = '';
      let docId = `doc-${Date.now()}`;

      if (token && !token.startsWith('demo_')) {
        const created = await createGoogleDoc(token, title);
        if (created) {
          docId = created.id;
          docUrl = created.url;
        }
      }

      const newDoc: DocumentItem = {
        id: docId,
        name: `${title}.gdoc`,
        fileType: 'Google Doc',
        size: '1.2 KB',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'ready',
        summary: `Newly created Google Doc in Google Workspace. ${docUrl ? `Edit Link: ${docUrl}` : ''}`,
        risk: 'Low'
      };

      onAddDocument(newDoc);
      setSelectedDoc(newDoc);
      if (docUrl) {
        window.open(docUrl, '_blank');
      }
    } catch (err) {
      console.error('Error creating Google Doc:', err);
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedFileName.trim()) return;

    setIsUploading(true);
    try {
      const data = await ContrilApiClient.postAiDocumentAnalysis(
        simulatedFileName,
        'Executive agreement draft uploaded for AI Document analysis.'
      );

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: simulatedFileName,
        fileType: 'contract',
        size: '1.5 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'ready',
        summary: data.summary,
        clauses: data.clauses,
        keyDates: data.keyDates,
        financials: data.financials
      };

      onAddDocument(newDoc);
      setSelectedDoc(newDoc);
      setSimulatedFileName('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // If no documents are loaded/connected
  if (!documents || documents.length === 0) {
    return (
      <div className="w-full min-h-[60vh] md:min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#070709] font-sans">
        <div className="max-w-md w-full p-8 border border-white/[0.08] bg-[#0c0c0e] text-center space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
              <ServiceLogo id="google_drive" size={24} />
            </div>
            <div className="w-12 h-12 border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
              <ServiceLogo id="dropbox" size={24} />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00BFA6]">
              Cloud Storage
            </span>
            <h2 className="text-base font-medium text-white tracking-tight">
              Connect Google Drive
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
              See recent documents, folder previews, and contract summaries in one place. Connect Google Drive to index and summarize files automatically.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={onOpenSettings}
              className="h-9 px-4 border border-white bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Connect Google Drive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white font-sans py-6 md:py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Document Brain</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Sync, analyze, and manage contract intelligence from Google Drive.
            </p>
          </div>

          {/* Minimal Utility Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenGooglePicker}
              disabled={isPicking}
              className="h-9 px-3 border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02] text-white font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Pick files directly from Google Drive / Docs using Google Picker"
            >
              {isPicking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00BFA6]" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5 text-[#00BFA6]" />
              )}
              <span>Google Picker</span>
            </button>

            <button
              type="button"
              onClick={handleCreateNewGoogleDoc}
              disabled={isCreatingDoc}
              className="h-9 px-3 border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02] text-white font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Create a new Google Doc in your Google Workspace"
            >
              {isCreatingDoc ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4285F4]" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-[#4285F4]" />
              )}
              <span>New Google Doc</span>
            </button>

            <form onSubmit={handleSimulatedUpload} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Document name..."
                value={simulatedFileName}
                onChange={e => setSimulatedFileName(e.target.value)}
                className="h-9 px-3 bg-transparent border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00BFA6] transition-colors w-40 sm:w-48"
              />
              <button
                type="submit"
                disabled={isUploading || !simulatedFileName.trim()}
                className="h-9 px-3 bg-transparent border border-[#00BFA6]/40 hover:border-[#00BFA6] hover:bg-[#00BFA6]/10 text-[#00BFA6] disabled:opacity-50 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload</span>
              </button>
            </form>
          </div>
        </div>

        {/* Folder Previews Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Synced Folders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'Legal Agreements', files: 12, size: '48.2 MB', updated: '2h ago', icon: 'google_drive' },
              { name: 'Board Pitch Decks', files: 8, size: '124.5 MB', updated: 'Yesterday', icon: 'google_drive' },
              { name: 'Financial Audits', files: 24, size: '89.1 MB', updated: '3 days ago', icon: 'onedrive' },
              { name: 'Product Roadmaps', files: 16, size: '32.0 MB', updated: '1 week ago', icon: 'google_drive' }
            ].map((folder, idx) => (
              <div key={idx} className="p-3.5 border border-white/[0.08] bg-[#0c0c0e] flex items-center justify-between transition-colors hover:border-white/[0.15]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/[0.02] border border-white/[0.06] shrink-0">
                    <ServiceLogo id={folder.icon} size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-medium text-white">{folder.name}</h3>
                    <p className="text-[10px] text-neutral-400">{folder.files} files • {folder.size}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">{folder.updated}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Grid & Detail Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Document Rows List */}
          <div className={`lg:col-span-5 space-y-3 ${mobileShowDetail ? 'hidden md:block' : ''}`}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Recent Files
            </h2>
            <div className="divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => { setSelectedDoc(doc); setMobileShowDetail(true); }}
                    className={`py-3 px-2 flex items-start justify-between gap-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white/[0.04]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 flex items-center justify-center bg-white/[0.02] border border-white/[0.06] shrink-0 mt-0.5">
                        <ServiceLogo id="google_docs" size={16} />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className={`text-xs font-medium truncate ${isSelected ? 'text-[#00BFA6]' : 'text-white'}`}>
                          {doc.name}
                        </h3>
                        <p className="text-[11px] text-neutral-400 line-clamp-1 leading-relaxed">
                          {doc.summary}
                        </p>
                        <span className="text-[10px] font-mono text-neutral-500 block">
                          {doc.size} • {doc.uploadDate}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono uppercase shrink-0 px-1.5 py-0.5 border ${
                      doc.status === 'ready' ? 'border-[#00BFA6]/30 text-[#00BFA6]' : 'border-neutral-700 text-neutral-400'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Deep Analysis View */}
          <div className={`lg:col-span-7 ${!mobileShowDetail ? 'hidden md:block' : ''}`}>
            {selectedDoc ? (
              <div className="p-6 border border-white/[0.08] bg-[#0c0c0e] space-y-6">
                
                {/* Mobile back button */}
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="md:hidden flex items-center gap-1 text-xs text-neutral-400 hover:text-white min-h-[44px] transition-colors"
                >
                  <span>←</span>
                  <span>Back to documents</span>
                </button>
                
                {/* Header */}
                <div className="space-y-3 pb-5 border-b border-white/[0.08]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <ServiceLogo id="google_docs" size={20} />
                      <h2 className="text-base font-semibold text-white tracking-tight truncate max-w-xs md:max-w-md">
                        {selectedDoc.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href={selectedDoc.summary?.includes('https://docs.google.com') 
                          ? selectedDoc.summary.match(/https:\/\/docs\.google\.com[^\s]+/)?.[0] || `https://docs.google.com/document/d/${selectedDoc.id}/edit`
                          : `https://docs.google.com/document/d/${selectedDoc.id}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-2.5 border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02] text-neutral-300 hover:text-white text-[11px] font-mono transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in Docs</span>
                      </a>
                      <span className="text-[10px] font-mono text-neutral-500">{selectedDoc.size}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {selectedDoc.summary}
                  </p>
                </div>

                {/* Clauses & Risk Indicators */}
                {selectedDoc.clauses && selectedDoc.clauses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Clause Analysis & Risk Indicators
                    </h3>

                    <div className="divide-y divide-white/[0.08]">
                      {selectedDoc.clauses.map((clause, idx) => {
                        const riskLevel = (clause.risk || clause.riskLevel || 'low').toLowerCase();
                        const textContent = clause.text || clause.summary || '';
                        return (
                          <div key={idx} className="py-3.5 space-y-1.5 first:pt-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-white">{clause.title}</span>
                              {riskLevel === 'high' ? (
                                <span className="text-[11px] font-mono text-red-400">High Risk</span>
                              ) : riskLevel === 'medium' ? (
                                <span className="text-[11px] font-mono text-amber-500">Medium Risk</span>
                              ) : (
                                <span className="text-[11px] font-mono text-[#00BFA6] flex items-center gap-1">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00BFA6]" />
                                  Low Risk
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-400 leading-relaxed">{textContent}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Key Dates & Financials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.08]">
                  {/* Key Deadlines */}
                  {selectedDoc.keyDates && selectedDoc.keyDates.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#00BFA6]" />
                        <span>Key Deadlines</span>
                      </div>
                      <div className="divide-y divide-white/[0.06]">
                        {selectedDoc.keyDates.map((kd: any, idx: number) => {
                          const dateStr = typeof kd === 'string' ? kd : kd.date || '';
                          const descStr = typeof kd === 'string' ? '' : kd.event || kd.label || '';
                          return (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs font-mono text-neutral-300 first:pt-0">
                              <span>{dateStr}</span>
                              <span className="text-neutral-500">{descStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Financial Milestones */}
                  {selectedDoc.financials && selectedDoc.financials.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-[#00BFA6]" />
                        <span>Financial Milestones</span>
                      </div>
                      <div className="divide-y divide-white/[0.06]">
                        {selectedDoc.financials.map((fin: any, idx: number) => {
                          const itemStr = fin.item || '';
                          const valueStr = fin.value || fin.amount || '';
                          return (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs font-mono text-neutral-300 first:pt-0">
                              <span>{itemStr}</span>
                              <span className="text-neutral-500">{valueStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
};
