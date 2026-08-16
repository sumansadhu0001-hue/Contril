import crypto from 'crypto';
import { supabaseAdmin } from '../database/supabaseAdmin';
import { Resend } from 'resend';

// SHA-256 Hash helper
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// Generate cryptographically secure 6-digit OTP
export function generateOtp(): string {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

// Helper to send email via Resend SDK
export async function sendOtpEmail(email: string, otp: string, isRecovery: boolean = false): Promise<{ success: boolean; error?: string }> {
  console.info(`[Contril Auth] Initiating OTP email dispatch sequence...`);
  console.info(`[Contril Auth] Target Recipient: ${email}`);
  console.info(`[Contril Auth] Mode: ${isRecovery ? 'recovery' : 'signup'}`);

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM;
  console.info(`[Contril Auth] Checking RESEND_API_KEY and RESEND_FROM presence...`);
  
  if (!apiKey || apiKey.trim().length === 0) {
    const errText = "RESEND_API_KEY is missing from environment variables.";
    console.error(`[Contril Auth Error] ${errText}`);
    return { success: false, error: errText };
  }

  if (!fromEmail || fromEmail.trim().length === 0) {
    const errText = "RESEND_FROM is missing from environment variables.";
    console.error(`[Contril Auth Error] ${errText}`);
    return { success: false, error: errText };
  }
  
  console.info(`[Contril Auth] RESEND_API_KEY detected. Length: ${apiKey.length}`);
  console.info(`[Contril Auth] RESEND_FROM detected: "${fromEmail}"`);

  // Bypass for local testing if key is test or dummy
  if (apiKey === 'test' || apiKey === 'dummy' || apiKey.includes('test_key')) {
    console.info(`[Resend Sandbox] Offline bypass mode active. Verification code for ${email} is: [ ${otp} ]`);
    return { success: true };
  }

  const subject = isRecovery ? 'Reset your Contril password' : 'Verify your Contril account';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        body {
          background-color: #060608;
          color: #FAFAFA;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 40px 20px;
          text-align: center;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background-color: #0D0D11;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        .logo {
          font-size: 20px;
          font-weight: 300;
          letter-spacing: 2px;
          color: #FAFAFA;
          margin-bottom: 24px;
          text-transform: uppercase;
        }
        .logo span {
          color: #00BFA6;
          font-weight: 700;
        }
        .title {
          font-size: 22px;
          font-weight: 300;
          margin-bottom: 16px;
          color: #FAFAFA;
        }
        .otp-code {
          font-size: 38px;
          font-weight: 700;
          letter-spacing: 4px;
          color: #00BFA6;
          background-color: rgba(0, 191, 166, 0.05);
          border: 1px solid rgba(0, 191, 166, 0.2);
          padding: 12px 24px;
          border-radius: 12px;
          display: inline-block;
          margin: 20px 0;
          font-family: monospace;
        }
        .warning {
          font-size: 12px;
          color: #888888;
          margin-top: 16px;
        }
        .footer {
          margin-top: 32px;
          font-size: 11px;
          color: #666666;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 16px;
        }
        .support-link {
          color: #00BFA6;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">CONTR<span>IL</span></div>
        <div class="title">${isRecovery ? 'Password Reset Verification' : 'Verify your email address'}</div>
        <p style="font-size: 14px; line-height: 1.6; color: #CCCCCC; margin-bottom: 12px;">
          ${isRecovery ? 'We received a request to reset your password.' : 'Welcome to Contril. Your single enterprise AI workspace is ready.'}
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #CCCCCC;">
          Use the following secure, one-time verification code:
        </p>
        <div class="otp-code">${otp}</div>
        <p class="warning">
          This verification code is valid for <strong>5 minutes</strong>.
        </p>
        <p style="font-size: 13px; color: #888888; margin-top: 24px;">
          If you did not initiate this request, please ignore this message securely.
        </p>
        <div class="footer">
          Contril Platform Security • For assistance contact <a href="mailto:support@contril.ai" class="support-link">support@contril.ai</a>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.info(`[Contril Auth] Initializing official Resend SDK client...`);
    const resend = new Resend(apiKey);

    console.info(`[Contril Auth] Executing resend.emails.send() request...`);
    
    // Perform awaited send call (Guideline 5: Do NOT fire-and-forget)
    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: htmlBody
    });

    console.log("Resend Response:", response);

    if (response.error) {
      console.error(`[Contril Auth] Resend API returned error:`, response.error);
      return { success: false, error: response.error.message || JSON.stringify(response.error) };
    }

    console.info(`[Contril Auth] Resend API reported success. Message ID: ${response.data?.id}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Contril Auth Exception] Exception in sendOtpEmail process:`, err);
    return { success: false, error: err.message || 'Unknown Resend error' };
  }
}

