import { useQuery } from "@tanstack/react-query";
import request from "../api/client.js";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => request("/categories"),
  });
}