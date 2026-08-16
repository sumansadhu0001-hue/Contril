// Contril AI OS - REST API Router (V1 Enterprise Endpoints)
import { Router, Request, Response } from 'express';
import { AiOrchestrator } from '../orchestrator/AiOrchestrator';
import { AgentSystem } from '../agents/AgentSystem';
import { MemoryEngine } from '../memory/MemoryEngine';
import { AutomationEngine } from '../automation/AutomationEngine';
import { BackgroundWorkers, JobType } from '../workers/BackgroundWorkers';
import { SecurityMiddleware } from '../security/SecurityMiddleware';
import { AdminBackend } from '../admin/AdminBackend';
import { InquiriesService } from '../inquiries/InquiriesService';
import { connectorRegistry } from '../connectors/ConnectorRegistry';
import { registerDefaultAgents } from '../intelligence/registerDefaultAgents';
import { universalAgentRouter } from '../intelligence/AgentRouter';

import authRouter from '../auth/authRouter';
import betaRouter from '../beta/betaRouter';
import waitlistRouter from '../waitlist/waitlistRouter';
import planRouter from '../subscriptions/planRouter';
import adminRouter from '../admin/adminRouter';
import billingRouter from '../billing/billingRouter';
import usageRouter from '../usage/usageRouter';
import integrationsRouter from '../integrations/integrationsRouter';
import googleWorkspaceRouter from '../integrations/googleWorkspaceRouter';
import outlookRouter from '../integrations/outlookRouter';
import docsRouter from './docsRouter';

const router = Router();

// Public / Documentation Sub-Routers
router.use('/docs', docsRouter);
router.use('/auth', authRouter);
router.use('/waitlist', waitlistRouter);

// Middleware: Authenticate All Other V1 API Requests
router.use(SecurityMiddleware.authenticateToken);

// Authenticated Sub-Routers
router.use('/beta', betaRouter);
router.use('/subscriptions', planRouter);
router.use('/admin-panel', adminRouter);
router.use('/billing', billingRouter);
router.use('/usage', usageRouter);
router.use('/integrations', integrationsRouter);
router.use('/integrations/google', googleWorkspaceRouter);
router.use('/integrations/outlook', outlookRouter);


// ---------------------------------------------------------------------------
// 1. System Health Endpoint
// ---------------------------------------------------------------------------
router.get('/health', (req: Request, res: Response) => {
  const metrics = AdminBackend.getSystemMetrics();
  res.json({ success: true, apiVersion: 'v1', status: 'operational', metrics });
});