export class CustomOtpService {
  // Generate and send OTP for custom verification
  public static async createAndSendOtp(email: string, userId?: string, isRecovery: boolean = false): Promise<{ success: boolean; message: string; expiryMinutes: number }> {
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now

    console.info(`[Contril Auth] New custom OTP generated for ${email}: ${otp}`);

    // Insert OTP record into email_verification_codes table in Supabase
    const { error } = await supabaseAdmin
      .from('email_verification_codes')
      .insert({
        user_id: userId || null,
        email: email.toLowerCase(),
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
    const emailResult = await sendOtpEmail(email, otp, isRecovery);
    if (!emailResult.success) {
      console.log(`[Contril Auth] Clean up generated OTP for ${email} due to send failure.`);
      await supabaseAdmin.from('email_verification_codes').delete().eq('otp_hash', otpHash);
      throw new Error(`Unable to send verification email. Error: ${emailResult.error || 'RESEND_API_KEY is missing.'}`);
    }

    return {
      success: true,
      message: 'Verification code sent successfully.',
      expiryMinutes: 5
    };
  }

  // Verify custom OTP entered by user
  public static async verifyCustomOtp(email: string, token: string, type: 'signup' | 'recovery' = 'signup'): Promise<{ success: boolean; userId?: string }> {
    const cleanEmail = email.toLowerCase();
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
      console.warn(`[OTP Verify Warn] No OTP record found for email: ${cleanEmail}`);
      throw new Error('Incorrect verification code.');
    }

    const otpRecord = records[0];

    // Security: Check maximum verification attempts (5 attempts)
    if (otpRecord.attempts >= 5) {
      // Delete the record to block brute-force attempts
      await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);
      throw new Error('Maximum verification attempts exceeded. Please request a new code.');
    }

    // Security: Check expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);
      throw new Error('Verification code expired.');
    }

    // Hash entered code and compare
    const hashedInput = hashOtp(cleanToken);
    if (hashedInput !== otpRecord.otp_hash) {
      // Increment attempt counter
      await supabaseAdmin
        .from('email_verification_codes')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      throw new Error('Incorrect verification code.');
    }

    if (type === 'signup') {
      // Mark as verified
      await supabaseAdmin
        .from('email_verification_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      // Delete the OTP record from database
      await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);

      // Confirm user email on the Supabase User Authentication record directly
      if (otpRecord.user_id) {
        console.info(`[Contril Auth] Confirming user email in Supabase Auth backend for user UUID: ${otpRecord.user_id}`);
        const { error: adminErr } = await supabaseAdmin.auth.admin.updateUserById(otpRecord.user_id, {
          email_confirm: true
        });
        if (adminErr) {
          console.error(`[Supabase Admin Error] Confirming user email failed:`, adminErr.message);
          throw new Error('Failed to synchronize verification state with Supabase Auth.');
        }
      }
    } else {
      // For recovery, mark as verified, but don't delete yet. The reset-password endpoint will query it and delete it.
      await supabaseAdmin
        .from('email_verification_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);
    }

    return {
      success: true,
      userId: otpRecord.user_id
    };
  }

  // Handle password reset using verified recovery OTP code
  public static async resetPassword(email: string, token: string, passwordHashOrPass: string): Promise<{ success: boolean }> {
    const cleanEmail = email.toLowerCase();
    const cleanToken = token.trim();

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

    // Security: Check expiration (5 minutes)
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
      email_confirm: true // Ensure email is confirmed upon password reset
    });

    if (resetErr) {
      console.error(`[Supabase Admin Reset Password Error] Failed:`, resetErr.message);
      throw new Error('Failed to update credentials on auth provider.');
    }

    // Invalidate every existing session
    const { error: signOutErr } = await supabaseAdmin.auth.admin.signOut(otpRecord.user_id, 'global');
    if (signOutErr) {
      console.warn(`[SignOut Global Warn] SignOut failed for user:`, signOutErr.message);
    }

    // Delete the verified OTP record
    await supabaseAdmin.from('email_verification_codes').delete().eq('id', otpRecord.id);

    return { success: true };
  }

  // Handle resend request with 60-second cooldown check and limit
  public static async resendOtp(email: string, isRecovery: boolean = false): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.toLowerCase();

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

      // Check maximum 3 resend attempts within active verification window
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count, error: countErr } = await supabaseAdmin
        .from('email_verification_codes')
        .select('*', { count: 'exact', head: true })
        .eq('email', cleanEmail)
        .gte('created_at', fiveMinutesAgo);

      if (!countErr && count !== null && count >= 3) {
        throw new Error('Maximum resend attempts reached. Please wait 5 minutes before requesting a new code.');
      }

      // Delete the old OTP record(s) to invalidate old code
      await supabaseAdmin.from('email_verification_codes').delete().eq('email', cleanEmail);
    }

    // Get user id if exists to maintain schema relation
    let userId: string | undefined;
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    if (userList && userList.users) {
      const existingUser = userList.users.find((u: { id: string; email?: string }) => u.email?.toLowerCase() === cleanEmail);
      if (existingUser) userId = existingUser.id;
    }

    // Generate, store, and send new OTP
    const { message } = await this.createAndSendOtp(cleanEmail, userId, isRecovery);

    return {
      success: true,
      message
    };
  }
}
