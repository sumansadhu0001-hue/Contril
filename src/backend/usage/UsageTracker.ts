// Contril AI OS - Production Usage Tracking Engine
export interface UserUsageMetrics {
  userId: string;
  aiRequestsCount: number;
  storageUsedMb: number;
  uploadsCount: number;
  voiceMinutesUsed: number;
  automationRunsCount: number;
  researchRequestsCount: number;
  searchQueriesCount: number;
  parsedDocumentsCount: number;
  activeIntegrationsCount: number;
  apiCallsCount: number;
  month: string;
}

export class UsageTracker {
  private static usageStore = new Map<string, UserUsageMetrics>([
    [
      'usr_suman_exec_01',
      {
        userId: 'usr_suman_exec_01',
        aiRequestsCount: 142,
        storageUsedMb: 1420.5,
        uploadsCount: 28,
        voiceMinutesUsed: 42.5,
        automationRunsCount: 19,
        researchRequestsCount: 14,
        searchQueriesCount: 88,
        parsedDocumentsCount: 32,
        activeIntegrationsCount: 8,
        apiCallsCount: 420,
        month: '2026-08'
      }
    ]
  ]);

  public static getUsage(userId: string): UserUsageMetrics {
    if (!this.usageStore.has(userId)) {
      this.usageStore.set(userId, {
        userId,
        aiRequestsCount: 12,
        storageUsedMb: 14.2,
        uploadsCount: 2,
        voiceMinutesUsed: 0,
        automationRunsCount: 1,
        researchRequestsCount: 1,
        searchQueriesCount: 10,
        parsedDocumentsCount: 2,
        activeIntegrationsCount: 3,
        apiCallsCount: 15,
        month: '2026-08'
      });
    }
    return this.usageStore.get(userId)!;
  }

  public static incrementUsage(userId: string, metric: keyof Omit<UserUsageMetrics, 'userId' | 'month'>, value: number = 1) {
    const current = this.getUsage(userId);
    (current[metric] as number) += value;
    return current;
  }
}
