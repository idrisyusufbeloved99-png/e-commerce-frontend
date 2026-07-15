import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useCart } from "../context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../utils/formatCurrency";

const CATEGORY_COLORS = {
  fashion: "from-blue-600 to-blue-800",
  gadgets: "from-orange-500 to-orange-700",
  kitchenware: "from-slate-700 to-slate-900",
  beauty: "from-blue-400 to-blue-600",
};

const stats = [
  { value: "12K+", label: "Happy Customers", icon: "😊" },
  { value: "3K+", label: "Products", icon: "📦" },
  { value: "99%", label: "Satisfaction", icon: "⭐" },
  { value: "24/7", label: "Support", icon: "🎧" },
];

const perks = [
  {
    icon: <Truck size={20} />,
    title: "Free Shipping",
    desc: "On orders over ₦50,000",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Secure Payment",
    desc: "100% protected",
  },
  {
    icon: <HeadphonesIcon size={20} />,
    title: "24/7 Support",
    desc: "Always here for you",
  },
  {
    icon: <ShoppingBag size={20} />,
    title: "Easy Returns",
    desc: "30-day hassle-free",
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={
            s <= Math.round(rating)
              ? "text-orange-400 fill-orange-400"
              : "text-gray-200 fill-gray-200"
          }
        />
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const catName = product.category?.name || "";
  const catEmoji = product.category?.emoji || "🛍️";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <span className="text-7xl group-hover:scale-110 transition-transform duration-500 opacity-60">
            {catEmoji}
          </span>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md max-sm:text-[7px]
              ${product.badge === "Sale" ? "bg-orange-500 text-white" : "bg-blue-600 text-white"}`}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-600 to-transparent py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.unitPrice),
                category: catName,
                imageUrl: product.imageUrl || null, // ← add this
              });
            }}
            className="w-full text-xs font-bold text-white text-center"
          >
            + Quick Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 max-sm:p-2">
        <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">
          {catName}
        </span>
        <h3 className="font-bold text-gray-800 mt-1 mb-2 text-sm group-hover:text-blue-600 transition-colors leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.rating || 0} />
          <span className="text-[11px] text-gray-400">
            ({product.reviewsCount || 0})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-black text-gray-900 text-base max-sm:text-xs">
              {formatCurrency(product.unitPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          {product.originalPrice && (
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg max-sm:py-0.3 max-sm:px-1">
              -
              {Math.round(
                (1 -
                  Number(product.unitPrice) / Number(product.originalPrice)) *
                  100,
              )}
              % %
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-5 w-16 mt-1" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const featuredProducts = products.filter((p) => p.homeFeature);

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative bg-[#0f172a] overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #f97316 0%, transparent 40%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-24 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-7">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-orange-400 uppercase bg-orange-400/10 border border-orange-400/20 px-3 py-1.5 rounded-full">
                <TrendingUp size={12} /> New arrivals weekly
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Shop the{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Future
                </span>
              </span>
              <br />
              <span className="text-blue-400">Live Bold.</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Thousands of products across Fashion, Gadgets, Kitchenware and
              more. Delivered fast, priced right.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop"
                className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white hover:bg-white/10 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
              >
                Browse Deals
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div>
                <p className="text-xl font-black text-white">12K+</p>
                <p className="text-xs text-slate-500">Customers</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-xl font-black text-white">3K+</p>
                <p className="text-xs text-slate-500">Products</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-xl font-black text-white">99%</p>
                <p className="text-xs text-slate-500">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center">
            <div className="relative w-80 h-80">
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/20 animate-spin"
                style={{ animationDuration: "20s" }}
              />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-600/20 to-orange-500/20 blur-xl" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <span className="text-7xl">🛍️</span>
              </div>
              <div
                className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/40 animate-bounce"
                style={{ animationDuration: "2s" }}
              >
                New In!
              </div>
              <div className="absolute -bottom-2 -left-2 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ⭐ Top Rated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PERKS BAR ── */}
      <section className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white shrink-0">
                {perk.icon}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{perk.title}</p>
                <p className="text-blue-200 text-xs">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-black tracking-widest text-orange-500 uppercase mb-2">
              Explore
            </p>
            <h2 className="text-4xl font-black text-gray-900">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 group max-sm:w-50"
          >
            All products{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoriesLoading
            ? [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className={`relative bg-gradient-to-br ${CATEGORY_COLORS[cat.slug] || "from-blue-600 to-blue-800"} rounded-2xl p-6 overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="absolute -bottom-4 -right-4 text-8xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300">
                    {cat.emoji}
                  </div>
                  <span className="text-4xl block mb-4 relative z-10 max-sm:flex max-sm:justify-center">
                    {cat.emoji}
                  </span>
                  <h3 className="font-black text-white text-lg relative z-10 max-sm:flex max-sm:justify-center">
                    {cat.name}
                  </h3>
                  <p className="text-white/60 text-xs mt-1 relative z-10 max-sm:flex max-sm:justify-center">
                    {cat._count?.products ?? 0} items
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-white/80 text-xs font-semibold relative z-10 group-hover:gap-2 transition-all max-sm:flex max-sm:justify-center">
                    Shop now <ArrowRight size={12} />
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-black tracking-widest text-orange-500 uppercase mb-2">
                Hand Picked
              </p>
              <h2 className="text-4xl font-black text-gray-900">
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 group max-sm:w-50"
            >
              View all{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {productsLoading ? (
              [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : featuredProducts.length === 0 ? (
              <p className="col-span-full text-center text-gray-400 py-10">
                No featured products yet
              </p>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="relative bg-[#0f172a] rounded-3xl overflow-hidden px-10 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 10% 50%, #f97316 0%, transparent 50%),
                                radial-gradient(circle at 90% 50%, #3b82f6 0%, transparent 50%)`,
            }}
          />
          <div className="relative z-10 space-y-4">
            <span className="text-xs font-black tracking-widest text-orange-400 uppercase bg-orange-400/10 border border-orange-400/20 px-3 py-1.5 rounded-full">
              Limited Time
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Up to <span className="text-orange-400">50% Off</span>
              <br />
              on Gadgets
            </h2>
            <p className="text-slate-400">
              Don't miss out — deals end this Sunday.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Link
              to="/shop"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black text-sm transition-all duration-200 shadow-xl shadow-orange-500/30 hover:-translate-y-0.5"
            >
              Grab the Deal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
