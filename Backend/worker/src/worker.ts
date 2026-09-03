import { prisma } from "./config/prisma.js";
import { redisConnection } from "./config/redis.js";
import { repositoryIndexWorker } from "./queues/repository-index.queue.js";

const shutdown = async () => {
  await repositoryIndexWorker.close();
  await redisConnection.quit();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
