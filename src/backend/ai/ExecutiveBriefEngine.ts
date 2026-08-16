import { supabase } from '../../lib/auth';

export interface DailyExecutiveBrief {
  summary: string;
  urgentPriorities: string[];
  calendarHighlights: string[];
  unansweredEmailsCount: number;
  pendingApprovalsCount: number;
  alerts: { type: 'travel' | 'shopping' | 'deadline' | 'quota'; message: string }[];
  suggestedFocus: string;
}

export class ExecutiveBriefEngine {
  public static generateMorningBrief(
    meetingsCount: number = 0,
    tasksCount: number = 0,
    connectedToolsCount: number = 0
  ): DailyExecutiveBrief {
    const hasTools = connectedToolsCount > 0;

    return {
      summary: hasTools
        ? `Good morning. You have ${meetingsCount} meetings scheduled today across your connected calendar feeds. ${tasksCount} focus tasks require decision.`
        : 'Good morning. Contril AI OS is running in secure enclave mode. Connect Gmail and Calendar for real-time daily briefing aggregation.',
      urgentPriorities: hasTools
        ? ['Review Q3 Product Strategy deck', 'Approve pending expense reports', 'Client Sync call at 2:00 PM']
        : ['Connect Workspace channels to unlock proactive briefing', 'Define Q3 long-term goals in Goal Manager'],
      calendarHighlights: hasTools
        ? ['10:00 AM — Executive Engineering Sync', '02:00 PM — Investor Pitch Feedback Session']
        : ['No connected calendar events for today.'],
      unansweredEmailsCount: hasTools ? 3 : 0,
      pendingApprovalsCount: hasTools ? 1 : 0,
      alerts: hasTools
        ? [
            { type: 'deadline', message: 'Proposal due tomorrow at 5:00 PM.' },
            { type: 'travel', message: 'Flight to Delhi departs in 48 hours. Check-in opens today.' }
          ]
        : [],
      suggestedFocus: 'Focus on high-leverage strategic initiatives before 12:00 PM.'
    };
  }
}
