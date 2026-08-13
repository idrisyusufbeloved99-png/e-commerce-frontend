import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  ShoppingBag,
  Star,
  RotateCcw,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useCart } from "../context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../utils/formatCurrency";
import { useBanners } from "../hooks/useBanners";

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
    desc: "On orders over ₦100,000",
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
  const price = Number(product.unitPrice);
  const original = product.originalPrice ? Number(product.originalPrice) : null;
  const discount =
    original && original > price
      ? Math.round((1 - price / original) * 100)
      : null;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-5xl sm:text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500">
            {catEmoji}
          </span>
        )}

        {/* Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full w-fit">
              -{discount}%
            </span>
          )}
          {product.badge && (
            <span
              className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-sm w-fit
      ${
        product.badge === "Sale"
          ? "bg-orange-500 text-white"
          : product.badge === "Hot"
            ? "bg-red-500 text-white"
            : "bg-blue-600 text-white"
      }`}
            >
              {product.badge === "Hot" ? "🔥 Hot" : product.badge}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <span className="text-[10px] sm:text-xs font-semibold text-blue-500 uppercase tracking-wider">
          {catName}
        </span>

        <h3 className="font-bold text-gray-800 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={10}
              className={
                s <= Math.round(product.rating || 0)
                  ? "text-orange-400 fill-orange-400"
                  : "text-gray-200 fill-gray-200"
              }
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-0.5">
            ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Price row */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          {/* Price */}
          <div>
            <p className="font-black text-gray-900 text-sm leading-none">
              {formatCurrency(price)}
            </p>
            {original && (
              <p className="text-[10px] text-gray-400 line-through mt-0.5">
                {formatCurrency(original)}
              </p>
            )}
          </div>

          {/* Add button — full width */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({
                id: product.id,
                name: product.name,
                price,
                category: catName,
                imageUrl: product.imageUrl || null,
              });
            }}
            disabled={product.stock === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-xl transition-colors"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
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

  const featuredProducts = products.filter((p) => p.homeFeature === true);

  const { data: banners = [] } = useBanners();

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative bg-[#0f172a] overflow-hidden">
        {/* Background effects */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(37,99,235,0.12) 0%, transparent 50%),
        radial-gradient(circle at 80% 30%, rgba(249,115,22,0.08) 0%, transparent 40%)
      `,
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0v1h40V0zm0 39v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-0 ">
          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
            {/* ── LEFT — Text ── */}
            <div
              className="flex-1 flex flex-col gap-6 pt-4 lg:pt-8 text-center lg:text-left w-full
            "
            >
              {/* Label */}
              <div className="flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-orange-400 uppercase bg-orange-400/10 border border-orange-400/20 px-4 py-2 rounded-full">
                  <TrendingUp size={12} />
                  Nigeria's favourite online store
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight">
                Discover Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Lifestyle
                </span>
                <br />
                <span className="text-blue-400">All in One Place.</span>
              </h1>

              {/* Subtext */}
              <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                Gadgets, Kitchenware, Beauty, Fashion — quality products
                delivered fast across Nigeria.
              </p>

              {/* CTAs */}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/shop"
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-xl shadow-orange-500/30 hover:-translate-y-0.5"
                >
                  Shop Now <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white hover:bg-white/10 px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
                >
                  Browse Deals
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 pb-8 lg:pb-16 flex-wrap">
                {[
                  { value: "12K+", label: "Customers" },
                  { value: "500+", label: "Products" },
                  { value: "99%", label: "Satisfaction" },
                  { value: "24/7", label: "Support" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 sm:gap-6"
                  >
                    {i > 0 && <div className="w-px h-7 bg-white/10" />}
                    <div className="text-center lg:text-left">
                      <p className="text-base sm:text-xl font-black text-white">
                        {stat.value}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT — Category image grid ── */}
            <div className="w-full lg:w-[520px] shrink-0 self-end">
              {(() => {
                const categoryImages = [
                  {
                    label: "Gadgets",
                    emoji: "📱",
                    imageUrl:
                      "https://res.cloudinary.com/novqsonh/image/upload/v1786392510/samsung-memory-J8Cfm4W8gd8-unsplash_nq74cp.jpg",
                    slug: "gadgets",
                    gradient: "from-blue-900/80 to-blue-600/40",
                  },
                  {
                    label: "Kitchenware",
                    emoji: "🍳",
                    imageUrl:
                      "https://res.cloudinary.com/novqsonh/image/upload/v1786392495/dada_design-aJDt_9OFXBQ-unsplash_eo7ef4.jpg",
                    slug: "kitchenware",
                    gradient: "from-orange-900/80 to-orange-600/40",
                  },
                  {
                    label: "Beauty",
                    emoji: "✨",
                    imageUrl:
                      "https://res.cloudinary.com/novqsonh/image/upload/v1786392493/johanne-pold-jacobsen-vyhYvCiL3QQ-unsplash_kikzgb.jpg",
                    slug: "beauty",
                    gradient: "from-pink-900/80 to-pink-600/40",
                  },
                  {
                    label: "Fashion",
                    emoji: "👗",
                    imageUrl:
                      "https://res.cloudinary.com/novqsonh/image/upload/v1786392488/alexey-demidov-XYJBcDKpUqU-unsplash_adnd47.jpg",
                    slug: "fashion",
                    gradient: "from-indigo-900/80 to-indigo-600/40",
                  },
                ];

                const getCategoryLink = (slug) => {
                  const cat = categories.find((c) => c.slug === slug);
                  return cat ? `/shop?category=${cat.id}` : "/shop";
                };

                return (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {categoryImages.map((cat, index) => (
                      <Link
                        key={cat.label}
                        to={getCategoryLink(cat.slug)}
                        className={`group relative overflow-hidden rounded-2xl
                    ${index === 0 ? "row-span-2" : ""}
                  `}
                        style={{ minHeight: index === 0 ? "320px" : "152px" }}
                      >
                        {/* Image or gradient fallback */}
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.label}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}
                          >
                            <span
                              className={`opacity-30 group-hover:opacity-50 transition-opacity ${index === 0 ? "text-8xl" : "text-5xl"}`}
                            >
                              {cat.emoji}
                            </span>
                          </div>
                        )}

                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />

                        {/* Label */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                          <p
                            className={`text-white font-black leading-none ${index === 0 ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}
                          >
                            {cat.label}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-white/70 text-xs font-semibold group-hover:gap-2 transition-all">
                            Shop now <ArrowRight size={10} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {banners.map((banner) => (
              <Link
                key={banner.id}
                to={banner.link || "/shop"}
                className="relative flex-1 rounded-2xl overflow-hidden group min-h-[160px]"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[160px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <h3 className="text-white font-black text-xl leading-tight">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-white/80 text-sm mt-1">
                      {banner.subtitle}
                    </p>
                  )}
                  <span className="mt-3 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg w-fit transition-colors">
                    Shop Now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
    </div>
  );
}