// ---------------------------------------------------------------------------
// 2. AI Orchestrator Endpoint
// ---------------------------------------------------------------------------
router.post('/orchestrate', async (req: Request, res: Response) => {
  try {
    const { prompt, agentId, contextData } = req.body;
    const user = (req as any).user;

    const result = await AiOrchestrator.execute({
      userId: user.id,
      userPrompt: prompt || 'Synthesize executive priorities for today',
      requestedAgentId: agentId,
      contextData
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Phase 5.1 universal engine: generic, workspace-scoped and provider-neutral.
router.post('/ai-engine/execute', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AiOrchestrator.executeUniversal({
    workspaceId: req.body.workspaceId || user.organizationId,
    userId: user.id,
    prompt: req.body.prompt || '',
    permissions: req.body.permissions || [],
    enabledFeatures: req.body.enabledFeatures || [],
    requestedAgentId: req.body.agentId,
    contextData: req.body.contextData
  });
  res.status(result.success ? 200 : 400).json(result);
});

router.post('/ai-engine/stream', async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const stream = AiOrchestrator.streamUniversal({
    workspaceId: req.body.workspaceId || user.organizationId,
    userId: user.id,
    prompt: req.body.prompt || '',
    permissions: req.body.permissions || [],
    enabledFeatures: req.body.enabledFeatures || [],
    requestedAgentId: req.body.agentId,
    contextData: req.body.contextData
  });
  for await (const event of stream) res.write(`event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`);
  res.end();
});

router.get('/ai-engine/agents', (_req: Request, res: Response) => {
  registerDefaultAgents();
  res.json({ success: true, agents: universalAgentRouter.list() });
});

router.get('/ai-engine/connectors', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const context = { workspaceId: user?.organizationId || 'default_org', userId: user?.id || 'default_user', permissions: [] };
  
  const list = await Promise.all(
    connectorRegistry.list().map(async connector => {
      const configured = await connector.isConfigured(context);
      const available = await connector.isAvailable(context);
      const enabled = await connector.isEnabled(context);
      return {
        id: connector.id,
        name: connector.name,
        category: connector.category,
        configured,
        available,
        enabled
      };
    })
  );
  
  res.json({ success: true, connectors: list });
});

// ---------------------------------------------------------------------------
// 3. AI Agents Registry Endpoints
// ---------------------------------------------------------------------------
router.get('/agents', (req: Request, res: Response) => {
  res.json({ success: true, agents: Object.values(AgentSystem.getAgent) });
});

router.get('/agents/:id', (req: Request, res: Response) => {
  const agent = AgentSystem.getAgent(req.params.id);
  res.json({ success: true, agent });
});

// ---------------------------------------------------------------------------
// 4. Memory Engine Endpoints
// ---------------------------------------------------------------------------
router.post('/memory/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const user = (req as any).user;
    const result = await MemoryEngine.searchMemory(query || '', user.id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/memory/save', async (req: Request, res: Response) => {
  try {
    const { type, title, snippet, tags } = req.body;
    const saved = await MemoryEngine.saveMemoryItem({ type, title, snippet, tags: tags || [] });
    res.json({ success: true, memoryItem: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/memory/preferences', (req: Request, res: Response) => {
  const prefs = MemoryEngine.getUserPreferences();
  res.json({ success: true, preferences: prefs });
});

// ---------------------------------------------------------------------------
// 5. Automation Engine Endpoints
// ---------------------------------------------------------------------------
router.get('/automation/workflows', async (req: Request, res: Response) => {
  const workflows = await AutomationEngine.listWorkflows();
  res.json({ success: true, workflows });
});

router.post('/automation/run', async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.body;
    const result = await AutomationEngine.executeWorkflow(workflowId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/automation/log', async (req: Request, res: Response) => {
  const log = await AutomationEngine.getAutonomousLog();
  res.json({ success: true, autonomousLog: log });
});

// ---------------------------------------------------------------------------
// 6. Background Workers Endpoints
// ---------------------------------------------------------------------------
router.post('/workers/enqueue', async (req: Request, res: Response) => {
  try {
    const { jobType, payload } = req.body;
    const job = await BackgroundWorkers.enqueueJob(jobType as JobType, payload || {});
    res.json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/workers/status/:id', (req: Request, res: Response) => {
  const job = BackgroundWorkers.getJobStatus(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  res.json({ success: true, job });
});

router.get('/workers/stats', (req: Request, res: Response) => {
  const stats = BackgroundWorkers.getActiveWorkerStats();
  res.json({ success: true, stats });
});

// ---------------------------------------------------------------------------
// 7. Admin & Security Endpoints
// ---------------------------------------------------------------------------
router.get('/admin/overview', SecurityMiddleware.requireRole(['super_admin', 'org_admin']), (req: Request, res: Response) => {
  const overview = AdminBackend.getAdminOverview();
  res.json({ success: true, overview });
});

// ---------------------------------------------------------------------------
// 8. Executive Plan Inquiries Endpoints
// ---------------------------------------------------------------------------
router.post('/inquiries', async (req: Request, res: Response) => {
  try {
    const inquiry = await InquiriesService.createInquiry(req.body);
    res.json({ success: true, referenceId: inquiry.referenceId, inquiry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/inquiries', SecurityMiddleware.requireRole(['super_admin', 'org_admin']), async (req: Request, res: Response) => {
  try {
    const { search, status, sortBy } = req.query;
    const inquiries = await InquiriesService.listInquiries({
      search: search as string,
      status: status as string,
      sortBy: sortBy as any
    });
    res.json({ success: true, inquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/inquiries/:id', SecurityMiddleware.requireRole(['super_admin', 'org_admin']), async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const updated = await InquiriesService.updateInquiryStatus(req.params.id, status, notes);
    if (!updated) return res.status(404).json({ success: false, error: 'Inquiry not found' });
    res.json({ success: true, inquiry: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/inquiries/:id', SecurityMiddleware.requireRole(['super_admin', 'org_admin']), async (req: Request, res: Response) => {
  try {
    const deleted = await InquiriesService.deleteInquiry(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Inquiry not found' });
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
