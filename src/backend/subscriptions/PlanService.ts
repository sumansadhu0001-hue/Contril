// Contril AI OS — Production Plan Definitions, Entitlement Engine & Feature Gating
export type PlanTier = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled';
export type UpgradeRequest = 'none' | 'pro' | 'business' | 'enterprise';

// ---------------------------------------------------------------------------
// Feature Entitlement Map — Single source of truth
// ---------------------------------------------------------------------------
export type FeatureKey =
  | 'ai_chat' | 'gmail' | 'calendar' | 'community_templates' | 'email_support'
  | 'meeting_notes' | 'calendar_ai' | 'smart_tasks' | 'ai_search'
  | 'custom_branding' | 'priority_support' | 'unlimited_integrations'
  | 'team_permissions' | 'shared_ai_memory' | 'knowledge_base'
  | 'automation_builder' | 'analytics' | 'api_access' | 'audit_logs'
  | 'priority_ai_queue' | 'sso'
  | 'custom_ai_models' | 'private_deployment' | 'dedicated_support'
  | 'vpc' | 'on_premise' | 'enterprise_security' | 'sla';

export interface FeatureEntitlement {
  key: FeatureKey;
  label: string;
  description: string;
  minimumPlan: PlanTier;
  upgradeDescription: string;
}

