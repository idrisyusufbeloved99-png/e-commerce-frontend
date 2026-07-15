import { useState } from "react";
import {
  ShoppingBag,
  Users,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "../hooks/useOrders";
import { formatCurrency } from "../utils/formatCurrency";

const RANGE_OPTIONS = ["Last 30 days", "Last 3 months", "Last 6 months"];

const STATUS_COLORS = {
  DELIVERED: "bg-green-100 text-green-700",
  SHIPPING: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-500",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-white font-semibold capitalize">{p.name}:</span>
          <span className="text-slate-300">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState("Last 3 months");
  const { data, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    orders = [],
    revenueData = [],
  } = data || {};

  const stats = [
    {
      label: "Total Revenue",
      value: `${formatCurrency(totalRevenue || 0)}`,
      change: "+12%",
      up: true,
      icon: <TrendingUp size={20} />,
      color: "bg-blue-600",
    },
    {
      label: "Total Orders",
      value: totalOrders || 0,
      change: "+8%",
      up: true,
      icon: <ClipboardList size={20} />,
      color: "bg-orange-500",
    },
    {
      label: "Total Products",
      value: totalProducts || 0,
      change: "+3%",
      up: true,
      icon: <ShoppingBag size={20} />,
      color: "bg-green-500",
    },
    {
      label: "Total Users",
      value: totalUsers || 0,
      change: "+5%",
      up: true,
      icon: <Users size={20} />,
      color: "bg-purple-500",
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back! Here's what's happening.
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white`}
              >
                {stat.icon}
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full
                ${stat.up ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
              >
                {stat.up ? (
                  <ArrowUpRight size={11} />
                ) : (
                  <ArrowDownRight size={11} />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── AREA CHART — Revenue over time ── */}
      <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-white font-black text-lg">Revenue Over Time</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Monthly revenue from real orders
            </p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white/10 border border-white/20 text-white text-xs font-medium px-3 py-2 rounded-lg outline-none cursor-pointer hover:bg-white/20 transition-colors"
          >
            {RANGE_OPTIONS.map((r) => (
              <option key={r} value={r} className="bg-[#1e293b]">
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 h-72">
          {revenueData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No order data yet — place some orders to see revenue chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 5, right: 10, left: -1, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#2563eb", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── BAR CHART + RECENT ORDERS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-black text-gray-800 mb-1">Monthly Breakdown</h2>
          <p className="text-gray-400 text-sm mb-6">Revenue vs Orders</p>
          {revenueData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No data yet
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 0, right: 30, left: -1, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(37,99,235,0.05)" }}
                  />
                  <Legend
                    formatter={(v) => (
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {v}
                      </span>
                    )}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    name="Revenue (₦)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h2 className="font-black text-gray-800 flex items-center gap-2">
              <Package size={17} className="text-blue-600" /> Recent Orders
            </h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {order.id}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {order.user?.username || order.fullName} ·{" "}
                      {order.items?.length} item(s)
                    </p>
                  </div>
                  <span className="font-black text-gray-800 text-sm shrink-0">
                    {formatCurrency(order.total)}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-500"}`}
                  >
                    {order.status?.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
