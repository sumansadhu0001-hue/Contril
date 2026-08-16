export interface ArchitectureModuleSpec {
  name: string;
  category: 'core' | 'intelligence' | 'connectors' | 'security' | 'developer' | 'enterprise';
  status: 'production_ready';
  version: string;
  description: string;
}

export class ContrilArchitectureRegistry {
  public static readonly VERSION = '1.0.0';
  public static readonly RELEASE_NAME = 'Contril AI OS v1.0 Production Gold';

  public static getModules(): ArchitectureModuleSpec[] {
    return [
      { name: 'Universal Intent Engine', category: 'intelligence', status: 'production_ready', version: '1.0.0', description: 'Multi-domain intent classification & entity resolution' },
      { name: 'DAG Planning Engine', category: 'intelligence', status: 'production_ready', version: '1.0.0', description: 'Cycle-validated execution graph builder' },
      { name: 'Specialist Agent Coordinator', category: 'intelligence', status: 'production_ready', version: '1.0.0', description: '8 specialized agent role execution engine' },
      { name: 'Universal Connector Registry', category: 'connectors', status: 'production_ready', version: '1.0.0', description: 'Workspace, Shopping, Food, Travel & Developer connectors' },
      { name: 'Personal Context Builder & Knowledge Graph', category: 'core', status: 'production_ready', version: '1.0.0', description: 'User consent context assembly & relationship graph' },
      { name: 'Native Background Service & Battery Saver', category: 'core', status: 'production_ready', version: '1.0.0', description: 'Low-power background sync & offline queue replay' },
      { name: 'Multi-Tenant Organization Service & RBAC', category: 'enterprise', status: 'production_ready', version: '1.0.0', description: 'Isolated tenant hierarchy, RBAC matrix, and approvals' },
      { name: 'Contril Developer Platform & SDKs', category: 'developer', status: 'production_ready', version: '1.0.0', description: 'Public REST API /api/v1, Connector SDK, Agent SDK, Webhooks' },
      { name: 'Marketplace & Extension Ecosystem', category: 'developer', status: 'production_ready', version: '1.0.0', description: 'Verified extension catalog with permission guard' },
      { name: 'Enterprise Security Guard', category: 'security', status: 'production_ready', version: '1.0.0', description: 'CSP, HSTS, Rate Limiting, MFA TOTP, and session revocation' }
    ];
  }
}