export const ENTITLEMENT_MAP: Record<FeatureKey, FeatureEntitlement> = {
  // FREE tier features
  ai_chat:              { key: 'ai_chat',              label: 'AI Chat',                description: 'Basic AI conversational assistant',                            minimumPlan: 'FREE',       upgradeDescription: '' },
  gmail:                { key: 'gmail',                label: 'Gmail Integration',       description: 'Connect your Gmail inbox',                                      minimumPlan: 'FREE',       upgradeDescription: '' },
  calendar:             { key: 'calendar',             label: 'Calendar',                description: 'Google Calendar integration',                                   minimumPlan: 'FREE',       upgradeDescription: '' },
  community_templates:  { key: 'community_templates',  label: 'Community Templates',     description: 'Access shared workspace templates',                             minimumPlan: 'FREE',       upgradeDescription: '' },
  email_support:        { key: 'email_support',        label: 'Email Support',           description: 'Standard email support',                                        minimumPlan: 'FREE',       upgradeDescription: '' },

  // PRO tier features
  meeting_notes:        { key: 'meeting_notes',        label: 'Meeting Notes',           description: 'AI-powered meeting transcription and summaries',                minimumPlan: 'PRO',        upgradeDescription: 'Meeting Notes uses AI to transcribe, summarize, and extract action items from your meetings automatically.' },
  calendar_ai:          { key: 'calendar_ai',          label: 'Calendar AI',             description: 'AI-powered calendar management and scheduling',                 minimumPlan: 'PRO',        upgradeDescription: 'Calendar AI intelligently manages your schedule, suggests optimal meeting times, and handles conflicts automatically.' },
  smart_tasks:          { key: 'smart_tasks',          label: 'Smart Tasks',             description: 'AI-generated task management and tracking',                     minimumPlan: 'PRO',        upgradeDescription: 'Smart Tasks automatically creates, prioritizes, and tracks tasks extracted from your emails, meetings, and conversations.' },
  ai_search:            { key: 'ai_search',            label: 'AI Search',               description: 'Semantic search across your workspace',                         minimumPlan: 'PRO',        upgradeDescription: 'AI Search lets you find anything across emails, documents, meetings, and conversations using natural language.' },
  custom_branding:      { key: 'custom_branding',      label: 'Custom Branding',         description: 'Customize workspace branding and appearance',                   minimumPlan: 'PRO',        upgradeDescription: 'Custom Branding lets you personalize your workspace with your company logo, colors, and domain.' },
  priority_support:     { key: 'priority_support',     label: 'Priority Support',        description: 'Priority email and chat support',                               minimumPlan: 'PRO',        upgradeDescription: 'Get faster response times and dedicated support channels.' },
  unlimited_integrations: { key: 'unlimited_integrations', label: 'Unlimited Integrations', description: 'Connect unlimited third-party apps',                       minimumPlan: 'PRO',        upgradeDescription: 'Remove the 2-app limit and connect all your business tools.' },

  // BUSINESS tier features
  team_permissions:     { key: 'team_permissions',     label: 'Team Permissions',        description: 'Role-based access control for teams',                           minimumPlan: 'BUSINESS',   upgradeDescription: 'Team Permissions lets you assign roles, control access levels, and manage team member permissions across your workspace.' },
  shared_ai_memory:     { key: 'shared_ai_memory',     label: 'Shared AI Memory',        description: 'Team-wide AI knowledge sharing',                                minimumPlan: 'BUSINESS',   upgradeDescription: 'Shared AI Memory lets your entire team benefit from a collective AI knowledge base that learns from everyone.' },
  knowledge_base:       { key: 'knowledge_base',       label: 'Knowledge Base',          description: 'AI-powered organizational knowledge base',                      minimumPlan: 'BUSINESS',   upgradeDescription: 'Knowledge Base creates an AI-powered repository of your organization\'s documents, policies, and institutional knowledge.' },
  automation_builder:   { key: 'automation_builder',   label: 'Automation Builder',      description: 'Build automated workflows between apps',                        minimumPlan: 'BUSINESS',   upgradeDescription: 'Automation Builder lets you create workflows between Gmail, Calendar, Drive, Slack, and AI Agents — no code required.' },
  analytics:            { key: 'analytics',            label: 'Analytics Dashboard',     description: 'Workspace analytics and insights',                              minimumPlan: 'BUSINESS',   upgradeDescription: 'Analytics Dashboard provides deep insights into team productivity, AI usage, and workspace activity.' },
  api_access:           { key: 'api_access',           label: 'API Access',              description: 'REST API for programmatic access',                              minimumPlan: 'BUSINESS',   upgradeDescription: 'API Access gives you full programmatic control over your workspace via Contril\'s REST API.' },
  audit_logs:           { key: 'audit_logs',           label: 'Audit Logs',              description: 'Complete audit trail of workspace activity',                     minimumPlan: 'BUSINESS',   upgradeDescription: 'Audit Logs provide a complete, tamper-proof record of every action taken in your workspace for compliance.' },
  priority_ai_queue:    { key: 'priority_ai_queue',    label: 'Priority AI Queue',       description: 'Priority processing for AI requests',                           minimumPlan: 'BUSINESS',   upgradeDescription: 'Skip the queue and get faster AI processing for all your requests.' },
  sso:                  { key: 'sso',                  label: 'SSO & SAML',              description: 'Single sign-on with SAML/OIDC',                                 minimumPlan: 'BUSINESS',   upgradeDescription: 'SSO lets your team sign in with your company identity provider for seamless, secure access.' },

  // ENTERPRISE tier features
  custom_ai_models:     { key: 'custom_ai_models',     label: 'Custom AI Models',        description: 'Fine-tuned AI models for your organization',                    minimumPlan: 'ENTERPRISE', upgradeDescription: 'Deploy custom fine-tuned AI models trained on your organization\'s data and domain expertise.' },
  private_deployment:   { key: 'private_deployment',   label: 'Private Deployment',      description: 'Dedicated private cloud infrastructure',                        minimumPlan: 'ENTERPRISE', upgradeDescription: 'Run Contril on dedicated infrastructure isolated from other tenants for maximum security.' },
  dedicated_support:    { key: 'dedicated_support',    label: 'Dedicated Success Manager', description: 'Assigned customer success manager',                          minimumPlan: 'ENTERPRISE', upgradeDescription: 'Get a dedicated success manager who understands your organization and ensures you get maximum value.' },
  vpc:                  { key: 'vpc',                  label: 'VPC Deployment',          description: 'Deploy within your own VPC',                                    minimumPlan: 'ENTERPRISE', upgradeDescription: 'Deploy Contril within your own Virtual Private Cloud for network-level isolation.' },
  on_premise:           { key: 'on_premise',           label: 'On-Premise Deployment',   description: 'Self-hosted on-premise installation',                           minimumPlan: 'ENTERPRISE', upgradeDescription: 'Install and run Contril entirely on your own infrastructure with full data sovereignty.' },
  enterprise_security:  { key: 'enterprise_security',  label: 'Enterprise Security',     description: 'Advanced security controls and compliance',                     minimumPlan: 'ENTERPRISE', upgradeDescription: 'Advanced security including custom encryption keys, IP allowlisting, and compliance certifications.' },
  sla:                  { key: 'sla',                  label: 'SLA',                     description: 'Guaranteed uptime service level agreement',                     minimumPlan: 'ENTERPRISE', upgradeDescription: 'Get contractual uptime guarantees with financial penalties for any service disruptions.' },
};

// ---------------------------------------------------------------------------
// Feature Flags — Runtime toggles (no code changes needed)
// ---------------------------------------------------------------------------
export interface FeatureFlag {
  key: FeatureKey;
  enabled: boolean;
  beta: boolean;
}

const featureFlagsStore = new Map<FeatureKey, FeatureFlag>();
// Initialize all features as enabled and non-beta
(Object.keys(ENTITLEMENT_MAP) as FeatureKey[]).forEach(key => {
  featureFlagsStore.set(key, { key, enabled: true, beta: false });
});

