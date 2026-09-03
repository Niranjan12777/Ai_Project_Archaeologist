"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ImportRepositoryForm } from "@/components/import-repository-form";
import { RepositoryCard } from "@/components/repository-card";
import { useRepositories } from "@/hooks/use-repositories";
import { repositoryMetrics } from "@/lib/repository-metrics";

export default function DashboardPage() {
  const { data: repositories = [], isLoading } = useRepositories();
  const { indexedRepositories, activeJobs, failedJobs, topLanguages } = repositoryMetrics(repositories);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Monitor imported repositories, indexing progress, architecture coverage, recent chats, and documentation freshness."
        action={<ImportRepositoryForm />}
      />
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Repositories", String(repositories.length)],
          ["Indexed repos", String(indexedRepositories)],
          ["Active jobs", String(activeJobs)],
          ["Failed jobs", String(failedJobs)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-white p-5">
            <div className="text-sm text-muted">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-ink">{value}</div>
          </div>
        ))}
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-base font-semibold">Index activity</h2>
          <div className="mt-6 space-y-3">
            {repositories.slice(0, 6).map((repository) => {
              const job = repository.indexJobs?.[0];
              return (
                <div key={repository.id} className="rounded-md bg-panel p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">{repository.fullName}</span>
                    <span className="shrink-0 text-xs text-muted">{job?.status ?? "NEW"}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-neutral-200">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${job?.progress ?? 0}%` }} />
                  </div>
                </div>
              );
            })}
            {!repositories.length ? <p className="text-sm text-muted">Import repositories to populate activity.</p> : null}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-base font-semibold">Language distribution</h2>
          <div className="mt-6 space-y-3">
            {topLanguages.map(([language, count]) => (
              <div key={language}>
                <div className="flex items-center justify-between text-sm">
                  <span>{language}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${(count / repositories.length) * 100}%` }} />
                </div>
              </div>
            ))}
            {!topLanguages.length ? <p className="text-sm text-muted">Language data appears after imports.</p> : null}
          </div>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-base font-semibold">Recent repositories</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {isLoading ? (
            <div className="rounded-lg border border-line bg-white p-5 text-sm text-muted">Loading repositories...</div>
          ) : repositories.length ? (
            repositories.slice(0, 4).map((repository) => (
              <RepositoryCard key={repository.id} repository={repository} />
            ))
          ) : (
            <div className="rounded-lg border border-line bg-white p-5 text-sm text-muted">
              Import a GitHub repository to start indexing.
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
