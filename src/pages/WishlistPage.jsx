import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart, X } from "lucide-react";
import { useWishlist, useRemoveFromWishlist } from "../hooks/useWishlist";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={11} className={s <= Math.round(rating) ? "text-orange-400 fill-orange-400" : "text-gray-200 fill-gray-200"} />
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { data: wishlist = [], isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <Heart size={36} className="text-red-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your wishlist is empty</h2>
        <p className="text-gray-400 text-sm">Save items you love by tapping the heart icon.</p>
        <Link to="/shop" className="text-blue-600 hover:underline font-medium text-sm">
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">My Wishlist</h1>
      <p className="text-gray-400 text-sm mb-8">{wishlist.length} saved items</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {wishlist.map((item) => {
          const product = item.product;
          const price = Number(product.unitPrice);
          const catEmoji = product.category?.emoji || "🛍️";

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl opacity-50">{catEmoji}</span>
                )}
              </Link>

              <button
                onClick={() => removeFromWishlist.mutate(product.id, {
                  onSuccess: () => toast.success("Removed from wishlist"),
                })}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center"
              >
                <X size={13} className="text-gray-500" />
              </button>

              <div className="p-3 sm:p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-bold text-gray-800 text-sm mb-1.5 line-clamp-2">{product.name}</h3>
                </Link>
                <StarRating rating={product.rating || 0} />
                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-gray-900">${price.toFixed(2)}</span>
                  <button
                    onClick={() => {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price,
                        category: product.category?.name || "",
                      });
                      toast.success("Added to cart!");
                    }}
                    className="text-xs bg-blue-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
                  >
                    <ShoppingCart size={12} /> Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}