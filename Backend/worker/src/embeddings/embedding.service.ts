import OpenAI from "openai";
import { env } from "../config/env.js";

const EMBEDDING_BATCH_SIZE = 100;
const MAX_INPUT_LENGTH = 8000;

export class EmbeddingService {
  private readonly openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

  async embed(text: string): Promise<number[] | null> {
    if (!this.openai) {
      return null;
    }

    const response = await this.openai.embeddings.create({
      model: env.openaiEmbeddingModel,
      input: text.slice(0, MAX_INPUT_LENGTH)
    });

    return response.data[0]?.embedding ?? null;
  }

  async embedMany(texts: string[]): Promise<(number[] | null)[]> {
    if (!this.openai) {
      return texts.map(() => null);
    }

    if (texts.length === 0) {
      return [];
    }

    const results: (number[] | null)[] = [];

    for (let start = 0; start < texts.length; start += EMBEDDING_BATCH_SIZE) {
      const batch = texts.slice(start, start + EMBEDDING_BATCH_SIZE);

      const response = await this.openai.embeddings.create({
        model: env.openaiEmbeddingModel,
        input: batch.map((text) =>
          text.slice(0, MAX_INPUT_LENGTH)
        )
      });

      const batchEmbeddings: (number[] | null)[] = batch.map(() => null);

      for (const item of response.data) {
        batchEmbeddings[item.index] = item.embedding;
      }

      results.push(...batchEmbeddings);
    }

    return results;
  }
}
