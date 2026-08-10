import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => request("/banners"),
  });
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => request("/banners/all"),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      request("/banners", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useToggleBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      request(`/banners/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      request(`/banners/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
}