import { supabase } from '../../lib/auth';
import { MemoryEngine } from './MemoryEngine';

export interface MemoryCategorySettings {
  conversationEnabled: boolean;
  workspaceEnabled: boolean;
  shoppingEnabled: boolean;
  foodEnabled: boolean;
  travelEnabled: boolean;
  automationEnabled: boolean;
}

export interface AssembledAiContext {
  userId: string;
  originalPrompt: string;
  userPreferences: Record<string, any>;
  recalledMemories: Array<{ id: string; title: string; snippet: string; category: string }>;
  connectedProviders: string[];
  privacySettings: MemoryCategorySettings;
  systemContextPrompt: string;
}

export class ContextBuilder {
  /**
   * Fetches category privacy toggles for user. Default to all enabled.
   */
  public static async getMemoryPrivacySettings(userId: string = 'demo-user'): Promise<MemoryCategorySettings> {
    try {
      const { data, error } = await supabase
        .from('memory_categories_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        return {
          conversationEnabled: !!data.conversation_enabled,
          workspaceEnabled: !!data.workspace_enabled,
          shoppingEnabled: !!data.shopping_enabled,
          foodEnabled: !!data.food_enabled,
          travelEnabled: !!data.travel_enabled,
          automationEnabled: !!data.automation_enabled
        };
      }
    } catch {
      // Fallback
    }

    return {
      conversationEnabled: true,
      workspaceEnabled: true,
      shoppingEnabled: true,
      foodEnabled: true,
      travelEnabled: true,
      automationEnabled: true
    };
  }

  /**
   * Assembles optimized personal AI context prior to prompt execution.
   */
  public static async buildContextPayload(prompt: string, userId: string = 'demo-user'): Promise<AssembledAiContext> {
    const privacySettings = await this.getMemoryPrivacySettings(userId);
    const recalledMemories: Array<{ id: string; title: string; snippet: string; category: string }> = [];

    // 1. Query Memory Engine if memory recalls are allowed
    try {
      const searchRes = await MemoryEngine.searchMemory(prompt, userId);
      if (searchRes?.items) {
        searchRes.items.forEach((item: any) => {
          const cat = item.category || 'conversation';
          const isAllowed = 
            (cat === 'conversation' && privacySettings.conversationEnabled) ||
            (cat === 'workspace' && privacySettings.workspaceEnabled) ||
            (cat === 'shopping' && privacySettings.shoppingEnabled) ||
            (cat === 'food' && privacySettings.foodEnabled) ||
            (cat === 'travel' && privacySettings.travelEnabled) ||
            (cat === 'automation' && privacySettings.automationEnabled);

          if (isAllowed) {
            recalledMemories.push({
              id: item.id || `mem-${Math.random()}`,
              title: item.title,
              snippet: item.snippet,
              category: cat
            });
          }
        });
      }
    } catch {
      // Ignore
    }

    // 2. Fetch consented user preferences
    const userPreferences: Record<string, any> = {
      writingTone: 'direct',
      preferredCurrency: 'INR',
      workingHours: '9:00 AM - 6:00 PM',
      airlinePreference: 'IndiGo / Vistara',
      diningPreference: 'Executive Fine Dining & Clean Delivery'
    };

    // 3. Construct System Context Prompt String
    const memoryString = recalledMemories.length > 0
      ? recalledMemories.map(m => `[Memory - ${m.title}]: ${m.snippet}`).join('\n')
      : 'No relevant long-term memories retrieved.';

    const systemContextPrompt = `
[CONTRIL PERSONAL INTELLIGENCE LAYER CONTEXT]
User Identity: Executive (${userId})
Active Preferences: ${JSON.stringify(userPreferences)}
Recalled Long-Term Context:
${memoryString}
`.trim();

    return {
      userId,
      originalPrompt: prompt,
      userPreferences,
      recalledMemories,
      connectedProviders: ['Gmail', 'Google Calendar', 'Google Drive', 'Amazon India', 'Swiggy', 'MakeMyTrip'],
      privacySettings,
      systemContextPrompt
    };
  }
}
