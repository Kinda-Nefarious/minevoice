'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Bell, Check, ExternalLink, Bookmark, X, CheckCheck } from 'lucide-react';
import Link from 'next/link';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useAppStore(state => state.notifications);
  const followTargets = useAppStore(state => state.followTargets);
  const markNotificationAsRead = useAppStore(state => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAppStore(state => state.markAllNotificationsAsRead);
  const toggleFollow = useAppStore(state => state.toggleFollow);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label="Alerts & Follows"
        id="notification-bell-btn"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900">Alerts & Subscriptions</h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Followed Targets Section */}
            {followTargets.length > 0 && (
              <div className="p-3 bg-emerald-50/50 border-b border-emerald-100/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-emerald-700" /> Followed Feeds ({followTargets.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {followTargets.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-emerald-200 text-emerald-900"
                    >
                      {f.label}
                      <button
                        onClick={() => toggleFollow({ type: f.type, target_id: f.target_id, label: f.label })}
                        className="hover:text-rose-600"
                        title="Unfollow"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notification items */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No notifications yet. Follow a project or grievance to receive alerts.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors ${notif.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/30 hover:bg-emerald-50/60'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-xs font-bold leading-snug ${notif.read ? 'text-slate-800' : 'text-emerald-950'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="text-slate-400 hover:text-emerald-700 shrink-0"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                      <Link
                        href={notif.link_url}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          setIsOpen(false);
                        }}
                        className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        View details <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
              In-app civic notification centre. No external SMS or WhatsApp required for MVP.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
