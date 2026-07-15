import { useState } from "react";
import { Mail, Trash2, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscribers, useDeleteSubscriber } from "../hooks/useSubscriber";

export default function AdminSubscriberPage() {
  const [search, setSearch] = useState("");
  const { data: subscribers = [], isLoading } = useSubscribers();
  const deleteSubscriber = useDeleteSubscriber();

  function handleDelete(sub) {
    deleteSubscriber.mutate(sub.id, {
      onSuccess: () => toast.success(`${sub.email} removed`),
      onError: () => toast.error("Failed to remove subscriber"),
    });
  }

  function handleExport() {
    const csv = [
      "Email,Subscribed On",
      ...filtered.map((s) =>
        `${s.email},${new Date(s.createdAt).toLocaleDateString("en-GB")}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Subscribers exported!");
  }

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-400 text-sm mt-1">{subscribers.length} total subscribers</p>
        </div>
        <button
          onClick={handleExport}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
          <Mail size={20} />
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900">{subscribers.length}</p>
          <p className="text-sm text-gray-400">Total Subscribers</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-bold text-gray-700">
            Latest: {subscribers[0]
              ? new Date(subscribers[0].createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : "—"}
          </p>
          <p className="text-xs text-gray-400">Most recent subscriber</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-sm shadow-sm focus-within:border-blue-400 transition-colors">
        <Search size={15} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Mail size={40} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-black text-gray-700 mb-1">No subscribers yet</h3>
          <p className="text-gray-400 text-sm">Subscribers will appear here once people sign up via the footer.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["#", "Email", "Subscribed On", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub, index) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 text-xs">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Mail size={13} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-700">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(sub)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}