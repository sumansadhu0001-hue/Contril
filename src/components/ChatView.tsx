import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  Paperclip, 
  Mic, 
  Bot, 
  User, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  Search, 
  Plus, 
  Trash2, 
  Volume2, 
  Brain, 
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Pin,
  PinOff
} from 'lucide-react';
import { ChatMessage, streamChatResponse } from '../lib/chatPipeline';
import { Conversation, getStoredConversations, saveConversations, saveConversationsDebounced, createNewConversation, updateConversation, deleteConversation } from '../lib/chatStore';
import { getConnectedAccounts } from '../lib/integrationsStore';
import { getStoredGoogleTokens } from '../lib/googleApi';
import { UserProfile } from '../types';
import { AgentSystem } from '../backend/agents/AgentSystem';

// ---------------------------------------------------------------------------
// Custom Markdown & Visual Diagrams Renderer Component
// ---------------------------------------------------------------------------
interface MarkdownRendererProps {
  text: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  if (!text) return null;

  const blocks: Array<{ type: 'code' | 'table' | 'mermaid' | 'text'; content: string; language?: string }> = [];
  let currentPos = 0;
  const len = text.length;

  while (currentPos < len) {
    const nextCodeBlock = text.indexOf('```', currentPos);
    if (nextCodeBlock !== -1) {
      if (nextCodeBlock > currentPos) {
        blocks.push({
          type: 'text',
          content: text.substring(currentPos, nextCodeBlock)
        });
      }
      
      const closingCodeBlock = text.indexOf('```', nextCodeBlock + 3);
      if (closingCodeBlock !== -1) {
        const fullBlock = text.substring(nextCodeBlock + 3, closingCodeBlock);
        const firstNewLine = fullBlock.indexOf('\n');
        let lang = 'text';
        let code = fullBlock;
        if (firstNewLine !== -1) {
          lang = fullBlock.substring(0, firstNewLine).trim();
          code = fullBlock.substring(firstNewLine + 1);
        }

        if (lang === 'mermaid') {
          blocks.push({ type: 'mermaid', content: code });
        } else {
          blocks.push({ type: 'code', content: code, language: lang });
        }
        currentPos = closingCodeBlock + 3;
      } else {
        blocks.push({ type: 'code', content: text.substring(nextCodeBlock + 3) });
        break;
      }
    } else {
      blocks.push({
        type: 'text',
        content: text.substring(currentPos)
      });
      break;
    }
  }

  return (
    <div className="space-y-3 font-sans text-xs sm:text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed select-text">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <div key={idx} className="my-2 rounded-2xl bg-[#F0F6FF] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-white/[0.06] overflow-hidden text-left">
              {block.language && (
                <div className="px-4 py-1.5 bg-[#E0EDFF] dark:bg-[#111827] text-[10px] font-mono text-[#2563EB] dark:text-[#3B82F6] font-semibold border-b border-[#E2E8F0] dark:border-white/[0.04] flex items-center justify-between">
                  <span>{block.language}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(block.content)}
                    className="hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              )}
              <pre className="p-4 font-mono text-xs overflow-x-auto text-[#0F172A] dark:text-white">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        if (block.type === 'mermaid') {
          return (
            <div key={idx} className="my-2 p-4 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/30 border border-[#BFDBFE] dark:border-blue-900/40 text-xs font-mono text-[#1E293B] dark:text-blue-200 text-left">
              <div className="text-[10px] font-bold uppercase text-[#2563EB] dark:text-blue-400 mb-2">Workflow Diagram</div>
              <pre className="overflow-x-auto">{block.content}</pre>
            </div>
          );
        }

        return (
          <div key={idx} className="whitespace-pre-wrap leading-relaxed text-left text-[#0F172A] dark:text-white">
            {block.content}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main ChatView Component
// ---------------------------------------------------------------------------
interface ChatViewProps {
  initialPrompt?: string;
  conversationId?: string | null;
  onBack?: () => void;
  userProfile?: UserProfile;
  onSelectConversation?: (id: string) => void;
  onOpenSpotlight?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialPrompt,
  conversationId,
  onBack,
  userProfile,
  onSelectConversation,
  onOpenSpotlight
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => getStoredConversations());
  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId || (conversations[0]?.id || null));
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
  const [slashMenuFilter, setSlashMenuFilter] = useState<string>('');
  const [isOpeningConv, setIsOpeningConv] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userName = userProfile?.name || 'Suman';
  const currentConv = conversations.find(c => c.id === activeConvId);

  // Sync active conversation
  useEffect(() => {
    if (conversationId && conversationId !== activeConvId) {
      setActiveConvId(conversationId);
    }
  }, [conversationId]);

  // Initial prompt trigger
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendNewMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages, isGenerating]);

