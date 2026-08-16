import { supabase } from '../../lib/auth';

export interface TelemetryEvent {
  eventType: string;
  featureKey: string;
  metadata?: Record<string, any>;
}

export class ProductAnalyticsService {
  private static sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  public static async trackEvent(eventType: string, featureKey: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id || null;

      await supabase.from('analytics_telemetry_events').insert({
        user_id: userId,
        event_type: eventType,
        feature_key: featureKey,
        session_id: this.sessionId,
        metadata: metadata || {}
      });
    } catch (e) {
      // Telemetry failures should never crash UX
      console.warn('Analytics tracking error:', e);
    }
  }

  public static trackFeatureUse(featureKey: string, extra?: Record<string, any>): void {
    this.trackEvent('feature_use', featureKey, extra);
  }

  public static trackSearchQuery(query: string): void {
    this.trackEvent('search_query', 'global_search', { queryLength: query.length });
  }

  public static trackVoiceTrigger(): void {
    this.trackEvent('voice_command', 'voice_ambient', { timestamp: new Date().toISOString() });
  }
}
