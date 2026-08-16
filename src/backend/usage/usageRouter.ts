// Contril AI OS - Usage Metrics REST Router
import { Router, Request, Response } from 'express';
import { UsageTracker } from './UsageTracker';

const router = Router();

// 1. Get Current User Usage
router.get('/metrics', (req: Request, res: Response) => {
  const user = (req as any).user;
  const usage = UsageTracker.getUsage(user?.id || 'usr_suman_exec_01');
  return res.json({ success: true, usage });
});

// 2. Track Usage Event
router.post('/track', (req: Request, res: Response) => {
  const user = (req as any).user;
  const { metric, amount } = req.body;
  if (!metric) return res.status(400).json({ success: false, error: 'Metric name is required.' });
  const updated = UsageTracker.incrementUsage(user?.id || 'usr_suman_exec_01', metric, amount || 1);
  return res.json({ success: true, usage: updated });
});

export default router;
