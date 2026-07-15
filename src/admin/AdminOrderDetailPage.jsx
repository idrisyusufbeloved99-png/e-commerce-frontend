import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useOrderDetail, useUpdateOrderStatus } from "../hooks/useOrders";
import { formatCurrency } from "../utils/formatCurrency";

const STATUS_CONFIG = {
  PROCESSING: {
    label: "Processing",
    icon: <Clock size={14} />,
    color: "bg-yellow-100 text-yellow-700",
    step: 0,
  },
  SHIPPING: {
    label: "Shipping",
    icon: <Truck size={14} />,
    color: "bg-blue-100 text-blue-700",
    step: 1,
  },
  DELIVERED: {
    label: "Delivered",
    icon: <CheckCircle2 size={14} />,
    color: "bg-green-100 text-green-700",
    step: 2,
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle size={14} />,
    color: "bg-red-100 text-red-500",
    step: -1,
  },
};

const STATUS_OPTIONS = ["PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED"];

export default function AdminOrderDetailPage({ hideCustomerInfo = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrderDetail(id);
  const updateStatus = useUpdateOrderStatus();
  const [searchParams] = useSearchParams();
  const fromUser = searchParams.get("from") === "user";

  function handleUpdateStatus(status) {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(`Order updated to ${STATUS_CONFIG[status].label}`),
        onError: () => toast.error("Failed to update status"),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-gray-400">Order not found</p>
        <button
          onClick={() => navigate(fromUser ? -1 : "/admin/orders")}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium w-fit"
        >
          <ArrowLeft size={16} /> {fromUser ? "Back to User" : "Back to Orders"}
        </button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PROCESSING;
  const currentStep = cfg.step;
  const subtotal = order.items.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <button
        onClick={() => navigate("/admin/orders")}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium w-fit"
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Order header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Order ID
            </p>
            <h1 className="text-lg font-black text-gray-900 break-all">
              {order.id}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm w-fit ${cfg.color}`}
          >
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Progress tracker — only for non-cancelled */}
        {order.status !== "CANCELLED" && (
          <div className="flex items-center mt-6">
            {["PROCESSING", "SHIPPING", "DELIVERED"].map((step, i) => {
              const sCfg = STATUS_CONFIG[step];
              const done = i <= currentStep;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors
                      ${done ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      {done ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <span className="text-xs text-gray-400">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${done ? "text-blue-600" : "text-gray-400"}`}
                    >
                      {sCfg.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors
                      ${i < currentStep ? "bg-blue-600" : "bg-gray-200"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── ORDER ITEMS ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package size={17} className="text-blue-600" />
              <h2 className="font-black text-gray-800">
                Order Items ({order.items.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl">
                        {item.product?.category?.emoji || "🛍️"}
                      </span>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.product?.category?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-lg">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatCurrency(item.price)} each
                      </span>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0">
                    <p className="font-black text-gray-900">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span
                  className={`font-semibold ${Number(order.shipping) === 0 ? "text-green-500" : "text-gray-800"}`}
                >
                  {Number(order.shipping) === 0
                    ? "FREE"
                    : formatCurrency(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(order.tax)}
                </span>
              </div>
              <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-5">
          {/* Customer info */}
          {!fromUser && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <User size={16} className="text-blue-600" /> Customer
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shrink-0">
                    {order.user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {order.user?.username}
                    </p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/users/${order.user?.id}`)}
                  className="w-full text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl transition-colors"
                >
                  View Full Profile →
                </button>
              </div>
            </div>
          )}

          {/* Shipping address */}
          {!fromUser && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" /> Shipping Address
              </h2>
              <div className="flex flex-col gap-2.5 text-sm">
                {[
                  { icon: <User size={13} />, label: order.fullName },
                  { icon: <Mail size={13} />, label: order.email },
                  { icon: <Phone size={13} />, label: order.phoneNumber },
                  {
                    icon: <MapPin size={13} />,
                    label: `${order.address}, ${order.city}, ${order.state}`,
                  },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-start gap-2.5 text-gray-600"
                  >
                    <span className="text-blue-500 mt-0.5 shrink-0">
                      {icon}
                    </span>
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update status */}
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-800 mb-4">Update Status</h2>
            <div className="flex flex-col gap-2">
              {STATUS_OPTIONS.map((s) => {
                const c = STATUS_CONFIG[s];
                const isActive = order.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(s)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full text-left
                      ${
                        isActive
                          ? `${c.color} ring-2 ring-offset-1 ring-current`
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    {c.icon} {c.label}
                    {isActive && (
                      <CheckCircle2 size={13} className="ml-auto opacity-70" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
