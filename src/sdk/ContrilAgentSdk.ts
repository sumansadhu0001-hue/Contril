import { ExecutionDagNode } from '../backend/intelligence/PlanningEngine';

export interface AgentManifest {
  id: string;
  name: string;
  role: string;
  description: string;
  version: string;
  capabilities: string[];
  requiredConnectors?: string[];
}

export abstract class ContrilAgent {
  public abstract readonly manifest: AgentManifest;

  public abstract executeStep(
    node: ExecutionDagNode,
    context: Record<string, any>
  ): Promise<{ success: boolean; payload: Record<string, any>; error?: string }>;
}
