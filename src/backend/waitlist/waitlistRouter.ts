// Contril AI OS - Waitlist Public & Admin REST Router
import { Router, Request, Response } from 'express';
import { WaitlistService } from './WaitlistService';
import { SecurityMiddleware } from '../security/SecurityMiddleware';

const router = Router();

// Public: Join Waitlist
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { email, name, country, company, selectedPlan } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Email and Name are required.' });
    }
    const entry = await WaitlistService.joinWaitlist({ email, name, country, company, selectedPlan });
    return res.json({
      success: true,
      message: 'You have been added to the Contril Beta Waitlist. We will notify you once approved.',
      waitlistEntry: entry
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Only Endpoints
router.get('/list', SecurityMiddleware.requireRole(['super_admin', 'org_admin']), async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const list = await WaitlistService.listWaitlist(status as string);
    return res.json({ success: true, count: list.length, waitlist: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/approve/:id', SecurityMiddleware.requireRole(['super_admin', 'org_admin']), async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user;
    const adminId = adminUser ? adminUser.id : 'admin';
    const approved = await WaitlistService.approveWaitlistEntry(req.params.id, adminId);
    if (!approved) return res.status(404).json({ success: false, error: 'Waitlist entry not found' });
    return res.json({
      success: true,
      message: 'User approved! Beta invitation code created.',
      waitlistEntry: approved
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reject/:id', SecurityMiddleware.requireRole(['super_admin', 'org_admin']), async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user;
    const adminId = adminUser ? adminUser.id : 'admin';
    const { reason } = req.body;
    const rejected = await WaitlistService.rejectWaitlistEntry(req.params.id, adminId, reason);
    if (!rejected) return res.status(404).json({ success: false, error: 'Waitlist entry not found' });
    return res.json({ success: true, message: 'Waitlist entry rejected.', waitlistEntry: rejected });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
