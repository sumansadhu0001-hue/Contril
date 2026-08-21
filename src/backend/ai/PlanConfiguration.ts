// Contril Server-Authoritative Plan Configuration
export interface PlanTierConfig {
  id: string;
  name: string;
  priceInr: number | null; // null for custom/enterprise
  billingPeriod: 'daily' | 'monthly' | 'yearly';
  dailyTokenLimit: number;
  maxRequestTokenBudget: number;
  features: {
    aiChat: boolean;
    gmailIntegration: boolean;
    calendarIntegration: boolean;
    taskAutomation: boolean;
    priorityInference: boolean;
    overnightAutonomousEngine: boolean;
    extendedContextWindow: boolean;
  };
}

export const PLAN_CONFIGURATIONS: Record<string, PlanTierConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Free Starter',
    priceInr: 0,
    billingPeriod: 'monthly',
    dailyTokenLimit: 25000,
    maxRequestTokenBudget: 4096,
    features: {
      aiChat: true,
      gmailIntegration: true,
      calendarIntegration: true,
      taskAutomation: true,
      priorityInference: false,
      overnightAutonomousEngine: false,
      extendedContextWindow: false,
    }
  },
  PRO: {
    id: 'PRO',
    name: 'Contril Pro',
    priceInr: 899,
    billingPeriod: 'monthly',
    dailyTokenLimit: 75000,
    maxRequestTokenBudget: 8192,
    features: {
      aiChat: true,
      gmailIntegration: true,
      calendarIntegration: true,
      taskAutomation: true,
      priorityInference: true,
      overnightAutonomousEngine: false,
      extendedContextWindow: true,
    }
  },
  ELITE: {
    id: 'ELITE',
    name: 'Autonomous Elite',
    priceInr: 3999, // Server configured
    billingPeriod: 'monthly',
    dailyTokenLimit: 500000,
    maxRequestTokenBudget: 16384,
    features: {
      aiChat: true,
      gmailIntegration: true,
      calendarIntegration: true,
      taskAutomation: true,
      priorityInference: true,
      overnightAutonomousEngine: true,
      extendedContextWindow: true,
    }
  }
};

export function getPlanConfig(planId: string = 'FREE'): PlanTierConfig {
  const normalized = planId.toUpperCase().trim();
  if (normalized.includes('ELITE')) return PLAN_CONFIGURATIONS.ELITE;
  if (normalized.includes('PRO')) return PLAN_CONFIGURATIONS.PRO;
  return PLAN_CONFIGURATIONS.FREE;
}
