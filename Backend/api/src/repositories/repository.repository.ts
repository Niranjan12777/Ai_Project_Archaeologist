import { redisConnection } from "../config/redis.js";
import type { PrismaClient, Repository } from "../generated/prisma/client.js";

const REPOSITORY_LIST_TTL = 5;
const REPOSITORY_DETAIL_TTL = 30;

export class RepositoryRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async listForUser(ownerId: string): Promise<Repository[]> {
    const version = await this.getCacheVersion(ownerId);

    const cacheKey = `repositories:user:${ownerId}:v${version}:list`;

    const cached = await redisConnection.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Repository[];
    }

    const repositories = this.prisma.repository.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
      include: { indexJobs: { orderBy: { createdAt: "desc" }, take: 1 } }
    });

    await redisConnection.set(
      cacheKey,
      JSON.stringify(repositories),
      "EX",
      REPOSITORY_LIST_TTL
    )

    return repositories;
  }

  async findForUser(id: string, ownerId: string): Promise<Repository | null> {
    const version = await this.getCacheVersion(ownerId);

    const cacheKey = `repositories:user:${ownerId}:${id}:v${version}:user`;

    const cached = await redisConnection.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Repository;
    }

    const repository = this.prisma.repository.findFirst({
      where: { id, ownerId },
      include: {
        files: { take: 50, orderBy: { path: "asc" } },
        commits: { take: 50, orderBy: { committedAt: "desc" } },
        branches: { orderBy: { name: "asc" } },
        indexJobs: { orderBy: { createdAt: "desc" }, take: 5 },
        architectureGraphs: { orderBy: { updatedAt: "desc" }, take: 1 },
        documentation: { orderBy: { updatedAt: "desc" } }
      }
    });

    if (!repository) {
      return null;
    }

    await redisConnection.set(
      cacheKey,
      JSON.stringify(repository),
      "EX",
      REPOSITORY_DETAIL_TTL
    )

    return repository;
  }

  async upsertForUser(input: {
    ownerId: string;
    providerRepoId: string;
    ownerName: string;
    name: string;
    fullName: string;
    defaultBranch: string;
    description?: string;
    private: boolean;
    cloneUrl: string;
    htmlUrl: string;
    language?: string;
    stars?: number;
    forks?: number;
  }): Promise<Repository> {
    const repository = await this.prisma.repository.upsert({
      where: {
        ownerId_provider_providerRepoId: {
          ownerId: input.ownerId,
          provider: "GITHUB",
          providerRepoId: input.providerRepoId
        }
      },
      update: {
        ownerName: input.ownerName,
        name: input.name,
        fullName: input.fullName,
        defaultBranch: input.defaultBranch,
        description: input.description,
        private: input.private,
        cloneUrl: input.cloneUrl,
        htmlUrl: input.htmlUrl,
        language: input.language,
        stars: input.stars ?? 0,
        forks: input.forks ?? 0,
        lastSyncedAt: new Date()
      },
      create: {
        ownerId: input.ownerId,
        providerRepoId: input.providerRepoId,
        ownerName: input.ownerName,
        name: input.name,
        fullName: input.fullName,
        defaultBranch: input.defaultBranch,
        description: input.description,
        private: input.private,
        cloneUrl: input.cloneUrl,
        htmlUrl: input.htmlUrl,
        language: input.language,
        stars: input.stars ?? 0,
        forks: input.forks ?? 0,
        lastSyncedAt: new Date()
      }
    });

    await this.invalidateCache(
      input.ownerId
    );

    return repository;
  }

  async deleteForUser(id: string, ownerId: string): Promise<Repository> {
    const repository = await this.prisma.repository.delete({
      where: {
        id,
        ownerId
      }
    });

    await this.invalidateCache(
      ownerId
    )

    return repository;
  }

  private async invalidateCache(ownerId: string): Promise<void> {
    await redisConnection.incr(this.getVersionKey(ownerId));
  }

  private async getCacheVersion(ownerId: string): Promise<number> {
    const version = await redisConnection.get(this.getVersionKey(ownerId));

    if (version) {
      return Number(version);
    }

    const newVersion = await redisConnection.set(
      this.getVersionKey(ownerId),
      "1",
      "EX",
      60 * 60 * 24 * 30,
      "NX"
    );

    if (newVersion === "OK") {
      return 1;
    }

    const currentVersion = await redisConnection.get(this.getVersionKey(ownerId));

    return Number(currentVersion ?? 1);
  }

  private getVersionKey(ownerId: string): string {
    return `code-intel:${ownerId}:version`;
  }
}
