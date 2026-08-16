// Contril AI OS - Authentication REST Router
import { Router, Request, Response } from 'express';
import { AuthService } from './AuthService';
import { CustomOtpService } from './CustomOtpService';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../database/supabaseAdmin';

const router = Router();

// Custom OTP Endpoints
router.post('/custom-otp/send', async (req: Request, res: Response) => {
  try {
    const { email, userId, isRecovery } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });
    const result = await CustomOtpService.createAndSendOtp(email, userId, isRecovery);
    return res.json(result);
  } catch (error: any) {
    console.error(`[Router Exception] /custom-otp/send error:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate and dispatch OTP.' });
  }
});

router.post('/custom-otp/verify', async (req: Request, res: Response) => {
  try {
    const { email, code, type } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, error: 'Email and verification code are required.' });
    const result = await CustomOtpService.verifyCustomOtp(email, code, type);
    return res.json(result);
  } catch (error: any) {
    console.error(`[Router Exception] /custom-otp/verify error:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to verify OTP.' });
  }
});

router.post('/custom-otp/resend', async (req: Request, res: Response) => {
  try {
    const { email, isRecovery } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });
    const result = await CustomOtpService.resendOtp(email, isRecovery);
    return res.json(result);
  } catch (error: any) {
    console.error(`[Router Exception] /custom-otp/resend error:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to resend OTP.' });
  }
});

router.post('/custom-otp/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ success: false, error: 'Email, code, and password are required.' });
    }
    const result = await CustomOtpService.resetPassword(email, code, password);
    return res.json(result);
  } catch (error: any) {
    console.error(`[Router Exception] /custom-otp/reset-password error:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to reset password.' });
  }
});

// 1. Send OTP Email
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });
    const result = await AuthService.sendOtp(email);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Verify OTP and Sign In / Onboard
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, code, fullName, persona, companyName, workspaceName, plan } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, error: 'Email and verification code are required.' });
    const result = await AuthService.verifyOtp({ email, code, fullName, persona, companyName, workspaceName, plan });
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// 3. OAuth Sign In
router.post('/oauth', async (req: Request, res: Response) => {
  try {
    const { provider, email, fullName, providerToken, persona, companyName, workspaceName, plan } = req.body;
    if (!email || !provider) return res.status(400).json({ success: false, error: 'Provider and email required.' });
    const result = await AuthService.oauthSignIn(provider, { email, fullName, providerToken, persona, companyName, workspaceName, plan });
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Email Signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, fullName, persona, companyName, workspaceName, plan, activationCode } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ success: false, error: 'Email and fullName are required.' });
    }
    const result = await AuthService.register({ email, fullName, persona, companyName, workspaceName, plan, activationCode });
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// 5. Email Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // A. Check if user exists in Supabase Auth
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error(`[Supabase Admin listUsers Error]:`, listErr.message);
      return res.status(500).json({ success: false, error: 'Failed to verify user credentials.' });
    }

    const existingUser = (userList.users as Array<{ id: string; email?: string }>).find(user => user.email?.toLowerCase() === cleanEmail);
    if (!existingUser) {
      return res.status(400).json({ success: false, error: 'USER_NOT_FOUND' });
    }

    // B. Verify user password using a temporary client instance
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: authData, error: authErr } = await tempClient.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (authErr) {
      console.warn(`[Login Error Match] Incorrect password for ${cleanEmail}:`, authErr.message);
      return res.status(400).json({ success: false, error: 'INCORRECT_PASSWORD' });
    }

    return res.json({
      success: true,
      session: authData.session,
      user: {
        id: authData.user?.id,
        email: (authData.user as { email?: string } | null)?.email,
        name: authData.user?.user_metadata?.full_name || ''
      }
    });

  } catch (error: any) {
    console.error(`[Router Exception] /login error:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Login failed.' });
  }
});

// 6. Refresh Token Exchange
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'RefreshToken required' });
    const result = await AuthService.refreshToken(refreshToken);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(401).json({ success: false, error: error.message });
  }
});

// 6b. Refresh Google OAuth Token
router.post('/refresh-google-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, error: 'Google refreshToken required' });

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    if (!clientId || !clientSecret || clientId.includes('CONTRIL_') || clientSecret.includes('CONTRIL_')) {
      console.warn('[Google Token Refresh] Google Client credentials not configured. Returning local development fallback token.');
      return res.json({
        success: true,
        accessToken: 'mock_google_access_token_dev_refreshed_' + Date.now(),
        expiresIn: 3600
      });
    }

    console.log('[Google Token Refresh] Exchanging refresh token with Google OAuth api...');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[Google Token Refresh] Successfully refreshed Google access token.');
      return res.json({ success: true, accessToken: data.access_token, expiresIn: data.expires_in });
    }

    const errBody = await response.text();
    console.error('[Google Token Refresh Error] Google API rejected token exchange:', errBody);
    return res.status(400).json({ success: false, error: 'Failed to refresh token with Google: ' + errBody });
  } catch (error: any) {
    console.error('[Google Token Refresh Exception]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Forgot Password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if the user exists in Supabase
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error(`[Supabase Admin listUsers Error]:`, listErr.message);
      return res.status(500).json({ success: false, error: 'Failed to verify user account existence.' });
    }

    const existingUser = (userList.users as Array<{ id: string; email?: string }>).find(user => user.email?.toLowerCase() === cleanEmail);
    if (!existingUser) {
      return res.status(400).json({ success: false, error: 'USER_NOT_FOUND' });
    }

    // Invalidate previous OTP codes for this email
    await supabaseAdmin.from('email_verification_codes').delete().eq('email', cleanEmail);

    // Generate and send OTP for password recovery
    const otpResult = await CustomOtpService.createAndSendOtp(cleanEmail, (existingUser as { id: string }).id, true);
    return res.json(otpResult);

  } catch (error: any) {
    console.error(`[Router Exception] /forgot-password error:`, error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to dispatch recovery code.' });
  }
});

// 8. Logout
router.post('/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] || '';
  const result = await AuthService.logout(token);
  return res.json(result);
});

export default router;
