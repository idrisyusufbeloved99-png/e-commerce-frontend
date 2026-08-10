import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

export function useSubmitTicket() {
  return useMutation({
    mutationFn: (data) =>
      request("/help", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useAllTickets() {
  return useQuery({
    queryKey: ["help-tickets"],
    queryFn:  () => request("/help"),
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      request(`/help/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["help-tickets"] }),
  });
}

export function useUpdateTicketPriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, priority }) =>
      request(`/help/${id}/priority`, {
        method: "PATCH",
        body: JSON.stringify({ priority }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["help-tickets"] }),
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }) =>
      request(`/help/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["help-tickets"] }),
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      request(`/help/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["help-tickets"] }),
  });
}

export function useMyTickets() {
  return useQuery({
    queryKey: ["my-tickets"],
    queryFn: () => request("/help/my-tickets"),
  });
}

export function useCustomerReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }) =>
      request(`/help/${id}/customer-reply`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-tickets"] }),
  });
}
