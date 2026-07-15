import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, Star, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "../utils/formatCurrency";


const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
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
  const catLabel = product.category?.name || "";
  const catEmoji = product.category?.emoji || "🛍️";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-5xl sm:text-6xl opacity-50 group-hover:scale-110 transition-transform duration-500">
              {catEmoji}
            </span>
          )}
          {product.badge && (
            <span
              className={`absolute top-2 left-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full
              ${product.badge === "Sale" ? "bg-orange-500 text-white" : "bg-blue-600 text-white"}`}
            >
              {product.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
          {catLabel}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-800 text-xs sm:text-sm mt-1 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.rating || 0} />
          <span className="text-[10px] text-gray-400">
            ({product.reviewsCount || 0})
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-auto">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="font-black text-gray-900 text-sm sm:text-base">
              {formatCurrency(product.unitPrice)}
            </span>
            {product.originalPrice && (
              
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>

            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.unitPrice),
                category: catLabel,
                imageUrl: product.imageUrl || null, // ← add this
              });
            }}
            className="shrink-0 text-[10px] sm:text-xs bg-blue-600 hover:bg-orange-500 text-white px-2 sm:px-3 py-1.5 rounded-lg font-bold transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 sm:p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between items-center mt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function FilterDrawer({ open, onClose, priceRange, setPriceRange }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-800 flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-blue-600" /> Filters
          </h3>
          <button onClick={onClose}>
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="mb-6">
            <p className="text-sm font-bold text-gray-700 mb-3">Price Range</p>
            <input
              type="range"
              min={0}
              max={5000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>$0</span>
              <span className="font-bold text-blue-600">${priceRange[1]}</span>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filterDrawer, setFilterDrawer] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  function setCategory(categoryId) {
    const next = new URLSearchParams(searchParams);
    if (categoryId === "all") next.delete("category");
    else next.set("category", categoryId);
    next.delete("search");
    setSearchParams(next);
    setSearch("");
  }

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all")
      list = list.filter((p) => p.categoryId === activeCategory);
    if (search.trim())
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    list = list.filter(
      (p) =>
        Number(p.unitPrice) >= priceRange[0] &&
        Number(p.unitPrice) <= priceRange[1],
    );
    if (sort === "price-asc") list.sort((a, b) => a.unitPrice - b.unitPrice);
    if (sort === "price-desc") list.sort((a, b) => b.unitPrice - a.unitPrice);
    if (sort === "rating")
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [activeCategory, products, search, sort, priceRange]);

  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <>
      <FilterDrawer
        open={filterDrawer}
        onClose={() => setFilterDrawer(false)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      <div className="bg-gray-50 min-h-screen">
        <div className="bg-[#0f172a] text-white">
          <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm mb-3">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white font-medium capitalize">
                {activeCategory === "all" ? "All Products" : activeCat?.name}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <span className="text-4xl sm:text-5xl">
                {activeCat?.emoji || "🛍️"}
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  {activeCategory === "all" ? "All Products" : activeCat?.name}
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  {filtered.length} products
                </p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setCategory("all")}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0
                  ${activeCategory === "all" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
              >
                🛍️ All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0
                    ${activeCategory === cat.id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex gap-2 sm:gap-3 mb-6">
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-blue-400 transition-colors shadow-sm">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={13} className="text-gray-400" />
                </button>
              )}
            </div>

            <div className="relative hidden sm:block">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-9 text-sm font-medium text-gray-700 outline-none cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            <button
              onClick={() => setFilterDrawer(true)}
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-400 transition-colors shrink-0"
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:block">Filters</span>
            </button>
          </div>

          <div className="sm:hidden mb-4">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-medium text-gray-700 outline-none cursor-pointer shadow-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <aside className="w-56 shrink-0 hidden lg:block">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
                <h3 className="font-black text-gray-800 mb-5 flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-blue-600" />{" "}
                  Filters
                </h3>
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    Price Range
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>$0</span>
                    <span className="font-bold text-blue-600">{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <span className="text-5xl">🔍</span>
                  <h3 className="text-lg font-black text-gray-700">
                    No products found
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
