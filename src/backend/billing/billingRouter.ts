// Contril AI OS - Payments & Billing REST Router
import { Router, Request, Response } from 'express';
import { StripeService } from './StripeService';

const router = Router();

// 1. Create Checkout Session
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body;
    const user = (req as any).user;
    const session = await StripeService.createCheckoutSession({
      userId: user.id,
      plan: plan || 'PRO',
      successUrl: successUrl || 'http://localhost:3000/#billing?success=true',
      cancelUrl: cancelUrl || 'http://localhost:3000/#billing?canceled=true'
    });
    return res.json({ success: true, ...session });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Stripe Webhook Handler Endpoint
router.post('/webhook', (req: Request, res: Response) => {
  const event = req.body;
  const result = StripeService.handleWebhook(event);
  return res.json(result);
});

// 3. List User Invoices
router.get('/invoices', (req: Request, res: Response) => {
  const invoices = StripeService.getInvoices();
  return res.json({ success: true, invoices });
});

// 4. Cancel Subscription
router.post('/cancel', (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = StripeService.cancelSubscription(user.id);
  return res.json(result);
});

export default router;
