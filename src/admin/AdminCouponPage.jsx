import { useState } from "react";
import {
  Plus,
  Trash2,
  Tag,
  X,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCoupons,
  useCreateCoupon,
  useToggleCoupon,
  useDeleteCoupon,
} from "../hooks/useCoupon";

const DISCOUNT_TYPES = [
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED_AMOUNT", label: "Fixed Amount ($)" },
  { value: "FREE_SHIPPING", label: "Free Shipping" },
];

function CouponForm({ onClose, isSaving }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { discountType: "PERCENTAGE", maxUses: 1 },
  });
  const createCoupon = useCreateCoupon();
  const discountType = watch("discountType");

  function onSubmit(data) {
    createCoupon.mutate(data, {
      onSuccess: () => {
        toast.success("Coupon created!");
        onClose();
      },
      onError: (err) => toast.error(err.message || "Failed to create coupon"),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">Create Coupon</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 py-5 flex flex-col gap-4"
        >
          {/* Code */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Coupon Code *
            </label>
            <input
              {...register("code", { required: "Code is required" })}
              placeholder="e.g. SUMMER50"
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors uppercase
                ${errors.code ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.code && (
              <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <input
              {...register("description")}
              placeholder="e.g. Summer sale discount"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Discount Type *
            </label>
            <div className="relative">
              <select
                {...register("discountType", { required: true })}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-blue-400 transition-colors cursor-pointer"
              >
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Discount Value — hidden for FREE_SHIPPING */}
          {discountType !== "FREE_SHIPPING" && (
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                Discount Value * {discountType === "PERCENTAGE" ? "(%)" : "($)"}
              </label>
              <input
                {...register("discountValue", {
                  required: "Required",
                  min: { value: 0, message: "Must be positive" },
                })}
                type="number"
                step="0.01"
                placeholder={discountType === "PERCENTAGE" ? "10" : "5.00"}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                  ${errors.discountValue ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.discountValue && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.discountValue.message}
                </p>
              )}
            </div>
          )}

          {/* For FREE_SHIPPING set discountValue to 0 */}
          {discountType === "FREE_SHIPPING" && (
            <input type="hidden" {...register("discountValue")} value="0" />
          )}

          {/* Min Order Subtotal */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Minimum Order Amount ($)
            </label>
            <input
              {...register("minOrderSubtotal")}
              type="number"
              step="0.01"
              placeholder="0.00 (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Max Uses */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Maximum Uses *
            </label>
            <input
              {...register("maxUses", {
                required: "Required",
                min: { value: 1, message: "Min 1" },
              })}
              type="number"
              placeholder="100"
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                ${errors.maxUses ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.maxUses && (
              <p className="text-red-400 text-xs mt-1">
                {errors.maxUses.message}
              </p>
            )}
          </div>

          {/* Start + Expiry dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                Start Date
              </label>
              <input
                {...register("startDate")}
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                Expiry Date
              </label>
              <input
                {...register("expiresAt")}
                type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCoupon.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
            >
              {createCoupon.isPending ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCouponPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: coupons = [], isLoading } = useAdminCoupons();
  const toggleCoupon = useToggleCoupon();
  const deleteCoupon = useDeleteCoupon();

  function handleToggle(coupon) {
    toggleCoupon.mutate(coupon.id, {
      onSuccess: () =>
        toast.success(`Coupon ${coupon.active ? "deactivated" : "activated"}`),
      onError: () => toast.error("Failed to update coupon"),
    });
  }

  function handleDelete(coupon) {
    deleteCoupon.mutate(coupon.id, {
      onSuccess: () => toast.error(`Coupon "${coupon.code}" deleted`),
      onError: () => toast.error("Failed to delete coupon"),
    });
  }

  function getDiscountLabel(coupon) {
    if (coupon.discountType === "PERCENTAGE")
      return `${coupon.discountValue}% off`;
    if (coupon.discountType === "FIXED_AMOUNT")
      return `$${Number(coupon.discountValue).toFixed(2)} off`;
    if (coupon.discountType === "FREE_SHIPPING") return "Free Shipping";
    return "";
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {showForm && <CouponForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Coupons</h1>
            <p className="text-gray-400 text-sm mt-1">
              {coupons.length} coupons created
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={16} /> Create Coupon
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total", value: coupons.length, color: "bg-blue-600" },
            {
              label: "Active",
              value: coupons.filter((c) => c.active).length,
              color: "bg-green-500",
            },
            {
              label: "Inactive",
              value: coupons.filter((c) => !c.active).length,
              color: "bg-gray-400",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div
                className={`w-8 h-8 ${card.color} rounded-xl flex items-center justify-center text-white mb-2`}
              >
                <Tag size={15} />
              </div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-400">{card.label} Coupons</p>
            </div>
          ))}
        </div>

        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Tag size={40} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-black text-gray-700 mb-1">No coupons yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create your first coupon to offer discounts to customers.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Create Coupon
            </button>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-black text-gray-800">{coupon.code}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {coupon.description || "—"}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0
                      ${coupon.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="font-bold text-blue-600">
                      {getDiscountLabel(coupon)}
                    </span>
                    <span>
                      {coupon.usedCount}/{coupon.maxUses} used · 1 per user
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => handleToggle(coupon)}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors
                        ${coupon.active ? "bg-gray-50 hover:bg-gray-100 text-gray-600" : "bg-green-50 hover:bg-green-100 text-green-600"}`}
                    >
                      {coupon.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="flex-1 text-xs font-bold py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        "Code",
                        "Description",
                        "Discount",
                        "Min Order",
                        "Uses",
                        "Expires",
                        "Status",
                        "Actions",
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
                    {coupons.map((coupon) => (
                      <tr
                        key={coupon.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4 font-black text-gray-800">
                          {coupon.code}
                        </td>
                        <td className="px-5 py-4 text-gray-500 max-w-[160px] truncate">
                          {coupon.description || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-blue-600">
                            {getDiscountLabel(coupon)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {coupon.minOrderSubtotal
                            ? `$${Number(coupon.minOrderSubtotal).toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-gray-700 font-semibold text-xs">
                              {coupon.usedCount}/{coupon.maxUses} global
                            </span>
                            <span className="text-gray-400 text-xs">
                              1 use per user
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {coupon.expiresAt
                            ? new Date(coupon.expiresAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Never"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full
                            ${coupon.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {coupon.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggle(coupon)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                ${coupon.active ? "bg-gray-50 hover:bg-gray-100 text-gray-500" : "bg-green-50 hover:bg-green-100 text-green-600"}`}
                            >
                              {coupon.active ? (
                                <ToggleRight size={15} />
                              ) : (
                                <ToggleLeft size={15} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(coupon)}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
