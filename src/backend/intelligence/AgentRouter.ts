import { AgentDescriptor, IntentName } from './types';

export class AgentRouter {
  private readonly agents = new Map<string, AgentDescriptor>();

  public register(agent: AgentDescriptor): void {
    this.agents.set(agent.id, agent);
  }

  public resolve(intent: IntentName, permissions: string[] = []): AgentDescriptor | null {
    return [...this.agents.values()].find(agent =>
      agent.supportedIntents.includes(intent) && agent.requiredPermissions.every(permission => permissions.includes(permission))
    ) || null;
  }

  public resolveMulti(intents: IntentName[], permissions: string[] = []): AgentDescriptor[] {
    const matched = new Map<string, AgentDescriptor>();
    intents.forEach(intent => {
      const agent = this.resolve(intent, permissions);
      if (agent) matched.set(agent.id, agent);
    });
    return [...matched.values()];
  }

  public list(): AgentDescriptor[] {
    return [...this.agents.values()];
  }
}

export const universalAgentRouter = new AgentRouter();
