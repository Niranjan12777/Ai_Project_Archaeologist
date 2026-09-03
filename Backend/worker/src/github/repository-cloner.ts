import path from "node:path";
import fs from "node:fs/promises";
import { simpleGit } from "simple-git";
import { env } from "../config/env.js";

export class RepositoryCloner {
  async cloneOrPull(repositoryId: string, cloneUrl: string): Promise<string> {
    await fs.mkdir(env.repositoryWorkdir, { recursive: true });
    const targetPath = path.resolve(env.repositoryWorkdir, repositoryId);

    try {
      await fs.access(path.join(targetPath, ".git"));
      await simpleGit(targetPath).pull();
      return targetPath;
    } catch {
      await fs.rm(targetPath, { recursive: true, force: true });
      await simpleGit().clone(cloneUrl, targetPath, ["--depth", "1"]);
      return targetPath;
    }
  }
}
