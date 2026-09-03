"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useRepositories } from "@/hooks/use-repositories";
import { repositoryService } from "@/services/repository.service";
import styles from "@/styles/interactive.module.css";

export default function ArchitecturePage() {
  const { data: repositories = [] } = useRepositories();
  const [repositoryId, setRepositoryId] = useState("");
  const activeRepositoryId = repositoryId || repositories[0]?.id || "";
  const graph = useQuery({
    queryKey: ["architecture", activeRepositoryId],
    queryFn: () => repositoryService.architecture(activeRepositoryId),
    enabled: Boolean(activeRepositoryId)
  });
  const nodes = graph.data?.nodes ?? [];
  const edges = graph.data?.edges ?? [];

  return (
    <AppShell>
      <PageHeader title="Architecture" description="Explore dependency graphs, route maps, service boundaries, and generated architecture diagrams." />
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
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-sm font-semibold text-ink">Graph summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-panel p-4">
              <div className="text-xs text-muted">Nodes</div>
              <div className="mt-1 text-2xl font-semibold">{nodes.length}</div>
            </div>
            <div className="rounded-md bg-panel p-4">
              <div className="text-xs text-muted">Edges</div>
              <div className="mt-1 text-2xl font-semibold">{edges.length}</div>
            </div>
          </div>
          {graph.isLoading ? <p className="mt-4 text-sm text-muted">Loading graph...</p> : null}
          {graph.isError ? <p className="mt-4 text-sm text-red-600">No architecture graph found. Index the repository first.</p> : null}
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          <h2 className="text-sm font-semibold text-ink">Detected components</h2>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-auto">
            {nodes.slice(0, 80).map((node) => (
              <div key={node.id} className="flex items-center justify-between gap-3 rounded-md bg-panel px-3 py-2 text-sm">
                <span className="min-w-0 truncate text-ink">{node.id}</span>
                <span className="shrink-0 rounded border border-line bg-white px-2 py-1 text-xs text-muted">{node.type}</span>
              </div>
            ))}
            {!nodes.length && !graph.isError ? <p className="text-sm text-muted">Load or index a repository to view architecture nodes.</p> : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
