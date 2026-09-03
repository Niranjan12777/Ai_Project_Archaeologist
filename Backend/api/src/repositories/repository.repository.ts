import type { PrismaClient, Repository } from "../generated/prisma/client.js";

export class RepositoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listForUser(ownerId: string): Promise<Repository[]> {
    return this.prisma.repository.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
      include: { indexJobs: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
  }

  findForUser(id: string, ownerId: string): Promise<Repository | null> {
    return this.prisma.repository.findFirst({
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
  }

  upsertForUser(input: {
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
    return this.prisma.repository.upsert({
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
  }

  deleteForUser(id: string, ownerId: string): Promise<Repository> {
    return this.prisma.repository.delete({
      where: {
        id,
        ownerId
      }
    });
  }
}
