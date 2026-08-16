import { Request, Response, NextFunction } from 'express';

const ipRequestMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export class SecurityGuard {
  /**
   * Express middleware applying production security headers (CSP, HSTS, X-Frame-Options, XSS protection).
   */
  public static applySecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss:;");
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  }

  /**
   * Sliding window IP Rate Limiter middleware.
   */
  public static rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = ipRequestMap.get(ip);

    if (!record || now > record.resetAt) {
      ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return next();
    }

    if (record.count >= RATE_LIMIT_MAX) {
      res.setHeader('Retry-After', '60');
      res.status(429).json({ error: 'Too Many Requests — Rate limit exceeded. Try again in 60 seconds.' });
      return;
    }

    record.count++;
    next();
  }

  /**
   * Validates required production environment variables.
   */
  public static validateEnvironment(): { isHealthy: boolean; missingVars: string[] } {
    const requiredVars = ['PORT', 'GEMINI_API_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingVars = requiredVars.filter(key => {
      const fromEnv = process.env[key];
      const fromMeta = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env[key] : undefined;
      return !fromEnv && !fromMeta;
    });
    return { isHealthy: missingVars.length === 0, missingVars };
  }
}
