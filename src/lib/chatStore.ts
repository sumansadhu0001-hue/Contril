import { ChatMessage, streamChatResponse } from './chatPipeline';

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  isGenerating?: boolean;
  isPinned?: boolean;
}

const STORAGE_KEY = 'contril_conversations';
const ACTIVE_CONV_KEY = 'contril_active_conv_id';

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load conversations', e);
  }
  return [];
}

export function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations', e);
  }
}

let saveTimeout: any = null;
export function saveConversationsDebounced(conversations: Conversation[]) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveConversations(conversations);
  }, 1000);
}

export function getActiveConversationId(): string | null {
  return localStorage.getItem(ACTIVE_CONV_KEY);
}

export function setActiveConversationId(id: string) {
  localStorage.setItem(ACTIVE_CONV_KEY, id);
}

export function createNewConversation(prompt?: string): Conversation {
  const id = Math.random().toString(36).substring(2, 10);
  const title = prompt ? (prompt.length > 36 ? prompt.substring(0, 36) + '...' : prompt) : 'New Conversation';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const userMsg: ChatMessage | null = prompt ? {
    id: `user-${Date.now()}`,
    role: 'user',
    content: prompt,
    timestamp
  } : null;

  const newConv: Conversation = {
    id,
    title,
    createdAt: timestamp,
    messages: userMsg ? [userMsg] : []
  };

  const conversations = getStoredConversations();
  conversations.unshift(newConv);
  saveConversations(conversations);
  setActiveConversationId(id);
  return newConv;
}

export function updateConversation(id: string, updater: (conv: Conversation) => Conversation) {
  const conversations = getStoredConversations();
  const index = conversations.findIndex(c => c.id === id);
  if (index !== -1) {
    conversations[index] = updater(conversations[index]);
    saveConversations(conversations);
  }
}

export function deleteConversation(id: string) {
  const conversations = getStoredConversations().filter(c => c.id !== id);
  saveConversations(conversations);
}
