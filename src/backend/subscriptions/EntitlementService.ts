import { supabase } from '../../lib/auth';

export interface PlanFeature {
  planId: string;
  featureKey: string;
  limitValue: number; // -1 for unlimited, or specific numerical cap
  isEnabled: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: 'free' | 'pro' | 'business' | 'enterprise';
  planName: string;
  status: 'active' | 'trialing' | 'paused' | 'canceled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  customAiLimitOverride?: number;
  customStorageOverrideBytes?: number;
}

export interface UsageTrackingRecord {
  userId: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  aiMessagesCount: number;
  storageUsedBytes: number;
  connectedAppsCount: number;
  workspacesCount: number;
  voiceRequestsCount: number;
  connectorRequestsCount: number;
  shoppingSearchesCount: number;
  foodSearchesCount: number;
  travelSearchesCount: number;
}

export interface EntitlementCheckResult {
  allowed: boolean;
  featureKey: string;
  currentUsage: number;
  limitValue: number;
  requiredPlan?: 'pro' | 'business' | 'enterprise';
  reason?: 'limit_exceeded' | 'feature_locked' | 'subscription_expired' | 'ok';
}

class EntitlementEngine {
  private subscriptionCache: Map<string, { data: UserSubscription; timestamp: number }> = new Map();
  private CACHE_TTL_MS = 60 * 1000; // 1 minute memory cache

