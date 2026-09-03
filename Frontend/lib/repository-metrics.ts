import type { RepositorySummary } from "@/types/api";

export function repositoryMetrics(repositories: RepositorySummary[]) {
  const indexedRepositories = repositories.filter((repository) => repository.indexJobs?.[0]?.status === "COMPLETED").length;
  const activeJobs = repositories.filter((repository) => {
    const status = repository.indexJobs?.[0]?.status;
    return status === "QUEUED" || status === "RUNNING";
  }).length;
  const failedJobs = repositories.filter((repository) => repository.indexJobs?.[0]?.status === "FAILED").length;
  const languageCounts = repositories.reduce<Record<string, number>>((counts, repository) => {
    const language = repository.language ?? "Mixed";
    counts[language] = (counts[language] ?? 0) + 1;
    return counts;
  }, {});

  return {
    indexedRepositories,
    activeJobs,
    failedJobs,
    topLanguages: Object.entries(languageCounts).sort((left, right) => right[1] - left[1]).slice(0, 5)
  };
}
