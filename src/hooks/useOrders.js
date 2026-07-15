import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import request from "../api/client.js";

export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: () => request("/orders/my-orders"),
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => request("/orders"),
  });
}

// export function useUpdateOrderStatus() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, status }) =>
//       request(`/orders/${id}/status`, {
//         method: "PATCH",
//         body: JSON.stringify({ status }),
//       }),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
//   });
// }

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, users, products] = await Promise.all([
        request("/orders"),
        request("/users"),
        request("/products"),  // ← add this
      ]);

      const totalRevenue  = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const totalOrders   = orders.length;
      const totalUsers    = users.length;
      const totalProducts = products.length;  // ← add this

      const monthlyMap = {};
      orders.forEach((o) => {
        const month = new Date(o.createdAt).toLocaleString("en", { month: "short" });
        monthlyMap[month] = (monthlyMap[month] || 0) + Number(o.total);
      });

      const revenueData = Object.entries(monthlyMap).map(([month, revenue]) => ({
        month,
        revenue: parseFloat(revenue.toFixed(2)),
        orders: orders.filter((o) =>
          new Date(o.createdAt).toLocaleString("en", { month: "short" }) === month
        ).length,
      }));

      return { totalRevenue, totalOrders, totalUsers, totalProducts, orders, revenueData };
    },
  });
}

export function useOrderDetail(id) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => request(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      request(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}

