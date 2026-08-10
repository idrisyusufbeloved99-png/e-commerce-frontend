import { useState } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllReturns, useUpdateReturnStatus } from "../hooks/useReturns";
import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-700" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-500" },
  REFUNDED: { label: "Refunded", color: "bg-green-100 text-green-700" },
};

const REASON_LABELS = {
  DAMAGED: "Item arrived damaged",
  WRONG_ITEM: "Wrong item received",
  NOT_AS_DESCRIBED: "Not as described",
  CHANGED_MIND: "Changed mind",
  OTHER: "Other",
};

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED", "REFUNDED"];

export default function AdminReturnPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: returns = [], isLoading } = useAllReturns();
  const updateStatus = useUpdateReturnStatus();

  const navigate = useNavigate();

  function handleUpdateStatus(id, status) {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(`Return marked as ${STATUS_CONFIG[status].label}`),
        onError: () => toast.error("Failed to update return status"),
      },
    );
  }

  const filtered = returns.filter(
    (r) => filterStatus === "all" || r.status === filterStatus,
  );

  const counts = returns.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Returns & Refunds</h1>
        <p className="text-gray-400 text-sm mt-1">
          {returns.length} total requests
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
            className={`bg-white rounded-2xl border p-4 text-left hover:shadow-md transition-all
              ${filterStatus === key ? "border-blue-300 shadow-md" : "border-gray-100"}`}
          >
            <p className="text-2xl font-black text-gray-900 mb-1">
              {counts[key] || 0}
            </p>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}
            >
              {cfg.label}
            </span>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-9 text-sm font-medium text-gray-700 outline-none cursor-pointer shadow-sm"
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

      {/* Returns list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <RotateCcw size={40} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-black text-gray-700 mb-1">No return requests</h3>
          <p className="text-gray-400 text-sm">
            Return requests from customers will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((r) => {
            const cfg = STATUS_CONFIG[r.status];
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">
                          Customer
                        </p>
                        <p className="font-semibold text-gray-700">
                          {r.user?.username}
                        </p>
                        <p className="text-xs text-gray-400">{r.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">
                          Order
                        </p>
                        <button
                          onClick={() => navigate(`/admin/orders/${r.orderId}`)}
                          className="font-semibold text-blue-600 hover:underline text-xs truncate block max-w-[160px]"
                        >
                          {r.orderId}
                        </button>
                        <p className="text-xs text-orange-500 font-bold">
                          {formatCurrency(r.order?.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">
                          Reason
                        </p>
                        <p className="font-semibold text-gray-700">
                          {REASON_LABELS[r.reason]}
                        </p>
                      </div>
                      {r.details && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">
                            Details
                          </p>
                          <p className="text-gray-600 text-xs">{r.details}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider">
                      Update
                    </p>
                    {STATUS_OPTIONS.map((s) => {
                      const c = STATUS_CONFIG[s];
                      const isActive = r.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(r.id, s)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all w-full text-left
                            ${
                              isActive
                                ? `${c.color} ring-2 ring-offset-1 ring-current`
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-gray-100 mt-4 pt-4">
            <button
              onClick={() => navigate(`/admin/orders/${r.orderId}?from=return`)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
            >
              View Full Order Details →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
