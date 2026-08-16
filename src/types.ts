export type WorkspaceType = 'business' | 'creator' | 'freelancer' | 'student' | 'personal';

export interface UserProfile {
  name: string;
  email?: string;
  workspaceType: WorkspaceType;
  company?: string;
  teamSize?: string;
  platform?: string;
  creatorType?: string;
  role?: string;
  focus?: string;
  connectedTools: string[];
}

export type OperatingMode = 'focus' | 'decisions' | 'complete' | 'spotlight' | 'memory' | 'docs' | 'inbox' | 'meetings' | 'delegate' | 'privacy' | 'pricing' | 'billing' | 'modes' | 'travel' | 'contril_brand' | 'workspace' | 'profile' | 'settings' | 'chat' | 'marketplace' | 'automations' | 'workflows' | 'timeline' | 'memory_vault' | 'permissions' | 'devices' | 'organization' | 'developer_portal' | 'marketplace_home' | 'executive_dashboard' | 'support_center' | 'beta_dashboard';

export type NavigationTab = OperatingMode | 'daily_brief' | 'travel' | 'life_admin' | 'privacy_vault' | 'document_brain' | 'contril_brand';

export interface UrgentEmail {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  time: string;
  category: 'urgent' | 'action' | 'vip' | 'low';
  draftReply?: string;
}

export type EmailItem = UrgentEmail;

export interface DecisionItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status?: string;
  description?: string;
  recommendation?: string;
  legalStatus: 'Passed' | 'Flagged' | 'N/A';
  financeStatus: 'Passed' | 'Flagged' | 'N/A';
  riskLevel: 'Low' | 'Medium' | 'High';
  aiRecommendation: 'APPROVE' | 'REJECT' | 'REVIEW';
  confidenceScore: number;
  summary: string;
  financialImpact?: string;
  details: {
    keyClauses?: string[];
    requestedBy?: string;
    highlights?: string[];
  };
}

export interface AutoCompletedTask {
  id: string;
  time: string;
  category: string;
  title: string;
  detail: string;
}

export interface MemoryItem {
  id: string;
  type: 'document' | 'email' | 'meeting' | 'note' | 'travel';
  title: string;
  snippet: string;
  content?: string;
  timestamp: string;
  tags: string[];
  source?: string;
  category?: string;
  pinned?: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileType: string;
  size: string;
  uploadDate?: string;
  status?: string;
  summary: string;
  risk?: 'Low' | 'Medium' | 'High';
  keyDates?: { label?: string; date: string; event?: string }[] | string[];
  clauses?: { title: string; risk: 'low' | 'medium' | 'high'; text: string; riskLevel?: string; summary?: string }[];
  financials?: { item: string; value: string; amount?: string }[];
}

export interface ActionItem {
  task: string;
  owner: string;
  deadline?: string;
  completed?: boolean;
}

export interface PersonalizedFollowUpEmail {
  recipient: string;
  recipientEmail?: string;
  subject: string;
  emailText: string;
  assignedActionItems: string[];
}

export interface MeetingItem {
  id: string;
  title: string;
  time: string;
  platform?: string;
  status?: string;
  attendees?: string[];
  transcript?: string;
  summary: string;
  decisions: string[];
  keyDecisions?: string[];
  actionItems: ActionItem[];
  followUpEmailDraft?: string;
  personalizedEmails?: PersonalizedFollowUpEmail[];
  personalizedFollowUps?: PersonalizedFollowUpEmail[];
}

export interface AuditLog {
  id: string;
  time?: string;
  timestamp?: string;
  action: string;
  detail?: string;
  module?: string;
  hash?: string;
  status: string;
}

export interface TravelBooking {
  id: string;
  type?: string;
  title?: string;
  provider?: string;
  destination?: string;
  dates?: string;
  dateTime?: string;
  location?: string;
  purpose?: string;
  status: string;
  cost?: string;
  flight?: string;
  hotel?: string;
  confirmationCode?: string;
  weatherForecast?: string | { temp?: string; condition?: string };
  approvalRisk?: 'Low' | 'Medium' | 'High';
}

export interface PendingApproval {
  id: string;
  title: string;
  type?: string;
  category: string;
  amount?: string;
  vendor?: string;
  requestedBy: string;
  risk: 'Low' | 'Medium' | 'High';
  aiScore: number;
  reason: string;
  details?: string;
}

export interface DailyBriefingData {
  greeting: string;
  summaryText: string;
  executiveSummary?: string;
  workloadScore?: number;
  top3Priorities?: string[];
  urgentEmailsCount: number;
  todaysMeetingsCount: number;
  pendingApprovals: PendingApproval[];
  meetings?: MeetingItem[];
  urgentEmails?: UrgentEmail[];
  upcomingTravelSnippet?: { title?: string; destination?: string; dates?: string; confirmationCode?: string; flight?: string; route?: string; time?: string };
  billsDue?: { title?: string; amount?: string; dueDate?: string }[];
}

export interface DelegateWorkflow {
  id: string;
  name?: string;
  title?: string;
  prompt?: string;
  trigger?: string;
  action?: string;
  status: 'Active' | 'Paused' | 'completed' | 'running';
  executionCount?: number;
  lastRun?: string;
  currentStep?: number | string;
  progressPercent?: number;
  steps?: { name?: string; label?: string; status: string; output?: string }[];
  finalResult?: { title?: string; text?: string; link?: string; details?: string; summary?: string; comparisonTable?: any[]; actionsTaken?: string[] };
}

export interface LifeAdminItem {
  id: string;
  title: string;
  provider?: string;
  dueDate: string;
  daysRemaining?: number;
  amount?: string;
  category: string;
  status: 'Pending' | 'Completed';
  autoRenew: boolean;
  actionPrompt?: string;
}
