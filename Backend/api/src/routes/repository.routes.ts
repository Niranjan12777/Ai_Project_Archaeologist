import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { RepositoryController } from "../controllers/repository.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { IndexJobRepository } from "../repositories/index-job.repository.js";
import { RepositoryRepository } from "../repositories/repository.repository.js";
import { CodeIntelligenceRepository } from "../repositories/code-intelligence.repository.js";
import { AiChatService } from "../services/ai-chat.service.js";
import { ArchitectureService } from "../services/architecture.service.js";
import { DocumentationService } from "../services/documentation.service.js";
import { GitHubService } from "../services/github.service.js";
import { IndexingQueueService } from "../services/indexing-queue.service.js";
import { RagService } from "../services/rag.service.js";
import { RepositoryService } from "../services/repository.service.js";
import {
  chatRepositoryValidator,
  generateDocumentationValidator,
  importRepositoryValidator,
  repositoryIdValidator,
  searchRepositoryValidator
} from "../validators/repository.validator.js";

const repositories = new RepositoryRepository(prisma);
const indexJobs = new IndexJobRepository(prisma);
const code = new CodeIntelligenceRepository(prisma);
const github = new GitHubService();
const queue = new IndexingQueueService();
const service = new RepositoryService(repositories, indexJobs, github, queue);
const rag = new RagService(code);
const chat = new AiChatService(code, rag);
const architecture = new ArchitectureService(code);
const documentation = new DocumentationService(code);
const controller = new RepositoryController(service, rag, chat, architecture, documentation);

export const repositoryRouter = Router();

repositoryRouter.use(authenticate);
repositoryRouter.get("/", controller.list);
repositoryRouter.post("/", importRepositoryValidator, validateRequest, controller.import);
repositoryRouter.get("/:id", repositoryIdValidator, validateRequest, controller.get);
repositoryRouter.get("/:id/search", searchRepositoryValidator, validateRequest, controller.search);
repositoryRouter.post("/:id/chat", chatRepositoryValidator, validateRequest, controller.chat);
repositoryRouter.get("/:id/architecture", repositoryIdValidator, validateRequest, controller.architecture);
repositoryRouter.get("/:id/documentation", repositoryIdValidator, validateRequest, controller.documentation);
repositoryRouter.post("/:id/documentation", generateDocumentationValidator, validateRequest, controller.generateDocumentation);
repositoryRouter.post("/:id/reindex", repositoryIdValidator, validateRequest, controller.reindex);
repositoryRouter.post("/:id/sync", repositoryIdValidator, validateRequest, controller.sync);
repositoryRouter.delete("/:id", repositoryIdValidator, validateRequest, controller.delete);
