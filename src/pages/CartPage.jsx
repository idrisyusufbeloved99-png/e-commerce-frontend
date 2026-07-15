import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useValidateCoupon } from "../hooks/useCoupon";
import { toast } from "sonner";
import { formatCurrency } from "../utils/formatCurrency";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal } =
    useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(() =>
    JSON.parse(localStorage.getItem("appliedCoupon") || "null"),
  );
  const validateCoupon = useValidateCoupon();

  // ── totals ──
  const shipping =
    appliedCoupon?.discountType === "FREE_SHIPPING"
      ? 0
      : cartTotal > 50000
        ? 0
        : 1500;

  const discount = appliedCoupon
    ? appliedCoupon.discountType === "FREE_SHIPPING"
      ? 0
      : appliedCoupon.discountAmount
    : 0;

  const tax = cartTotal * 0.075;
  const grandTotal = cartTotal + shipping + tax - discount;

  function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    validateCoupon.mutate(
      { code: couponCode, subtotal: cartTotal },
      {
        onSuccess: (data) => {
          setAppliedCoupon(data);
          localStorage.setItem("appliedCoupon", JSON.stringify(data));
          toast.success(data.message);
          setCouponCode("");
        },
        onError: (err) => toast.error(err.message || "Invalid coupon code"),
      },
    );
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    localStorage.removeItem("appliedCoupon");
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-5">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
          <ShoppingBag size={40} className="text-blue-300" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 text-sm">
            Looks like you haven't added anything yet.
          </p>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
        >
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Your Cart
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {cartItems.reduce((s, i) => s + i.qty, 0)} items
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* ── CART ITEMS ── */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 sm:gap-5 bg-white border border-gray-100 rounded-2xl p-3 sm:p-5 hover:border-blue-100 hover:shadow-md transition-all"
            >
              {/* Image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl">
                    {item.category === "Gadgets"
                      ? "📱"
                      : item.category === "Fashion"
                        ? "👗"
                        : item.category === "Beauty"
                          ? "✨"
                          : "🍳"}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-blue-500 uppercase tracking-wider mb-0.5">
                  {item.category}
                </p>
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-2 leading-snug">
                  {item.name}
                </h3>
                <p className="text-orange-500 font-black text-sm sm:text-base mt-1">
                  {formatCurrency(item.price)}
                </p>
              </div>

              {/* Qty + subtotal + remove */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>

                {/* Qty controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-200 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-colors"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="w-6 sm:w-8 text-center font-bold text-gray-800 text-sm">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-gray-200 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center transition-colors"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Subtotal */}
                <p className="font-black text-gray-900 text-sm sm:text-base">
                  {formatCurrency(item.price * item.qty)}
                </p>
              </div>
            </div>
          ))}

          {/* Coupon input */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mt-2">
            <p className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
              <Tag size={14} className="text-blue-600" /> Apply Coupon
            </p>

            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validateCoupon.isPending || !couponCode.trim()}
                  className="shrink-0 bg-gray-900 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  {validateCoupon.isPending ? "..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                  <CheckCircle2 size={15} />
                  {appliedCoupon.code} — {appliedCoupon.message}
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-green-600 hover:text-red-500 transition-colors font-medium ml-2 shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div className="lg:w-96 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 sticky top-24">
            <h2 className="text-lg font-black text-gray-900 mb-5">
              Order Summary
            </h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="font-bold">-{formatCurrency(discount)}</span>
                </div>
              )}

              {appliedCoupon?.discountType === "FREE_SHIPPING" && (
                <div className="flex justify-between text-green-600">
                  <span>Shipping (coupon)</span>
                  <span className="font-bold">FREE</span>
                </div>
              )}

              {appliedCoupon?.discountType !== "FREE_SHIPPING" && (
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span
                    className={`font-semibold ${shipping === 0 ? "text-green-500" : "text-gray-800"}`}
                  >
                    {shipping === 0 ? "FREE" : `${formatCurrency(shipping)}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Tax (7.5%)</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(tax)}
                </span>
              </div>

              {shipping > 0 && !appliedCoupon && (
                <div className="bg-blue-50 text-blue-600 text-xs font-medium rounded-xl px-4 py-2.5 text-center">
                  Add {formatCurrency(50000 - cartTotal)} more for free
                  shipping!
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-xl text-gray-900">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-5 sm:mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 sm:py-4 rounded-xl transition-colors shadow-lg shadow-blue-200"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link
              to="/shop"
              className="mt-3 w-full flex items-center justify-center text-sm text-gray-400 hover:text-blue-600 transition-colors py-2"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