// ---------------------------------------------------------------------------
// Plan Definitions — INR Pricing
// ---------------------------------------------------------------------------
export interface PlanLimits {
  maxWorkspaces: number | 'unlimited';
  maxMembers: number | 'unlimited';
  maxConnectedApps: number | 'unlimited';
  maxAiCreditsPerMonth: number | 'unlimited';
  maxStorageGb: number | 'unlimited';
}

export interface PlanDetails {
  id: PlanTier;
  name: string;
  priceMonthlyInr: number | null; // null = custom pricing
  priceLabel: string;
  period: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  ctaLabel: string;
  limits: PlanLimits;
  highlightFeatures: string[];
}

// Plan hierarchy for comparison
const PLAN_HIERARCHY: Record<PlanTier, number> = {
  FREE: 0,
  PRO: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

export class PlanService {
  public static plans: Record<PlanTier, PlanDetails> = {
    FREE: {
      id: 'FREE',
      name: 'Free',
      priceMonthlyInr: 0,
      priceLabel: '₹0',
      period: '/month',
      tagline: 'Perfect for personal use and getting started',
      ctaLabel: 'Current Plan',
      limits: {
        maxWorkspaces: 1,
        maxMembers: 1,
        maxConnectedApps: 2,
        maxAiCreditsPerMonth: 500,
        maxStorageGb: 2,
      },
      highlightFeatures: [
        '1 Workspace',
        '1 Member',
        '2 Connected Apps',
        '500 AI Credits/month',
        '2 GB Storage',
        'Basic AI Chat',
        'Community Templates',
        'Email Support',
      ],
    },
    PRO: {
      id: 'PRO',
      name: 'Pro',
      priceMonthlyInr: 499,
      priceLabel: '₹499',
      period: '/month',
      tagline: 'Best for freelancers and solo founders',
      badge: '⭐ Most Popular',
      isPopular: true,
      ctaLabel: 'Upgrade to Pro',
      limits: {
        maxWorkspaces: 5,
        maxMembers: 10,
        maxConnectedApps: 'unlimited',
        maxAiCreditsPerMonth: 20000,
        maxStorageGb: 100,
      },
      highlightFeatures: [
        'Everything in Free',
        '5 Workspaces',
        'Up to 10 Members',
        '20,000 AI Credits/month',
        '100 GB Storage',
        'Unlimited Connected Apps',
        'Meeting Notes',
        'Calendar AI',
        'Smart Tasks',
        'AI Search',
        'Custom Branding',
        'Priority Support',
      ],
    },
    BUSINESS: {
      id: 'BUSINESS',
      name: 'Business',
      priceMonthlyInr: 2499,
      priceLabel: '₹2,499',
      period: '/month',
      tagline: 'Best for growing companies and teams',
      ctaLabel: 'Upgrade to Business',
      limits: {
        maxWorkspaces: 'unlimited',
        maxMembers: 'unlimited',
        maxConnectedApps: 'unlimited',
        maxAiCreditsPerMonth: 100000,
        maxStorageGb: 1000,
      },
      highlightFeatures: [
        'Everything in Pro',
        'Unlimited Workspaces',
        'Unlimited Members',
        '100,000 AI Credits/month',
        '1 TB Storage',
        'Team Permissions',
        'Shared AI Memory',
        'Knowledge Base',
        'Automation Builder',
        'Analytics Dashboard',
        'API Access',
        'Audit Logs',
        'Priority AI Queue',
        'SSO',
      ],
    },
    ENTERPRISE: {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      priceMonthlyInr: null,
      priceLabel: 'Custom',
      period: 'Pricing',
      tagline: 'For organizations that need dedicated infrastructure',
      ctaLabel: 'Contact Sales',
      limits: {
        maxWorkspaces: 'unlimited',
        maxMembers: 'unlimited',
        maxConnectedApps: 'unlimited',
        maxAiCreditsPerMonth: 'unlimited',
        maxStorageGb: 'unlimited',
      },
      highlightFeatures: [
        'Everything in Business',
        'Unlimited AI Credits',
        'Unlimited Storage',
        'Dedicated Infrastructure',
        'Private Deployment',
        'Custom AI Models',
        'Dedicated Success Manager',
        'SLA',
        'VPC Deployment',
        'On-Premise Option',
        'Enterprise Security',
      ],
    },
  };

  // ---------------------------------------------------------------------------
  // Entitlement Checks
  // ---------------------------------------------------------------------------

  /** Check if a plan tier meets or exceeds a required tier */
  public static isPlanSufficient(userPlan: PlanTier, requiredPlan: PlanTier): boolean {
    return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
  }

  /** Check if a specific feature is allowed for a user's plan (checks both entitlement AND feature flag) */
  public static isFeatureAllowed(userPlan: PlanTier, featureKey: FeatureKey): boolean {
    const entitlement = ENTITLEMENT_MAP[featureKey];
    if (!entitlement) return false;

    const flag = featureFlagsStore.get(featureKey);
    if (flag && !flag.enabled) return false;

    return this.isPlanSufficient(userPlan, entitlement.minimumPlan);
  }

  /** Get the minimum plan required for a feature */
  public static getRequiredPlan(featureKey: FeatureKey): PlanTier {
    return ENTITLEMENT_MAP[featureKey]?.minimumPlan || 'ENTERPRISE';
  }

  /** Get upgrade modal data for a gated feature */
  public static getUpgradeModalData(featureKey: FeatureKey) {
    const entitlement = ENTITLEMENT_MAP[featureKey];
    if (!entitlement) {
      return {
        upgradeRequired: true,
        featureKey,
        featureLabel: featureKey,
        featureDescription: '',
        requiredPlan: 'PRO' as PlanTier,
        requiredPlanDetails: this.plans.PRO,
        upgradeDescription: '',
      };
    }

    const requiredPlan = entitlement.minimumPlan;
    return {
      upgradeRequired: true,
      featureKey: entitlement.key,
      featureLabel: entitlement.label,
      featureDescription: entitlement.description,
      requiredPlan,
      requiredPlanDetails: this.plans[requiredPlan],
      upgradeDescription: entitlement.upgradeDescription,
    };
  }

  /** Get all features available for a plan */
  public static getFeaturesForPlan(plan: PlanTier): FeatureKey[] {
    return (Object.keys(ENTITLEMENT_MAP) as FeatureKey[]).filter(
      key => this.isPlanSufficient(plan, ENTITLEMENT_MAP[key].minimumPlan)
    );
  }

  /** Get all features locked for a plan (for comparison tables) */
  public static getLockedFeatures(plan: PlanTier): FeatureEntitlement[] {
    return (Object.values(ENTITLEMENT_MAP) as FeatureEntitlement[]).filter(
      e => !this.isPlanSufficient(plan, e.minimumPlan)
    );
  }

  // ---------------------------------------------------------------------------
  // Feature Flags Management
  // ---------------------------------------------------------------------------

  public static getFeatureFlags(): FeatureFlag[] {
    return Array.from(featureFlagsStore.values());
  }

  public static setFeatureFlag(key: FeatureKey, enabled: boolean, beta?: boolean): FeatureFlag | null {
    const flag = featureFlagsStore.get(key);
    if (!flag) return null;
    flag.enabled = enabled;
    if (beta !== undefined) flag.beta = beta;
    return flag;
  }

  public static isFeatureFlagEnabled(key: FeatureKey): boolean {
    return featureFlagsStore.get(key)?.enabled ?? true;
  }

  // ---------------------------------------------------------------------------
  // Feature Comparison Table Data
  // ---------------------------------------------------------------------------

  public static getComparisonTable(): { feature: string; free: boolean; pro: boolean; business: boolean; enterprise: boolean }[] {
    const features: { label: string; minPlan: PlanTier }[] = [
      { label: 'AI Chat', minPlan: 'FREE' },
      { label: 'Gmail Integration', minPlan: 'FREE' },
      { label: 'Calendar', minPlan: 'FREE' },
      { label: 'Meeting Notes', minPlan: 'PRO' },
      { label: 'Calendar AI', minPlan: 'PRO' },
      { label: 'Smart Tasks', minPlan: 'PRO' },
      { label: 'AI Search', minPlan: 'PRO' },
      { label: 'Custom Branding', minPlan: 'PRO' },
      { label: 'Automation Builder', minPlan: 'BUSINESS' },
      { label: 'Knowledge Base', minPlan: 'BUSINESS' },
      { label: 'Team Permissions', minPlan: 'BUSINESS' },
      { label: 'API Access', minPlan: 'BUSINESS' },
      { label: 'Analytics', minPlan: 'BUSINESS' },
      { label: 'SSO', minPlan: 'BUSINESS' },
      { label: 'Audit Logs', minPlan: 'BUSINESS' },
      { label: 'Custom AI Models', minPlan: 'ENTERPRISE' },
      { label: 'Private Deployment', minPlan: 'ENTERPRISE' },
      { label: 'Dedicated Support', minPlan: 'ENTERPRISE' },
    ];

    return features.map(f => ({
      feature: f.label,
      free: this.isPlanSufficient('FREE', f.minPlan),
      pro: this.isPlanSufficient('PRO', f.minPlan),
      business: this.isPlanSufficient('BUSINESS', f.minPlan),
      enterprise: this.isPlanSufficient('ENTERPRISE', f.minPlan),
    }));
  }
}
