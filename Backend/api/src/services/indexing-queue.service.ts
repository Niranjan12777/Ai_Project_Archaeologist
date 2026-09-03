import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { QUEUES } from "../constants/queues.js";

export interface RepositoryIndexJobData {
  repositoryId: string;
  indexJobId: string;
}

export class IndexingQueueService {
  private readonly queue = new Queue<RepositoryIndexJobData>(QUEUES.repositoryIndexing, {
    connection: redisConnection
  });

  enqueueRepositoryIndex(data: RepositoryIndexJobData): Promise<{ id?: string }> {
    return this.queue.add("index-repository", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { age: 86400, count: 500 },
      removeOnFail: { age: 604800, count: 1000 }
    });
  }
}
