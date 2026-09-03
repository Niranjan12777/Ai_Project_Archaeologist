import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { env } from "../config/env.js";
import { QUEUES } from "../constants/queues.js";
import type { RepositoryIndexJobData } from "../jobs/repository-index-job.js";
import { RepositoryIndexProcessor } from "../processors/repository-index.processor.js";
import { prisma } from "../config/prisma.js";

const processor = new RepositoryIndexProcessor();

export const repositoryIndexWorker = new Worker<RepositoryIndexJobData>(
  QUEUES.repositoryIndexing,
  async (job) => processor.process(job),
  {
    connection: redisConnection,
    concurrency: env.workerConcurrency
  }
);

repositoryIndexWorker.on("failed", async (job, error) => {
  const indexJobId = job?.data.indexJobId;
  if (!indexJobId) return;

  await prisma.repositoryIndexJob.update({
    where: { id: indexJobId },
    data: {
      status: "FAILED",
      errorMessage: error.message,
      currentStep: "Indexing failed"
    }
  });
});
