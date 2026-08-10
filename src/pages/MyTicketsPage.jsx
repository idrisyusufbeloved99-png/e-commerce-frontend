import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMyTickets, useCustomerReply } from "../hooks/useHelp";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const STATUS_CONFIG = {
  OPEN: { label: "Open", color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-500" },
};

const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "bg-gray-100 text-gray-500" },
  MEDIUM: { label: "Medium", color: "bg-orange-100 text-orange-600" },
  HIGH: { label: "High", color: "bg-red-100 text-red-600" },
};

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyTicketsPage() {
  const { data: tickets = [], isLoading } = useMyTickets();
  const [expanded, setExpanded] = useState(null);

  const [replyText, setReplyText] = useState({});
  const customerReply = useCustomerReply();

  function handleCustomerReply(ticketId) {
    const message = replyText[ticketId]?.trim();
    if (!message) return;
    customerReply.mutate(
      { id: ticketId, message },
      {
        onSuccess: () => {
          toast.success("Reply sent!");
          setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
        },
        onError: (err) => toast.error(err.message || "Failed to send reply"),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-4">
        <Skeleton className="h-8 w-48 mb-4" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            My Support Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {tickets.length} conversation(s)
          </p>
        </div>
        <Link
          to="/help"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          <HelpCircle size={15} /> New Message
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
            <MessageSquare size={36} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-black text-gray-700">No messages yet</h2>
          <p className="text-gray-400 text-sm">Need help? Send us a message.</p>
          <Link
            to="/help"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Contact Support →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tickets.map((ticket) => {
            const statusCfg =
              STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
            const priorityCfg =
              PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
            const isOpen = expanded === ticket.id;
            const hasReplies = ticket.replies?.length > 0;
            const lastReply = ticket.replies?.[ticket.replies.length - 1];

            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
                  ${hasReplies && lastReply?.fromAdmin ? "border-blue-200" : "border-gray-100"}`}
              >
                {/* New reply indicator */}
                {hasReplies && lastReply?.fromAdmin && (
                  <div className="bg-blue-600 px-5 py-2 flex items-center gap-2">
                    <MessageSquare size={12} className="text-white" />
                    <p className="text-xs font-bold text-white">
                      New reply from support —{" "}
                      {formatDateTime(lastReply.createdAt)}
                    </p>
                  </div>
                )}

                {/* Header */}
                <div
                  className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors gap-3"
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex flex-col gap-1.5 shrink-0 mt-0.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityCfg.color}`}
                      >
                        {priorityCfg.label}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(ticket.createdAt)}
                      </p>
                      {ticket.orderId && (
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">
                          Order linked
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {ticket.replies?.length || 0} replies
                    </span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded conversation */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="flex flex-col gap-3 pt-4">
                      {/* Original message */}

                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-black text-white shrink-0">
                            {ticket.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-600">
                            You
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateTime(ticket.createdAt)}
                          </span>
                        </div>
                        <div className="mr-9 bg-orange-50 border border-orange-100 rounded-xl p-4 max-w-[85%]">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {ticket.message}
                          </p>
                        </div>
                      </div>

                      {/* Replies */}
                      {ticket.replies?.map((reply) => (
                        <div
                          key={reply.id}
                          className={`flex flex-col gap-1 ${!reply.fromAdmin ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`flex items-center gap-2 ${!reply.fromAdmin ? "flex-row-reverse" : ""}`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0
        ${reply.fromAdmin ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}
                            >
                              {reply.fromAdmin
                                ? "S"
                                : ticket.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-gray-600">
                              {reply.fromAdmin ? "Support Team" : "You"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(reply.createdAt)}
                            </span>
                          </div>
                          <div
                            className={`max-w-[85%] rounded-xl p-4
      ${
        reply.fromAdmin
          ? "ml-9 bg-blue-50 border border-blue-100"
          : "mr-9 bg-orange-50 border border-orange-100"
      }`}
                          >
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {reply.message}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Customer reply form — only if ticket is not closed */}
                      {ticket.status !== "CLOSED" &&
                        ticket.status !== "RESOLVED" && (
                          <div className="border-t border-gray-100 pt-4 mt-2">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                              Add a Reply
                            </p>
                            <div className="flex gap-2">
                              <textarea
                                value={replyText[ticket.id] || ""}
                                onChange={(e) =>
                                  setReplyText((prev) => ({
                                    ...prev,
                                    [ticket.id]: e.target.value,
                                  }))
                                }
                                placeholder="Type your follow-up message..."
                                rows={3}
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                              />
                              <button
                                onClick={() => handleCustomerReply(ticket.id)}
                                disabled={
                                  customerReply.isPending ||
                                  !replyText[ticket.id]?.trim()
                                }
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors self-end flex items-center gap-2 font-bold text-sm shrink-0"
                              >
                                <Send size={14} />
                                {customerReply.isPending ? "..." : "Send"}
                              </button>
                            </div>
                            {ticket.status === "RESOLVED" && (
                              <p className="text-xs text-gray-400 mt-1.5">
                                Sending a reply will reopen this ticket.
                              </p>
                            )}
                          </div>
                        )}

                      {(ticket.status === "CLOSED" ||
                        ticket.status === "RESOLVED") && (
                        <div className="border-t border-gray-100 pt-4 mt-2 text-center">
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold mb-2
      ${
        ticket.status === "RESOLVED"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-gray-50 text-gray-500 border border-gray-200"
      }`}
                          >
                            <CheckCircle2 size={13} />
                            {ticket.status === "RESOLVED"
                              ? "This conversation has been resolved"
                              : "This ticket is closed"}
                          </div>
                          <p className="text-xs text-gray-400">
                            {ticket.status === "RESOLVED"
                              ? "If you still need help, open a new support message."
                              : "Please open a new ticket if you need further assistance."}
                          </p>
                          <Link
                            to="/help"
                            className="text-xs text-blue-600 hover:underline font-medium mt-1 block"
                          >
                            Open New Ticket →
                          </Link>
                        </div>
                      )}

                      {/* No replies yet */}
                      {ticket.replies?.length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-xs">
                          No replies yet — we'll get back to you within 24
                          hours.
                        </div>
                      )}
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
