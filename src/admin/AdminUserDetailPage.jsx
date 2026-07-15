import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Package,
  BarChart2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Ban,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useUserDetail,
  useUpdateUserStatus,
  useUpdateUserRole,
} from "../hooks/useUsers";
import { formatCurrency } from "../utils/formatCurrency";


const TABS = ["Profile", "Orders", "Analytics"];

const STATUS_CONFIG = {
  PROCESSING: {
    label: "Processing",
    icon: <Clock size={12} />,
    color: "bg-yellow-100 text-yellow-700",
  },
  SHIPPING: {
    label: "Shipping",
    icon: <Truck size={12} />,
    color: "bg-blue-100 text-blue-700",
  },
  DELIVERED: {
    label: "Delivered",
    icon: <CheckCircle2 size={12} />,
    color: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle size={12} />,
    color: "bg-red-100 text-red-500",
  },
};

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");

  const { data: user, isLoading, refetch } = useUserDetail(id);
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  

  function handleToggleBan() {
    const newStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
    updateStatus.mutate(
      { id: user.id, status: newStatus },
      {
        onSuccess: () => {
          toast[newStatus === "BANNED" ? "error" : "success"](
            `${user.username} ${newStatus === "BANNED" ? "banned" : "unbanned"}`,
          );
          refetch();
        },
        onError: () => toast.error("Failed to update status"),
      },
    );
  }

  function handleToggleRole() {
    const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    updateRole.mutate(
      { id: user.id, role: newRole },
      {
        onSuccess: () => {
          toast.success(`${user.username} is now ${newRole}`);
          refetch();
        },
        onError: () => toast.error("Failed to update role"),
      },
    );
  }

  // build monthly orders chart data from user's orders
  function buildChartData(orders) {
    const monthlyMap = {};
    orders.forEach((o) => {
      const month = new Date(o.createdAt).toLocaleString("en", {
        month: "short",
        year: "2-digit",
      });
      if (!monthlyMap[month])
        monthlyMap[month] = { month, orders: 0, spent: 0 };
      monthlyMap[month].orders += 1;
      monthlyMap[month].spent += Number(o.total);
    });
    return Object.values(monthlyMap).slice(-6); // last 6 months
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-400">User not found</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  const chartData = buildChartData(user.orders || []);

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium w-fit"
      >
        <ArrowLeft size={16} /> Back to Users
      </button>

      {/* User header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-3xl shrink-0">
            {user.username?.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900">
                {user.username}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full
                ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
              >
                {user.role}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full
                ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
              >
                {user.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">
                {user.ordersCount || 0}
              </p>
              <p className="text-xs text-gray-400">Orders</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 max-sm:text-xl">
                {formatCurrency(user.totalSpent || 0)}
              </p>
              <p className="text-xs text-gray-400 ">Total Spent</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleToggleBan}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors
                ${
                  user.status === "ACTIVE"
                    ? "bg-red-50 hover:bg-red-100 text-red-500"
                    : "bg-green-50 hover:bg-green-100 text-green-600"
                }`}
            >
              {user.status === "ACTIVE" ? "Ban User" : "Unban User"}
            </button>
            <button
              onClick={handleToggleRole}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors"
            >
              Make {user.role === "ADMIN" ? "Customer" : "Admin"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all max-sm:px-2 max-sm:py-2
              ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab === "Profile" && <User size={14} />}
            {tab === "Orders" && <Package size={14} />}
            {tab === "Analytics" && <BarChart2 size={14} />}
            {tab}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === "Profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Account info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-800 mb-5">
              Account Information
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: <User size={15} />,
                  label: "Username",
                  value: user.username,
                },
                { icon: <Mail size={15} />, label: "Email", value: user.email },
                { icon: <Shield size={15} />, label: "Role", value: user.role },
                {
                  icon: <Ban size={15} />,
                  label: "Status",
                  value: user.status,
                },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <span className="text-blue-600 shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="font-semibold text-gray-700 text-sm overflow-auto wrap-anywhere min-w-0">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile / delivery info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-800 mb-5">
              Delivery Information
            </h2>
            {user.profile ? (
              <div className="flex flex-col gap-4">
                {[
                  {
                    icon: <User size={15} />,
                    label: "Full Name",
                    value: user.profile.fullName,
                  },
                  {
                    icon: <Phone size={15} />,
                    label: "Phone",
                    value: user.profile.phoneNumber,
                  },
                  {
                    icon: <MapPin size={15} />,
                    label: "Address",
                    value: user.profile.address,
                  },
                  {
                    icon: <MapPin size={15} />,
                    label: "City",
                    value: user.profile.city || "—",
                  },
                  {
                    icon: <MapPin size={15} />,
                    label: "State",
                    value: user.profile.state || "—",
                  },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-blue-600 shrink-0">{icon}</span>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="font-semibold text-gray-700 text-sm">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <MapPin size={32} className="text-gray-200" />
                <p className="text-gray-400 text-sm">
                  This user hasn't set up their delivery profile yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === "Orders" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!user.orders?.length ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Package size={40} className="text-gray-200" />
              <p className="text-gray-400 text-sm">
                This user has no orders yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Order ID", "Date", "Items", "Total", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {user.orders.map((order) => {
                    const cfg =
                      STATUS_CONFIG[order.status] || STATUS_CONFIG.PROCESSING;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/admin/orders/${order.id}?from=user`)}
                        className="hover:bg-blue-50 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4 font-black text-blue-600 text-xs truncate max-w-[140px] group-hover:underline">
                          {order.id}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-600">
                          {order.items?.length}
                        </td>
                        <td className="px-5 py-4 font-black text-gray-800">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`flex items-center gap-1.5 w-fit text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}
                          >
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "Analytics" && (
        <div className="flex flex-col gap-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Orders", value: user.ordersCount || 0 },
              {
                label: "Total Spent",
                value: formatCurrency(user.totalSpent || 0),
              },
              {
                label: "Avg Order",
                value: user.ordersCount
                  ? formatCurrency((user.totalSpent || 0) / user.ordersCount)
                  : "₦0.00",
              },
              {
                label: "Last Order",
                value: user.orders?.[0]
                  ? new Date(user.orders[0].createdAt).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short" },
                    )
                  : "—",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm "
              >
                <p className="text-xl font-black text-gray-900 max-sm:text-sm">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-800 mb-1">Orders Per Month</h2>
            <p className="text-gray-400 text-sm mb-6">
              Last 6 months of activity
            </p>

            {chartData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                No order data yet
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: -1, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "rgba(37,99,235,0.05)" }}
                      formatter={(value, name) => [
                        name === "spent" ? formatCurrency(value) : value,
                        name === "spent" ? "Amount Spent" : "Orders",
                      ]}
                    />
                    <Bar
                      dataKey="orders"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      name="orders"
                    />
                    <Bar
                      dataKey="spent"
                      fill="#f97316"
                      radius={[6, 6, 0, 0]}
                      name="spent"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Order status breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-black text-gray-800 mb-5">
              Order Status Breakdown
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = (user.orders || []).filter(
                  (o) => o.status === key,
                ).length;
                return (
                  <div key={key} className={`rounded-xl p-4 ${cfg.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {cfg.icon}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-2xl font-black">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
