import { Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag, Package } from "lucide-react";

export default function OrderSuccessPage() {
  const orderId = "ORD-" + Math.floor(Math.random() * 9000 + 1000);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed! 🎉</h1>
      <p className="text-gray-400 text-sm max-w-sm mb-2">
        Thank you for your order. We'll send a confirmation to your email shortly.
      </p>
      <p className="text-blue-600 font-bold text-sm mb-8">Order ID: {orderId}</p>

      <div className="flex items-center gap-3">
        <Link to="/orders" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200">
          <Package size={15} /> Track Order
        </Link>
        <Link to="/shop" className="flex items-center gap-2 border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
          <ShoppingBag size={15} /> Keep Shopping
        </Link>
      </div>
    </div>
  );
}