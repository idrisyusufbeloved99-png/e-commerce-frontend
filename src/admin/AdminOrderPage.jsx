import { useState } from "react";
import {
  Search,
  Eye,
  ChevronDown,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllOrders, useUpdateOrderStatus } from "../hooks/useOrders";
import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  PROCESSING: {
    label: "Processing",
    icon: <Clock size={13} />,
    color: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-400",
  },
  SHIPPING: {
    label: "Shipping",
    icon: <Truck size={13} />,
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  DELIVERED: {
    label: "Delivered",
    icon: <CheckCircle2 size={13} />,
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle size={13} />,
    color: "bg-red-100 text-red-500",
    dot: "bg-red-400",
  },
};

const STATUS_OPTIONS = ["PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];

function OrderDetailPanel({ order, onUpdateStatus, onClose }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PROCESSING;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-gray-800">Order Detail</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle size={18} />
        </button>
      </div>

      {/* Current status badge */}
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl ${cfg.color} font-bold text-sm`}
      >
        {cfg.icon} {cfg.label}
        <span className="ml-auto text-xs font-normal opacity-70">
          Current Status
        </span>
      </div>

      {/* Order info */}
      <div className="flex flex-col gap-3">
        {[
          { label: "Order ID", value: order.id },
          { label: "Customer", value: order.user?.username || order.fullName },
          { label: "Email", value: order.email },
          {
            label: "Date",
            value: new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          },
          { label: "Items", value: `${order.items?.length} item(s)` },
          { label: "Total", value: `${formatCurrency(order.total)}` },
          {
            label: "Address",
            value: `${order.address}, ${order.city}, ${order.state}`,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 bg-gray-50 rounded-xl px-3 py-2.5"
          >
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              {label}
            </span>
            <span className="text-sm font-semibold text-gray-700 break-all">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Update status */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">
          Update Status
        </p>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map((s) => {
            const c = STATUS_CONFIG[s];
            const isActive = order.status === s;
            return (
              <button
                key={s}
                onClick={() => onUpdateStatus(order.id, s)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left
                  ${
                    isActive
                      ? `${c.color} ring-2 ring-offset-1 ring-current`
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {c.icon}
                {c.label}
                {isActive && (
                  <CheckCircle2 size={13} className="ml-auto opacity-70" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const { data: orders = [], isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const navigate = useNavigate();

  function handleUpdateStatus(id, status) {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success(`Order updated to ${STATUS_CONFIG[status].label}`);
          if (selected?.id === id) setSelected((s) => ({ ...s, status }));
        },
        onError: () => toast.error("Failed to update order"),
      },
    );
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatus === "all" || o.status === filterStatus);
  });

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Mobile bottom sheet */}
      {selected && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-white rounded-t-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <OrderDetailPanel
              order={selected}
              onUpdateStatus={handleUpdateStatus}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Orders
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {orders.length} total orders
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() =>
                setFilterStatus(filterStatus === key ? "all" : key)
              }
              className={`bg-white rounded-2xl border p-3 sm:p-4 text-left hover:shadow-md transition-all
                ${filterStatus === key ? "border-blue-300 shadow-md" : "border-gray-100"}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {cfg.label}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">
                {counts[key] || 0}
              </p>
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-blue-400 transition-colors">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by order ID, customer or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-9 text-sm font-medium text-gray-700 outline-none cursor-pointer shadow-sm"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 xl:hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No orders found
            </div>
          ) : (
            filtered.map((order) => {
              const cfg =
                STATUS_CONFIG[order.status] || STATUS_CONFIG.PROCESSING;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-blue-600 text-xs truncate max-w-[160px]">
                        {order.id}
                      </p>
                      <p className="font-semibold text-gray-800 text-sm mt-0.5">
                        {order.user?.username || order.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mt-1.5 ${cfg.color}`}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <Eye size={13} /> View & Update Status
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop — table + side panel */}
        <div className="hidden xl:flex gap-5">
          {/* Table */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Order",
                      "Customer",
                      "Date",
                      "Items",
                      "Total",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-gray-400 text-sm"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => {
                      const cfg =
                        STATUS_CONFIG[order.status] || STATUS_CONFIG.PROCESSING;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors
                          ${selected?.id === order.id ? "bg-blue-50" : ""}`}
                        >
                          <td className="px-5 py-4 font-black text-blue-600 text-xs max-w-[120px] truncate">
                            {order.id}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-800">
                              {order.user?.username || order.fullName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {order.email}
                            </p>
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
                          <td className="px-5 py-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(order);
                              }}
                              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                            >
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side panel */}
          {selected && (
            <div className="w-80 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 self-start sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <OrderDetailPanel
                order={selected}
                onUpdateStatus={handleUpdateStatus}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
