import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useUseCoupon } from "../hooks/useCoupon";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Loader2, Tag } from "lucide-react";
import request from "../api/client.js";
import { formatCurrency } from "../utils/formatCurrency";

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const useCoupon = useUseCoupon();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: user?.email || "" },
  });

  // read applied coupon from localStorage
  const appliedCoupon = JSON.parse(
    localStorage.getItem("appliedCoupon") || "null",
  );

  // compute totals — matching CartPage logic exactly
  const shipping =
    appliedCoupon?.discountType === "FREE_SHIPPING"
      ? 0
      : cartTotal > 50000 ? 0 : 1500;

  const discount = appliedCoupon
    ? appliedCoupon.discountType === "FREE_SHIPPING"
      ? 0
      : appliedCoupon.discountAmount
    : 0;

  const tax = cartTotal * 0.075;
  const grandTotal = cartTotal + shipping + tax - discount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-5xl">🛒</span>
        <h2 className="text-2xl font-black text-gray-800">
          Nothing to checkout
        </h2>
        <Link to="/shop" className="text-blue-600 hover:underline font-medium">
          ← Go Shopping
        </Link>
      </div>
    );
  }

  async function createOrder(formData) {
    const items = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.qty,
      price: item.price,
    }));

    await request("/orders", {
      method: "POST",
      body: JSON.stringify({
        items,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
      }),
    });
  }

  function onSubmit(data) {
    setLoading(true);

    const amountInKobo = Math.round(grandTotal * 100);

    function onPaymentSuccess(response) {
      createOrder(data)
        .then(() => {
          // increment coupon usedCount if one was applied
          if (appliedCoupon) {
            useCoupon.mutate(appliedCoupon.code);
            localStorage.removeItem("appliedCoupon");
          }
          clearCart();
          toast.success("Order placed successfully! 🎉", {
            description: `Payment ref: ${response.reference}`,
          });
          navigate("/order-success");
        })
        .catch((err) => {
          toast.error("Payment received but order failed. Contact support.");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }

    function onPaymentClose() {
      setLoading(false);
      toast.error("Payment cancelled");
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: data.email,
      amount: amountInKobo,
      currency: "NGN",
      ref: `mystore_${Date.now()}`,
      callback: onPaymentSuccess,
      onClose: onPaymentClose,
    });

    handler.openIframe();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
        <p className="text-gray-400 text-sm mt-1">
          Fill in your details to complete your order
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── FORM ── */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-black text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">
                    First Name
                  </label>
                  <input
                    {...register("firstName", { required: "Required" })}
                    placeholder="John"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                      ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">
                    Last Name
                  </label>
                  <input
                    {...register("lastName", { required: "Required" })}
                    placeholder="Doe"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                      ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">
                    Email
                  </label>
                  <input
                    {...register("email", {
                      required: "Required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email",
                      },
                    })}
                    placeholder="john@example.com"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                      ${errors.email ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">
                    Phone
                  </label>
                  <input
                    {...register("phone", { required: "Required" })}
                    placeholder="+234 800 000 0000"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                      ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-black text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Shipping Address
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5">
                    Street Address
                  </label>
                  <input
                    {...register("address", { required: "Required" })}
                    placeholder="123 Main Street"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                      ${errors.address ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.address && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">
                      City
                    </label>
                    <input
                      {...register("city", { required: "Required" })}
                      placeholder="Lagos"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                        ${errors.city ? "border-red-400" : "border-gray-200"}`}
                    />
                    {errors.city && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">
                      State
                    </label>
                    <input
                      {...register("state", { required: "Required" })}
                      placeholder="Lagos State"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                        ${errors.state ? "border-red-400" : "border-gray-200"}`}
                    />
                    {errors.state && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment note */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-3">
              <ShieldCheck size={20} className="text-blue-600 shrink-0" />
              <p className="text-sm text-blue-700">
                <span className="font-bold">Secure Payment via Paystack.</span>{" "}
                You'll be redirected to complete payment safely.
              </p>
            </div>
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h2 className="font-black text-gray-800 mb-5">Order Summary</h2>

              {/* Cart items */}
              <div className="flex flex-col gap-3 mb-5 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : item.category === "Gadgets" ? (
                        "📱"
                      ) : item.category === "Fashion" ? (
                        "👗"
                      ) : (
                        "🍳"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">x{item.qty}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 shrink-0">
                     {formatCurrency(item.price * item.qty)}

                    </span>
                  </div>
                ))}
              </div>

              {/* Applied coupon banner */}
              {appliedCoupon && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
                  <Tag size={13} className="text-green-600 shrink-0" />
                  <p className="text-xs font-bold text-green-700 flex-1">
                    {appliedCoupon.code} — {appliedCoupon.message}
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm">
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
                      {shipping === 0 ? "FREE" : `{formatCurrency(shipping)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(tax)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-100 pt-2 mt-1">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-orange-200"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(grandTotal)} <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> Secured by Paystack
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
