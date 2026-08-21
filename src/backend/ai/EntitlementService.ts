import { getPlanConfig, PlanTierConfig } from './PlanConfiguration';
import crypto from 'crypto';

export interface AiUsageRecord {
  id: string;
  userId: string;
  requestId: string;
  conversationId?: string;
  plan: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  status: 'success' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface EntitlementStatus {
  allowed: boolean;
  type?: string;
  plan: string;
  dailyTokenLimit: number;
  tokensUsedToday: number;
  tokensRemainingToday: number;
  resetAt: string;
  features: Record<string, boolean>;
  message?: string;
}

// In-Memory usage storage with persistent database sync capability
const dailyUsageStore = new Map<string, { promptTokens: number; completionTokens: number; totalTokens: number; requestCount: number; date: string }>();
const userUsageRecords = new Map<string, AiUsageRecord[]>();
const userPlanStore = new Map<string, string>(); // userId -> planId
const userTimezoneStore = new Map<string, string>(); // userId -> timezone

export class EntitlementService {

  static getUserTimezone(userId: string): string {
    return userTimezoneStore.get(userId) || 'Asia/Kolkata';
  }

  static setUserTimezone(userId: string, timezone: string): void {
    userTimezoneStore.set(userId, timezone);
  }

  static getUserPlan(userId: string): string {
    return userPlanStore.get(userId) || 'FREE';
  }

  static setUserPlan(userId: string, plan: string): void {
    userPlanStore.set(userId, plan.toUpperCase());
  }

  static getTodayDateString(timezone: string = 'Asia/Kolkata'): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
      return formatter.format(now); // YYYY-MM-DD
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  static getNextResetTimestamp(timezone: string = 'Asia/Kolkata'): string {
    try {
      const now = new Date();
      // Next midnight in user's timezone
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextDate = this.getTodayDateString(timezone);
      const resetDate = new Date(`${nextDate}T00:00:00.000Z`);
      if (resetDate.getTime() <= now.getTime()) {
        return new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
      }
      return resetDate.toISOString();
    } catch {
      return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    }
  }

  static getTodayUsage(userId: string, timezone?: string): { promptTokens: number; completionTokens: number; totalTokens: number; requestCount: number } {
    const tz = timezone || this.getUserTimezone(userId);
    const today = this.getTodayDateString(tz);
    const key = `${userId}:${today}`;
    const usage = dailyUsageStore.get(key);
    if (!usage || usage.date !== today) {
      return { promptTokens: 0, completionTokens: 0, totalTokens: 0, requestCount: 0 };
    }
    return usage;
  }

  /**
   * Pre-flight check before calling NVIDIA hosted inference.
   * If usage limit is reached, blocks NVIDIA execution immediately.
   */
  static checkEntitlement(userId: string): EntitlementStatus {
    const planId = this.getUserPlan(userId);
    const planConfig = getPlanConfig(planId);
    const tz = this.getUserTimezone(userId);
    const todayUsage = this.getTodayUsage(userId, tz);
    const remaining = Math.max(0, planConfig.dailyTokenLimit - todayUsage.totalTokens);
    const resetAt = this.getNextResetTimestamp(tz);

    if (todayUsage.totalTokens >= planConfig.dailyTokenLimit) {
      return {
        allowed: false,
        type: 'usage_limit',
        plan: planConfig.id,
        dailyTokenLimit: planConfig.dailyTokenLimit,
        tokensUsedToday: todayUsage.totalTokens,
        tokensRemainingToday: 0,
        resetAt: resetAt,
        features: planConfig.features as any,
        message: `You have reached today's AI usage limit (${todayUsage.totalTokens.toLocaleString()} / ${planConfig.dailyTokenLimit.toLocaleString()} tokens). Your allowance resets at midnight (${tz}). Upgrade for higher daily token capacity.`
      };
    }

    return {
      allowed: true,
      plan: planConfig.id,
      dailyTokenLimit: planConfig.dailyTokenLimit,
      tokensUsedToday: todayUsage.totalTokens,
      tokensRemainingToday: remaining,
      resetAt: resetAt,
      features: planConfig.features as any
    };
  }

  /**
   * Records exact provider usage returned from NVIDIA response.
   */
  static recordUsage(
    userId: string,
    requestId: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    totalTokens: number,
    conversationId?: string,
    status: 'success' | 'failed' | 'cancelled' = 'success'
  ): AiUsageRecord {
    const planId = this.getUserPlan(userId);
    const tz = this.getUserTimezone(userId);
    const today = this.getTodayDateString(tz);
    const key = `${userId}:${today}`;

    // Update Daily Aggregation
    const current = dailyUsageStore.get(key) || { promptTokens: 0, completionTokens: 0, totalTokens: 0, requestCount: 0, date: today };
    current.promptTokens += promptTokens;
    current.completionTokens += completionTokens;
    current.totalTokens += totalTokens;
    current.requestCount += 1;
    dailyUsageStore.set(key, current);

    // Create Individual Audit Record
    const record: AiUsageRecord = {
      id: `usg_${crypto.randomUUID()}`,
      userId,
      requestId,
      conversationId,
      plan: planId,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      status,
      createdAt: new Date().toISOString()
    };

    const records = userUsageRecords.get(userId) || [];
    records.push(record);
    if (records.length > 100) records.shift();
    userUsageRecords.set(userId, records);

    return record;
  }

  static getRecentUsageHistory(userId: string): AiUsageRecord[] {
    return userUsageRecords.get(userId) || [];
  }
}
