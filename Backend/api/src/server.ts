import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { redisConnection } from "./config/redis.js";

const app = createApp();
const server = app.listen(env.port);

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    await redisConnection.quit();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
