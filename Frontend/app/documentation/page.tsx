"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useRepositories } from "@/hooks/use-repositories";
import { repositoryService } from "@/services/repository.service";
import type { DocumentationArtifact } from "@/types/api";
import styles from "@/styles/interactive.module.css";

const docTypes: Array<{ type: DocumentationArtifact["type"]; label: string }> = [
  { type: "README", label: "README" },
  { type: "API", label: "API Documentation" },
  { type: "ARCHITECTURE", label: "Architecture Documentation" },
  { type: "ONBOARDING", label: "Onboarding Guide" }
];

export default function DocumentationPage() {
  const { data: repositories = [] } = useRepositories();
  const [repositoryId, setRepositoryId] = useState("");
  const activeRepositoryId = repositoryId || repositories[0]?.id || "";
  const docs = useQuery({
    queryKey: ["documentation", activeRepositoryId],
    queryFn: () => repositoryService.documentation(activeRepositoryId),
    enabled: Boolean(activeRepositoryId)
  });
  const generate = useMutation({
    mutationFn: (type: DocumentationArtifact["type"]) => repositoryService.generateDocumentation(activeRepositoryId, type),
    onSuccess: async () => {
      await docs.refetch();
    }
  });

  return (
    <AppShell>
      <PageHeader title="Documentation" description="Generate README files, API references, architecture notes, commit summaries, and onboarding guides." />
      <select
        className={`${styles.input} mt-8 w-full rounded-md border border-line px-4 py-3 text-sm outline-none md:w-96`}
        value={activeRepositoryId}
        onChange={(event) => setRepositoryId(event.target.value)}
      >
        {repositories.map((repository) => (
          <option key={repository.id} value={repository.id}>
            {repository.fullName}
          </option>
        ))}
      </select>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {docTypes.map((item) => (
          <article key={item.type} className="rounded-lg border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-ink">{item.label}</h2>
              <button
                className={`${styles.button} rounded-md border border-line px-3 py-2 text-sm font-medium disabled:text-muted`}
                disabled={!activeRepositoryId || generate.isPending}
                onClick={() => generate.mutate(item.type)}
                type="button"
              >
                Generate
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">Generate this artifact from indexed files, architecture metadata, and repository context.</p>
          </article>
        ))}
      </section>
      <section className="mt-8 space-y-4">
        {docs.isLoading ? <p className="text-sm text-muted">Loading generated documentation...</p> : null}
        {docs.isError ? <p className="text-sm text-red-600">Unable to load documentation for this repository.</p> : null}
        {docs.data?.map((doc) => (
          <article key={doc.id} className="rounded-lg border border-line bg-white p-5">
            <div className="text-xs font-medium text-muted">{doc.type}</div>
            <h2 className="mt-1 font-semibold text-ink">{doc.title}</h2>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-panel p-4 text-sm leading-6 text-neutral-700">{doc.content}</pre>
          </article>
        ))}
        {docs.data?.length === 0 ? <p className="text-sm text-muted">No generated documentation yet.</p> : null}
      </section>
    </AppShell>
  );
}
