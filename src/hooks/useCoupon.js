import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

// src/hooks/useCoupon.js
export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }) =>
      request("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code, subtotal }),
      }),
  });
}

export function useUseCoupon() {
  return useMutation({
    mutationFn: (code) =>
      request("/coupons/use", {
        method: "PATCH",
        body: JSON.stringify({ code }),
      }),
  });
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => request("/coupons"),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      request("/coupons", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useToggleCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => request(`/coupons/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => request(`/coupons/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}
