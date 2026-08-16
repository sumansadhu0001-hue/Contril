import { IntegrationDefinition, ConnectedAccountState, IntegrationActivityEvent } from '../types/integrations';
import { EmailItem, MeetingItem, DocumentItem, DecisionItem, AutoCompletedTask } from '../types';

export const INTEGRATIONS_LIST: IntegrationDefinition[] = [
  // Google
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'google',
    categoryLabel: 'Google Workspace',
    description: 'Read unread emails, threads, drafts, summarize inbox, & send responses.',
    iconName: 'Mail',
    accentColor: '#EA4335',
    permissions: [
      'Read inbox, unread emails, & labels',
      'Access email threads & drafts',
      'Draft AI responses & send emails',
      'Archive, delete, & summarize inbox'
    ],
    oauthSupported: true
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'google',
    categoryLabel: 'Google Workspace',
    description: "Sync today's schedule, meetings, create events & meeting briefs.",
    iconName: 'Calendar',
    accentColor: '#4285F4',
    permissions: [
      "Read events, meetings, & today's schedule",
      'Check availability & meeting links',
      'Create, edit, & cancel events',
      'Generate meeting briefs & prepare agendas'
    ],
    oauthSupported: true
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'google',
    categoryLabel: 'Google Workspace',
    description: 'Search files, organize folders, summarize documents & analyze contracts.',
    iconName: 'Folder',
    accentColor: '#34A853',
    permissions: [
      'Search & read Drive files & folders',
      'Summarize documents & legal contracts',
      'Organize workspace folders & drive metadata'
    ],
    oauthSupported: true
  },
  {
    id: 'google_docs',
    name: 'Google Docs',
    category: 'google',
    categoryLabel: 'Google Workspace',
    description: 'Extract document intelligence, draft briefs, & review shared files.',
    iconName: 'FileText',
    accentColor: '#4285F4',
    permissions: [
      'Read document contents & comments',
      'Draft AI executive memos & summaries',
      'Track revisions & document edits'
    ],
    oauthSupported: true
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    category: 'google',
    categoryLabel: 'Google Workspace',
    description: 'Ingest live meeting transcripts, auto-extract action items, & generate instant briefs.',
    iconName: 'Video',
    accentColor: '#00897B',
    permissions: [
      'Access live meeting transcripts',
      'Synthesize real-time attendee action items',
      'Draft meeting recap summaries'
    ],
    oauthSupported: true
  },

  // Microsoft Ecosystem
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    category: 'microsoft',
    categoryLabel: 'Microsoft Ecosystem',
    description: 'Read Outlook emails, summarize inbox, & draft executive email replies.',
    iconName: 'Mail',
    accentColor: '#0078D4',
    permissions: [
      'Read Outlook inbox & email threads',
      'Draft AI replies & send emails via Graph API',
      'Categorize urgent C-suite emails'
    ],
    oauthSupported: true
  },
  {
    id: 'microsoft_calendar',
    name: 'Microsoft Calendar',
    category: 'microsoft',
    categoryLabel: 'Microsoft Ecosystem',
    description: 'Sync Outlook calendar events, availability, & executive schedules.',
    iconName: 'Calendar',
    accentColor: '#0078D4',
    permissions: [
      'Read calendar events & schedule availability',
      'Create & update Outlook calendar invites'
    ],
    oauthSupported: true
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'microsoft',
    categoryLabel: 'Microsoft Ecosystem',
    description: 'Search cloud files, index shared documents, & analyze contracts.',
    iconName: 'Folder',
    accentColor: '#0078D4',
    permissions: [
      'Read OneDrive files & shared business folders',
      'Extract document insights & legal risks'
    ],
    oauthSupported: true
  },
  {
    id: 'msteams',
    name: 'Microsoft Teams',
    category: 'microsoft',
    categoryLabel: 'Microsoft Ecosystem',
    description: 'Monitor Teams channels, summarize meeting transcripts, & push updates.',
    iconName: 'Video',
    accentColor: '#6264A7',
    permissions: [
      'Read Teams channel messages & meeting transcripts',
      'Draft channel updates & priority summaries'
    ],
    oauthSupported: true
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    categoryLabel: 'Communication',
    description: 'Monitor priority channels, summarize unread threads, & queue updates.',
    iconName: 'MessageSquare',
    accentColor: '#E01E5A',
    permissions: [
      'Read public & private channels',
      'Summarize unread channel activity',
      'Post executive briefings & decisions'
    ],
    oauthSupported: true
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    categoryLabel: 'Communication',
    description: 'Track developer & community channels, filter alerts, & archive updates.',
    iconName: 'MessageCircle',
    accentColor: '#5865F2',
    permissions: [
      'Read server channels & announcements',
      'Synthesize daily community sentiment'
    ],
    oauthSupported: true
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'communication',
    categoryLabel: 'Communication',
    description: 'Import meeting transcripts, auto-extract decisions, & send follow-ups.',
    iconName: 'Video',
    accentColor: '#2D8CFF',
    permissions: [
      'Access cloud meeting recordings & AI transcripts',
      'Extract executive action items & key decisions'
    ],
    oauthSupported: true
  },

  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    categoryLabel: 'Productivity & Knowledge',
    description: 'Sync team wiki pages, project databases, & executive roadmap docs.',
    iconName: 'BookOpen',
    accentColor: '#FAFAFA',
    permissions: [
      'Read Notion databases & workspace pages',
      'Query knowledge bases & process docs',
      'Update project task statuses'
    ],
    oauthSupported: true
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'productivity',
    categoryLabel: 'Productivity & Knowledge',
    description: 'Track engineering cycles, high-priority issues, & release milestones.',
    iconName: 'CheckSquare',
    accentColor: '#5E6AD2',
    permissions: [
      'Read cycle issues & project boards',
      'Extract blocking technical decisions',
      'Update issue statuses & assignees'
    ],
    oauthSupported: true
  },
  {
    id: 'trello',
    name: 'Trello',
    category: 'productivity',
    categoryLabel: 'Productivity & Knowledge',
    description: 'Sync Kanban cards, team sprints, & approval queues.',
    iconName: 'Trello',
    accentColor: '#0079BF',
    permissions: ['Read Trello boards & cards', 'Move card statuses'],
    oauthSupported: true
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'productivity',
    categoryLabel: 'Productivity & Knowledge',
    description: 'Sync enterprise epics, bug reports, & compliance tickets.',
    iconName: 'Briefcase',
    accentColor: '#0052CC',
    permissions: ['Read Jira projects, epics, & sprints', 'Extract blocker risks'],
    oauthSupported: true
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'productivity',
    categoryLabel: 'Productivity & Knowledge',
    description: 'Sync cross-functional projects, milestones, & task deadlines.',
    iconName: 'CheckCircle',
    accentColor: '#F06A6A',
    permissions: ['Read Asana projects & subtasks', 'Update task completion'],
    oauthSupported: true
  },

  // Storage
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    categoryLabel: 'Cloud Storage',
    description: 'Index cloud files, search shared folders, & summarize documents.',
    iconName: 'HardDrive',
    accentColor: '#0061FF',
    permissions: ['Read Dropbox files & team folders'],
    oauthSupported: true
  },
  {
    id: 'box',
    name: 'Box',
    category: 'storage',
    categoryLabel: 'Cloud Storage',
    description: 'Enterprise content security, legal hold indexing, & contract review.',
    iconName: 'Archive',
    accentColor: '#0061D5',
    permissions: ['Read Box enterprise files & governance metadata'],
    oauthSupported: true
  },

  // Development
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    categoryLabel: 'Development & Engineering',
    description: 'Monitor pull requests, code security audits, & CI/CD deployment pipelines.',
    iconName: 'GitPullRequest',
    accentColor: '#FAFAFA',
    permissions: [
      'Read repository pull requests & issues',
      'Track security advisories & release tags',
      'Summarize code review discussions'
    ],
    oauthSupported: true
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'development',
    categoryLabel: 'Development & Engineering',
    description: 'Sync GitLab merge requests, pipeline statuses, & vulnerability logs.',
    iconName: 'GitBranch',
    accentColor: '#FC6D26',
    permissions: ['Read merge requests & pipeline logs'],
    oauthSupported: true
  },

  // CRM
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'crm',
    categoryLabel: 'CRM & Payments',
    description: 'Track MRR growth, subscription renewals, customer churn alerts, & invoice statuses.',
    iconName: 'CreditCard',
    accentColor: '#635BFF',
    permissions: ['Read subscriptions, charges, MRR, & invoice events'],
    oauthSupported: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    categoryLabel: 'CRM & Sales',
    description: 'Sync sales pipelines, key deal stages, & customer account logs.',
    iconName: 'Users',
    accentColor: '#FF7A59',
    permissions: ['Read deal pipelines & contact engagement histories'],
    oauthSupported: true
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    categoryLabel: 'CRM & Sales',
    description: 'Sync enterprise CRM accounts, opportunity stages, & revenue forecasts.',
    iconName: 'BarChart',
    accentColor: '#00A1E0',
    permissions: ['Read Salesforce Opportunities, Accounts, & Contacts'],
    oauthSupported: true
  },

  // Optional
  {
    id: 'clickup',
    name: 'ClickUp',
    category: 'optional',
    categoryLabel: 'Workflow & Management',
    description: 'Sync custom workspace tasks, docs, & project goals.',
    iconName: 'Layers',
    accentColor: '#7B68EE',
    permissions: ['Read ClickUp spaces & task lists'],
    oauthSupported: true
  },
  {
    id: 'monday',
    name: 'Monday.com',
    category: 'optional',
    categoryLabel: 'Workflow & Management',
    description: 'Sync work OS boards, project timelines, & resource allocations.',
    iconName: 'Grid',
    accentColor: '#FF3D57',
    permissions: ['Read Monday.com boards & column items'],
    oauthSupported: true
  },
  {
    id: 'resend',
    name: 'Resend',
    category: 'crm',
    categoryLabel: 'CRM & Payments',
    description: 'Send enterprise email alerts and notification workflows.',
    iconName: 'Mail',
    accentColor: '#000000',
    permissions: ['Send transaction emails', 'Track deliverability metrics', 'Access domain settings'],
    oauthSupported: false
  }
];

