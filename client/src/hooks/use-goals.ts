import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertGoal } from "@shared/schema";

export function useGoals(userId?: string) {
  return useQuery({
    queryKey: [api.goals.list.path, userId],
    queryFn: async () => {
      const url = userId 
        ? `${api.goals.list.path}?userId=${userId}` 
        : api.goals.list.path;
        
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch goals");
      return api.goals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGoal) => {
      const res = await fetch(api.goals.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return api.goals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
    },
  });
}

export function useContributeGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: number, amount: number }) => {
      const url = buildUrl(api.goals.contribute.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to contribute");
      }
      return api.goals.contribute.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] }); // Balance decreases
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}
