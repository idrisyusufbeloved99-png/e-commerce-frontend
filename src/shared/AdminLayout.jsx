import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, ClipboardList, Users, LogOut, Store, Menu, X, Tag, Mail } from "lucide-react"

const navItems = [
  { label: "Dashboard", path: "/admin",          icon: <LayoutDashboard size={18} />, end: true },
  { label: "Products",  path: "/admin/products",  icon: <ShoppingBag size={18} /> },
  { label: "Orders",    path: "/admin/orders",    icon: <ClipboardList size={18} /> },
  { label: "Users",     path: "/admin/users",     icon: <Users size={18} /> },
  { label: "Coupons",   path: "/admin/coupons",   icon: <Tag size={18} /> },
  { label: "Subscribers", path: "/admin/subscribers",   icon: <Mail size={18} /> }, 
];

function Sidebar({ onClose }) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Store size={20} className="text-blue-600" />
          <span className="font-black text-lg">Admin Panel</span>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? "bg-blue-600 text-white" : "text-base-content hover:bg-base-200"}`
            }
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-base-300">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-base-200 relative">

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-base-300 bg-base-100">
        <Sidebar />
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          {/* Drawer */}
          <div className="relative z-10 flex flex-col w-64 bg-white h-full shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-base-100 border-b border-base-300 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-30">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-base-200 transition-colors text-gray-600"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Store size={16} className="text-blue-600 lg:hidden" />
            <h1 className="text-sm text-base-content/60">
              Welcome back, <span className="font-semibold text-base-content">Admin</span>
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}