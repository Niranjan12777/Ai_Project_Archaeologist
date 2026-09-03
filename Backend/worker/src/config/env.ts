import dotenv from "dotenv";

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  redisHost: process.env.REDIS_HOST ?? "localhost",
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
  repositoryWorkdir: process.env.REPOSITORY_WORKDIR ?? "./repositories",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  openaiChatModel: process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini"
} as const;
