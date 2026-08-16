// Contril AI OS - Subscription Plans & Feature Gating Router
import { Router, Request, Response, NextFunction } from 'express';
import { PlanService, PlanTier } from './PlanService';
import { entitlementService } from './EntitlementService';

const router = Router();

// Middleware generator for feature gating
export function requireFeature(featureKey: any, minRequiredPlan: PlanTier = 'PRO') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id || 'demo-user';
    const result = await entitlementService.checkEntitlement(userId, featureKey);

    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        error: `Upgrade Required: Feature '${featureKey}' requires ${result.requiredPlan?.toUpperCase()} plan.`,
        entitlement: result
      });
    }

    next();
  };
}

// 1. List All Available Subscription Plans
router.get('/plans', (req: Request, res: Response) => {
  return res.json({
    success: true,
    plans: Object.values(PlanService.plans)
  });
});

// 2. Current User Subscription Details
router.get('/subscriptions/current', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.query.userId as string || 'demo-user';
    const subscription = await entitlementService.getUserSubscription(userId);
    const usage = await entitlementService.getUsageTracking(userId);

    return res.json({
      success: true,
      subscription,
      usage
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Dynamic Entitlement Check
router.post('/subscriptions/check-entitlement', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId || 'demo-user';
    const { featureKey, requestedUnits } = req.body;
    if (!featureKey) return res.status(400).json({ success: false, error: 'featureKey required' });

    const result = await entitlementService.checkEntitlement(userId, featureKey, requestedUnits || 1);
    return res.json({ success: true, entitlement: result });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 4. Record Unit Consumption
router.post('/subscriptions/record-usage', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.body.userId || 'demo-user';
    const { featureKey, units } = req.body;
    if (!featureKey) return res.status(400).json({ success: false, error: 'featureKey required' });

    await entitlementService.recordUsage(userId, featureKey, units || 1);
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 5. Legacy Feature Check Endpoint
router.get('/feature-check/:featureKey', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 'demo-user';
  const featureKey = req.params.featureKey;
  const result = await entitlementService.checkEntitlement(userId, featureKey);

  return res.json({
    allowed: result.allowed,
    entitlement: result
  });
});

export default router;
