// Contril AI OS - Beta Access System REST Router
import { Router, Request, Response } from 'express';
import { BetaService } from './BetaService';
import { SecurityMiddleware } from '../security/SecurityMiddleware';

const router = Router();

// Middleware: Admin Guard
router.use(SecurityMiddleware.requireRole(['super_admin', 'org_admin']));

// 1. Generate Beta Accounts (Single or Bulk 50, 100, 500)
router.post('/generate', (req: Request, res: Response) => {
  try {
    const { count, plan, expiryDays, notes, reviewerName } = req.body;
    const accounts = BetaService.generateBetaAccounts({
      count: parseInt(count, 10) || 1,
      plan,
      expiryDays: parseInt(expiryDays, 10) || 180,
      notes,
      reviewerName
    });
    return res.json({
      success: true,
      message: `Successfully generated ${accounts.length} beta account(s).`,
      count: accounts.length,
      accounts
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. List & Search Beta Accounts
router.get('/accounts', (req: Request, res: Response) => {
  const { search, status } = req.query;
  const accounts = BetaService.searchBetaAccounts(search as string, status as string);
  return res.json({ success: true, count: accounts.length, accounts });
});

// 3. Export Accounts in CSV Format
router.get('/export/csv', (req: Request, res: Response) => {
  const csvData = BetaService.exportCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=contril-beta-accounts-${Date.now()}.csv`);
  return res.send(csvData);
});

// 4. Update Account Status (Activate, Suspend, Deactivate)
router.patch('/accounts/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = BetaService.updateAccountStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ success: false, error: 'Beta account not found' });
  return res.json({ success: true, account: updated });
});

// 5. Extend Account Expiry
router.post('/accounts/:id/extend', (req: Request, res: Response) => {
  const { days } = req.body;
  const updated = BetaService.extendExpiry(req.params.id, parseInt(days, 10) || 30);
  if (!updated) return res.status(404).json({ success: false, error: 'Beta account not found' });
  return res.json({ success: true, account: updated });
});

// 6. Reset Temp Password
router.post('/accounts/:id/reset-password', (req: Request, res: Response) => {
  const updated = BetaService.resetTempPassword(req.params.id);
  if (!updated) return res.status(404).json({ success: false, error: 'Beta account not found' });
  return res.json({ success: true, account: updated });
});

// 7. Delete Beta Account
router.delete('/accounts/:id', (req: Request, res: Response) => {
  const deleted = BetaService.deleteAccount(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: 'Beta account not found' });
  return res.json({ success: true, message: 'Beta account deleted' });
});

export default router;
