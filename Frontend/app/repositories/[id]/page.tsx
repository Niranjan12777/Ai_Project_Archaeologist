"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useRepository } from "@/hooks/use-repositories";

export default function RepositoryDetailsPage() {
  const params = useParams<{ id: string }>();
  const { data: repository, isLoading, isError } = useRepository(params.id);
  const latestJob = repository?.indexJobs?.[0];

  return (
    <AppShell>
      <PageHeader
        title={repository?.fullName ?? "Repository Details"}
        description="Review files, commits, architecture, dependencies, generated documentation, and repository-specific AI chats."
      />
      {isLoading ? <p className="mt-8 text-sm text-muted">Loading repository...</p> : null}
      {isError ? <p className="mt-8 text-sm text-red-600">Unable to load this repository.</p> : null}
      {repository ? (
        <>
          <section className="mt-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-lg border border-line bg-white p-5">
              <h2 className="font-semibold text-ink">Repository</h2>
              <p className="mt-2 text-sm text-muted">{repository.description ?? "No description available."}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                <span className="rounded border border-line px-2 py-1">{repository.language ?? "Mixed"}</span>
                <span className="rounded border border-line px-2 py-1">{repository.stars} stars</span>
                <span className="rounded border border-line px-2 py-1">{repository.forks} forks</span>
              </div>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <h2 className="font-semibold text-ink">Index status</h2>
              <div className="mt-4 h-2 rounded-full bg-neutral-100">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${latestJob?.progress ?? 0}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{latestJob?.currentStep ?? "No indexing job queued"}</p>
            </div>
          </section>
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Files", String(repository.files?.length ?? 0)],
              ["Commits", String(repository.commits?.length ?? 0)],
              ["Branches", String(repository.branches?.length ?? 0)],
              ["Generated Docs", String(repository.documentation?.length ?? 0)]
            ].map(([label, value]) => (
              <article key={label} className="rounded-lg border border-line bg-white p-5">
                <h3 className="text-sm font-semibold text-ink">{label}</h3>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </article>
            ))}
          </section>
          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-line bg-white p-5">
              <h2 className="font-semibold text-ink">Files</h2>
              <div className="mt-4 max-h-80 space-y-2 overflow-auto">
                {repository.files?.map((file) => (
                  <div key={file.id} className="flex items-center justify-between gap-3 rounded-md bg-panel px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">{file.path}</span>
                    <span className="shrink-0 text-xs text-muted">{file.language ?? file.extension ?? "file"}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-lg border border-line bg-white p-5">
              <h2 className="font-semibold text-ink">Recent commits</h2>
              <div className="mt-4 max-h-80 space-y-3 overflow-auto">
                {repository.commits?.map((commit) => (
                  <div key={commit.id} className="rounded-md bg-panel p-3 text-sm">
                    <div className="font-medium text-ink">{commit.message}</div>
                    <div className="mt-1 text-xs text-muted">{commit.sha.slice(0, 7)} by {commit.authorName ?? "Unknown"}</div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
