import { supabase } from '../../lib/auth';

export interface GoalMilestone {
  id?: string;
  title: string;
  description: string;
  stepOrder: number;
  isCompleted: boolean;
  blockers?: string[];
}

export interface ExecutiveGoal {
  id?: string;
  userId: string;
  title: string;
  category: 'career' | 'business' | 'fitness' | 'learning' | 'finance' | 'projects' | 'travel' | 'shopping' | 'reading' | 'health';
  status: 'draft' | 'in_progress' | 'completed' | 'blocked' | 'archived';
  progressPercentage: number;
  targetCompletionDate?: string;
  milestones: GoalMilestone[];
  aiSuggestions: string[];
}

export class ExecutivePlanningEngine {

  /**
   * Decomposes a high-level goal into structured milestones
   */
  public static generateMilestoneBreakdown(goalTitle: string, category: string): GoalMilestone[] {
    const clean = goalTitle.toLowerCase();

    if (clean.includes('startup') || clean.includes('business')) {
      return [
        { title: 'Market Research & Customer Discovery', description: 'Validate problem statement with 20 user interviews.', stepOrder: 1, isCompleted: false },
        { title: 'MVP & Landing Page Development', description: 'Build landing page with early access waitlist.', stepOrder: 2, isCompleted: false },
        { title: 'Private Beta Launch', description: 'Onboard initial cohort of 50 active users.', stepOrder: 3, isCompleted: false },
        { title: 'Public Launch', description: 'Product Hunt, press release, and open onboarding.', stepOrder: 4, isCompleted: false },
        { title: 'Growth & Monetization', description: 'Reach ₹1,00,000 MRR milestone.', stepOrder: 5, isCompleted: false },
        { title: 'Institutional Fundraising', description: 'Prepare pitch deck and investor data room.', stepOrder: 6, isCompleted: false }
      ];
    }

    if (clean.includes('fitness') || clean.includes('marathon') || clean.includes('health')) {
      return [
        { title: 'Medical Baseline & VO2 Max Assessment', description: 'Establish baseline metrics and health targets.', stepOrder: 1, isCompleted: false },
        { title: 'Base Endurance Training Phase', description: '4 weeks of zone-2 aerobic conditioning.', stepOrder: 2, isCompleted: false },
        { title: 'Half-Marathon Distance Milestone', description: 'Complete 21km training run under 2 hours.', stepOrder: 3, isCompleted: false },
        { title: 'Tapering & Race Preparation', description: 'Nutrition strategy and race pace calibration.', stepOrder: 4, isCompleted: false }
      ];
    }

    // Generic structured plan breakdown
    return [
      { title: 'Phase 1: Research & Scope Definition', description: 'Define core objectives and resource requirements.', stepOrder: 1, isCompleted: false },
      { title: 'Phase 2: Execution & Milestone Delivery', description: 'Execute primary deliverables.', stepOrder: 2, isCompleted: false },
      { title: 'Phase 3: Review & Optimization', description: 'Measure outcomes against initial KPIs.', stepOrder: 3, isCompleted: false }
    ];
  }

  /**
   * Create goal in database
   */
  public static async createGoal(userId: string, title: string, category: any): Promise<ExecutiveGoal> {
    const milestones = this.generateMilestoneBreakdown(title, category);
    
    const goalData: ExecutiveGoal = {
      userId,
      title,
      category,
      status: 'in_progress',
      progressPercentage: 0,
      milestones,
      aiSuggestions: [
        'Connect Calendar to align daily work blocks with milestone deadlines.',
        'Enable Executive Mode for daily progress briefings.'
      ]
    };

    try {
      const { data, error } = await supabase
        .from('executive_goals')
        .insert({
          user_id: userId,
          title,
          category,
          status: 'in_progress',
          progress_percentage: 0,
          ai_suggestions: goalData.aiSuggestions
        })
        .select()
        .single();

      if (data) {
        goalData.id = data.id;
        // Insert milestones
        for (const m of milestones) {
          await supabase.from('goal_milestones').insert({
            goal_id: data.id,
            title: m.title,
            description: m.description,
            step_order: m.stepOrder,
            is_completed: false
          });
        }
      }
    } catch (e) {
      console.warn('Database save warning for goal:', e);
    }

    return goalData;
  }
}
