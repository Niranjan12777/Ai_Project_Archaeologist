import crypto from "node:crypto";
import { redisConnection } from "../config/redis.js";
import type { ArchitectureGraph, Documentation, DocumentationType, Prisma, PrismaClient } from "../generated/prisma/client.js";

export interface ChunkSearchResult {
  chunkId: string;
  fileId: string;
  path: string;
  language: string | null;
  content: string;
  startLine: number;
  endLine: number;
  score: number;
}

const SEARCH_CACHE_TTL = 60;
const CONTEXT_CACHE_TTL = 300;

export class CodeIntelligenceRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async keywordSearch(repositoryId: string, query: string, limit = 8): Promise<ChunkSearchResult[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    const version = await this.getCacheVersion(repositoryId);

    const cacheKey = `code-intel:${repositoryId}:v${version}:keyword:` + `${this.hash(normalizedQuery)}:${limit}`;

    const cached = await redisConnection.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ChunkSearchResult[];
    }

    const chunks = await this.prisma.fileChunk.findMany({
      where: {
        file: { repositoryId },
        OR: [
          { content: { contains: query, mode: "insensitive" } },
          { file: { path: { contains: query, mode: "insensitive" } } },
          { file: { language: { contains: query, mode: "insensitive" } } }
        ]
      },
      include: { file: true },
      take: limit,
      orderBy: { createdAt: "desc" }
    });

    const results = chunks.map((chunk) => ({
      chunkId: chunk.id,
      fileId: chunk.fileId,
      path: chunk.file.path,
      language: chunk.file.language,
      content: chunk.content,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      score: this.keywordScore(query, chunk.file.path, chunk.content)
    }));

    await redisConnection.set(
      cacheKey,
      JSON.stringify(results),
      "EX",
      SEARCH_CACHE_TTL
    )

    return results;
  }

  async vectorSearch(repositoryId: string, vector: number[], limit = 8): Promise<ChunkSearchResult[]> {
    const vectorHash = this.hash(
      JSON.stringify(vector)
    );

    const version = await this.getCacheVersion(repositoryId);

    const cacheKey = `code-intel:${repositoryId}:v${version}:vector` + `${vectorHash}:${limit}`;

    const cached = await redisConnection.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ChunkSearchResult[];
    }

    const vectorLiteral = `[${vector.join(",")}]`;
    const results = await this.prisma.$queryRaw<ChunkSearchResult[]>`
      SELECT
        "FileChunk"."id" AS "chunkId",
        "RepositoryFile"."id" AS "fileId",
        "RepositoryFile"."path",
        "RepositoryFile"."language",
        "FileChunk"."content",
        "FileChunk"."startLine",
        "FileChunk"."endLine",
        1 - ("Embedding"."vector" <=> ${vectorLiteral}::vector) AS "score"
      FROM "Embedding"
      INNER JOIN "FileChunk" ON "FileChunk"."id" = "Embedding"."chunkId"
      INNER JOIN "RepositoryFile" ON "RepositoryFile"."id" = "FileChunk"."fileId"
      WHERE "RepositoryFile"."repositoryId" = ${repositoryId}
      ORDER BY "Embedding"."vector" <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `;

    await redisConnection.set(
      cacheKey,
      JSON.stringify(results),
      "EX",
      SEARCH_CACHE_TTL
    )

    return results;
  }

  async latestArchitectureGraph(repositoryId: string): Promise<ArchitectureGraph | null> {
    const version = await this.getCacheVersion(repositoryId);

    const cacheKey = `code-intel:${repositoryId}:v${version}:architecture`;

    const cached = await redisConnection.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ArchitectureGraph;
    }

    const graph = this.prisma.architectureGraph.findFirst({
      where: { repositoryId },
      orderBy: { updatedAt: "desc" }
    });

    if (graph) {
      await redisConnection.set(
        cacheKey,
        JSON.stringify(graph),
        "EX",
        CONTEXT_CACHE_TTL
      )
    }

    return graph;
  }

  async listDocumentation(repositoryId: string): Promise<Documentation[]> {
    const version = await this.getCacheVersion(repositoryId);

    const cacheKey = `code-intel:${repositoryId}:v${version}:documentation`;

    const cached = await redisConnection.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as Documentation[];
    }

    const documentation = this.prisma.documentation.findMany({
      where: { repositoryId },
      orderBy: { updatedAt: "desc" }
    });

    await redisConnection.set(
      cacheKey,
      JSON.stringify(documentation),
      "EX",
      CONTEXT_CACHE_TTL
    )

    return documentation;
  }

  upsertDocumentation(input: {
    repositoryId: string;
    type: DocumentationType;
    title: string;
    content: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<Documentation> {
    return this.prisma.documentation.create({
      data: input
    });
  }

  async repositoryContext(repositoryId: string) {
    const version = await this.getCacheVersion(repositoryId);

    const cacheKey = `code-intel:${repositoryId}:v${version}:context`;

    const cached = await redisConnection.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const [repository, files, graph, docs] = await Promise.all([
      this.prisma.repository.findUnique({ where: { id: repositoryId } }),
      this.prisma.repositoryFile.findMany({
        where: { repositoryId },
        take: 80,
        orderBy: [{ language: "asc" }, { path: "asc" }]
      }),
      this.latestArchitectureGraph(repositoryId),
      this.listDocumentation(repositoryId)
    ]);

    const context = { repository, files, graph, docs };

    await redisConnection.set(
      cacheKey,
      JSON.stringify(context),
      "EX",
      CONTEXT_CACHE_TTL
    )

    return context;
  }

  createChat(input: { userId: string; repositoryId: string; title: string }) {
    return this.prisma.chat.create({ data: input });
  }

  findChatForUser(input: { chatId: string; userId: string; repositoryId: string }) {
    return this.prisma.chat.findFirst({
      where: {
        id: input.chatId,
        userId: input.userId,
        repositoryId: input.repositoryId
      }
    });
  }

  addMessage(input: { chatId: string; role: "USER" | "ASSISTANT" | "SYSTEM"; content: string; citations?: Prisma.InputJsonValue }) {
    return this.prisma.message.create({
      data: input
    });
  }

  async invalidateRepositoryCache(repositoryId: string): Promise<void> {
    await redisConnection.incr(this.getVersionKey(repositoryId));
  }

  private async getCacheVersion(repositoryId: string): Promise<number> {
    const version = await redisConnection.get(this.getVersionKey(repositoryId));

    if (version) {
      return Number(version);
    }

    const newVersion = await redisConnection.set(
      this.getVersionKey(repositoryId),
      "1",
      "EX",
      60 * 60 * 24 * 30,
      "NX"
    );

    if (newVersion === "OK") {
      return 1;
    }

    const currentVersion = await redisConnection.get(this.getVersionKey(repositoryId));

    return Number(currentVersion ?? 1);
  }

  private getVersionKey(repositoryId: string): string {
    return `code-intel:${repositoryId}:version`;
  }

  private hash(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  private keywordScore(query: string, path: string, content: string): number {
    const normalizedQuery = query.toLowerCase();
    const normalizedPath = path.toLowerCase();
    const normalizedContent = content.toLowerCase();
    let score = 0.2;
    if (normalizedPath.includes(normalizedQuery)) score += 0.45;
    if (normalizedContent.includes(normalizedQuery)) score += 0.35;
    return Number(score.toFixed(2));
  }
}
