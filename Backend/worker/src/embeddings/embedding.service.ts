import OpenAI from "openai";
import { env } from "../config/env.js";

export class EmbeddingService {
  private readonly openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

  async embed(text: string): Promise<number[] | null> {
    if (!this.openai) {
      return null;
    }

    const response = await this.openai.embeddings.create({
      model: env.openaiEmbeddingModel,
      input: text.slice(0, 8000)
    });

    return response.data[0]?.embedding ?? null;
  }
}
