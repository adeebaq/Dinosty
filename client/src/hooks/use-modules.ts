import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useModules() {
  return useQuery({
    queryKey: [api.modules.list.path],
    queryFn: async () => {
      const res = await fetch(api.modules.list.path);
      if (!res.ok) throw new Error("Failed to fetch progress");
      return api.modules.list.responses[200].parse(await res.json());
    },
  });
}

export function useCompleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const url = buildUrl(api.modules.complete.path, { id: moduleId });
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Failed to complete module");
      return api.modules.complete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.modules.list.path] });
      // Completing modules might give rewards later, so invalidate balance too
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
    },
  });
}
