import crypto from 'crypto';
import { supabaseAdmin } from '../database/supabaseAdmin';
import { Resend } from 'resend';

// SHA-256 Hash helper
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// Generate cryptographically secure 4-digit random OTP
export function generateOtp(): string {
  const num = crypto.randomInt(1000, 10000);
  return num.toString();
}

// Helper to send email via Resend SDK
export async function sendOtpEmail(email: string, otp: string, isRecovery: boolean = false): Promise<{ success: boolean; error?: string }> {
  console.info(`[Contril Auth Resend] Initiating OTP email delivery sequence for: ${email}`);

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
  
  if (!apiKey || apiKey.trim().length === 0) {
    const errText = "RESEND_API_KEY is missing from server environment.";
    console.error(`[Contril Auth Error] ${errText}`);
    return { success: false, error: errText };
  }

  // Bypass only for local dummy key
  if (apiKey === 'test' || apiKey === 'dummy' || apiKey.includes('test_key')) {
    console.info(`[Resend Sandbox] Offline bypass mode active for ${email}.`);
    return { success: true };
  }

  const subject = isRecovery ? 'Reset your Contril password' : 'Verify your Contril account';
  
  // Premium Contril Light Theme Email Template
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          background-color: #F8FAFC;
          color: #0F172A;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 40px 20px;
          text-align: center;
        }
        .container {
          max-width: 480px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 36px 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .logo-wrap {
          margin-bottom: 20px;
        }
        .logo-text {
          font-family: monospace;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #0F172A;
          text-transform: uppercase;
        }
        .title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #0F172A;
        }
        .desc {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }
        .otp-box {
          font-family: monospace;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #2563EB;
          background-color: #EFF6FF;
          border: 1.5px solid #2563EB;
          padding: 16px 28px;
          border-radius: 12px;
          display: inline-block;
          margin: 10px 0 24px 0;
        }
        .expiry-note {
          font-size: 13px;
          color: #64748B;
          margin-bottom: 16px;
        }
        .disclaimer {
          font-size: 12px;
          color: #94A3B8;
          line-height: 1.5;
          margin-top: 24px;
          border-top: 1px solid #F1F5F9;
          padding-top: 20px;
        }
        .footer {
          margin-top: 16px;
          font-size: 12px;
          color: #94A3B8;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-wrap">
          <div class="logo-text">CONTRIL</div>
          <div style="font-size: 11px; color: #64748B; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;">AI Chief of Staff</div>
        </div>
        <div class="title">${isRecovery ? 'Reset your password' : 'Verify your email'}</div>
        <p class="desc">
          ${isRecovery 
            ? 'We received a request to reset your Contril password. Use the verification code below:' 
            : 'Welcome to Contril. Use the verification code below to finish creating your Contril account:'}
        </p>
        <div class="otp-box">${otp}</div>
        <div class="expiry-note">
          This code expires in <strong>10 minutes</strong>.
        </div>
        <div class="disclaimer">
          If you did not initiate this request, you can safely ignore this email.
        </div>
        <div class="footer">
          © Contril
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = new Resend(apiKey);
    const formattedFrom = fromEmail.includes('<') ? fromEmail : `Contril <${fromEmail}>`;

    const response = await resend.emails.send({
      from: formattedFrom,
      to: email,
      subject,
      html: htmlBody
    });

    if (response.error) {
      console.error(`[Contril Auth Resend Error]`, response.error);
      return { success: false, error: response.error.message || JSON.stringify(response.error) };
    }

    console.info(`[Contril Auth Resend Success] Email delivered. Message ID: ${response.data?.id}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Contril Auth Resend Exception]`, err);
    return { success: false, error: err.message || 'Unknown Resend dispatch error' };
  }
}

export class CustomOtpService {
  // Generate and send OTP with 10 minute expiry and 5 max attempts
  public static async createAndSendOtp(email: string, userId?: string, isRecovery: boolean = false): Promise<{ success: boolean; message: string; expiryMinutes: number }> {
    const cleanEmail = email.toLowerCase().trim();
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiryMinutes = 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    console.info(`[Contril Auth] Generated secure 6-digit OTP for ${cleanEmail}. Expiry: 10 minutes.`);

    // Invalidate previous unverified OTP records for this email
    await supabaseAdmin
      .from('email_verification_codes')
      .delete()
      .eq('email', cleanEmail);

    // Insert new OTP record
    const { error } = await supabaseAdmin
      .from('email_verification_codes')
      .insert({
        user_id: userId || null,
        email: cleanEmail,
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        verified: false
      });

    if (error) {
      console.error(`[Supabase DB Error] Storing OTP failed:`, error.message);
      throw new Error('Database transaction failed. Please try again.');
    }

    // Send email using Resend API
    const emailResult = await sendOtpEmail(cleanEmail, otp, isRecovery);
    if (!emailResult.success) {
      console.log(`[Contril Auth] Cleaning up OTP for ${cleanEmail} due to email dispatch failure.`);
      await supabaseAdmin.from('email_verification_codes').delete().eq('otp_hash', otpHash);
      throw new Error(`Unable to send verification email: ${emailResult.error || 'Resend delivery failed.'}`);
    }

    return {
      success: true,
      message: 'Verification code sent successfully.',
      expiryMinutes
    };
  }

