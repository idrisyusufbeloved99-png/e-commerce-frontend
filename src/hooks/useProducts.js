import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => request("/products"),
  });
}

export function useProductsByCategory(categoryId) {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: () => request(`/products/category/${categoryId}`),
    enabled: !!categoryId, // only runs if a categoryId is actually passed in
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => request(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, rating, comment }) =>
      request("/reviews", {
        method: "POST",
        body: JSON.stringify({ productId, rating, comment }),
      }),
    onSuccess: (_, variables) => {
      // refetch this product so the new review appears immediately
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
    },
  });
}