const STORAGE_CONNECTIONS_KEY = 'contril_connected_accounts_v2';
const STORAGE_ACTIVITY_KEY = 'contril_activity_events_v2';

export function getConnectedAccounts(): Record<string, ConnectedAccountState> {
  try {
    const raw = localStorage.getItem(STORAGE_CONNECTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read connected accounts', err);
  }
  return {};
}

export function saveConnectedAccounts(state: Record<string, ConnectedAccountState>) {
  try {
    localStorage.setItem(STORAGE_CONNECTIONS_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save connected accounts', err);
  }
}

export function getActivityLogs(): IntegrationActivityEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read activity logs', err);
  }
  return [];
}

export function saveActivityLogs(logs: IntegrationActivityEvent[]) {
  try {
    localStorage.setItem(STORAGE_ACTIVITY_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save activity logs', err);
  }
}

export function addActivityEvent(
  integrationId: string,
  integrationName: string,
  action: string,
  details: string,
  category: 'sync' | 'action' | 'creation' | 'draft' = 'sync'
): IntegrationActivityEvent {
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const event: IntegrationActivityEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    time: timeFormatted,
    timestamp: now.getTime(),
    integrationId,
    integrationName,
    action,
    details,
    category
  };
  const existing = getActivityLogs();
  const updated = [event, ...existing].slice(0, 50); // Keep last 50
  saveActivityLogs(updated);
  return event;
}

