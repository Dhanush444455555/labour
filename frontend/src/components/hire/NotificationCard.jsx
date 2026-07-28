import { Bell, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function NotificationCard({ notification }) {
  const getIcon = () => {
    if (notification.type === 'accepted') return <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />;
    if (notification.type === 'declined') return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
    return <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />;
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
        notification.unread
          ? 'bg-green-50/50 border-green-200 shadow-sm'
          : 'bg-white border-gray-100'
      }`}
    >
      <div className="p-2 bg-white rounded-full shadow-xs border border-gray-100">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-900 text-sm">{notification.title}</h4>
          {notification.unread && (
            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
          )}
        </div>
        <p className="text-gray-600 text-xs mt-1 leading-relaxed">{notification.message}</p>
        <span className="text-[11px] text-gray-400 mt-2 block font-medium">{notification.time}</span>
      </div>
    </div>
  );
}
