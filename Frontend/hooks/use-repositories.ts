"use client";

import { useQuery } from "@tanstack/react-query";
import { repositoryService } from "@/services/repository.service";

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: repositoryService.list,
    refetchInterval: (query) => {
      const repositories = query.state.data;

      const isIndexing = repositories?.some((repository) =>
        repository.indexJobs?.some(
          (job) =>
            job.status === "QUEUED" ||
            job.status === "RUNNING"
        )
      );

      return isIndexing ? 5000 : false;
    }
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
