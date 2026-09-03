"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { Route } from "next";
import { GitFork, RefreshCw, Star, Trash2 } from "lucide-react";
import type { RepositorySummary } from "@/types/api";
import { repositoryService } from "@/services/repository.service";
import styles from "@/styles/interactive.module.css";

export function RepositoryCard({ repository }: { repository: RepositorySummary }) {
  const job = repository.indexJobs?.[0];
  const queryClient = useQueryClient();
  const reindex = useMutation({
    mutationFn: () => repositoryService.reindex(repository.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["repositories"] });
    }
  });
  const sync = useMutation({
    mutationFn: () => repositoryService.sync(repository.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["repositories"] });
    }
  });
  const remove = useMutation({
    mutationFn: () => repositoryService.delete(repository.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["repositories"] });
    }
  });
  const isIndexing = job?.status === "QUEUED" || job?.status === "RUNNING";

  return (
    <article className={`${styles.card} rounded-lg border border-line bg-white p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/repositories/${repository.id}` as Route} className="text-base font-semibold text-ink">
            {repository.fullName}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
            {repository.description ?? "No description available."}
          </p>
        </div>
        <span className="rounded-md border border-line px-2 py-1 text-xs text-muted">
          {job?.status ?? "NEW"}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
        <span>{repository.language ?? "Mixed"}</span>
        <span className="flex items-center gap-1">
          <Star size={15} />
          {repository.stars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={15} />
          {repository.forks}
        </span>
      </div>
      {job ? (
        <div className="mt-5">
          <div className="h-2 rounded-full bg-neutral-100">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${job.progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">{job.currentStep ?? "Waiting for worker"}</p>
          {job.errorMessage ? <p className="mt-1 text-xs text-red-600">{job.errorMessage}</p> : null}
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className={`${styles.button} inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:text-muted`}
          type="button"
          disabled={reindex.isPending || isIndexing}
          onClick={() => reindex.mutate()}
        >
          <RefreshCw size={15} />
          {reindex.isPending ? "Queueing" : "Re-index"}
        </button>
        <button
          className={`${styles.button} inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:text-muted`}
          type="button"
          disabled={sync.isPending || isIndexing}
          onClick={() => sync.mutate()}
        >
          <RefreshCw size={15} />
          {sync.isPending ? "Syncing" : "Sync"}
        </button>
        <button
          className={`${styles.button} inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:text-muted`}
          type="button"
          disabled={remove.isPending || isIndexing}
          onClick={() => {
            if (window.confirm(`Delete ${repository.fullName}?`)) {
              remove.mutate();
            }
          }}
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </article>
  );
}
