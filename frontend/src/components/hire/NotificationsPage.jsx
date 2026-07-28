import NotificationCard from './NotificationCard';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage({ notifications, onMarkAllRead }) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2 text-green-600" />
            Notifications
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">Updates on your laborer bookings</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4 mr-1 text-green-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm my-4">
          <p className="text-gray-500 text-sm font-medium">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
