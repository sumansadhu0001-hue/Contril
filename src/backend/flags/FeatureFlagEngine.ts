export class FeatureFlagEngine {
  
  /**
   * Evaluates if a feature is enabled for a given user ID or org ID based on rollout percentage
   */
  public static isFeatureEnabled(featureKey: string, userId?: string, rolloutPercentage: number = 100): boolean {
    if (rolloutPercentage >= 100) return true;
    if (rolloutPercentage <= 0) return false;
    if (!userId) return true;

    // Hash user ID to deterministic 0-99 bucket
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % 100;
    return bucket < rolloutPercentage;
  }
}
