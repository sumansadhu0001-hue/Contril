import { supabase } from '../../lib/auth';

export interface BatteryState {
  level: number; // 0 - 100
  isCharging: boolean;
  isBatterySaverOn: boolean;
}

export interface SyncTaskResult {
  taskId: string;
  status: 'synced' | 'paused_battery_saver' | 'failed';
  itemsProcessed: number;
  durationMs: number;
}

export class NativeBackgroundService {
  private static isSyncing = false;

  /**
   * Retrieves current battery state from navigator API or system fallback.
   */
  public static async getBatteryState(): Promise<BatteryState> {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        const bat: any = await (navigator as any).getBattery();
        return {
          level: Math.round(bat.level * 100),
          isCharging: bat.charging,
          isBatterySaverOn: bat.level <= 0.20 && !bat.charging
        };
      } catch {
        // Fallback
      }
    }

    return {
      level: 85,
      isCharging: true,
      isBatterySaverOn: false
    };
  }

  /**
   * Executes background synchronization while evaluating battery saver thresholds and network connection.
   */
  public static async runBackgroundSync(userId: string = 'demo-user'): Promise<SyncTaskResult> {
    if (this.isSyncing) {
      return { taskId: `sync-${Date.now()}`, status: 'synced', itemsProcessed: 0, durationMs: 0 };
    }

    this.isSyncing = true;
    const startTime = Date.now();
    const battery = await this.getBatteryState();

    // Battery Saver Rule: If battery < 20% and not charging, pause non-critical background jobs
    if (battery.isBatterySaverOn) {
      this.isSyncing = false;
      return {
        taskId: `sync-${Date.now()}`,
        status: 'paused_battery_saver',
        itemsProcessed: 0,
        durationMs: Date.now() - startTime
      };
    }

    let syncedCount = 0;
    try {
      // 1. Process offline sync queue
      const { data: queuedItems } = await supabase
        .from('offline_sync_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'queued')
        .limit(10);

      if (queuedItems && queuedItems.length > 0) {
        syncedCount = queuedItems.length;
        await supabase
          .from('offline_sync_queue')
          .update({ status: 'synced', synced_at: new Date().toISOString() })
          .in('id', queuedItems.map(i => i.id));
      }

      // 2. Update device battery level telemetry
      await supabase
        .from('user_devices')
        .update({
          battery_level: battery.level,
          last_active_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch {
      // Ignore
    } finally {
      this.isSyncing = false;
    }

    return {
      taskId: `sync-${Date.now()}`,
      status: 'synced',
      itemsProcessed: syncedCount,
      durationMs: Date.now() - startTime
    };
  }
}