  /**
   * Resolves active user subscription from PostgreSQL DB. Default to 'free' if no record.
   */
  public async getUserSubscription(userId: string): Promise<UserSubscription> {
    const cached = this.subscriptionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        const sub: UserSubscription = {
          id: data.id,
          userId: data.user_id,
          planId: (data.plan_id || 'free') as any,
          planName: this.capitalizePlan(data.plan_id || 'free'),
          status: data.status || 'active',
          currentPeriodStart: data.current_period_start || new Date().toISOString(),
          currentPeriodEnd: data.current_period_end || new Date(Date.now() + 30 * 86400000).toISOString(),
          customAiLimitOverride: data.custom_ai_limit_override,
          customStorageOverrideBytes: data.custom_storage_override_bytes
        };
        this.subscriptionCache.set(userId, { data: sub, timestamp: Date.now() });
        return sub;
      }
    } catch {
      // Fallback
    }

    // Default Free Subscription if DB lookup is empty
    const defaultSub: UserSubscription = {
      id: `sub-default-${userId}`,
      userId,
      planId: 'free',
      planName: 'Free',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    this.subscriptionCache.set(userId, { data: defaultSub, timestamp: Date.now() });
    return defaultSub;
  }

  /**
   * Fetches monthly usage meter values for a given user.
   */
  public async getUsageTracking(userId: string): Promise<UsageTrackingRecord> {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('billing_period_start', periodStart)
        .single();

      if (data && !error) {
        return {
          userId: data.user_id,
          billingPeriodStart: data.billing_period_start,
          billingPeriodEnd: data.billing_period_end,
          aiMessagesCount: data.ai_messages_count || 0,
          storageUsedBytes: Number(data.storage_used_bytes || 0),
          connectedAppsCount: data.connected_apps_count || 0,
          workspacesCount: data.workspaces_count || 1,
          voiceRequestsCount: data.voice_requests_count || 0,
          connectorRequestsCount: data.connector_requests_count || 0,
          shoppingSearchesCount: data.shopping_searches_count || 0,
          foodSearchesCount: data.food_searches_count || 0,
          travelSearchesCount: data.travel_searches_count || 0
        };
      }
    } catch {
      // Fallback
    }

    return {
      userId,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      aiMessagesCount: 0,
      storageUsedBytes: 0,
      connectedAppsCount: 0,
      workspacesCount: 1,
      voiceRequestsCount: 0,
      connectorRequestsCount: 0,
      shoppingSearchesCount: 0,
      foodSearchesCount: 0,
      travelSearchesCount: 0
    };
  }

  /**
   * Checks if user has permission and remaining limits for a specific feature.
   */
  public async checkEntitlement(
    userId: string,
    featureKey: string,
    requestedUnits: number = 1
  ): Promise<EntitlementCheckResult> {
    const subscription = await this.getUserSubscription(userId);
    const usage = await this.getUsageTracking(userId);

    // Feature requirement map
    const requiredPlanMap: Record<string, 'pro' | 'business' | 'enterprise'> = {
      gmail: 'pro',
      gcal: 'pro',
      gdrive: 'pro',
      gdocs: 'pro',
      ai_memory: 'pro',
      voice_brief: 'pro',
      shopping_assistant: 'pro',
      food_assistant: 'pro',
      travel_assistant: 'pro',
      slack: 'business',
      github: 'business',
      shared_memory: 'business',
      ai_agents: 'business',
      sso: 'enterprise',
      rbac: 'enterprise'
    };

    // Check if feature is locked for current plan tier
    const reqPlan = requiredPlanMap[featureKey];
    if (reqPlan) {
      const planHierarchy: Record<string, number> = { free: 1, pro: 2, business: 3, enterprise: 4 };
      if (planHierarchy[subscription.planId] < planHierarchy[reqPlan]) {
        return {
          allowed: false,
          featureKey,
          currentUsage: 0,
          limitValue: 0,
          requiredPlan: reqPlan,
          reason: 'feature_locked'
        };
      }
    }

    // Check numerical usage limits
    if (featureKey === 'ai_messages' || featureKey === 'ai_messages_monthly') {
      const limit = subscription.customAiLimitOverride ?? this.getPlanAiLimit(subscription.planId);
      if (limit !== -1 && usage.aiMessagesCount + requestedUnits > limit) {
        return {
          allowed: false,
          featureKey,
          currentUsage: usage.aiMessagesCount,
          limitValue: limit,
          requiredPlan: subscription.planId === 'free' ? 'pro' : 'business',
          reason: 'limit_exceeded'
        };
      }
      return { allowed: true, featureKey, currentUsage: usage.aiMessagesCount, limitValue: limit, reason: 'ok' };
    }

    if (featureKey === 'max_storage_bytes') {
      const limit = subscription.customStorageOverrideBytes ?? this.getPlanStorageLimit(subscription.planId);
      if (limit !== -1 && usage.storageUsedBytes + requestedUnits > limit) {
        return {
          allowed: false,
          featureKey,
          currentUsage: usage.storageUsedBytes,
          limitValue: limit,
          requiredPlan: subscription.planId === 'free' ? 'pro' : 'business',
          reason: 'limit_exceeded'
        };
      }
      return { allowed: true, featureKey, currentUsage: usage.storageUsedBytes, limitValue: limit, reason: 'ok' };
    }

    if (featureKey === 'max_connected_apps') {
      const limit = this.getPlanAppsLimit(subscription.planId);
      if (limit !== -1 && usage.connectedAppsCount >= limit) {
        return {
          allowed: false,
          featureKey,
          currentUsage: usage.connectedAppsCount,
          limitValue: limit,
          requiredPlan: subscription.planId === 'free' ? 'pro' : 'business',
          reason: 'limit_exceeded'
        };
      }
      return { allowed: true, featureKey, currentUsage: usage.connectedAppsCount, limitValue: limit, reason: 'ok' };
    }

    return { allowed: true, featureKey, currentUsage: 0, limitValue: -1, reason: 'ok' };
  }

  /**
   * Records unit consumption into usage meters and audit logs.
   */
  public async recordUsage(userId: string, featureKey: string, units: number = 1): Promise<void> {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    try {
      // 1. Audit log
      await supabase.from('feature_usage_logs').insert([{
        user_id: userId,
        feature_key: featureKey,
        units_consumed: units,
        created_at: new Date().toISOString()
      }]);

      // 2. Increment usage meter
      const updateFieldMap: Record<string, string> = {
        ai_messages: 'ai_messages_count',
        ai_messages_monthly: 'ai_messages_count',
        voice_request: 'voice_requests_count',
        connector_request: 'connector_requests_count',
        shopping_search: 'shopping_searches_count',
        food_search: 'food_searches_count',
        travel_search: 'travel_searches_count'
      };

      const dbField = updateFieldMap[featureKey];
      if (dbField) {
        const currentUsage = await this.getUsageTracking(userId);
        const nextVal = (currentUsage as any)[this.camelize(dbField)] + units;

        await supabase.from('usage_tracking').upsert([{
          user_id: userId,
          billing_period_start: periodStart,
          billing_period_end: periodEnd,
          [dbField]: nextVal,
          updated_at: new Date().toISOString()
        }], { onConflict: 'user_id,billing_period_start' });
      }
    } catch (err) {
      console.error('[EntitlementEngine] Record usage error:', err);
    }
  }

  /**
   * Admin action: Resets cached and database subscription state for user.
   */
  public clearUserCache(userId: string): void {
    this.subscriptionCache.delete(userId);
  }

  private getPlanAiLimit(planId: string): number {
    switch (planId) {
      case 'free': return 100;
      case 'pro': return 2000;
      case 'business': return 10000;
      case 'enterprise': return -1;
      default: return 100;
    }
  }

  private getPlanStorageLimit(planId: string): number {
    switch (planId) {
      case 'free': return 5368709120; // 5GB
      case 'pro': return 21474836480; // 20GB
      case 'business': return 214748364800; // 200GB
      case 'enterprise': return -1; // unlimited
      default: return 5368709120;
    }
  }

  private getPlanAppsLimit(planId: string): number {
    switch (planId) {
      case 'free': return 2;
      case 'pro': return 10;
      case 'business': return -1;
      case 'enterprise': return -1;
      default: return 2;
    }
  }

  private capitalizePlan(str: string): string {
    if (!str) return 'Free';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private camelize(str: string): string {
    return str.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
  }
}

export const entitlementService = new EntitlementEngine();
