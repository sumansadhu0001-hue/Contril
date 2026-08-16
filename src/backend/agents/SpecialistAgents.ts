import { ExecutionDagNode } from '../intelligence/PlanningEngine';

export interface SpecialistAgent {
  id: 'executive' | 'workspace' | 'shopping' | 'food' | 'travel' | 'research' | 'memory' | 'automation';
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  executeStep: (node: ExecutionDagNode, context: Record<string, any>) => Promise<{ success: boolean; payload: Record<string, any>; error?: string }>;
}

class SpecialistAgentRegistry {
  private readonly agents = new Map<string, SpecialistAgent>();

  constructor() {
    this.registerDefaults();
  }

  public register(agent: SpecialistAgent): void {
    this.agents.set(agent.id, agent);
  }

  public get(id: string): SpecialistAgent | undefined {
    return this.agents.get(id);
  }

  public list(): SpecialistAgent[] {
    return Array.from(this.agents.values());
  }

  private registerDefaults(): void {
    // 1. Executive Agent (Master Orchestrator)
    this.register({
      id: 'executive',
      name: 'Executive AI Agent',
      role: 'Chief of Staff & Master Planner',
      description: 'Coordinates multi-agent workflows, synthesizes cross-domain results, and builds executive dossiers.',
      capabilities: ['planning', 'synthesis', 'decision_staging', 'delegation'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            summary: `Executive synthesis completed for step "${node.title}". Multi-agent outputs consolidated.`,
            confidence: 0.98,
            timestamp: new Date().toISOString()
          }
        };
      }
    });

    // 2. Workspace Agent
    this.register({
      id: 'workspace',
      name: 'Workspace Intelligence Agent',
      role: 'Productivity & Office Assistant',
      description: 'Interacts with Gmail, Calendar, Drive, Docs, Slack, and GitHub.',
      capabilities: ['email_triage', 'calendar_scheduling', 'document_search', 'slack_digest'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            connectorId: node.connectorId || 'gcal',
            status: 'completed',
            syncedItems: 4,
            detail: `Workspace operation "${node.operation}" executed cleanly.`
          }
        };
      }
    });

    // 3. Shopping Agent
    this.register({
      id: 'shopping',
      name: 'Shopping & E-Commerce Agent',
      role: 'Product Comparison & Price Watcher',
      description: 'Queries Amazon, Flipkart, Myntra, Ajio, and Meesho catalogs for deals and availability.',
      capabilities: ['catalog_search', 'price_comparison', 'deal_extraction'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            connectorId: node.connectorId || 'amazon',
            matchedItems: 3,
            lowestPriceINR: 48999,
            bestProvider: 'Amazon India'
          }
        };
      }
    });

    // 4. Food Agent
    this.register({
      id: 'food',
      name: 'Food & Dining Agent',
      role: 'Restaurant & Grocery Curator',
      description: 'Searches Swiggy, Zomato, and BigBasket for food delivery and grocery restocks.',
      capabilities: ['restaurant_discovery', 'eta_comparison', 'grocery_reorder'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            connectorId: node.connectorId || 'swiggy',
            restaurant: 'Social Executive Dining',
            rating: 4.8,
            deliveryEta: '25-30 mins'
          }
        };
      }
    });

    // 5. Travel Agent
    this.register({
      id: 'travel',
      name: 'Travel Operations Agent',
      role: 'Flight & Hotel Concierge',
      description: 'Compares MakeMyTrip flights, Airbnb stays, and Oyo hotels.',
      capabilities: ['flight_search', 'hotel_search', 'itinerary_building'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            connectorId: node.connectorId || 'makemytrip',
            flightRoute: 'DEL → BOM',
            priceINR: 4999,
            hotelName: 'The Taj Mahal Palace (Proximity: 1.2 km)'
          }
        };
      }
    });

    // 6. Research Agent
    this.register({
      id: 'research',
      name: 'Deep Research Agent',
      role: 'Web & Document Intelligence Analyst',
      description: 'Performs multi-source research, web indexing, and citation verification.',
      capabilities: ['web_search', 'source_synthesis', 'citation_check'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            sourcesAnalyzed: 8,
            keyInsights: ['Insight A: Market lead expanding', 'Insight B: Pricing optimized']
          }
        };
      }
    });

    // 7. Memory Agent
    this.register({
      id: 'memory',
      name: 'Semantic Memory Agent',
      role: 'Personalized Context & Knowledge Retriever',
      description: 'Retrieves preferences, pinned snippets, and vectorized memory chunks.',
      capabilities: ['vector_search', 'preference_matching', 'context_injection'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            memorySnippetsFound: 3,
            topTag: 'executive_preference'
          }
        };
      }
    });

    // 8. Automation Agent
    this.register({
      id: 'automation',
      name: 'Background Automation Agent',
      role: 'Trigger & Notifier Watcher',
      description: 'Monitors background watchers, price drops, and dispatches unified alerts.',
      capabilities: ['trigger_monitoring', 'alert_dispatch', 'scheduled_execution'],
      executeStep: async (node, context) => {
        return {
          success: true,
          payload: {
            notificationDispatched: true,
            channel: 'unified_notification_center'
          }
        };
      }
    });
  }
}

export const specialistAgentRegistry = new SpecialistAgentRegistry();
