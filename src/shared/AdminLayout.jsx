import { useState, useEffect } from "react";
import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Users,
  Tag,
  Mail,
  RotateCcw,
  Image,
  HelpCircle,
  LogOut,
  Store,
  Menu,
  X,
  Bell,
  ExternalLink,
  ShoppingCart,
  FileQuestion,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  useAdminNotifications,
  useMarkAdminRead,
  useMarkAllAdminRead,
  useMarkAdminReadByLink,
  useDeleteAdminNotification,
} from "../hooks/useAdminNotifications";

// Maps notification type to icon + color
const NOTIF_CONFIG = {
  NEW_ORDER: {
    icon: <ShoppingCart size={14} />,
    color: "bg-blue-100 text-blue-600",
  },
  NEW_RETURN: {
    icon: <RotateCcw size={14} />,
    color: "bg-orange-100 text-orange-600",
  },
  NEW_TICKET: {
    icon: <FileQuestion size={14} />,
    color: "bg-purple-100 text-purple-600",
  },
  TICKET_REPLY: {
    icon: <MessageSquare size={14} />,
    color: "bg-green-100 text-green-600",
  },
  NEW_SUBSCRIBER: {
    icon: <UserPlus size={14} />,
    color: "bg-pink-100 text-pink-600",
  },
};

// Sidebar nav items with their notification link
const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: <LayoutDashboard size={18} />,
    end: true,
    notifLink: null,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBag size={18} />,
    end: false,
    notifLink: null,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: <ClipboardList size={18} />,
    end: false,
    notifLink: "/admin/orders",
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <Users size={18} />,
    end: false,
    notifLink: null,
  },
  {
    label: "Coupons",
    path: "/admin/coupons",
    icon: <Tag size={18} />,
    end: false,
    notifLink: null,
  },
  {
    label: "Subscribers",
    path: "/admin/subscribers",
    icon: <Mail size={18} />,
    end: false,
    notifLink: "/admin/subscribers",
  },
  {
    label: "Returns",
    path: "/admin/returns",
    icon: <RotateCcw size={18} />,
    end: false,
    notifLink: "/admin/returns",
  },
  {
    label: "Banners",
    path: "/admin/banners",
    icon: <Image size={18} />,
    end: false,
    notifLink: null,
  },
  {
    label: "Help Tickets",
    path: "/admin/help",
    icon: <HelpCircle size={18} />,
    end: false,
    notifLink: "/admin/help",
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: notifications = [] } = useAdminNotifications();
  const markRead = useMarkAdminRead();
  const markAllRead = useMarkAllAdminRead();
  const markByLink = useMarkAdminReadByLink();
  const deleteNotif = useDeleteAdminNotification();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Auto-mark notifications as read when admin visits the relevant page
  useEffect(() => {
    const currentNavItem = NAV_ITEMS.find(
      (item) => item.notifLink && location.pathname.startsWith(item.path),
    );
    if (currentNavItem?.notifLink) {
      const hasUnread = notifications.some(
        (n) => !n.read && n.link === currentNavItem.notifLink,
      );
      if (hasUnread) {
        markByLink.mutate(currentNavItem.notifLink);
      }
    }
  }, [location.pathname]);

  // Count unread notifications per sidebar link
  function getUnreadForLink(link) {
    if (!link) return 0;
    return notifications.filter((n) => !n.read && n.link === link).length;
  }

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    navigate("/");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 font-black text-white hover:text-orange-400 transition-colors"
        >
          <Store size={20} className="text-orange-400" />
          MyStore
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const unread = getUnreadForLink(item.notifLink);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {/* Red dot badge on sidebar */}
              {unread > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full shrink-0">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom — view store + logout */}
      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <ExternalLink size={18} /> View Store
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all w-full text-left"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0f172a]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-[#0f172a] flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-xs text-gray-400">Welcome back,</p>
              <p className="font-black text-gray-800">
                {user?.username || "Admin"}
              </p>
            </div>
          </div>

          {/* Right — notification bell */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              {/* Backdrop */}
              {notifOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
              )}

              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 z-50 shadow-2xl rounded-2xl border border-gray-100 bg-white overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-blue-600" />
                      <span className="font-black text-gray-800 text-sm">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-xs font-bold bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead.mutate()}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                        <Bell size={28} className="text-gray-200" />
                        <p className="text-gray-400 text-sm font-medium">
                          All caught up!
                        </p>
                        <p className="text-gray-300 text-xs">
                          New orders, tickets and returns will appear here
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const cfg =
                          NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.NEW_ORDER;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.read) markRead.mutate(notif.id);
                              navigate(notif.link);
                              setNotifOpen(false);
                            }}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
                              ${!notif.read ? "bg-blue-50/40" : ""}`}
                          >
                            {/* Icon */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}
                            >
                              {cfg.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-bold leading-snug ${!notif.read ? "text-gray-900" : "text-gray-500"}`}
                              >
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-300 mt-1">
                                {new Date(notif.createdAt).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>

                            {/* Unread dot + delete */}
                            <div className="flex flex-col items-center gap-2 shrink-0">
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotif.mutate(notif.id);
                                }}
                                className="text-gray-300 hover:text-red-400 transition-colors mt-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={() => {
                          markAllRead.mutate();
                          setNotifOpen(false);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold w-full text-center"
                      >
                        Clear all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
