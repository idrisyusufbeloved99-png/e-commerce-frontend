import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProduct, useCreateReview } from "../hooks/useProducts";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "../hooks/useWishlist";
import { formatCurrency } from "../utils/formatCurrency";

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
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

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="flex flex-col md:flex-row gap-12">
        <Skeleton className="flex-1 aspect-square rounded-3xl" />
        <div className="flex-1 flex flex-col gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, isError } = useProduct(id);

  // review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const createReview = useCreateReview();

  // ✅ wishlist hooks — AFTER product is defined
  const { data: wishlist = [] } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const allImages = [
    ...(product?.imageUrl ? [product.imageUrl] : []),
    ...(product?.images || []),
  ];
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">😕</span>
        <h2 className="text-2xl font-black text-gray-800">Product not found</h2>
        <Link to="/shop" className="text-blue-600 hover:underline font-medium">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  // ✅ this line is now safe — product is guaranteed defined past this point
  const isWishlisted = wishlist.some((item) => item.productId === product.id);

  function handleToggleWishlist() {
    if (isWishlisted) {
      removeFromWishlist.mutate(product.id, {
        onSuccess: () => toast.success("Removed from wishlist"),
      });
    } else {
      addToWishlist.mutate(product.id, {
        onSuccess: () => toast.success("Added to wishlist! ❤️"),
        onError: (err) => {
          if (
            err.message.includes("Authentication") ||
            err.message.includes("token")
          ) {
            toast.error("Please log in to use wishlist");
          } else {
            toast.error(err.message);
          }
        },
      });
    }
  }

  const price = Number(product.unitPrice);
  const originalPrice = product.originalPrice
    ? Number(product.originalPrice)
    : null;
  const discount = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : null;
  const catName = product.category?.name || "";
  const catEmoji = product.category?.emoji || "🛍️";
  const reviews = product.reviews || [];

  function handleSubmitReview(e) {
    e.preventDefault();
    createReview.mutate(
      { productId: product.id, rating: reviewRating, comment: reviewComment },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          setReviewComment("");
          setReviewRating(5);
        },
        onError: (err) => {
          if (err.message.includes("already reviewed")) {
            toast.error("You already reviewed this product");
          } else if (
            err.message.includes("Authentication") ||
            err.message.includes("token")
          ) {
            toast.error("Please log in to leave a review");
          } else {
            toast.error("Something went wrong");
          }
        },
      },
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-blue-600 transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{product.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Image gallery */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Main image */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <span className="text-9xl opacity-40">{catEmoji}</span>
            )}
            {product.badge && (
              <span
                className={`absolute top-5 left-5 text-sm font-bold px-3 py-1.5 rounded-full
        ${product.badge === "Sale" ? "bg-orange-500 text-white" : "bg-blue-600 text-white"}`}
              >
                {product.badge} {discount && `−${discount}%`}
              </span>
            )}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-110"
            >
              <Heart
                size={18}
                className={
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                }
              />
            </button>
          </div>

          {/* Thumbnails — only show if more than 1 image */}
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0
            ${activeImage === index ? "border-blue-600 shadow-md" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-5">
          <div>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
              {catName}
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-2 leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating || 0} size={16} />
            <span className="text-sm text-gray-500">
              ({product.reviewsCount || 0} reviews)
            </span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-gray-900">
              {formatCurrency(price)}
            </span>
            {originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through mb-0.5">
                  {formatCurrency(originalPrice)}
                </span>
                <span className="text-sm font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg mb-0.5">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-500 leading-relaxed">
            {product.description ||
              "No description available for this product yet."}
          </p>

          <div className="border-t border-gray-100 pt-5 flex flex-col gap-4">
            {/* Qty */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-bold"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-gray-800">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {product.stock === 0 && (
              <p className="text-sm font-bold text-red-500">Out of stock</p>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price,
                      category: catName,
                      imageUrl: product.imageUrl || null, // ← add this
                    });
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
              >
                <ShoppingCart size={17} /> Add to Cart
              </button>
              <Link
                to="/checkout"
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200"
              >
                <Zap size={17} /> Buy Now
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { icon: <Truck size={15} />, text: "Free shipping over ₦50,000" },
              { icon: <ShieldCheck size={15} />, text: "Secure checkout" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5"
              >
                <span className="text-blue-600">{b.icon}</span> {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-gray-100 pt-10">
        <h2 className="text-xl font-black text-gray-900 mb-6">
          Customer Reviews ({reviews.length})
        </h2>

        {/* Write a review */}
        <form
          onSubmit={handleSubmitReview}
          className="border border-gray-100 rounded-2xl p-5 mb-8 max-w-2xl flex flex-col gap-4"
        >
          <p className="font-bold text-gray-800 text-sm">Write a review</p>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewRating(star)}
              >
                <Star
                  size={22}
                  className={
                    star <= reviewRating
                      ? "text-orange-400 fill-orange-400"
                      : "text-gray-200 fill-gray-200"
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            rows={3}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
          />

          <button
            type="submit"
            disabled={createReview.isPending}
            className="self-start bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="flex flex-col gap-5 max-w-2xl">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-100 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {review.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      {review.user?.username || "Anonymous"}
                    </p>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