// LOCAL STORAGE DATA PERSISTENCE FOR REAL USER CREATED ITEMS
const STORAGE_USER_EMAILS_KEY = 'contril_user_emails_v1';
const STORAGE_USER_MEETINGS_KEY = 'contril_user_meetings_v1';
const STORAGE_USER_DOCS_KEY = 'contril_user_docs_v1';
const STORAGE_USER_DECISIONS_KEY = 'contril_user_decisions_v1';
const STORAGE_USER_TASKS_KEY = 'contril_user_tasks_v1';

export function getUserStoredEmails(): EmailItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_USER_EMAILS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveUserStoredEmails(emails: EmailItem[]) {
  localStorage.setItem(STORAGE_USER_EMAILS_KEY, JSON.stringify(emails));
}

export function getUserStoredMeetings(): MeetingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_USER_MEETINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveUserStoredMeetings(meetings: MeetingItem[]) {
  localStorage.setItem(STORAGE_USER_MEETINGS_KEY, JSON.stringify(meetings));
}

export function getUserStoredDocs(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_USER_DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveUserStoredDocs(docs: DocumentItem[]) {
  localStorage.setItem(STORAGE_USER_DOCS_KEY, JSON.stringify(docs));
}

export function getUserStoredDecisions(): DecisionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_USER_DECISIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveUserStoredDecisions(decisions: DecisionItem[]) {
  localStorage.setItem(STORAGE_USER_DECISIONS_KEY, JSON.stringify(decisions));
}

export function getUserStoredTasks(): AutoCompletedTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_USER_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveUserStoredTasks(tasks: AutoCompletedTask[]) {
  localStorage.setItem(STORAGE_USER_TASKS_KEY, JSON.stringify(tasks));
}

export function addUserEmail(email: EmailItem) {
  const current = getUserStoredEmails();
  const updated = [email, ...current];
  saveUserStoredEmails(updated);
  return updated;
}

export function addUserMeeting(meeting: MeetingItem) {
  const current = getUserStoredMeetings();
  const updated = [meeting, ...current];
  saveUserStoredMeetings(updated);
  return updated;
}

export function addUserDoc(doc: DocumentItem) {
  const current = getUserStoredDocs();
  const updated = [doc, ...current];
  saveUserStoredDocs(updated);
  return updated;
}

export function addUserDecision(decision: DecisionItem) {
  const current = getUserStoredDecisions();
  const updated = [decision, ...current];
  saveUserStoredDecisions(updated);
  return updated;
}

export function addUserTask(task: AutoCompletedTask) {
  const current = getUserStoredTasks();
  const updated = [task, ...current];
  saveUserStoredTasks(updated);
  return updated;
}

// REAL LIVE DATA SYNCED PER CONNECTED INTEGRATION
export function getLiveSyncedData(connectedMap: Record<string, ConnectedAccountState>) {
  const hasConnectedEmail = Boolean(connectedMap['gmail']?.isConnected || connectedMap['outlook']?.isConnected);
  const hasConnectedCalendar = Boolean(connectedMap['google_calendar']?.isConnected || connectedMap['microsoft_calendar']?.isConnected);
  const hasConnectedDrive = Boolean(connectedMap['google_drive']?.isConnected || connectedMap['onedrive']?.isConnected || connectedMap['google_docs']?.isConnected || connectedMap['notion']?.isConnected);
  const hasConnectedTasks = Boolean(connectedMap['linear']?.isConnected || connectedMap['github']?.isConnected || connectedMap['jira']?.isConnected || connectedMap['slack']?.isConnected);

  const allEmails = getUserStoredEmails();
  const allMeetings = getUserStoredMeetings();
  const allDocs = getUserStoredDocs();
  const allDecisions = getUserStoredDecisions();
  const allTasks = getUserStoredTasks();

  return {
    emails: hasConnectedEmail ? allEmails : [],
    meetings: hasConnectedCalendar ? allMeetings : [],
    documents: hasConnectedDrive ? allDocs : [],
    decisions: hasConnectedTasks ? allDecisions : [],
    tasks: hasConnectedTasks ? allTasks : []
  };
}

export async function hydrateIntegrationsStatus(): Promise<void> {
  try {
    const sessionUserStr = localStorage.getItem('contril_session_user');
    const token = sessionUserStr ? JSON.parse(sessionUserStr).token : '';
    if (!token) return;

    const res = await fetch('/api/v1/integrations/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.status) {
        const connectedMap = getConnectedAccounts();
        let changed = false;

        Object.keys(data.status).forEach(key => {
          const isConnected = data.status[key].connected;
          if (!connectedMap[key] || connectedMap[key].isConnected !== isConnected) {
            connectedMap[key] = {
              integrationId: key,
              isConnected,
              lastSyncTime: isConnected ? (connectedMap[key]?.lastSyncTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : undefined,
              statusMessage: isConnected ? 'Connected' : 'Disconnected'
            };
            changed = true;
          }
        });

        if (changed) {
          saveConnectedAccounts(connectedMap);
        }
      }
    }
  } catch (err) {
    console.error('Failed to hydrate integrations status from backend:', err);
  }
}

