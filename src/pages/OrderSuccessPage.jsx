import { useLocation, Link } from "react-router-dom";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const orderId   = state?.orderId || null;
  const reference = state?.reference || null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6 m-10">
      {/* Success icon */}
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900">Order Placed! 🎉</h1>
        <p className="text-gray-400 text-sm max-w-sm">
          Thank you for your order. We'll send a confirmation to your email shortly.
        </p>
      </div>

      {/* Order details */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm w-full max-w-sm flex flex-col gap-3 text-sm">
        {orderId && (
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Order ID</p>
            <p className="font-mono text-xs text-gray-600 break-all">{orderId}</p>
          </div>
        )}
        {reference && (
          <div className="flex flex-col gap-0.5 border-t border-gray-50 pt-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Payment Reference</p>
            <p className="font-mono text-xs text-gray-600 break-all">{reference}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to="/orders"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          <Package size={16} /> Track Order
        </Link>
        <Link
          to="/shop"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors"
        >
          <ShoppingBag size={16} /> Keep Shopping
        </Link>
      </div>
    </div>
  );
}