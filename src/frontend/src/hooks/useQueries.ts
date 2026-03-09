import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CommunityLinks, Project } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { CommunityLinks, Project };

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

export function useFounderSpotsRemaining() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["founderSpots"],
    queryFn: async () => {
      if (!actor) return BigInt(100);
      return actor.getFounderSpotsRemaining();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCommunityLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<CommunityLinks>({
    queryKey: ["communityLinks"],
    queryFn: async () => {
      if (!actor)
        return {
          discord: "https://discord.gg",
          x: "https://x.com",
          reddit: "https://reddit.com",
        };
      return actor.getCommunityLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

interface SubmitProjectArgs {
  name: string;
  githubUrl: string;
  abandonmentReason: string;
  askingPrice: number;
  isPublic: boolean;
}

export function useSubmitProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, SubmitProjectArgs>({
    mutationFn: async ({
      name,
      githubUrl,
      abandonmentReason,
      askingPrice,
      isPublic,
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.submitProject(
        name,
        githubUrl,
        abandonmentReason,
        askingPrice,
        isPublic,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["founderSpots"] });
    },
  });
}
