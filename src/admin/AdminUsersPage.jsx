import { useState } from "react";
import { Search, Shield, User, Ban, ChevronDown, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAllUsers, useUpdateUserStatus, useUpdateUserRole } from "../hooks/useUsers";
import { formatCurrency } from "../utils/formatCurrency";

const ROLE_CONFIG = {
  ADMIN:    { label: "Admin",    color: "bg-purple-100 text-purple-700", icon: <Shield size={11} /> },
  CUSTOMER: { label: "Customer", color: "bg-blue-100 text-blue-700",    icon: <User size={11} /> },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700", dot: "bg-green-400" },
  BANNED: { label: "Banned", color: "bg-red-100 text-red-500",     dot: "bg-red-400" },
};

export default function AdminUsersPage() {
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const navigate                      = useNavigate();

  const { data: users = [], isLoading } = useAllUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole   = useUpdateUserRole();

  function handleToggleBan(e, user) {
    e.stopPropagation();
    const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
    updateStatus.mutate(
      { id: user.id, status: newStatus },
      {
        onSuccess: () =>
          toast[newStatus === "BANNED" ? "error" : "success"](
            `${user.username} ${newStatus === "BANNED" ? "banned" : "unbanned"}`
          ),
        onError: () => toast.error("Failed to update user status"),
      }
    );
  }

  function handleToggleRole(e, user) {
    e.stopPropagation();
    const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    updateRole.mutate(
      { id: user.id, role: newRole },
      {
        onSuccess: () => toast.success(`${user.username} is now ${newRole}`),
        onError: () => toast.error("Failed to update user role"),
      }
    );
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (roleFilter === "all" || u.role === roleFilter);
  });

  const totalRevenue = users.reduce((s, u) => s + (u.totalSpent || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">Users</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Customers",   value: users.filter((u) => u.role === "CUSTOMER").length, color: "bg-blue-600",   icon: <User size={16} /> },
          { label: "Admins",      value: users.filter((u) => u.role === "ADMIN").length,    color: "bg-purple-600", icon: <Shield size={16} /> },
          { label: "Banned",      value: users.filter((u) => u.status === "BANNED").length, color: "bg-red-500",    icon: <Ban size={16} /> },
          { label: "Total Spent", value: formatCurrency(totalRevenue),                       color: "bg-orange-500", icon: <ShoppingBag size={16} /> },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 ${card.color} rounded-xl flex items-center justify-center text-white mb-2 sm:mb-3`}>
              {card.icon}
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{card.value}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-blue-400 transition-colors">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-9 text-sm font-medium text-gray-700 outline-none cursor-pointer shadow-sm"
          >
            <option value="all">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {filtered.map((user) => {
          const roleCfg   = ROLE_CONFIG[user.role]    || ROLE_CONFIG.CUSTOMER;
          const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.ACTIVE;
          return (
            <div
              key={user.id}
              onClick={() => navigate(`/admin/users/${user.id}`)}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black shrink-0">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{user.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${roleCfg.color}`}>
                    {roleCfg.icon} {roleCfg.label}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{user.ordersCount || 0} orders</span>
                <span className="font-bold text-gray-700">{formatCurrency(user.totalSpent || 0)} spent</span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button
                  onClick={(e) => handleToggleBan(e, user)}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors
                    ${user.status === "ACTIVE" ? "bg-red-50 hover:bg-red-100 text-red-500" : "bg-green-50 hover:bg-green-100 text-green-600"}`}
                >
                  {user.status === "ACTIVE" ? "Ban" : "Unban"}
                </button>
                <button
                  onClick={(e) => handleToggleRole(e, user)}
                  className="flex-1 text-xs font-bold py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                >
                  → {user.role === "ADMIN" ? "Customer" : "Admin"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table — no side panel, click navigates */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["User", "Role", "Status", "Orders", "Spent", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No users found</td>
                </tr>
              ) : filtered.map((user) => {
                const roleCfg   = ROLE_CONFIG[user.role]    || ROLE_CONFIG.CUSTOMER;
                const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.ACTIVE;
                return (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    className="hover:bg-blue-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 w-fit text-xs font-bold px-2.5 py-1 rounded-full ${roleCfg.color}`}>
                        {roleCfg.icon} {roleCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 w-fit text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-600">{user.ordersCount || 0}</td>
                    <td className="px-5 py-4 font-bold text-gray-800">{formatCurrency(user.totalSpent || 0)}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleBan(e, user)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors
                            ${user.status === "ACTIVE" ? "bg-red-50 hover:bg-red-100 text-red-500" : "bg-green-50 hover:bg-green-100 text-green-600"}`}
                        >
                          {user.status === "ACTIVE" ? "Ban" : "Unban"}
                        </button>
                        <button
                          onClick={(e) => handleToggleRole(e, user)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
                        >
                          {user.role === "ADMIN" ? "→ Customer" : "→ Admin"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}