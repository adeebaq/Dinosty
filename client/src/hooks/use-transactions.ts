import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTransactions(userId?: string) {
  return useQuery({
    queryKey: [api.transactions.list.path, userId],
    queryFn: async () => {
      const url = userId 
        ? `${api.transactions.list.path}?userId=${userId}` 
        : api.transactions.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}
