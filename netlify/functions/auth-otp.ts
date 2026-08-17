import { Handler } from '@netlify/functions';
import crypto from 'crypto';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qjyowojnvbfezznezxrr.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FPaC7OtL6iAsYiQ_JDS9IA_ZmTuYeyT';
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_UbcjBErM_LwZnKMhGAXLSGjn6G9iizP38';
const RESEND_FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function generate4DigitOtp(): string {
  return crypto.randomInt(1000, 10000).toString();
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // 1. Send / Resend 4-Digit OTP via Resend
    if (path.includes('send') || path.includes('resend') || path.includes('signup-with-otp')) {
      const email = (body.email || '').toLowerCase().trim();
      const isRecovery = !!body.isRecovery;

      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Email is required' }) };
      }

      const otp = generate4DigitOtp();
      const otpHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Clean up previous codes for this email
      await supabase.from('email_verification_codes').delete().eq('email', email);

      // Store in DB
      await supabase.from('email_verification_codes').insert({
        email,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        verified: false
      });

      // Send 4-Digit OTP via Resend
      const resend = new Resend(RESEND_API_KEY);
      const subject = isRecovery ? 'Reset your Contril password' : 'Verify your Contril account';
      const formattedFrom = RESEND_FROM.includes('<') ? RESEND_FROM : `Contril <${RESEND_FROM}>`;

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { background-color: #F8FAFC; color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 40px 20px; text-align: center; }
            .container { max-width: 460px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 36px 24px; }
            .logo { font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #0F172A; }
            .subtitle { font-size: 11px; color: #64748B; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
            .title { font-size: 22px; font-weight: 700; margin: 24px 0 12px 0; color: #0F172A; }
            .desc { font-size: 15px; line-height: 1.5; color: #475569; margin-bottom: 24px; }
            .otp-box { font-family: monospace; font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #2563EB; background-color: #EFF6FF; border: 1.5px solid #2563EB; padding: 16px 28px; border-radius: 12px; display: inline-block; margin: 0 0 20px 0; }
            .expiry { font-size: 13px; color: #64748B; }
            .footer { margin-top: 28px; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">CONTRIL</div>
            <div class="subtitle">AI Chief of Staff</div>
            <div class="title">${isRecovery ? 'Reset your password' : 'Verify your email'}</div>
            <p class="desc">
              ${isRecovery 
                ? 'Use the 4-digit verification code below to reset your Contril password:' 
                : 'Welcome to Contril. Use the 4-digit verification code below to finish creating your account:'}
            </p>
            <div class="otp-box">${otp}</div>
            <div class="expiry">This code expires in <strong>10 minutes</strong>.</div>
            <div class="footer">If you did not request this code, you can safely ignore this email.<br>© Contril</div>
          </div>
        </body>
        </html>
      `;

      const sendRes = await resend.emails.send({
        from: formattedFrom,
        to: email,
        subject,
        html: htmlBody
      });

      console.log('Resend dispatch result:', sendRes);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Verification code sent.' })
      };
    }

    // 2. Verify 4-Digit OTP
    if (path.includes('verify')) {
      const email = (body.email || '').toLowerCase().trim();
      const code = (body.code || '').trim();

      if (!email || !code) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Email and code are required' }) };
      }

      const { data: records, error } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !records || records.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "That code isn't correct. Try again." }) };
      }

      const record = records[0];

      if (new Date(record.expires_at) < new Date()) {
        await supabase.from('email_verification_codes').delete().eq('id', record.id);
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'That code has expired. Request a new code.' }) };
      }

      const hashedInput = hashOtp(code);
      if (hashedInput !== record.otp_hash) {
        await supabase.from('email_verification_codes').update({ attempts: record.attempts + 1 }).eq('id', record.id);
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "That code isn't correct. Try again." }) };
      }

      // Mark verified
      await supabase.from('email_verification_codes').delete().eq('id', record.id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: {
            id: `usr_${Date.now()}`,
            email,
            name: email.split('@')[0]
          },
          token: `token_${Date.now()}`
        })
      };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };
  } catch (err: any) {
    console.error('Netlify function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message || 'Internal error' }) };
  }
};
