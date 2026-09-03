import type { IndexJobStatus, PrismaClient, RepositoryIndexJob } from "../generated/prisma/client.js";

export class IndexJobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(repositoryId: string): Promise<RepositoryIndexJob> {
    return this.prisma.repositoryIndexJob.create({
      data: {
        repositoryId,
        status: "QUEUED",
        progress: 0,
        currentStep: "Queued for indexing"
      }
    });
  }

  attachQueueJob(id: string, queueJobId: string): Promise<RepositoryIndexJob> {
    return this.prisma.repositoryIndexJob.update({
      where: { id },
      data: { queueJobId }
    });
  }

  updateStatus(
    id: string,
    data: { status: IndexJobStatus; progress?: number; currentStep?: string; errorMessage?: string }
  ): Promise<RepositoryIndexJob> {
    return this.prisma.repositoryIndexJob.update({
      where: { id },
      data
    });
  }
}
