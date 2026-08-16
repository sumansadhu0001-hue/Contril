import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  Trash2, 
  Check 
} from 'lucide-react';
import { supabase } from '../lib/auth';

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  isRead: boolean;
}

interface AdminNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminNotificationDrawer: React.FC<AdminNotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'warning'>('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setNotifications(data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          severity: n.type === 'warning' ? 'warning' : 'info',
          timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: n.is_read || false
        })));
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
  };

  if (!isOpen) return null;

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const filtered = safeNotifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'warning') return n.severity === 'warning' || n.severity === 'critical';
    return true;
  });

  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex justify-end animate-modal-overlay">
      <div className="w-full max-w-md bg-[#0D0D11]/95 border-l border-white/[0.1] h-full flex flex-col justify-between p-6 text-white backdrop-blur-xl animate-modal-content font-sans">
        
        {/* Header */}
        <div className="space-y-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00BFA6]" />
              <h2 className="text-lg font-semibold text-white">Live Platform Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#00BFA6] text-black font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>

            <button onClick={onClose} className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1">
              {['all', 'unread', 'warning'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    filter === f ? 'bg-[#00BFA6]/15 text-[#00BFA6] font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <button onClick={markAllRead} className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#00BFA6]" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 font-mono text-xs">
          {filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Bell className="w-8 h-8 text-neutral-600 mx-auto" />
              <div className="text-neutral-400 font-semibold">No System Notifications</div>
              <p className="text-[11px] text-neutral-500 font-light">Real-time alerts and operational notifications will be listed here as platform events occur.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all space-y-1.5 ${
                  !n.isRead ? 'bg-white/[0.03] border-[#00BFA6]/30' : 'bg-[#111114] border-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {n.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Info className="w-4 h-4 text-[#00BFA6]" />
                    )}
                    <span className="font-semibold text-white">{n.title}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{n.timestamp}</span>
                </div>

                <p className="text-[11px] text-neutral-300 font-light leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.06] text-center text-[10px] font-mono text-neutral-500">
          Contril Platform Event Stream • Real-time Alerts
        </div>

      </div>
    </div>
  );
};
