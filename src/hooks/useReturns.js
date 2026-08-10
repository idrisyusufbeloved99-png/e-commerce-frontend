import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

export function useMyReturns() {
  return useQuery({
    queryKey: ["my-returns"],
    queryFn: () => request("/returns/my-returns"),
  });
}

export function useRequestReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      request("/returns", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-returns"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
}

export function useAllReturns() {
  return useQuery({
    queryKey: ["admin-returns"],
    queryFn: () => request("/returns"),
  });
}

export function useUpdateReturnStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      request(`/returns/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-returns"] }),
  });
}