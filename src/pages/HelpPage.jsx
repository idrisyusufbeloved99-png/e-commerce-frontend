import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useSubmitTicket } from "../hooks/useHelp";
import { useAuth } from "../context/AuthContext";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 3-5 business days within Lagos, and 5-7 days for other states.",
  },
  {
    q: "Can I return a product?",
    a: "Yes! You can request a return within 7 days of delivery. Go to My Orders and click 'Request Return'.",
  },
  {
    q: "How do I track my order?",
    a: "Visit the My Orders page to see real-time status updates on your orders.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major debit/credit cards and bank transfers via Paystack.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes — all payments are processed securely by Paystack. We never store your card details.",
  },
  {
    q: "How do I use a coupon code?",
    a: "Add items to your cart, then enter your coupon code in the cart page before proceeding to checkout.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery. Items must be in original, unused condition with all packaging intact. To request a return, go to My Orders and click 'Request Return' on any delivered order. Returns for damaged, used, or items without original packaging will be rejected. Refunds are processed within 5-10 business days after approval.",
  },
  {
    q: "What items cannot be returned?",
    a: "Items that have been used, damaged by the customer, or are missing original packaging cannot be returned. Perishable goods, digital products, and items marked as 'Final Sale' are not eligible for returns.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const submitTicket = useSubmitTicket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.username || "",
      email: user?.email || "",
    },
  });

  function onSubmit(data) {
    submitTicket.mutate(data, {
      onSuccess: () => {
        setSubmitted(true);
        reset();
      },
      onError: (err) => toast.error(err.message || "Failed to send message"),
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
          <HelpCircle size={28} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-3">Help Center</h1>
        <p className="text-gray-400 text-lg">
          We're here to help. Find answers or contact us below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FAQs */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" /> Frequently
            Asked Questions
          </h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-800 text-sm pr-4">
                    {faq.q}
                  </span>
                  <span
                    className={`text-blue-600 font-black text-lg shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-600 rounded-2xl p-6 text-white">
            <h3 className="font-black text-lg mb-4">Contact Us Directly</h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Mail size={16} />, text: "support@mystore.com" },
                { icon: <Phone size={16} />, text: "+234 800 000 0000" },
                { icon: <MapPin size={16} />, text: "Lagos, Nigeria" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-blue-100"
                >
                  <span className="text-white shrink-0">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-200 mt-4">
              Business hours: Mon–Fri, 9am–6pm WAT
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
            <Mail size={20} className="text-blue-600" /> Send Us a Message
          </h2>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
              <CheckCircle2 size={40} className="text-green-500" />
              <h3 className="font-black text-gray-800 text-lg">
                Message Sent!
              </h3>
              <p className="text-gray-500 text-sm">
                We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-sm font-bold text-blue-600 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    {...register("name", { required: "Required" })}
                    placeholder="John Doe"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                      ${errors.name ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    {...register("email", {
                      required: "Required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid" },
                    })}
                    placeholder="john@email.com"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                      ${errors.email ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Order reference — optional */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                  Order ID{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (optional — if this is about an order)
                  </span>
                </label>
                <input
                  {...register("orderId")}
                  placeholder="e.g. cmrf4elsa000..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                  Subject *
                </label>
                <input
                  {...register("subject", { required: "Required" })}
                  placeholder="e.g. Problem with my order"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                    ${errors.subject ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.subject && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  {...register("message", {
                    required: "Required",
                    minLength: { value: 20, message: "At least 20 characters" },
                  })}
                  placeholder="Describe your issue or question in detail..."
                  rows={5}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors resize-none
                    ${errors.message ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.message && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitTicket.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
              >
                {submitTicket.isPending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
