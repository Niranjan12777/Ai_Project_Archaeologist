"use client";

import { AppShell } from "@/components/app-shell";
import { ImportRepositoryForm } from "@/components/import-repository-form";
import { PageHeader } from "@/components/page-header";
import { RepositoryCard } from "@/components/repository-card";
import { useRepositories } from "@/hooks/use-repositories";

export default function RepositoriesPage() {
  const { data: repositories = [], isLoading, isError } = useRepositories();

  return (
    <AppShell>
      <PageHeader
        title="Repositories"
        description="Import GitHub repositories, monitor indexing progress, and queue re-indexing when source code changes."
        action={<ImportRepositoryForm />}
      />
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <div className="rounded-lg border border-line bg-white p-5 text-sm text-muted">Loading repositories...</div>
        ) : null}
        {isError ? (
          <div className="rounded-lg border border-line bg-white p-5 text-sm text-red-600">
            Unable to load repositories. Confirm the API is running and your session is valid.
          </div>
        ) : null}
        {!isLoading && !isError && repositories.length === 0 ? (
          <div className="rounded-lg border border-line bg-white p-5 text-sm text-muted">
            No repositories imported yet.
          </div>
        ) : null}
        {repositories.map((repository) => (
          <RepositoryCard key={repository.id} repository={repository} />
        ))}
      </section>
    </AppShell>
  );
}
