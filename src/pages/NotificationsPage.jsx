import { Bell, Package, RotateCcw, MessageSquare, CheckCircle2, Trash2, ShoppingBag, HelpCircle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications, useMarkRead, useMarkAllRead, useDeleteNotification } from "../hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS = {
  ORDER_STATUS:   <Package size={14} className="text-blue-600" />,
  RETURN_STATUS:  <RotateCcw size={14} className="text-orange-500" />,
  TICKET_REPLY:   <MessageSquare size={14} className="text-green-500" />,
  TICKET_CLOSED:  <CheckCircle2 size={14} className="text-gray-400" />,
  NEW_ORDER:      <ShoppingBag size={14} className="text-blue-600" />,
  NEW_TICKET:     <HelpCircle size={14} className="text-purple-500" />,
  NEW_RETURN:     <RotateCcw size={14} className="text-red-500" />,
  NEW_SUBSCRIBER: <Mail size={14} className="text-green-500" />,
};

export default function NotificationsPage() {
  const navigate    = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead    = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotif = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-4">
        <Skeleton className="h-8 w-48 mb-4" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <Bell size={36} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-black text-gray-700">No notifications</h2>
          <p className="text-gray-400 text-sm">
            You'll see order updates, return status and support replies here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => {
            const cfg = ICONS[notif.type] || ICONS.ORDER_STATUS;
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markRead.mutate(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                className={`flex items-start gap-4 bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all
                  ${!notif.read ? "border-blue-200 bg-blue-50/30" : "border-gray-100"}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-snug ${!notif.read ? "text-gray-900" : "text-gray-600"}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-300 mt-2">
                    {new Date(notif.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(notif.id); }}
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}