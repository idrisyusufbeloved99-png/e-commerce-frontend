import { Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyOrders } from "../hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatCurrency";

const STATUS = {
  PROCESSING: { label: "Processing", icon: <Clock size={13} />,        color: "bg-yellow-100 text-yellow-700" },
  SHIPPING:   { label: "Shipping",   icon: <Truck size={13} />,        color: "bg-blue-100 text-blue-700" },
  DELIVERED:  { label: "Delivered",  icon: <CheckCircle2 size={13} />, color: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Cancelled",  icon: <XCircle size={13} />,      color: "bg-red-100 text-red-500" },
};

const STATUS_STEPS = ["PROCESSING", "SHIPPING", "DELIVERED"];

export default function OrderPage() {
  const { data: orders = [], isLoading } = useMyOrders();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-4">
        <Skeleton className="h-8 w-48 mb-4" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} orders placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <Package size={36} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-black text-gray-700">No orders yet</h2>
          <Link to="/shop" className="text-blue-600 hover:underline text-sm font-medium">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = STATUS[order.status] || STATUS.PROCESSING;
            const currentStepIndex = STATUS_STEPS.indexOf(order.status);

            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-gray-800 text-sm">{order.id}</h3>
                      <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2 border-t border-gray-50 pt-4 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.imageUrl
                          ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                          : <span className="text-sm">🛍️</span>}
                      </div>
                      <div className="flex justify-between w-full text-sm">
                        <span className="text-gray-600">{item.product?.name} <span className="text-gray-400">x{item.quantity}</span></span>
                        <span className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress tracker — only for non-cancelled orders */}
                {order.status !== "CANCELLED" && (
                  <div className="flex items-center gap-1">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStepIndex;
                      const cfg = STATUS[step];
                      return (
                        <div key={step} className="flex items-center gap-1 flex-1">
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white transition-colors
                              ${done ? "bg-blue-600" : "bg-gray-200"}`}>
                              {done && <CheckCircle2 size={10} />}
                            </div>
                            <span className={`text-[10px] font-semibold capitalize ${done ? "text-blue-600" : "text-gray-400"}`}>
                              {cfg.label}
                            </span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mb-4 rounded-full transition-colors ${i < currentStepIndex ? "bg-blue-600" : "bg-gray-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}