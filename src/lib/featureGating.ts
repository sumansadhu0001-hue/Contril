import { PLAN_CONFIG, PlanTier } from '../components/OnboardingScreen';

export interface UserSubscription {
  plan: PlanTier;
  aiCommandsUsedThisMonth: number;
  storageUsedGB: number;
}

const STORAGE_KEY_SUB = 'contril_user_subscription_v1';

export function getUserSubscription(): UserSubscription {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUB);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse subscription', err);
  }
  // Default to PRO or FREE plan if not explicitly saved
  return {
    plan: 'PRO',
    aiCommandsUsedThisMonth: 124,
    storageUsedGB: 1.2
  };
}

export function saveUserSubscription(sub: Partial<UserSubscription>) {
  try {
    const current = getUserSubscription();
    const updated = { ...current, ...sub };
    localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save subscription', err);
  }
}

export function canConnectIntegration(connectedCount: number, plan: PlanTier = getUserSubscription().plan): { allowed: boolean; maxAllowed: number; reason?: string } {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;
  const maxAllowed = config.limits.apps;

  if (connectedCount >= maxAllowed) {
    return {
      allowed: false,
      maxAllowed,
      reason: `Your ${plan} plan allows up to ${maxAllowed} connected integrations. Upgrade to Pro or Business for more connections.`
    };
  }

  return { allowed: true, maxAllowed };
}

export function canExecuteAiCommand(plan: PlanTier = getUserSubscription().plan): { allowed: boolean; used: number; maxAllowed: number; reason?: string } {
  const sub = getUserSubscription();
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;
  const maxAllowed = config.limits.aiCredits;

  if (sub.aiCommandsUsedThisMonth >= maxAllowed) {
    return {
      allowed: false,
      used: sub.aiCommandsUsedThisMonth,
      maxAllowed,
      reason: `You have reached your monthly limit of ${maxAllowed} AI commands on the ${plan} plan. Upgrade to Pro for unlimited AI executions.`
    };
  }

  return {
    allowed: true,
    used: sub.aiCommandsUsedThisMonth,
    maxAllowed
  };
}

export function incrementAiCommandUsage(): number {
  const sub = getUserSubscription();
  const newCount = sub.aiCommandsUsedThisMonth + 1;
  saveUserSubscription({ aiCommandsUsedThisMonth: newCount });
  return newCount;
}
