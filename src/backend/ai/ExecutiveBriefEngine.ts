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

// REAL DATA CONTRACT: This engine must NEVER return invented content.
// Every field must be derived from data that was actually fetched from a
// real, connected source. If no real data exists, fields must say so
// honestly (e.g. empty arrays, "No data available" strings) rather than
// return plausible-sounding placeholder content.

export interface RealBriefInputs {
  realMeetings: { title: string; time: string }[];   // must come from a real Calendar API fetch
  realUnansweredEmails: { subject: string; from: string }[]; // must come from a real Gmail API fetch
  realPendingApprovals: number; // must come from a real Supabase query
  connectedToolsCount: number;
}

export class ExecutiveBriefEngine {
  public static generateMorningBrief(inputs: RealBriefInputs): DailyExecutiveBrief {
    const hasTools = inputs.connectedToolsCount > 0;

    if (!hasTools) {
      return {
        summary: 'Connect Gmail and Calendar to unlock your daily briefing.',
        urgentPriorities: ['Connect Workspace channels to unlock proactive briefing'],
        calendarHighlights: ['No connected calendar events for today.'],
        unansweredEmailsCount: 0,
        pendingApprovalsCount: 0,
        alerts: [],
        suggestedFocus: 'Connect your tools to get started.'
      };
    }

    // hasTools is true — but we must still only report what was ACTUALLY fetched.
    const hasMeetings = inputs.realMeetings.length > 0;
    const hasEmails = inputs.realUnansweredEmails.length > 0;

    return {
      summary: hasMeetings || hasEmails
        ? `You have ${inputs.realMeetings.length} meeting(s) and ${inputs.realUnansweredEmails.length} unanswered email(s) today.`
        : 'Your inbox and calendar are clear for now.',
      urgentPriorities: hasEmails
        ? inputs.realUnansweredEmails.slice(0, 3).map(e => `Reply to "${e.subject}" from ${e.from}`)
        : ['Nothing urgent found today.'],
      calendarHighlights: hasMeetings
        ? inputs.realMeetings.map(m => `${m.time} — ${m.title}`)
        : ['No upcoming events found today.'],
      unansweredEmailsCount: inputs.realUnansweredEmails.length,
      pendingApprovalsCount: inputs.realPendingApprovals,
      alerts: [], // Only populate this from a real source (e.g. real deadline data) — never invent alerts.
      suggestedFocus: hasEmails
        ? 'Clear your unanswered emails first.'
        : 'No urgent items — good time for deep work.'
    };
  }
}
