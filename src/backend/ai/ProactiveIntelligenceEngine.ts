export type PermissionMode = 'passive' | 'assist' | 'executive' | 'autonomous';

export interface ProactiveNudge {
  id: string;
  title: string;
  message: string;
  priority: 'urgent' | 'important' | 'optional' | 'low';
  category: 'travel' | 'shopping' | 'email' | 'meeting' | 'quota' | 'connector';
  isDismissed: boolean;
}

export class ProactiveIntelligenceEngine {

  public static getProactiveNudges(mode: PermissionMode, connectedToolsCount: number): ProactiveNudge[] {
    if (mode === 'passive') {
      return []; // Passive mode strictly suppresses background nudges
    }

    if (connectedToolsCount === 0) {
      return [
        {
          id: 'nudge-1',
          title: 'Connect Workspace Channels',
          message: 'Connect Gmail, Calendar, and Drive to unlock real-time proactive intelligence nudges.',
          priority: 'important',
          category: 'connector',
          isDismissed: false
        }
      ];
    }

    return [
      {
        id: 'nudge-2',
        title: 'Unanswered High-Priority Email',
        message: 'Email from investor@venturefund.com has not received a response in 18 hours.',
        priority: 'urgent',
        category: 'email',
        isDismissed: false
      },
      {
        id: 'nudge-3',
        title: 'Upcoming Meeting Missing Agenda',
        message: 'Executive Sync tomorrow at 10:00 AM has no attached document agenda.',
        priority: 'important',
        category: 'meeting',
        isDismissed: false
      },
      {
        id: 'nudge-4',
        title: 'Flight Price Reduction Detected',
        message: 'San Francisco non-stop flight price dropped by 15%.',
        priority: 'optional',
        category: 'travel',
        isDismissed: false
      }
    ];
  }

  public static classifyPriority(title: string, dueDate?: string): 'urgent' | 'important' | 'optional' | 'low' {
    const clean = title.toLowerCase();
    if (clean.includes('urgent') || clean.includes('asap') || clean.includes('today') || clean.includes('overdue')) {
      return 'urgent';
    }
    if (clean.includes('proposal') || clean.includes('review') || clean.includes('contract') || clean.includes('investor')) {
      return 'important';
    }
    if (clean.includes('newsletter') || clean.includes('optional') || clean.includes('reading')) {
      return 'optional';
    }
    return 'important';
  }
}
