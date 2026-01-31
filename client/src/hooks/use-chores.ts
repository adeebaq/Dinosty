import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertChore } from "@shared/schema";

export function useChores(assigneeId?: string) {
  return useQuery({
    queryKey: [api.chores.list.path, assigneeId],
    queryFn: async () => {
      // Need to construct query params manually or use buildUrl helper if it supported query params
      // api.chores.list.path is just the path string
      const url = assigneeId 
        ? `${api.chores.list.path}?assigneeId=${assigneeId}` 
        : api.chores.list.path;
        
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch chores");
      return api.chores.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertChore) => {
      const res = await fetch(api.chores.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create chore");
      return api.chores.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chores.list.path] });
    },
  });
}

export function useUpdateChoreStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "pending" | "completed" | "approved" | "declined" }) => {
      const url = buildUrl(api.chores.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.chores.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chores.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] }); // Balance might update
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}
