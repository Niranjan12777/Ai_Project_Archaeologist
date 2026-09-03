import { describe, expect, it } from "vitest";
import { repositoryMetrics } from "./repository-metrics";
import type { RepositorySummary } from "@/types/api";

describe("repositoryMetrics", () => {
  it("summarizes index status and language distribution", () => {
    const repositories = [
      { id: "1", fullName: "a/api", stars: 1, forks: 0, updatedAt: "", language: "TypeScript", indexJobs: [{ id: "j1", status: "COMPLETED", progress: 100 }] },
      { id: "2", fullName: "b/ui", stars: 1, forks: 0, updatedAt: "", language: "TypeScript", indexJobs: [{ id: "j2", status: "RUNNING", progress: 45 }] },
      { id: "3", fullName: "c/ops", stars: 1, forks: 0, updatedAt: "", language: "Go", indexJobs: [{ id: "j3", status: "FAILED", progress: 20 }] }
    ] satisfies RepositorySummary[];

    expect(repositoryMetrics(repositories)).toMatchObject({
      indexedRepositories: 1,
      activeJobs: 1,
      failedJobs: 1,
      topLanguages: [["TypeScript", 2], ["Go", 1]]
    });
  });
});
