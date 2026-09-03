"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useRepositories } from "@/hooks/use-repositories";
import { repositoryService } from "@/services/repository.service";
import styles from "@/styles/interactive.module.css";

export default function SearchPage() {
  const { data: repositories = [] } = useRepositories();
  const [repositoryId, setRepositoryId] = useState("");
  const [query, setQuery] = useState("");
  const activeRepositoryId = repositoryId || repositories[0]?.id || "";
  const activeRepositoryName = useMemo(
    () => repositories.find((repository) => repository.id === activeRepositoryId)?.fullName ?? "No repository selected",
    [activeRepositoryId, repositories]
  );
  const search = useMutation({
    mutationFn: () => repositoryService.search(activeRepositoryId, query)
  });

  return (
    <AppShell>
      <PageHeader title="Search" description="Run semantic, keyword, file, commit, and function searches across indexed repositories." />
      <form
        className="mt-8 grid gap-3 lg:grid-cols-[260px_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (activeRepositoryId && query.trim()) search.mutate();
        }}
      >
        <select
          className={`${styles.input} rounded-md border border-line px-4 py-3 text-sm outline-none`}
          value={activeRepositoryId}
          onChange={(event) => setRepositoryId(event.target.value)}
        >
          {repositories.map((repository) => (
            <option key={repository.id} value={repository.id}>
              {repository.fullName}
            </option>
          ))}
        </select>
        <input
          className={`${styles.input} min-w-0 flex-1 rounded-md border border-line px-4 py-3 outline-none`}
          placeholder="Search code, files, symbols, routes, or architecture..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          className={`${styles.button} rounded-md bg-accent px-4 text-white disabled:bg-neutral-400`}
          aria-label="Search"
          disabled={!activeRepositoryId || !query.trim() || search.isPending}
        >
          <Search size={20} />
        </button>
      </form>
      <section className="mt-6 rounded-lg border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">{activeRepositoryName}</h2>
        <div className="mt-4 space-y-4">
          {search.isPending ? <p className="text-sm text-muted">Searching indexed chunks...</p> : null}
          {search.isError ? <p className="text-sm text-red-600">Search failed. Confirm the repository has been indexed.</p> : null}
          {search.data?.length === 0 ? <p className="text-sm text-muted">No matching chunks found.</p> : null}
          {search.data?.map((result) => (
            <article key={result.chunkId} className="rounded-md border border-line bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-ink">
                  {result.path}:{result.startLine}-{result.endLine}
                </span>
                <span className="text-muted">Score {result.score.toFixed(2)}</span>
              </div>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-5 text-neutral-700">
                {result.content}
              </pre>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
