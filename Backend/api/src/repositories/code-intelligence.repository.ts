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

export class CodeIntelligenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async keywordSearch(repositoryId: string, query: string, limit = 8): Promise<ChunkSearchResult[]> {
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

    return chunks.map((chunk) => ({
      chunkId: chunk.id,
      fileId: chunk.fileId,
      path: chunk.file.path,
      language: chunk.file.language,
      content: chunk.content,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      score: this.keywordScore(query, chunk.file.path, chunk.content)
    }));
  }

  vectorSearch(repositoryId: string, vector: number[], limit = 8): Promise<ChunkSearchResult[]> {
    const vectorLiteral = `[${vector.join(",")}]`;
    return this.prisma.$queryRaw<ChunkSearchResult[]>`
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
  }

  latestArchitectureGraph(repositoryId: string): Promise<ArchitectureGraph | null> {
    return this.prisma.architectureGraph.findFirst({
      where: { repositoryId },
      orderBy: { updatedAt: "desc" }
    });
  }

  listDocumentation(repositoryId: string): Promise<Documentation[]> {
    return this.prisma.documentation.findMany({
      where: { repositoryId },
      orderBy: { updatedAt: "desc" }
    });
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

    return { repository, files, graph, docs };
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
