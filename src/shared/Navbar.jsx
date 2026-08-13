import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  X,
  Menu,
  ChevronDown,
  Zap,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "../context/CartContext";
import { useCategories } from "../hooks/useCategories";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import {
  Bell,
  Package,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from "../hooks/useNotifications";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Orders", path: "/orders" },
  { label: "Help", path: "/help" },
];

function CartSheet() {
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCart();
  const shipping = cartTotal > 100000 ? 0 : 1500;
  const grandTotal = cartTotal + shipping;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200">
          <ShoppingCart size={18} />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
              {cartItems.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[90vw] sm:w-[400px] bg-white flex flex-col p-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-4 border-b border-gray-100 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base font-black text-gray-900">
            <ShoppingCart size={18} className="text-blue-600" />
            Cart
            <span className="ml-auto text-xs font-normal text-gray-400">
              {cartItems.reduce((s, i) => s + i.qty, 0)} items
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
              <ShoppingCart size={40} className="text-gray-200" />
              <p className="text-gray-400 text-sm font-medium">
                Your cart is empty
              </p>
              <Link
                to="/shop"
                className="text-sm text-blue-600 font-bold hover:underline"
              >
                Start Shopping →
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50"
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xl">
                      {item.category === "Gadgets"
                        ? "📱"
                        : item.category === "Fashion"
                          ? "👗"
                          : item.category === "Beauty"
                            ? "✨"
                            : "🍳"}
                    </span>
                  )}
                </div>

                {/* Name + price — takes all available space */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-xs leading-snug mb-1 break-words">
                    {item.name}
                  </p>
                  <p className="text-blue-600 font-black text-sm">
                    {formatCurrency(item.price)}
                  </p>
                  {/* Qty controls below name */}
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-colors text-gray-500 font-bold text-sm"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-black text-gray-800 text-xs">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-colors text-gray-500 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove + subtotal */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X size={13} />
                  </button>
                  <p className="font-black text-gray-900 text-sm">
                    {formatCurrency(item.price * item.qty)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100 flex flex-col gap-3 shrink-0 bg-white">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-black text-gray-900">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span
                className={`font-bold ${shipping === 0 ? "text-green-500" : "text-gray-700"}`}
              >
                {shipping === 0 ? "FREE" : `${formatCurrency(shipping)}`}
              </span>
            </div>
            <div className="flex items-center justify-between font-black text-gray-900 border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-lg">{formatCurrency(grandTotal)}</span>
            </div>
            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-100"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              className="w-full text-center text-xs text-gray-400 hover:text-blue-600 transition-colors py-1"
            >
              View full cart
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function NotifDropdownContent({
  notifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotif,
  navigate,
  onClose,
}) {
  const ICONS = {
    ORDER_STATUS: <Package size={14} className="text-blue-600" />,
    RETURN_STATUS: <RotateCcw size={14} className="text-orange-500" />,
    TICKET_REPLY: <MessageSquare size={14} className="text-green-500" />,
    TICKET_CLOSED: <CheckCircle2 size={14} className="text-gray-400" />,
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
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
            className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
            <Bell size={15} className="text-gray-200" />
            <p className="text-gray-400 text-sm font-medium">
              No notifications yet
            </p>
            <p className="text-gray-300 text-xs">
              Order updates and support replies appear here
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.read) markRead.mutate(notif.id);
                if (notif.link) navigate(notif.link);
                onClose();
              }}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0
                ${!notif.read ? "bg-blue-50/50" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                ${!notif.read ? "bg-blue-100" : "bg-gray-100"}`}
              >
                {ICONS[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-bold leading-snug ${!notif.read ? "text-gray-900" : "text-gray-600"}`}
                >
                  {notif.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(notif.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif.mutate(notif.id);
                  }}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => {
              navigate("/notifications");
              onClose();
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold w-full text-center transition-colors"
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);

  const { data: categories = [] } = useCategories();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const { isAuthenticated, isAdmin, user, logout, isLoading } = useAuth();

  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotif = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  function handleSubscribe() {
    toast.success("You're subscribed! 🎉", {
      description: "Welcome to our newsletter.",
    });
  }

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-blue-600 text-white text-center text-xs py-2 font-medium tracking-wide px-4">
        🎉 Free shipping on orders over ₦100,000 &nbsp;·&nbsp;
        <Link
          to="/shop"
          className="underline underline-offset-2 hover:text-orange-300 transition-colors"
        >
          Shop Now
        </Link>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-[#0f172a] shadow-xl shadow-black/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-black text-white text-lg sm:text-xl tracking-tight">
              My<span className="text-orange-400">Store</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${isActive ? "text-white bg-white/15 border-b-2 border-orange-400" : "text-slate-300 hover:text-white hover:bg-white/10"}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Categories dropdown — built from real data */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                Categories
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Invisible bridge — fills the gap between button and dropdown */}
              {categoriesOpen && (
                <div className="absolute top-full left-0 w-full h-2" />
              )}

              <div
                className={`absolute top-full left-0 mt-0 pt-2 w-48 transition-all duration-200
    ${categoriesOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
              >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.id}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <span>{cat.emoji}</span> {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Search — desktop */}
          <div className="hidden md:flex items-center">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="flex items-center w-56 bg-white/10 border border-white/20 rounded-xl px-3 py-2 gap-2"
              >
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent text-white placeholder:text-slate-500 text-sm outline-none flex-1 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X
                    size={13}
                    className="text-slate-400 hover:text-white transition-colors"
                  />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-sm"
              >
                <Search size={15} />
                <span className="text-xs hidden lg:block">Search...</span>
              </button>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <Search size={17} />
            </button>

            {/* Notification Bell */}
            {isAuthenticated && (
              <>
                {/* Mobile backdrop */}
                {notifOpen && (
                  <div
                    className="fixed inset-0 z-40 sm:hidden bg-black/20"
                    onClick={() => setNotifOpen(false)}
                  />
                )}

                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    onMouseEnter={() =>
                      window.innerWidth >= 640 && setNotifOpen(true)
                    }
                    onMouseLeave={() =>
                      window.innerWidth >= 640 && setNotifOpen(false)
                    }
                    className="relative flex items-center justify-center w-10 h-10 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Desktop dropdown — normal absolute */}
                  <div
                    onMouseEnter={() => setNotifOpen(true)}
                    onMouseLeave={() => setNotifOpen(false)}
                    className={`hidden sm:block absolute right-0 top-full mt-0 pt-2 w-80 z-50 transition-all duration-200
          ${notifOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                  >
                    <NotifDropdownContent
                      notifications={notifications}
                      unreadCount={unreadCount}
                      markRead={markRead}
                      markAllRead={markAllRead}
                      deleteNotif={deleteNotif}
                      navigate={navigate}
                      onClose={() => setNotifOpen(false)}
                    />
                  </div>

                  {/* Mobile dropdown — fixed, centered */}
                  {notifOpen && (
                    <div className="sm:hidden fixed top-[72px] left-3 right-3 z-50">
                      <NotifDropdownContent
                        notifications={notifications}
                        unreadCount={unreadCount}
                        markRead={markRead}
                        markAllRead={markAllRead}
                        deleteNotif={deleteNotif}
                        navigate={navigate}
                        onClose={() => setNotifOpen(false)}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Cart */}
            <CartSheet />

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-black">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {user.username}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    My Orders
                  </Link>
                  {!isLoading && isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/my-tickets"
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Support Tickets
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={async () => {
                      await logout();
                      toast.success("Logged out successfully");
                      navigate("/");
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-orange-500/25"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 gap-2"
            >
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent text-white placeholder:text-slate-500 text-sm outline-none flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X size={13} className="text-slate-400 hover:text-white" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0f172a] border-t border-white/10 px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
          ${isActive ? "text-white bg-white/15" : "text-slate-300 hover:text-white hover:bg-white/10"}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Categories */}
            <div>
              <p className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Categories
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="block px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {cat.emoji} {cat.name}
                </Link>
              ))}
            </div>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-1">
                {/* User info */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-black text-white shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user.username}
                  </span>
                </div>

                {/* Account links */}
                <p className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Account
                </p>
                {[
                  { label: "Profile", path: "/profile" },
                  { label: "My Orders", path: "/orders" },
                  { label: "Wishlist", path: "/wishlist" },
                  { label: "Support Messages", path: "/my-tickets" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Admin link — only if admin */}
                {isAdmin && (
                  <>
                    <p className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      Admin
                    </p>
                    <Link
                      to="/admin"
                      className="block px-5 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-white/10 rounded-lg transition-colors font-bold"
                    >
                      🛠 Admin Panel
                    </Link>
                  </>
                )}

                {/* Logout */}
                <button
                  onClick={async () => {
                    await logout();
                    toast.success("Logged out successfully");
                    navigate("/");
                  }}
                  className="text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                <Link
                  to="/login"
                  className="flex-1 text-center text-sm font-medium text-slate-300 border border-white/20 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
