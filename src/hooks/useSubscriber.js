import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

export function useSubscribe() {
  return useMutation({
    mutationFn: (email) =>
      request("/subscribers", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export function useSubscribers() {
  return useQuery({
    queryKey: ["subscribers"],
    queryFn: () => request("/subscribers"),
  });
}

export function useDeleteSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      request(`/subscribers/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscribers"] }),
  });
}