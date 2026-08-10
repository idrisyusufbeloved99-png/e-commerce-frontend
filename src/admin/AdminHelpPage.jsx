import { useState } from "react";
import { HelpCircle, Trash2, ChevronDown, ChevronUp, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  useAllTickets, useUpdateTicketStatus,
  useUpdateTicketPriority, useReplyToTicket, useDeleteTicket,
} from "../hooks/useHelp";

const STATUS_CONFIG = {
  OPEN:        { label: "Open",        color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  RESOLVED:    { label: "Resolved",    color: "bg-green-100 text-green-700" },
  CLOSED:      { label: "Closed",      color: "bg-gray-100 text-gray-500" },
};

const PRIORITY_CONFIG = {
  LOW:    { label: "Low",    color: "bg-gray-100 text-gray-500" },
  MEDIUM: { label: "Medium", color: "bg-orange-100 text-orange-600" },
  HIGH:   { label: "High",   color: "bg-red-100 text-red-600" },
};

const STATUS_OPTIONS   = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminHelpPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch]             = useState("");
  const [expanded, setExpanded]         = useState(null);
  const [replyText, setReplyText]       = useState({});
  const navigate                        = useNavigate();

  const { data: tickets = [], isLoading } = useAllTickets();
  const updateStatus   = useUpdateTicketStatus();
  const updatePriority = useUpdateTicketPriority();
  const replyToTicket  = useReplyToTicket();
  const deleteTicket   = useDeleteTicket();

  function handleUpdateStatus(id, status) {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Ticket marked as ${STATUS_CONFIG[status].label}`),
        onError:   () => toast.error("Failed to update status"),
      }
    );
  }

  function handleUpdatePriority(id, priority) {
    updatePriority.mutate(
      { id, priority },
      {
        onSuccess: () => toast.success(`Priority set to ${PRIORITY_CONFIG[priority].label}`),
        onError:   () => toast.error("Failed to update priority"),
      }
    );
  }

  function handleReply(ticketId) {
    const message = replyText[ticketId]?.trim();
    if (!message) return;
    replyToTicket.mutate(
      { id: ticketId, message },
      {
        onSuccess: () => {
          toast.success("Reply sent!");
          setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
        },
        onError: () => toast.error("Failed to send reply"),
      }
    );
  }

  function handleDelete(ticket) {
    deleteTicket.mutate(ticket.id, {
      onSuccess: () => { toast.success("Ticket deleted"); setExpanded(null); },
      onError:   () => toast.error("Failed to delete ticket"),
    });
  }

  const filtered = tickets.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.orderId || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Help Tickets</h1>
        <p className="text-gray-400 text-sm mt-1">{tickets.length} total tickets</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
            className={`bg-white rounded-2xl border p-4 text-left hover:shadow-md transition-all
              ${filterStatus === key ? "border-blue-300 shadow-md" : "border-gray-100"}`}
          >
            <p className="text-2xl font-black text-gray-900 mb-1">{counts[key] || 0}</p>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-blue-400 transition-colors">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, subject or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
          />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-9 text-sm font-medium text-gray-700 outline-none cursor-pointer shadow-sm">
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Tickets */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <HelpCircle size={40} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-black text-gray-700 mb-1">No tickets found</h3>
          <p className="text-gray-400 text-sm">Customer support tickets will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((ticket) => {
            const statusCfg   = STATUS_CONFIG[ticket.status];
            const priorityCfg = PRIORITY_CONFIG[ticket.priority];
            const isOpen      = expanded === ticket.id;

            return (
              <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header row */}
                <div
                  className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors gap-3"
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex flex-col gap-1.5 shrink-0 mt-0.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-semibold">{ticket.name}</span>
                        {" · "}{ticket.email}
                      </p>
                      {ticket.orderId && (
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">
                          Order: {ticket.orderId.slice(0, 16)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">{formatDateTime(ticket.createdAt)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ticket.replies?.length || 0} replies</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    {/* Metadata row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Full Name</p>
                        <p className="font-semibold text-gray-700 text-sm">{ticket.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                        <p className="font-semibold text-gray-700 text-sm">{ticket.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Submitted</p>
                        <p className="font-semibold text-gray-700 text-sm">{formatDateTime(ticket.createdAt)}</p>
                      </div>
                      {ticket.orderId && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Order Reference</p>
                          <button
                            onClick={() => navigate(`/admin/orders/${ticket.orderId}`)}
                            className="font-semibold text-blue-600 hover:underline text-xs truncate block"
                          >
                            View Order →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Conversation thread */}
                    <div className="flex flex-col gap-3 py-4">
                      {/* Original message */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-black text-gray-600 shrink-0">
                            {ticket.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-600">{ticket.name}</span>
                          <span className="text-xs text-gray-400">{formatDateTime(ticket.createdAt)}</span>
                        </div>
                        <div className="ml-9 bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 leading-relaxed">{ticket.message}</p>
                        </div>
                      </div>

                      {/* Replies */}
                      {ticket.replies?.map((reply) => (
                        <div key={reply.id} className={`flex flex-col gap-1 ${reply.fromAdmin ? "items-end" : ""}`}>
                          <div className={`flex items-center gap-2 ${reply.fromAdmin ? "flex-row-reverse" : ""}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0
                              ${reply.fromAdmin ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                              {reply.fromAdmin ? "A" : ticket.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-gray-600">
                              {reply.fromAdmin ? "Admin" : ticket.name}
                            </span>
                            <span className="text-xs text-gray-400">{formatDateTime(reply.createdAt)}</span>
                          </div>
                          <div className={`max-w-[85%] rounded-xl p-4
                            ${reply.fromAdmin ? "mr-9 bg-blue-50" : "ml-9 bg-gray-50"}`}>
                            <p className="text-sm text-gray-700 leading-relaxed">{reply.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply input */}
                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Send Reply</p>
                      <div className="flex gap-2">
                        <textarea
                          value={replyText[ticket.id] || ""}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Type your reply..."
                          rows={3}
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                        />
                        <button
                          onClick={() => handleReply(ticket.id)}
                          disabled={replyToTicket.isPending || !replyText[ticket.id]?.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors self-end flex items-center gap-2 font-bold text-sm shrink-0"
                        >
                          <Send size={14} />
                          {replyToTicket.isPending ? "..." : "Send"}
                        </button>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start justify-between border-t border-gray-100 pt-4 mt-2">
                      <div className="flex flex-col gap-3 flex-1">
                        {/* Status */}
                        <div>
                          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Status</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((s) => {
                              const c = STATUS_CONFIG[s];
                              return (
                                <button key={s}
                                  onClick={() => handleUpdateStatus(ticket.id, s)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                    ${ticket.status === s
                                      ? `${c.color} ring-2 ring-offset-1 ring-current`
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                  {c.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Priority */}
                        <div>
                          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Priority</p>
                          <div className="flex flex-wrap gap-2">
                            {PRIORITY_OPTIONS.map((p) => {
                              const c = PRIORITY_CONFIG[p];
                              return (
                                <button key={p}
                                  onClick={() => handleUpdatePriority(ticket.id, p)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                    ${ticket.priority === p
                                      ? `${c.color} ring-2 ring-offset-1 ring-current`
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                  {c.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <button onClick={() => handleDelete(ticket)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors shrink-0">
                        <Trash2 size={13} /> Delete Ticket
                      </button>
                    </div>
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