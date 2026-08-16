import React, { useState } from 'react';
import { 
  Code, 
  Key, 
  Webhook, 
  Terminal, 
  BookOpen, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Send, 
  ExternalLink, 
  Layers, 
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { DeveloperKeyService, DeveloperApiKey } from '../backend/api/DeveloperKeyService';
import { WebhookDispatchEngine, WebhookSubscriptionItem } from '../backend/api/WebhookDispatchEngine';

interface DeveloperPortalViewProps {
  onBack?: () => void;
}

export const DeveloperPortalView: React.FC<DeveloperPortalViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'keys' | 'webhooks' | 'sdks' | 'extensions'>('docs');

  // API Keys
  const [apiKeys, setApiKeys] = useState<DeveloperApiKey[]>([
    { id: 'key-1', userId: 'demo-user', keyName: 'Production Server Key', keyPrefix: 'ck_live_8f3a9b', scopes: ['read', 'write', 'ai'], createdAt: '2 days ago' },
    { id: 'key-2', userId: 'demo-user', keyName: 'CI/CD Automation Key', keyPrefix: 'ck_live_1c4d9e', scopes: ['read', 'automations'], createdAt: '1 week ago' }
  ]);

  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookSubscriptionItem[]>([
    { id: 'whsub-1', userId: 'demo-user', targetUrl: 'https://api.myapp.com/webhooks/contril', secretKey: 'whsec_9a8b7c6d5e4f', subscribedEvents: ['ai.completed', 'workflow.completed'], isActive: true, createdAt: '3 days ago' }
  ]);

  // Key creation state
  const [newKeyName, setNewKeyName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  // Webhook creation state
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const newKey = await DeveloperKeyService.createApiKey('demo-user', newKeyName, ['read', 'write', 'ai']);
    setApiKeys(prev => [newKey, ...prev]);
    setCreatedSecret(newKey.rawSecretKey || null);
    setNewKeyName('');
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;

    const newWh = await WebhookDispatchEngine.registerSubscription('demo-user', newWebhookUrl);
    setWebhooks(prev => [newWh, ...prev]);
    setNewWebhookUrl('');
  };

  const handleTestWebhook = async (whId: string) => {
    await WebhookDispatchEngine.dispatchWebhookEvent('ai.completed', { test: true, timestamp: new Date().toISOString() });
    alert('Test webhook payload dispatched successfully (HMAC SHA-256 signed).');
  };

  const deleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
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
            <Code className="w-6 h-6 text-[#00BFA6]" />
            <span>Contril Developer Platform & APIs</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Build connectors, AI agents, automations, and applications via public REST APIs (/api/v1) & official SDKs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'docs', label: 'API Explorer & Docs' },
          { id: 'keys', label: 'API Keys' },
          { id: 'webhooks', label: 'Webhooks' },
          { id: 'sdks', label: 'SDKs & CLI' },
          { id: 'extensions', label: 'Extension Registry' }
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

      {/* Panels */}
      <div className="max-w-7xl mx-auto">
        
        {/* API EXPLORER */}
        {activeTab === 'docs' && (
          <div className="space-y-4 font-mono">
            <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-semibold text-white">Public REST API v1 Specification</h3>
              <p className="text-xs text-neutral-400 font-light">Versioned endpoints authenticated via `Authorization: Bearer ck_live_...`</p>
              
              <div className="space-y-2 text-xs">
                {[
                  { method: 'POST', path: '/api/v1/ai/chat', desc: 'Execute multi-domain AI prompt' },
                  { method: 'GET', path: '/api/v1/connectors', desc: 'List active domain connectors' },
                  { method: 'POST', path: '/api/v1/memory/search', desc: 'Perform semantic memory search' },
                  { method: 'GET', path: '/api/v1/workflows', desc: 'Query active DAG workflow executions' }
                ].map((ep, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#00BFA6]/15 text-[#00BFA6]">{ep.method}</span>
                      <span className="text-white font-semibold">{ep.path}</span>
                    </div>
                    <span className="text-neutral-400 font-light text-[11px]">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API KEYS */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            
            {/* Create Key Form */}
            <form onSubmit={handleCreateKey} className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-4 font-mono">
              <h3 className="text-sm font-semibold text-white">Generate Scoped API Key</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Key name (e.g. Production Backend Service)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 bg-[#17171B] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00BFA6]"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#00BFA6] text-black font-semibold text-xs cursor-pointer">
                  Generate Key
                </button>
              </div>

              {createdSecret && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-1">
                  <div>Secret Key Generated (Copy now, will not be displayed again):</div>
                  <div className="font-mono select-all text-white font-bold">{createdSecret}</div>
                </div>
              )}
            </form>

            {/* Keys Table */}
            <div className="rounded-2xl bg-[#0D0D11] border border-white/[0.06] overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-neutral-400 border-b border-white/[0.06]">
                  <tr>
                    <th className="p-4">Key Name</th>
                    <th className="p-4">Prefix</th>
                    <th className="p-4">Scopes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-white/[0.01]">
                      <td className="p-4 text-white font-semibold">{k.keyName}</td>
                      <td className="p-4 text-neutral-300">{k.keyPrefix}...</td>
                      <td className="p-4">
                        {k.scopes.map((s, idx) => (
                          <span key={idx} className="mr-1 px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-neutral-400">{s}</span>
                        ))}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteKey(k.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* WEBHOOKS */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateWebhook} className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.08] space-y-4 font-mono">
              <h3 className="text-sm font-semibold text-white">Register Webhook Endpoint</h3>
              <div className="flex gap-3">
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks/contril"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="flex-1 bg-[#17171B] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00BFA6]"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#00BFA6] text-black font-semibold text-xs cursor-pointer">
                  Add Webhook
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-5 rounded-2xl bg-[#0D0D11] border border-white/[0.06] flex items-center justify-between font-mono text-xs">
                  <div className="space-y-1">
                    <div className="text-white font-semibold">{wh.targetUrl}</div>
                    <div className="text-[10px] text-neutral-400">HMAC Secret: {wh.secretKey}</div>
                  </div>
                  <button onClick={() => handleTestWebhook(wh.id)} className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] text-white border border-white/[0.08] text-xs cursor-pointer">
                    Test Dispatch
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SDKS & CLI */}
        {activeTab === 'sdks' && (
          <div className="p-6 rounded-2xl bg-[#0D0D11] border border-white/[0.06] space-y-4 font-mono text-xs">
            <h3 className="text-sm font-semibold text-white">Official Contril SDKs & CLI</h3>
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] space-y-2">
              <div className="text-[#00BFA6]">npm install @contril/sdk</div>
              <div className="text-neutral-400">import &#123; ContrilConnector &#125; from '@contril/sdk';</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
