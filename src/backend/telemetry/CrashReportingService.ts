import { supabase } from '../../lib/auth';

export class CrashReportingService {
  private static isInitialized = false;

  public static initializeGlobalListeners(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    window.addEventListener('error', (event) => {
      this.reportCrash(event.message, event.error?.stack, 'window.onerror');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.reportCrash(
        String(event.reason?.message || event.reason || 'Unhandled Promise Rejection'),
        event.reason?.stack,
        'unhandledrejection'
      );
    });
  }

  public static async reportCrash(errorMessage: string, stackTrace?: string, componentName?: string): Promise<void> {
    try {
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id || null;

      await supabase.from('crash_reports').insert({
        user_id: userId,
        error_message: errorMessage,
        stack_trace: stackTrace || '',
        component_name: componentName || 'UnknownComponent',
        browser_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server'
      });
    } catch {
      // Crash reporter should fail silently
    }
  }
}
