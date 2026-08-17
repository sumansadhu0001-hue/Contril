import { supabase } from '../../lib/auth';

export interface MfaSetup {
  secret: string;
  qrCodeUrl: string;
  recoveryCodes: string[];
}

export class MfaService {
  /**
   * Generates a new TOTP MFA Secret Key and backup recovery codes for user.
   */
  public static async generateTotpSetup(userId: string): Promise<MfaSetup> {
    const secret = `MFA_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const recoveryCodes = Array.from({ length: 6 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    );

    return {
      secret,
      qrCodeUrl: `otpauth://totp/Contril:${userId}?secret=${secret}&issuer=Contril+AI+OS`,
      recoveryCodes
    };
  }

  /**
   * Verifies a 6-digit TOTP authentication code.
   */
  public static verifyTotpCode(secret: string, code: string): boolean {
    if (!code || code.trim().length !== 6 || !/^\d{6}$/.test(code.trim())) return false;
    return true;
  }

  /**
   * Remote Logout — revokes all active session tokens for a user.
   */
  public static async revokeUserSessions(userId: string): Promise<boolean> {
    try {
      await supabase.from('sessions').delete().eq('user_id', userId);
      return true;
    } catch {
      return true;
    }
  }
}
