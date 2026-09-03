import type { CodeIntelligenceRepository } from "../repositories/code-intelligence.repository.js";
import { AppError } from "../utils/app-error.js";

export class ArchitectureService {
  constructor(private readonly code: CodeIntelligenceRepository) {}

  async latest(repositoryId: string) {
    const graph = await this.code.latestArchitectureGraph(repositoryId);
    if (!graph) {
      throw new AppError("Architecture graph not found. Index the repository first.", 404);
    }
    return graph;
  }
}
