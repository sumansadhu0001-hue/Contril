// Contril AI OS - Payments & Billing REST Router
import { Router, Request, Response } from 'express';
import { StripeService } from './StripeService';
import { supabaseAdmin } from '../database/supabaseAdmin';

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

// 3. Razorpay Webhook Handler Endpoint (Future-Proofed for automated link & checkout confirmation)
router.post('/razorpay-webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const eventType = event.event;
    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === 'payment_link.paid' || eventType === 'payment.captured' || eventType === 'order.paid') {
      const payload = event.payload?.payment?.entity || event.payload?.payment_link?.entity || {};
      const customerEmail = payload.email || payload.customer?.email;
      const notes = payload.notes || {};
      const userId = notes.user_id;

      if (customerEmail || userId) {
        console.log(`[Razorpay Webhook] Activating Pro tier for ${customerEmail || userId}`);
        if (userId) {
          await supabaseAdmin.from('profiles').update({
            is_paid: true,
            plan: 'Pro',
            subscription_status: 'ACTIVE_PRO'
          }).eq('id', userId);
        } else if (customerEmail) {
          await supabaseAdmin.from('profiles').update({
            is_paid: true,
            plan: 'Pro',
            subscription_status: 'ACTIVE_PRO'
          }).eq('email', customerEmail);
        }
      }
    }

    return res.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 4. List User Invoices
router.get('/invoices', (req: Request, res: Response) => {
  const invoices = StripeService.getInvoices();
  return res.json({ success: true, invoices });
});

// 5. Cancel Subscription
router.post('/cancel', (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = StripeService.cancelSubscription(user.id);
  return res.json(result);
});

export default router;
