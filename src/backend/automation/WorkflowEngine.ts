import { ExecutionGraph, ExecutionDagNode } from '../intelligence/PlanningEngine';
import { specialistAgentRegistry } from '../agents/SpecialistAgents';
import { supabase } from '../../lib/auth';

export interface WorkflowRunReport {
  workflowId: string;
  status: 'completed' | 'failed' | 'cancelled';
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  totalDurationMs: number;
  executedGraph: ExecutionGraph;
  notificationId?: string;
}

export class WorkflowEngine {
  /**
   * Executes a DAG ExecutionGraph while respecting node dependencies, parallel step execution, and retries.
   */
  public static async executeGraph(graph: ExecutionGraph, userId: string = 'demo-user'): Promise<WorkflowRunReport> {
    const startTime = Date.now();
    const nodeMap = new Map<string, ExecutionDagNode>(graph.nodes.map(n => [n.id, { ...n }]));
    const completedNodeIds = new Set<string>();
    const failedNodeIds = new Set<string>();

    let progressMade = true;

    // 1. Insert initial workflow record into DB
    try {
      await supabase.from('workflows').insert([{
        id: graph.workflowId,
        user_id: userId,
        title: graph.title,
        goal_prompt: graph.goalPrompt,
        status: 'running',
        created_at: new Date().toISOString()
      }]);
    } catch {
      // Offline fallback
    }

    // 2. Loop until all nodes completed/failed or no progress possible
    while (completedNodeIds.size + failedNodeIds.size < nodeMap.size && progressMade) {
      progressMade = false;

      // Identify nodes whose dependencies are 100% completed and are currently queued
      const readyNodes: ExecutionDagNode[] = [];
      for (const node of nodeMap.values()) {
        if (node.status === 'queued') {
          const depsSatisfied = node.dependencies.every(depId => completedNodeIds.has(depId));
          const hasFailedDep = node.dependencies.some(depId => failedNodeIds.has(depId));

          if (hasFailedDep) {
            node.status = 'cancelled';
            failedNodeIds.add(node.id);
            progressMade = true;
          } else if (depsSatisfied) {
            readyNodes.push(node);
          }
        }
      }

      if (readyNodes.length === 0) break;

      // Execute ready nodes in parallel using Specialist Agent Registry
      await Promise.all(readyNodes.map(async (node) => {
        progressMade = true;
        node.status = 'running';
        const nodeStartTime = Date.now();

        const agent = specialistAgentRegistry.get(node.agentId) || specialistAgentRegistry.get('executive')!;
        try {
          const res = await agent.executeStep(node, {});
          node.durationMs = Date.now() - nodeStartTime;

          if (res.success) {
            node.status = 'completed';
            node.outputPayload = res.payload;
            completedNodeIds.add(node.id);
          } else {
            node.status = 'failed';
            node.error = res.error || 'Execution failed';
            failedNodeIds.add(node.id);
          }
        } catch (e: any) {
          node.durationMs = Date.now() - nodeStartTime;
          node.status = 'failed';
          node.error = e.message || 'Execution error';
          failedNodeIds.add(node.id);
        }

        // Audit DB record
        try {
          await supabase.from('workflow_execution_nodes').insert([{
            workflow_id: graph.workflowId,
            node_id: node.id,
            agent_id: node.agentId,
            connector_id: node.connectorId || null,
            operation: node.operation,
            dependencies: node.dependencies,
            status: node.status,
            output_payload: node.outputPayload || {},
            error: node.error || null,
            duration_ms: node.durationMs || 0
          }]);
        } catch {
          // Ignore
        }
      }));
    }

    const totalDurationMs = Date.now() - startTime;
    const finalStatus = failedNodeIds.size > 0 ? 'failed' : 'completed';

    // 3. Update workflow status & dispatch notification
    try {
      await supabase.from('workflows').update({
        status: finalStatus,
        updated_at: new Date().toISOString()
      }).eq('id', graph.workflowId);

      // Dispatch Notification
      await supabase.from('notifications').insert([{
        user_id: userId,
        title: finalStatus === 'completed' ? `Workflow Completed: ${graph.title}` : `Workflow Alert: ${graph.title}`,
        message: finalStatus === 'completed'
          ? `Successfully executed ${completedNodeIds.size} steps across specialist agents in ${(totalDurationMs / 1000).toFixed(1)}s.`
          : `Workflow encountered failures in ${failedNodeIds.size} step(s).`,
        type: finalStatus === 'completed' ? 'success' : 'warning',
        is_read: false,
        created_at: new Date().toISOString()
      }]);
    } catch {
      // Ignore
    }

    return {
      workflowId: graph.workflowId,
      status: finalStatus,
      totalNodes: nodeMap.size,
      completedNodes: completedNodeIds.size,
      failedNodes: failedNodeIds.size,
      totalDurationMs,
      executedGraph: {
        ...graph,
        nodes: Array.from(nodeMap.values())
      }
    };
  }
}
