import { useQuery } from "@tanstack/react-query";
import type { Project } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { Project };

export function useListProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProject(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Project>({
    queryKey: ["project", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getProject(id);
    },
    enabled: !!actor && !isFetching,
  });
}
