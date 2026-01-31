import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertAppUser } from "@shared/routes";
import { appUsers } from "@shared/schema";
import { z } from "zod";

export function useUser() {
  return useQuery({
    queryKey: [api.users.me.path],
    queryFn: async () => {
      const res = await fetch(api.users.me.path);
      if (res.status === 404) return null; // Not onboarded
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.users.me.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useOnboardUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.users.onboard.input>) => {
      const res = await fetch(api.users.onboard.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to onboard");
      }
      return api.users.onboard.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.users.me.path], data);
    },
  });
}

export function useChildren() {
  return useQuery({
    queryKey: [api.users.children.path],
    queryFn: async () => {
      const res = await fetch(api.users.children.path);
      if (!res.ok) throw new Error("Failed to fetch children");
      return api.users.children.responses[200].parse(await res.json());
    },
  });
}
