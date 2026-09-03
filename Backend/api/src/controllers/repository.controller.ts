import type { Request, RequestHandler } from "express";
import { sendSuccess } from "../utils/api-response.js";
import type { RepositoryService } from "../services/repository.service.js";
import type { RagService } from "../services/rag.service.js";
import type { AiChatService } from "../services/ai-chat.service.js";
import type { ArchitectureService } from "../services/architecture.service.js";
import type { DocumentationService } from "../services/documentation.service.js";
import { AppError } from "../utils/app-error.js";
import type { DocumentationType } from "../generated/prisma/client.js";

export class RepositoryController {
  constructor(
    private readonly repositoryService: RepositoryService,
    private readonly ragService: RagService,
    private readonly aiChatService: AiChatService,
    private readonly architectureService: ArchitectureService,
    private readonly documentationService: DocumentationService
  ) {}

  list: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repositories = await this.repositoryService.list(req.user.id);
      sendSuccess(res, repositories, "Repositories loaded");
    } catch (error) {
      next(error);
    }
  };

  get: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repository = await this.repositoryService.get(this.repositoryId(req), req.user.id);
      sendSuccess(res, repository, "Repository loaded");
    } catch (error) {
      next(error);
    }
  };

  import: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const result = await this.repositoryService.importFromGitHub(req.user.id, req.body.fullName);
      sendSuccess(res, result, "Repository import queued", 202);
    } catch (error) {
      next(error);
    }
  };

  reindex: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const result = await this.repositoryService.reindex(this.repositoryId(req), req.user.id);
      sendSuccess(res, result, "Repository re-index queued", 202);
    } catch (error) {
      next(error);
    }
  };

  sync: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const result = await this.repositoryService.sync(this.repositoryId(req), req.user.id);
      sendSuccess(res, result, "Repository sync queued", 202);
    } catch (error) {
      next(error);
    }
  };

  delete: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repository = await this.repositoryService.delete(this.repositoryId(req), req.user.id);
      sendSuccess(res, repository, "Repository deleted");
    } catch (error) {
      next(error);
    }
  };

  search: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repositoryId = this.repositoryId(req);
      await this.repositoryService.get(repositoryId, req.user.id);
      const results = await this.ragService.retrieve(repositoryId, this.queryText(req, "q"), 12);
      sendSuccess(res, results, "Search completed");
    } catch (error) {
      next(error);
    }
  };

  chat: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repositoryId = this.repositoryId(req);
      await this.repositoryService.get(repositoryId, req.user.id);
      const answer = await this.aiChatService.ask({
        userId: req.user.id,
        repositoryId,
        question: req.body.question,
        chatId: req.body.chatId
      });
      sendSuccess(res, answer, "Question answered");
    } catch (error) {
      next(error);
    }
  };

  architecture: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repositoryId = this.repositoryId(req);
      await this.repositoryService.get(repositoryId, req.user.id);
      const graph = await this.architectureService.latest(repositoryId);
      sendSuccess(res, graph, "Architecture graph loaded");
    } catch (error) {
      next(error);
    }
  };

  documentation: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repositoryId = this.repositoryId(req);
      await this.repositoryService.get(repositoryId, req.user.id);
      const docs = await this.documentationService.list(repositoryId);
      sendSuccess(res, docs, "Documentation loaded");
    } catch (error) {
      next(error);
    }
  };

  generateDocumentation: RequestHandler = async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      const repositoryId = this.repositoryId(req);
      await this.repositoryService.get(repositoryId, req.user.id);
      const doc = await this.documentationService.generate(repositoryId, req.body.type as DocumentationType);
      sendSuccess(res, doc, "Documentation generated", 201);
    } catch (error) {
      next(error);
    }
  };

  private repositoryId(req: Request): string {
    return this.paramText(req, "id");
  }

  private paramText(req: Request, key: string): string {
    const value = req.params[key];
    return Array.isArray(value) ? value[0] : value;
  }

  private queryText(req: Request, key: string): string {
    const value = req.query[key];
    if (Array.isArray(value)) {
      return String(value[0] ?? "");
    }
    return String(value ?? "");
  }
}
