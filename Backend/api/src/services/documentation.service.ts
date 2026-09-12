import OpenAI from "openai";
import type { DocumentationType } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import type { CodeIntelligenceRepository } from "../repositories/code-intelligence.repository.js";

const documentationTitles: Record<DocumentationType, string> = {
  README: "Generated README",
  API: "Generated API Documentation",
  ARCHITECTURE: "Generated Architecture Documentation",
  ONBOARDING: "Generated Onboarding Guide"
};

export class DocumentationService {
  private readonly openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

  constructor(private readonly code: CodeIntelligenceRepository) { }

  list(repositoryId: string) {
    return this.code.listDocumentation(repositoryId);
  }

  async generate(repositoryId: string, type: DocumentationType) {
    const context = await this.code.repositoryContext(repositoryId);
    const title = documentationTitles[type];
    const content = this.openai
      ? await this.generateWithAi(type, context)
      : this.generateFallback(type, context);

    return this.code.upsertDocumentation({
      repositoryId,
      type,
      title,
      content,
      metadata: {
        generatedBy: this.openai ? "openai" : "template",
        fileCount: context.files.length
      }
    });
  }

  private async generateWithAi(type: DocumentationType, context: Awaited<ReturnType<CodeIntelligenceRepository["repositoryContext"]>>) {
    const response = await this.openai?.chat.completions.create({
      model: env.openaiChatModel,
      messages: [
        {
          role: "system",
          content: "Generate concise, production-ready repository documentation from indexed metadata. Use Markdown. Do not invent unavailable details."
        },
        {
          role: "user",
          content: `Documentation type: ${type}\nRepository: ${context.repository?.fullName}\nFiles:\n${context.files.map((file) => `- ${file.path} (${file.language ?? "Unknown"})`).join("\n")}\nArchitecture graph nodes: ${Array.isArray(context.graph?.nodes) ? context.graph.nodes.length : 0}`
        }
      ]
    });

    return response?.choices[0]?.message.content ?? this.generateFallback(type, context);
  }

  private generateFallback(type: DocumentationType, context: Awaited<ReturnType<CodeIntelligenceRepository["repositoryContext"]>>) {
    const repositoryName = context.repository?.fullName ?? "Repository";
    const filesByLanguage = new Map<string, number>();
    for (const file of context.files) {
      filesByLanguage.set(file.language ?? "Unknown", (filesByLanguage.get(file.language ?? "Unknown") ?? 0) + 1);
    }

    const languageSummary = [...filesByLanguage.entries()]
      .map(([language, count]) => `- ${language}: ${count}`)
      .join("\n");
    const sampleFiles = context.files.slice(0, 20).map((file) => `- \`${file.path}\``).join("\n");

    return `# ${documentationTitles[type]}\n\n## Repository\n\n${repositoryName}\n\n## Indexed Languages\n\n${languageSummary || "- No indexed files yet"}\n\n## Important Files\n\n${sampleFiles || "- Re-index the repository to populate file metadata."}\n\n## Notes\n\nThis document was generated from indexed repository metadata. Add an OpenAI API key for richer prose and deeper architectural explanations.`;
  }
}
