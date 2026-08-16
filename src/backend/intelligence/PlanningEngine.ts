export type NodeExecutionStatus = 'queued' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionDagNode {
  id: string;
  workflowId?: string;
  agentId: 'executive' | 'workspace' | 'shopping' | 'food' | 'travel' | 'research' | 'memory' | 'automation';
  connectorId?: string;
  operation: string;
  title: string;
  description: string;
  dependencies: string[]; // List of parent node IDs that must finish before this node runs
  status: NodeExecutionStatus;
  outputPayload?: Record<string, any>;
  error?: string;
  durationMs?: number;
}

export interface ExecutionGraph {
  workflowId: string;
  title: string;
  goalPrompt: string;
  nodes: ExecutionDagNode[];
  createdAt: string;
}

export class PlanningEngine {
  /**
   * Intelligently parses goal prompt and generates a Directed Acyclic Graph (DAG) execution plan.
   */
  public static async createExecutionGraph(goalPrompt: string, userId: string = 'demo-user'): Promise<ExecutionGraph> {
    const promptLower = goalPrompt.toLowerCase();
    const workflowId = `wf-${Date.now()}`;
    const nodes: ExecutionDagNode[] = [];

    // Pattern 1: Travel & Meeting Coordination ("Meeting tomorrow", "Book flight for trip", "Hotel near meeting")
    if (promptLower.includes('meeting') || promptLower.includes('hotel') || promptLower.includes('flight') || promptLower.includes('travel') || promptLower.includes('trip')) {
      nodes.push({
        id: 'step-1',
        workflowId,
        agentId: 'workspace',
        connectorId: 'gcal',
        operation: 'read_calendar_schedule',
        title: 'Check Calendar Schedule',
        description: 'Read upcoming meeting events and location requirements from Google Calendar.',
        dependencies: [],
        status: 'queued'
      });

      nodes.push({
        id: 'step-2',
        workflowId,
        agentId: 'travel',
        connectorId: 'makemytrip',
        operation: 'search_flights',
        title: 'Search Flight Options',
        description: 'Query MakeMyTrip connector for optimal flight routes and pricing.',
        dependencies: ['step-1'],
        status: 'queued'
      });

      nodes.push({
        id: 'step-3',
        workflowId,
        agentId: 'travel',
        connectorId: 'airbnb',
        operation: 'search_hotels',
        title: 'Search Hotel Stays',
        description: 'Search nearby 4-star and 5-star hotels relative to meeting venue.',
        dependencies: ['step-1'],
        status: 'queued'
      });

      nodes.push({
        id: 'step-4',
        workflowId,
        agentId: 'executive',
        operation: 'synthesize_travel_recommendation',
        title: 'Synthesize Recommendation',
        description: 'Compare flights, hotel locations, and budget to build executive itinerary dossier.',
        dependencies: ['step-2', 'step-3'],
        status: 'queued'
      });

      nodes.push({
        id: 'step-5',
        workflowId,
        agentId: 'automation',
        operation: 'dispatch_user_notification',
        title: 'Notify Executive',
        description: 'Send notification alert and stage 1-click booking card.',
        dependencies: ['step-4'],
        status: 'queued'
      });

      return {
        workflowId,
        title: 'Travel & Meeting Coordination Pipeline',
        goalPrompt,
        nodes,
        createdAt: new Date().toISOString()
      };
    }

    // Pattern 2: Shopping Comparison & Price Watch ("Compare laptop", "Cheapest phone", "Price drop")
    if (promptLower.includes('compare') || promptLower.includes('laptop') || promptLower.includes('shopping') || promptLower.includes('price')) {
      nodes.push({
        id: 'step-1',
        workflowId,
        agentId: 'shopping',
        connectorId: 'amazon',
        operation: 'search_amazon_catalog',
        title: 'Search Amazon Catalog',
        description: 'Query Amazon India API for product specs, prices, and ratings.',
        dependencies: [],
        status: 'queued'
      });

      nodes.push({
        id: 'step-2',
        workflowId,
        agentId: 'shopping',
        connectorId: 'flipkart',
        operation: 'search_flipkart_catalog',
        title: 'Search Flipkart Catalog',
        description: 'Query Flipkart connector in parallel for price and deal matching.',
        dependencies: [],
        status: 'queued'
      });

      nodes.push({
        id: 'step-3',
        workflowId,
        agentId: 'executive',
        operation: 'aggregate_shopping_deals',
        title: 'Compare Prices & Delivery',
        description: 'Cross-aggregate products and identify lowest price provider.',
        dependencies: ['step-1', 'step-2'],
        status: 'queued'
      });

      nodes.push({
        id: 'step-4',
        workflowId,
        agentId: 'automation',
        operation: 'register_price_watcher',
        title: 'Attach Price Drop Watcher',
        description: 'Set background rule to alert if price drops below target threshold.',
        dependencies: ['step-3'],
        status: 'queued'
      });

      return {
        workflowId,
        title: 'Multi-Provider Shopping Aggregation Pipeline',
        goalPrompt,
        nodes,
        createdAt: new Date().toISOString()
      };
    }

    // Default Fallback Pattern: Workspace Document & Email Synthesis
    nodes.push({
      id: 'step-1',
      workflowId,
      agentId: 'workspace',
      connectorId: 'gdrive',
      operation: 'search_drive_documents',
      title: 'Search Workspace Drive',
      description: 'Locate relevant documents, proposals, and contract files.',
      dependencies: [],
      status: 'queued'
    });

    nodes.push({
      id: 'step-2',
      workflowId,
      agentId: 'memory',
      operation: 'vector_search_memory',
      title: 'Retrieve Semantic Memory',
      description: 'Query vector memory bank for relevant user context.',
      dependencies: [],
      status: 'queued'
    });

    nodes.push({
      id: 'step-3',
      workflowId,
      agentId: 'executive',
      operation: 'synthesize_executive_brief',
      title: 'Synthesize Executive Briefing',
      description: 'Combine document content and memory context into actionable intelligence.',
      dependencies: ['step-1', 'step-2'],
      status: 'queued'
    });

    return {
      workflowId,
      title: 'Workspace Intelligence & Document Audit Pipeline',
      goalPrompt,
      nodes,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Validates that DAG execution nodes contain no circular dependencies.
   */
  public static validateDag(nodes: ExecutionDagNode[]): boolean {
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const dfs = (id: string): boolean => {
      visited.add(id);
      inStack.add(id);

      const node = nodeMap.get(id);
      if (node) {
        for (const depId of node.dependencies) {
          if (!visited.has(depId)) {
            if (dfs(depId)) return true;
          } else if (inStack.has(depId)) {
            return true; // Cycle detected!
          }
        }
      }

      inStack.delete(id);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return false; // Invalid DAG due to cycle
      }
    }

    return true;
  }
}
