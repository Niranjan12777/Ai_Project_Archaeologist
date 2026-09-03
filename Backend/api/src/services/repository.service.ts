import type { RepositoryRepository } from "../repositories/repository.repository.js";
import type { IndexJobRepository } from "../repositories/index-job.repository.js";
import type { GitHubService } from "./github.service.js";
import type { IndexingQueueService } from "./indexing-queue.service.js";
import { AppError } from "../utils/app-error.js";

export class RepositoryService {
  constructor(
    private readonly repositories: RepositoryRepository,
    private readonly indexJobs: IndexJobRepository,
    private readonly github: GitHubService,
    private readonly indexingQueue: IndexingQueueService
  ) {}

  list(ownerId: string) {
    return this.repositories.listForUser(ownerId);
  }

  async get(id: string, ownerId: string) {
    const repository = await this.repositories.findForUser(id, ownerId);
    if (!repository) {
      throw new AppError("Repository not found", 404);
    }
    return repository;
  }

  async importFromGitHub(ownerId: string, fullName: string) {
    const githubRepo = await this.github.fetchRepository(fullName);
    const repository = await this.repositories.upsertForUser({
      ownerId,
      providerRepoId: String(githubRepo.id),
      ownerName: githubRepo.owner.login,
      name: githubRepo.name,
      fullName: githubRepo.full_name,
      defaultBranch: githubRepo.default_branch,
      description: githubRepo.description ?? undefined,
      private: githubRepo.private,
      cloneUrl: githubRepo.clone_url,
      htmlUrl: githubRepo.html_url,
      language: githubRepo.language ?? undefined,
      stars: githubRepo.stargazers_count,
      forks: githubRepo.forks_count
    });

    const indexJob = await this.indexJobs.create(repository.id);
    const queued = await this.indexingQueue.enqueueRepositoryIndex({
      repositoryId: repository.id,
      indexJobId: indexJob.id
    });

    if (queued.id) {
      await this.indexJobs.attachQueueJob(indexJob.id, queued.id);
    }

    return { repository, indexJob };
  }

  async reindex(id: string, ownerId: string) {
    const repository = await this.get(id, ownerId);
    const indexJob = await this.indexJobs.create(repository.id);
    const queued = await this.indexingQueue.enqueueRepositoryIndex({
      repositoryId: repository.id,
      indexJobId: indexJob.id
    });

    if (queued.id) {
      await this.indexJobs.attachQueueJob(indexJob.id, queued.id);
    }

    return { repository, indexJob };
  }

  async sync(id: string, ownerId: string) {
    const current = await this.get(id, ownerId);
    return this.importFromGitHub(ownerId, current.fullName);
  }

  async delete(id: string, ownerId: string) {
    await this.get(id, ownerId);
    return this.repositories.deleteForUser(id, ownerId);
  }
}
