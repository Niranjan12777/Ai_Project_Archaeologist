import OpenAI from "openai";
import { env } from "../config/env.js";
import type { CodeIntelligenceRepository, ChunkSearchResult } from "../repositories/code-intelligence.repository.js";
import type { RagService } from "./rag.service.js";

export interface ChatAnswer {
  chatId: string;
  answer: string;
  citations: Array<{ path: string; startLine: number; endLine: number; score: number }>;
}

export class AiChatService {
  private readonly openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

  constructor(
    private readonly code: CodeIntelligenceRepository,
    private readonly rag: RagService
  ) { }

  async ask(input: { userId: string; repositoryId: string; question: string; chatId?: string }): Promise<ChatAnswer> {
    const chat = input.chatId
      ? await this.code.findChatForUser({ chatId: input.chatId, userId: input.userId, repositoryId: input.repositoryId })
      : await this.code.createChat({
        userId: input.userId,
        repositoryId: input.repositoryId,
        title: this.titleFromQuestion(input.question)
      });

    const activeChat = chat ?? await this.code.createChat({
      userId: input.userId,
      repositoryId: input.repositoryId,
      title: this.titleFromQuestion(input.question)
    });

    await this.code.addMessage({ chatId: activeChat.id, role: "USER", content: input.question });
    const contexts = await this.rag.retrieve(input.repositoryId, input.question, 8);
    const answer = this.openai
      ? await this.generateAnswer(input.question, contexts)
      : this.fallbackAnswer(input.question, contexts);
    const citations = contexts.map((context) => ({
      path: context.path,
      startLine: context.startLine,
      endLine: context.endLine,
      score: context.score
    }));

    await this.code.addMessage({
      chatId: activeChat.id,
      role: "ASSISTANT",
      content: answer,
      citations
    });

    return { chatId: activeChat.id, answer, citations };
  }

  private async generateAnswer(question: string, contexts: ChunkSearchResult[]): Promise<string> {
    const response = await this.openai?.chat.completions.create({
      model: env.openaiChatModel,
      messages: [
        {
          role: "system",
          content: "You explain indexed repositories using only the provided code context. Cite file paths and line ranges when relevant. If context is insufficient, say what is missing."
        },
        {
          role: "user",
          content: `Question: ${question}\n\nContext:\n${this.formatContexts(contexts)}`
        }
      ]
    });

    return response?.choices[0]?.message.content ?? this.fallbackAnswer(question, contexts);
  }

  private fallbackAnswer(question: string, contexts: ChunkSearchResult[]): string {
    if (!contexts.length) {
      return `I could not find indexed code that matches "${question}". Try re-indexing the repository or search for a more specific file, class, route, or function name.`;
    }

    const files = contexts.slice(0, 5).map((context) => `${context.path}:${context.startLine}-${context.endLine}`);
    return `I found ${contexts.length} relevant indexed chunk(s) for "${question}". Start with ${files.join(", ")}. Add an OpenAI API key to enable full natural-language explanations over this retrieved context.`;
  }

  private formatContexts(contexts: ChunkSearchResult[]): string {
    return contexts
      .map((context, index) => {
        return `[${index + 1}] ${context.path}:${context.startLine}-${context.endLine}\n${context.content}`;
      })
      .join("\n\n");
  }

  private titleFromQuestion(question: string): string {
    return question.trim().slice(0, 80) || "Repository chat";
  }
}
