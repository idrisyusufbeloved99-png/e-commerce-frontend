import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMyOrders } from "../hooks/useOrders";
import { useMyReturns, useRequestReturn } from "../hooks/useReturns";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../utils/formatCurrency";
import { toast } from "sonner";

const STATUS = {
  PROCESSING: {
    label: "Processing",
    icon: <Clock size={13} />,
    color: "bg-yellow-100 text-yellow-700",
  },
  SHIPPING: {
    label: "Shipping",
    icon: <Truck size={13} />,
    color: "bg-blue-100 text-blue-700",
  },
  DELIVERED: {
    label: "Delivered",
    icon: <CheckCircle2 size={13} />,
    color: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: <XCircle size={13} />,
    color: "bg-red-100 text-red-500",
  },
};

const RETURN_STATUS = {
  PENDING: {
    label: "Return Pending — Under Review",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  APPROVED: {
    label: "Return Approved — Being Processed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  REJECTED: {
    label: "Return Rejected",
    color: "bg-red-50 text-red-500 border-red-200",
  },
  REFUNDED: {
    label: "Refunded ✓",
    color: "bg-green-50 text-green-700 border-green-200",
  },
};

const STATUS_STEPS = ["PROCESSING", "SHIPPING", "DELIVERED"];

function ReturnStatusBadge({ order, returns, onRequestReturn }) {
  const existingReturn = returns.find((r) => r.orderId === order.id);

  if (existingReturn) {
    const cfg = RETURN_STATUS[existingReturn.status] || RETURN_STATUS.PENDING;
    return (
      <div
        className={`mt-3 w-full text-xs font-bold border py-2.5 rounded-xl text-center ${cfg.color}`}
      >
        {cfg.label}
      </div>
    );
  }

  if (order.status !== "DELIVERED") return null;

  // Check 7-day window on frontend too
  const daysLeft = order.deliveredAt
    ? 7 -
      Math.floor(
        (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24),
      )
    : 7; // assume full window if no deliveredAt yet

  if (daysLeft <= 0) {
    return (
      <div className="mt-3 w-full text-xs text-gray-400 border border-gray-100 py-2.5 rounded-xl text-center">
        Return window expired
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-1">
      <button
        onClick={() => onRequestReturn(order)}
        className="w-full text-xs font-bold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
      >
        <RotateCcw size={12} /> Request Return / Refund
      </button>
      <p className="text-[10px] text-gray-400 text-center">
        {daysLeft} day(s) remaining · Item must be in original condition
      </p>
    </div>
  );
}

export default function OrderPage() {
  const { data: orders = [], isLoading } = useMyOrders();
  const { data: returns = [] } = useMyReturns();
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState("DAMAGED");
  const [returnDetails, setReturnDetails] = useState("");
  const requestReturn = useRequestReturn();

  const [agreedToCondition, setAgreedToCondition] = useState(false);

  function handleRequestReturn() {
    requestReturn.mutate(
      { orderId: returnModal.id, reason: returnReason, details: returnDetails },
      {
        onSuccess: () => {
          toast.success("Return request submitted!");
          setReturnModal(null);
          setReturnDetails("");
          setReturnReason("DAMAGED");
        },
        onError: (err) => toast.error(err.message || "Failed to submit return"),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-4">
        <Skeleton className="h-8 w-48 mb-4" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Return request modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="font-black text-gray-900 text-lg">
              Request Return / Refund
            </h2>
            <p className="text-xs text-gray-400 break-all">
              Order: {returnModal.id}
            </p>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                Reason
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
              >
                <option value="DAMAGED">Item arrived damaged</option>
                <option value="WRONG_ITEM">Wrong item received</option>
                <option value="NOT_AS_DESCRIBED">Not as described</option>
                <option value="CHANGED_MIND">Changed my mind</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                Additional Details{" "}
                <span className="font-normal text-gray-400 normal-case">
                  (optional)
                </span>
              </label>
              <textarea
                value={returnDetails}
                onChange={(e) => setReturnDetails(e.target.value)}
                placeholder="Describe the issue in more detail..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
              />
            </div>

            {/* Add this inside the modal before the submit button */}

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <input
                type="checkbox"
                id="condition"
                checked={agreedToCondition}
                onChange={(e) => setAgreedToCondition(e.target.checked)}
                className="mt-0.5 accent-orange-500 cursor-pointer shrink-0"
              />
              <label
                htmlFor="condition"
                className="text-xs text-amber-800 cursor-pointer leading-relaxed"
              >
                I confirm that the item is in its{" "}
                <strong>original condition</strong>, unused, with all original
                packaging and tags intact. I understand that returns of damaged
                or used items will be rejected.
              </label>
            </div>

            {/* Disable submit until agreed */}

            <div className="flex gap-2">
              <button
                onClick={() => setReturnModal(null)}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReturn}
                disabled={requestReturn.isPending || !agreedToCondition}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                {requestReturn.isPending ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          My Orders
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {orders.length} orders placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <Package size={36} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-black text-gray-700">No orders yet</h2>
          <Link
            to="/shop"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = STATUS[order.status] || STATUS.PROCESSING;
            const currentStepIndex = STATUS_STEPS.indexOf(order.status);

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 hover:border-blue-200 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${status.color}`}
                      >
                        {status.icon} {status.label}
                      </span>
                    </div>
                    {/* Order ID — truncated on mobile */}
                    <p className="text-xs text-gray-400 font-mono truncate max-w-[220px] sm:max-w-full">
                      {order.id}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="font-black text-gray-900 text-base sm:text-lg">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.items?.length} item(s)
                    </p>
                  </div>
                </div>
                {/* Items */}
                <div className="flex flex-col gap-2.5 border-t border-gray-50 pt-4 mb-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {/* Product image */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product?.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-sm">🛍️</span>
                        )}
                      </div>
                      {/* Product name + qty */}
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {item.product?.name}
                          <span className="text-gray-400 ml-1">
                            x{item.quantity}
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 shrink-0">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Progress tracker — non-cancelled only */}
                {order.status !== "CANCELLED" && (
                  <div className="flex items-center gap-1 mb-4">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStepIndex;
                      const cfg = STATUS[step];
                      return (
                        <div
                          key={step}
                          className="flex items-center gap-1 flex-1"
                        >
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors
                              ${done ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                            >
                              {done ? (
                                <CheckCircle2 size={10} />
                              ) : (
                                <span className="text-[9px] text-gray-400 font-bold">
                                  {i + 1}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[9px] sm:text-[10px] font-semibold text-center
                              ${done ? "text-blue-600" : "text-gray-400"}`}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 mb-4 rounded-full transition-colors
                              ${i < currentStepIndex ? "bg-blue-600" : "bg-gray-200"}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Return / Refund button or status */}
                <ReturnStatusBadge
                  order={order}
                  returns={returns}
                  onRequestReturn={setReturnModal}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
