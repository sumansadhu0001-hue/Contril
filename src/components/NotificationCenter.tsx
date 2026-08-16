import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShoppingBag, 
  Plane, 
  Mail, 
  Trash2, 
  CheckCheck,
  X,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/auth';

export interface ContrilNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'price_drop' | 'flight_alert';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectNotification?: (notif: ContrilNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen = true, onClose, onSelectNotification }) => {
  const [notifications, setNotifications] = useState<ContrilNotification[]>([
    {
      id: 'notif-1',
      title: 'Workflow Completed: Travel & Meeting Coordination',
      message: 'Successfully executed 5 steps across Workspace, Travel, and Executive Agents in 2.4s.',
      type: 'success',
      isRead: false,
      createdAt: '5 mins ago'
    },
    {
      id: 'notif-2',
      title: 'Laptop Price Drop Watcher Triggered',
      message: 'Amazon India dropped MacBook Air M3 price below target threshold ₹50,000 (Now ₹48,999).',
      type: 'price_drop',
      isRead: false,
      createdAt: '25 mins ago'
    },
    {
      id: 'notif-3',
      title: 'Flight Fare Alert: BOM → DEL',
      message: 'MakeMyTrip detected 18% discount on morning direct flight.',
      type: 'flight_alert',
      isRead: true,
      createdAt: '2 hours ago'
    },
    {
      id: 'notif-4',
      title: 'Urgent Executive Email Triaged',
      message: 'Draft reply staged for priority email from Board of Directors.',
      type: 'info',
      isRead: true,
      createdAt: '4 hours ago'
    }
  ]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error && data.length > 0) {
        setNotifications(data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          isRead: !!n.is_read,
          actionUrl: n.action_url,
          createdAt: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
    } catch {
      // Fallback
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-md bg-[#0D0D11]/95 border border-white/[0.1] rounded-3xl p-5 shadow-2xl space-y-4 text-white font-sans backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-[#00BFA6]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00BFA6] animate-ping" />
            )}
          </div>
          <h3 className="text-base font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00BFA6]/20 text-[#00BFA6]">
              {unreadCount} New
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Bell className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="text-xs text-neutral-400 font-light">No new notifications. Autonomous agent triggers will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification && onSelectNotification(notif)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 relative ${
                !notif.isRead
                  ? 'bg-white/[0.04] border-[#00BFA6]/40 shadow-[0_0_15px_rgba(0,191,166,0.08)]'
                  : 'bg-white/[0.01] border-white/[0.04] hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {notif.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {notif.type === 'price_drop' && <ShoppingBag className="w-3.5 h-3.5 text-[#00BFA6] shrink-0" />}
                  {notif.type === 'flight_alert' && <Plane className="w-3.5 h-3.5 text-[#00BFA6] shrink-0" />}
                  {notif.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {notif.type === 'info' && <Info className="w-3.5 h-3.5 text-[#00BFA6] shrink-0" />}

                  <h4 className="text-xs font-semibold text-white leading-snug line-clamp-1">{notif.title}</h4>
                </div>

                <span className="text-[9px] font-mono text-neutral-500 shrink-0">{notif.createdAt}</span>
              </div>

              <p className="text-[11px] text-neutral-300 font-light leading-relaxed pl-5">{notif.message}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
