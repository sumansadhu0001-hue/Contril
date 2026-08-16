export interface AutomationRecommendation {
  id: string;
  title: string;
  triggerDescription: string;
  actionDescription: string;
  estimatedTimeSavedMinutesWeekly: number;
}

export class AutomationRecommendationEngine {
  public static getRecommendations(): AutomationRecommendation[] {
    return [
      {
        id: 'auto-rec-1',
        title: 'Auto-Summarize Meeting Transcripts',
        triggerDescription: 'When Google Calendar meeting finishes',
        actionDescription: 'Generate executive summary & save to Memory Bank',
        estimatedTimeSavedMinutesWeekly: 45
      },
      {
        id: 'auto-rec-2',
        title: 'Daily Morning Executive Brief Email',
        triggerDescription: 'Every weekday morning at 8:00 AM',
        actionDescription: 'Send consolidated Brief to user email',
        estimatedTimeSavedMinutesWeekly: 30
      },
      {
        id: 'auto-rec-3',
        title: 'Flight Price Reduction Watcher',
        triggerDescription: 'Every 6 hours',
        actionDescription: 'Check booked flight itineraries & alert on price drops',
        estimatedTimeSavedMinutesWeekly: 20
      }
    ];
  }
}
