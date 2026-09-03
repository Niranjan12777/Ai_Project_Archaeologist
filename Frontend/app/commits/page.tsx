"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useRepositories, useRepository } from "@/hooks/use-repositories";
import styles from "@/styles/interactive.module.css";

export default function CommitHistoryPage() {
  const { data: repositories = [] } = useRepositories();
  const [repositoryId, setRepositoryId] = useState("");
  const activeRepositoryId = repositoryId || repositories[0]?.id || "";
  const { data: repository, isLoading } = useRepository(activeRepositoryId);

  return (
    <AppShell>
      <PageHeader title="Commit History" description="Summarize commits, compare branches, compare commits, and trace repository evolution." />
      <select
        className={`${styles.input} mt-8 w-full rounded-md border border-line px-4 py-3 text-sm outline-none md:w-96`}
        value={activeRepositoryId}
        onChange={(event) => setRepositoryId(event.target.value)}
      >
        {repositories.map((item) => (
          <option key={item.id} value={item.id}>
            {item.fullName}
          </option>
        ))}
      </select>
      <section className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="text-base font-semibold text-ink">{repository?.fullName ?? "Repository commits"}</h2>
        {isLoading ? <p className="mt-4 text-sm text-muted">Loading commits...</p> : null}
        <div className="mt-5 space-y-3">
          {repository?.commits?.map((commit) => (
            <article key={commit.id} className="rounded-md bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">{commit.message}</h3>
                <span className="text-xs text-muted">{commit.sha.slice(0, 7)}</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                {commit.authorName ?? "Unknown author"} on {new Date(commit.committedAt).toLocaleString()}
              </p>
            </article>
          ))}
          {repository && !repository.commits?.length ? (
            <p className="text-sm text-muted">No commits have been synchronized yet. Re-index the repository to refresh git metadata.</p>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
