export interface RecommendationPreferences {
  priceWeight?: number;
  ratingWeight?: number;
  availabilityWeight?: number;
  deliveryWeight?: number;
  distanceWeight?: number;
  popularityWeight?: number;
  confidenceWeight?: number;
}

export class RecommendationEngine {
  public static rank<T extends Record<string, unknown>>(results: T[], preferences: RecommendationPreferences = {}): T[] {
    const weights = {
      priceWeight: 1,
      ratingWeight: 1,
      availabilityWeight: 1,
      deliveryWeight: 1,
      distanceWeight: 1,
      popularityWeight: 1,
      confidenceWeight: 1,
      ...preferences
    };
    return [...results].sort((a, b) => this.score(b, weights) - this.score(a, weights));
  }

  private static score(item: Record<string, unknown>, weights: Required<RecommendationPreferences>): number {
    let score = 0;
    if (typeof item.price === 'number') score -= item.price * weights.priceWeight;
    if (typeof item.rating === 'number') score += item.rating * weights.ratingWeight;
    if (item.available === true) score += weights.availabilityWeight;
    if (item.deliveryAvailable === true) score += weights.deliveryWeight;
    if (typeof item.distanceKm === 'number') score -= item.distanceKm * weights.distanceWeight;
    if (typeof item.popularity === 'number') score += item.popularity * weights.popularityWeight;
    if (typeof item.confidence === 'number') score += item.confidence * weights.confidenceWeight;
    return score;
  }
}
