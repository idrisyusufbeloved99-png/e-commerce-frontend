import { useState } from "react";
import { Link } from "react-router-dom";
import { Store, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "../hooks/useCategories";
import { useSubscribe } from "../hooks/useSubscriber";


const accountLinks = [
  { label: "My Profile", path: "/profile" },
  { label: "My Orders",  path: "/orders" },
  { label: "Cart",       path: "/cart" },
  { label: "Login",      path: "/login" },
  { label: "Register",   path: "/register" },
];

const socials = [
  { label: "FB", href: "#" },
  { label: "TW", href: "#" },
  { label: "IG", href: "#" },
  { label: "YT", href: "#" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const { data: categories = [] } = useCategories();
  const subscribe = useSubscribe();

  function handleSubscribe() {
  if (!email.trim() || !email.includes("@")) {
    toast.error("Please enter a valid email address");
    return;
  }
  subscribe.mutate(email, {
    onSuccess: (data) => {
      toast.success(data.message);
      setEmail("");
    },
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });
}

  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
              <Store size={22} className="text-orange-400" />
              MyStore
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your one-stop shop for Fashion, Gadgets, Kitchenware and more.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: <Mail size={13} />,   text: "support@mystore.com" },
                { icon: <Phone size={13} />,  text: "+234 800 000 0000" },
                { icon: <MapPin size={13} />, text: "Lagos, Nigeria" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <span className="text-orange-400 shrink-0">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Shop — real categories */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white text-xs uppercase tracking-widest">Shop</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/shop" className="text-sm text-slate-400 hover:text-orange-400 transition-colors duration-200">
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/shop?category=${cat.id}`} className="text-sm text-slate-400 hover:text-orange-400 transition-colors duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white text-xs uppercase tracking-widest">Account</h3>
            <ul className="flex flex-col gap-2.5">
              {accountLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-slate-400 hover:text-orange-400 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4 sm:col-span-2 md:col-span-1">
            <h3 className="font-semibold text-white text-xs uppercase tracking-widest">Newsletter</h3>
            <p className="text-sm text-slate-400">Get the latest deals straight to your inbox.</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSubscribe}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-lg transition-colors duration-200"
              >
                Subscribe
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} MyStore. Built for learning purposes.</p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 text-xs font-bold">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}