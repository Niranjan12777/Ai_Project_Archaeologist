import OpenAI from "openai";
import { env } from "../config/env.js";
import type { CodeIntelligenceRepository, ChunkSearchResult } from "../repositories/code-intelligence.repository.js";

export class RagService {
  private readonly openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

  constructor(private readonly code: CodeIntelligenceRepository) {}

  async retrieve(repositoryId: string, query: string, limit = 8): Promise<ChunkSearchResult[]> {
    const keywordResults = await this.code.keywordSearch(repositoryId, query, limit);

    if (!this.openai) {
      return keywordResults;
    }

    const embedding = await this.embed(query);
    if (!embedding) {
      return keywordResults;
    }

    const semanticResults = await this.code.vectorSearch(repositoryId, embedding, limit);
    return this.mergeResults([...semanticResults, ...keywordResults]).slice(0, limit);
  }

  private async embed(query: string): Promise<number[] | null> {
    const response = await this.openai?.embeddings.create({
      model: env.openaiEmbeddingModel,
      input: query.slice(0, 8000)
    });

    return response?.data[0]?.embedding ?? null;
  }

  private mergeResults(results: ChunkSearchResult[]): ChunkSearchResult[] {
    const byChunk = new Map<string, ChunkSearchResult>();
    for (const result of results) {
      const existing = byChunk.get(result.chunkId);
      if (!existing || existing.score < result.score) {
        byChunk.set(result.chunkId, result);
      }
    }
    return [...byChunk.values()].sort((left, right) => right.score - left.score);
  }
}
