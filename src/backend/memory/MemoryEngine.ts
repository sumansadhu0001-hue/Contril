// Contril AI OS - Memory Engine (Long-Term Context & Semantic Recall)
import { MemoryItem } from '../../types';

export interface UserPreferencesMemory {
  writingTone: 'direct' | 'formal' | 'concise' | 'persuasive';
  preferredWorkHours: string;
  deepWorkDays: string[];
  clientReplyWindow: string;
  autoApproveRiskThreshold: 'Low' | 'Medium';
}

export class MemoryEngine {
  private static memoryStore: MemoryItem[] = [];

  private static getStore(): MemoryItem[] {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('contril_user_memory_bank_v1');
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to load memory bank:', e);
      }
    }
    return this.memoryStore;
  }

  private static saveStore(items: MemoryItem[]) {
    this.memoryStore = items;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('contril_user_memory_bank_v1', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save memory bank:', e);
      }
    }
  }

  public static async searchMemory(query: string, userId?: string): Promise<{ answer: string; items: MemoryItem[]; confidence: number }> {
    const store = this.getStore();
    if (store.length === 0) {
      return {
        answer: 'No saved memory records found.',
        items: [],
        confidence: 1.0
      };
    }

    const q = query.toLowerCase();
    const matched = store.filter(
      item => item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q) || (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
    );

    return {
      answer: matched.length > 0 ? `Found ${matched.length} relevant record(s) in Contril Memory.` : 'No matching records found for your query.',
      items: matched,
      confidence: matched.length > 0 ? 0.95 : 0.5
    };
  }

  public static async saveMemoryItem(item: Omit<MemoryItem, 'id' | 'timestamp'>): Promise<MemoryItem> {
    const store = this.getStore();
    const newItem: MemoryItem = {
      ...item,
      id: `mem-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    store.unshift(newItem);
    this.saveStore(store);
    return newItem;
  }

  public static getUserPreferences(): UserPreferencesMemory {
    return {
      writingTone: 'concise',
      preferredWorkHours: '8:00 AM - 6:00 PM PST',
      deepWorkDays: ['Friday'],
      clientReplyWindow: 'After 5:00 PM',
      autoApproveRiskThreshold: 'Low'
    };
  }
}
