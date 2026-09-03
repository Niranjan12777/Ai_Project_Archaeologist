import crypto from "node:crypto";
import type { Job } from "bullmq";
import { simpleGit } from "simple-git";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import type { RepositoryIndexJobData } from "../jobs/repository-index-job.js";
import { RepositoryCloner } from "../github/repository-cloner.js";
import { SourceParser } from "../parser/source-parser.js";
import { Chunker } from "../parser/chunker.js";
import { StaticAnalyzer } from "../architecture/static-analyzer.js";
import { EmbeddingService } from "../embeddings/embedding.service.js";

export class RepositoryIndexProcessor {
  private readonly cloner = new RepositoryCloner();
  private readonly parser = new SourceParser();
  private readonly chunker = new Chunker();
  private readonly analyzer = new StaticAnalyzer();
  private readonly embeddings = new EmbeddingService();

  async process(job: Job<RepositoryIndexJobData>): Promise<void> {
    const { repositoryId, indexJobId } = job.data;
    await this.updateJob(indexJobId, 5, "Loading repository metadata");

    const repository = await prisma.repository.findUniqueOrThrow({ where: { id: repositoryId } });

    await this.updateJob(indexJobId, 15, "Cloning or pulling repository");
    const localPath = await this.cloner.cloneOrPull(repository.id, repository.cloneUrl);

    await this.updateJob(indexJobId, 30, "Parsing source files");
    const files = await this.parser.parse(localPath);

    await this.updateJob(indexJobId, 38, "Synchronizing git metadata");
    await this.persistGitMetadata(repositoryId, localPath);

    await this.updateJob(indexJobId, 45, "Running static analysis");
    const graph = this.analyzer.analyze(files);

    await this.updateJob(indexJobId, 60, "Persisting files and chunks");
    await this.pruneRemovedFiles(repositoryId, files.map((file) => file.path));

    for (const sourceFile of files) {
      const file = await prisma.repositoryFile.upsert({
        where: { repositoryId_path: { repositoryId, path: sourceFile.path } },
        update: {
          extension: sourceFile.extension,
          language: sourceFile.language,
          sizeBytes: sourceFile.sizeBytes,
          hash: this.hash(sourceFile.content)
        },
        create: {
          repositoryId,
          path: sourceFile.path,
          extension: sourceFile.extension,
          language: sourceFile.language,
          sizeBytes: sourceFile.sizeBytes,
          hash: this.hash(sourceFile.content)
        }
      });

      await prisma.fileChunk.deleteMany({ where: { fileId: file.id } });
      for (const chunk of this.chunker.chunk(sourceFile.content)) {
        const savedChunk = await prisma.fileChunk.create({
          data: { fileId: file.id, ...chunk }
        });
        const vector = await this.embeddings.embed(chunk.content);
        if (vector) {
          const vectorLiteral = `[${vector.join(",")}]`;
          await prisma.$executeRaw`
            INSERT INTO "Embedding" ("id", "chunkId", "model", "vector", "createdAt")
            VALUES (${crypto.randomUUID()}, ${savedChunk.id}, ${env.openaiEmbeddingModel}, ${vectorLiteral}::vector, NOW())
          `;
        }
      }
    }

    await this.updateJob(indexJobId, 85, "Saving architecture graph");
    await prisma.architectureGraph.create({
      data: {
        repositoryId,
        name: "Current architecture",
        nodes: graph.nodes,
        edges: graph.edges,
        metadata: { generatedBy: "static-analyzer" }
      }
    });

    await prisma.repositoryIndexJob.update({
      where: { id: indexJobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        currentStep: "Indexing complete",
        completedAt: new Date()
      }
    });
  }

  private updateJob(id: string, progress: number, currentStep: string) {
    return prisma.repositoryIndexJob.update({
      where: { id },
      data: {
        status: "RUNNING",
        progress,
        currentStep,
        ...(progress === 5 ? { startedAt: new Date() } : {})
      }
    });
  }

  private pruneRemovedFiles(repositoryId: string, indexedPaths: string[]) {
    if (indexedPaths.length === 0) {
      return prisma.repositoryFile.deleteMany({ where: { repositoryId } });
    }

    return prisma.repositoryFile.deleteMany({
      where: {
        repositoryId,
        path: { notIn: indexedPaths }
      }
    });
  }

  private async persistGitMetadata(repositoryId: string, localPath: string) {
    const git = simpleGit(localPath);
    const [branchSummary, log] = await Promise.all([
      git.branch().catch(() => null),
      git.log({ maxCount: 100 }).catch(() => null)
    ]);

    if (branchSummary) {
      await Promise.all(
        Object.values(branchSummary.branches).map((branch) =>
          prisma.branch.upsert({
            where: { repositoryId_name: { repositoryId, name: branch.name } },
            update: {
              sha: branch.commit,
              protected: branch.name === branchSummary.current
            },
            create: {
              repositoryId,
              name: branch.name,
              sha: branch.commit,
              protected: branch.name === branchSummary.current
            }
          })
        )
      );
    }

    if (log) {
      await Promise.all(
        log.all.map((commit) =>
          prisma.commit.upsert({
            where: { repositoryId_sha: { repositoryId, sha: commit.hash } },
            update: {
              message: commit.message,
              authorName: commit.author_name,
              authorEmail: commit.author_email,
              committedAt: new Date(commit.date)
            },
            create: {
              repositoryId,
              sha: commit.hash,
              message: commit.message,
              authorName: commit.author_name,
              authorEmail: commit.author_email,
              committedAt: new Date(commit.date)
            }
          })
        )
      );
    }
  }

  private hash(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }
}