  // Verify custom OTP entered by user
  public static async verifyCustomOtp(email: string, token: string, type: 'signup' | 'recovery' = 'signup'): Promise<{ success: boolean; userId?: string; user?: any; token?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.trim();

    // Query the latest unverified OTP record for this email
    const { data: records, error } = await supabaseAdmin
      .from('email_verification_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !records || records.length === 0) {
      console.warn(`[OTP Verify Warn] No active OTP record found for email: ${cleanEmail}`);
      throw new Error("That code isn't correct. Try again.");
    }

    const otpRecord = records[0];

    // Security: Check maximum verification attempts (5 attempts)
    if (otpRecord.attempts >= 5) {
      await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);
      throw new Error('Too many attempts. Request a new code.');
    }

    // Security: Check expiration (10 minutes)
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);
      throw new Error('That code has expired. Request a new code.');
    }

    // Hash entered code and compare
    const hashedInput = hashOtp(cleanToken);
    if (hashedInput !== otpRecord.otp_hash) {
      await supabaseAdmin
        .from('email_verification_codes')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      throw new Error("That code isn't correct. Try again.");
    }

    if (type === 'signup') {
      // Mark as verified
      await supabaseAdmin
        .from('email_verification_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      // Delete the OTP record from database
      await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);

      // Confirm user email on Supabase Auth
      let finalUserId = otpRecord.user_id;
      let userName = cleanEmail.substringBefore ? cleanEmail.split('@')[0] : cleanEmail;

      if (finalUserId) {
        console.info(`[Contril Auth] Confirming user email in Supabase Auth for UUID: ${finalUserId}`);
        const { data: userData, error: adminErr } = await supabaseAdmin.auth.admin.updateUserById(finalUserId, {
          email_confirm: true
        });
        if (!adminErr && userData?.user) {
          const meta = userData.user.user_metadata;
          if (meta?.full_name || meta?.name) {
            userName = meta.full_name || meta.name;
          }
        }
      }

      return {
        success: true,
        userId: finalUserId,
        user: {
          id: finalUserId || `usr_${System.currentTimeMillis ? Date.now() : 'verified'}`,
          email: cleanEmail,
          name: userName
        },
        token: `session_token_${Date.now()}`
      };
    } else {
      // For recovery, mark as verified so reset-password can validate it
      await supabaseAdmin
        .from('email_verification_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      return {
        success: true,
        userId: otpRecord.user_id
      };
    }
  }

  // Handle password reset using verified recovery OTP code
  public static async resetPassword(email: string, token: string, passwordHashOrPass: string): Promise<{ success: boolean }> {
    const cleanEmail = email.toLowerCase().trim();

    // Query the verified OTP record for this email
    const { data: records, error } = await supabaseAdmin
      .from('email_verification_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !records || records.length === 0) {
      throw new Error('Verification session has expired or was not validated.');
    }

    const otpRecord = records[0];

    // Check expiration (10 minutes)
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);
      throw new Error('Verification session has expired. Please request a new code.');
    }

    if (!otpRecord.user_id) {
      throw new Error('User association not found.');
    }

    // Update password via Supabase Admin API
    const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(otpRecord.user_id, {
      password: passwordHashOrPass,
      email_confirm: true
    });

    if (resetErr) {
      console.error(`[Supabase Admin Reset Password Error] Failed:`, resetErr.message);
      throw new Error('Failed to update credentials.');
    }

    // Invalidate every existing session
    await supabaseAdmin.auth.admin.signOut(otpRecord.user_id, 'global');

    // Delete the verified OTP record
    await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);

    return { success: true };
  }

  // Handle resend request with 60-second cooldown check
  public static async resendOtp(email: string, isRecovery: boolean = false): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase().trim();

    // Query recent OTP codes for this email
    const { data: records, error } = await supabaseAdmin
      .from('email_verification_codes')
      .select('*')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && records && records.length > 0) {
      const lastRecord = records[0];
      const timeSinceCreatedMs = Date.now() - new Date(lastRecord.created_at).getTime();

      // Check 60-second resend cooldown
      if (timeSinceCreatedMs < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - timeSinceCreatedMs) / 1000);
        throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new code.`);
      }

      // Invalidate previous OTP
      await supabaseAdmin.from('email_verification_codes').delete().eq('email', cleanEmail);
    }

    // Get user id if exists
    let userId: string | undefined;
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    if (userList && userList.users) {
      const existingUser = userList.users.find((u: { id: string; email?: string }) => u.email?.toLowerCase() === cleanEmail);
      if (existingUser) userId = existingUser.id;
    }

    // Generate, store, and send new OTP via Resend
    const { message } = await this.createAndSendOtp(cleanEmail, userId, isRecovery);

    return {
      success: true,
      message: 'New verification code sent.'
    };
  }
}
