import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Trash2,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

export const NotificationsPage: React.FC<{ onTriggerTestAlarm?: () => void }> = ({ onTriggerTestAlarm }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.warn('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleTestAlarmClick = async () => {
    if (onTriggerTestAlarm) {
      onTriggerTestAlarm();
    }
    try {
      await healthApi.testAlarm();
      fetchNotifs();
    } catch (e) {
      console.warn('Failed to record test alarm:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#00D084]" />
            Alerts & Reminder Notifications
          </h1>
          <p className="text-xs text-[#9BAAB6] mt-1">
            Persistent medication alarms, appointment alerts, and critical lab finding summaries.
          </p>
        </div>

        <button
          onClick={handleTestAlarmClick}
          className="btn-emerald text-xs !py-2.5 !px-4 flex items-center gap-2 self-start sm:self-auto"
        >
          <Volume2 className="w-4 h-4" />
          <span>Trigger Test Alarm Sound</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel-dark rounded-3xl p-12 text-center text-xs text-[#9BAAB6] space-y-2">
          <Bell className="w-8 h-8 text-[#203039] mx-auto" />
          <p className="text-sm font-bold text-[#F4F7FA]">No Notifications</p>
          <p>You have no pending reminder alerts. Click the button above to test the reminder system.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                n.is_read
                  ? 'bg-[#0D171F] border-[#203039] text-[#9BAAB6]'
                  : 'bg-[#111F28] border-[#00D084]/30 text-[#F4F7FA]'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#F4F7FA]">{n.title}</h3>
                  <span className="text-[10px] text-[#9BAAB6]">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-[#9BAAB6] leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
