import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

export function useAdminNotifications() {
  return useQuery({
    queryKey:        ["admin-notifications"],
    queryFn:         () => request("/admin-notifications"),
    refetchInterval: 30000,
  });
}

export function useMarkAdminRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      request(`/admin-notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });
}

export function useMarkAllAdminRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      request("/admin-notifications/read-all", { method: "PATCH" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });
}

export function useMarkAdminReadByLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (link) =>
      request("/admin-notifications/read-by-link", {
        method: "PATCH",
        body: JSON.stringify({ link }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });
}

export function useDeleteAdminNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      request(`/admin-notifications/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });
}