"use client";

import { useQuery } from "@tanstack/react-query";
import { repositoryService } from "@/services/repository.service";

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: repositoryService.list,
    refetchInterval: 5000
  });
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: ["repository", id],
    queryFn: () => repositoryService.get(id),
    enabled: Boolean(id),
    refetchInterval: 5000
  });
}