  const runStreamingResponse = async (convId: string, userText: string, messageHistory: ChatMessage[]) => {
    setIsGenerating(true);

    const assistantMsgId = `asst-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      rawPrompt: userText
    };

    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, assistantPlaceholder]
          };
        }
        return c;
      });
      saveConversations(updated);
      return updated;
    });

    let fullAccumulated = '';

    await streamChatResponse({
      prompt: userText,
      history: messageHistory,
      onChunk: (chunkText) => {
        fullAccumulated += chunkText;
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === convId) {
              const newMsgs = c.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return { ...m, content: fullAccumulated };
                }
                return m;
              });
              return { ...c, messages: newMsgs };
            }
            return c;
          });
          saveConversationsDebounced(updated);
          return updated;
        });
      },
      onComplete: (fullText) => {
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === convId) {
              const newMsgs = c.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return { ...m, content: fullText, isStreaming: false };
                }
                return m;
              });
              return { ...c, messages: newMsgs };
            }
            return c;
          });
          saveConversations(updated);
          return updated;
        });
        setIsGenerating(false);
      },
      onError: (errorMessage) => {
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id === convId) {
              const newMsgs = c.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return { ...m, isStreaming: false, error: errorMessage };
                }
                return m;
              });
              return { ...c, messages: newMsgs };
            }
            return c;
          });
          saveConversations(updated);
          return updated;
        });
        setIsGenerating(false);
      }
    });
  };

  const handleSendNewMessage = (overrideText?: string) => {
    const textToSend = (overrideText || inputPrompt).trim();
    if (!textToSend) return;

    let convId = activeConvId;
    let targetConv = currentConv;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp
    };

    if (!convId || !targetConv) {
      const newConv = createNewConversation(textToSend);
      convId = newConv.id;
      setActiveConvId(convId);
      setConversations(getStoredConversations());
      runStreamingResponse(convId, textToSend, [userMsg]);
      setInputPrompt('');
      return;
    }

    const updatedMessages = [...targetConv.messages, userMsg];
    setConversations(prev => {
      const updated = prev.map(c => c.id === convId ? { ...c, messages: updatedMessages } : c);
      saveConversations(updated);
      return updated;
    });

    setInputPrompt('');
    runStreamingResponse(convId, textToSend, updatedMessages);
  };

  const handleCreateNewChat = () => {
    const newConv = createNewConversation();
    setActiveConvId(newConv.id);
    setConversations(getStoredConversations());
    if (onSelectConversation) {
      onSelectConversation(newConv.id);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-6rem)] max-w-6xl mx-auto flex flex-col bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] overflow-hidden select-none font-sans rounded-3xl shadow-[0_8px_32px_rgba(37,99,235,0.06)] dark:shadow-none text-left">
      
      {/* CHAT HEADER */}
      <header className="h-16 px-6 border-b border-[#E2E8F0] dark:border-white/[0.06] bg-[#F8FAFC] dark:bg-[#161F30] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-[#2563EB] dark:text-[#3B82F6] hover:underline font-semibold cursor-pointer"
            >
              ← Back to Today
            </button>
          )}

          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-white">
            {currentConv?.title || 'Contril Command Assistant'}
          </h2>
        </div>

        <button
          onClick={handleCreateNewChat}
          className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </header>

      {/* MAIN BODY: SIDEBAR & MESSAGES */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* CONVERSATION HISTORY SIDEBAR */}
        <aside className="w-60 border-r border-[#E2E8F0] dark:border-white/[0.06] bg-[#F8FAFC] dark:bg-[#111827] p-3 hidden md:flex flex-col gap-2 shrink-0 select-none">
          <div className="text-[10px] font-mono uppercase text-[#64748B] dark:text-[#94A3B8] px-2 py-1 font-bold tracking-wider">
            Conversations ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
            {conversations.map((c) => {
              const isSelected = c.id === activeConvId;
              const lastMsg = c.messages[c.messages.length - 1];
              const lastMsgText = lastMsg ? lastMsg.content : 'New conversation';
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id);
                    if (onSelectConversation) onSelectConversation(c.id);
                  }}
                  className={`p-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1D4ED8] dark:text-blue-300 font-semibold border-[#BFDBFE] dark:border-blue-800/40'
                      : 'text-[#475569] dark:text-[#94A3B8] hover:bg-white dark:hover:bg-white/[0.04] border-transparent'
                  }`}
                >
                  <span className="font-semibold truncate text-[#0F172A] dark:text-white">{c.title}</span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">{lastMsgText}</span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CHAT STREAM CONTAINER */}
        <main className="flex-1 flex flex-col bg-white dark:bg-[#0D1117] overflow-hidden">
          
          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            
            {(!currentConv || currentConv.messages.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-xl font-semibold text-[#0F172A] dark:text-white">Ask Contril anything.</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    Query connected tools, analyze threads, synthesize decisions, or find files in drive.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-lg">
                  {[
                    "Find me a Chicago-style pizza under ₹500",
                    "Summarize my unread emails needing response",
                    "List upcoming calendar briefings",
                    "Find documents related to my next meeting"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendNewMessage(sug)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F0F6FF] dark:bg-[#161F30] hover:bg-[#E0EDFF] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-white/[0.04] text-xs text-[#2563EB] dark:text-blue-300 transition-all cursor-pointer font-medium"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                {currentConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* User Message */}
                    {msg.role === 'user' && (
                      <div className="max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#161F30] border border-[#BFDBFE] dark:border-white/[0.08] text-[#0F172A] dark:text-white text-xs sm:text-sm leading-relaxed text-left">
                        <div className="text-[10px] text-[#2563EB] dark:text-blue-400 font-mono mb-1">
                          You • {msg.timestamp}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    )}

                    {/* Assistant Message */}
                    {msg.role === 'assistant' && (
                      <div className="w-full p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E2E8F0] dark:border-white/[0.06] text-xs sm:text-sm leading-relaxed space-y-3 text-left">
                        <div className="flex items-center justify-between pb-1 text-xs text-[#64748B] font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">Contril AI</span>
                            {msg.isStreaming && (
                              <span className="flex items-center gap-1.5 text-[11px] text-[#06B6D4]">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>thinking...</span>
                              </span>
                            )}
                          </div>

                          {msg.content && !msg.error && (
                            <button
                              onClick={() => handleCopyText(msg.id, msg.content)}
                              className="text-[10px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white font-mono cursor-pointer"
                            >
                              {copiedId === msg.id ? 'Copied' : 'Copy'}
                            </button>
                          )}
                        </div>

                        {msg.content ? (
                          <MarkdownRenderer text={msg.content} />
                        ) : msg.isStreaming ? (
                          <div className="text-xs text-[#64748B] font-mono">Synthesizing response...</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* COMPOSER AT BOTTOM */}
          <div className="p-4 border-t border-[#E2E8F0] dark:border-white/[0.06] bg-[#F8FAFC] dark:bg-[#161F30]">
            <div className="max-w-3xl mx-auto px-4 py-2 rounded-2xl bg-white dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-white/[0.08] focus-within:border-[#2563EB] transition-all flex items-center gap-3 shadow-2xs">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendNewMessage();
                  }
                }}
                placeholder="Ask Contril anything..."
                rows={1}
                className="flex-1 bg-transparent text-[#0F172A] dark:text-white placeholder-[#64748B] text-xs sm:text-sm focus:outline-none resize-none font-sans p-1 leading-normal border-none"
              />

              <button
                onClick={() => handleSendNewMessage()}
                disabled={!inputPrompt.trim()}
                className="p-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors cursor-pointer disabled:opacity-40 shrink-0"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

        </main>

      </div>

    </div>
  );
};
