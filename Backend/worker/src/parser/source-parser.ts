import path from "node:path";
import fs from "node:fs/promises";
import fg from "fast-glob";
import { ignoredPathGlobs } from "../utils/ignored-paths.js";

export interface ParsedSourceFile {
  path: string;
  extension: string;
  language: string | null;
  sizeBytes: number;
  content: string;
}

export class SourceParser {
  async parse(rootPath: string): Promise<ParsedSourceFile[]> {
    const files = await fg(["**/*"], {
      cwd: rootPath,
      dot: true,
      onlyFiles: true,
      ignore: ignoredPathGlobs,
      absolute: true
    });

    const parsed: ParsedSourceFile[] = [];
    for (const filePath of files.slice(0, 2000)) {
      const stat = await fs.stat(filePath);
      if (stat.size > 512_000) {
        continue;
      }

      const content = await fs.readFile(filePath, "utf8").catch(() => "");
      if (!content.trim()) {
        continue;
      }

      parsed.push({
        path: path.relative(rootPath, filePath).replaceAll("\\", "/"),
        extension: path.extname(filePath),
        language: this.inferLanguage(filePath),
        sizeBytes: stat.size,
        content
      });
    }

    return parsed;
  }

  private inferLanguage(filePath: string): string | null {
    const extension = path.extname(filePath).toLowerCase();
    const filename = path.basename(filePath).toLowerCase();
    const languageByExtension: Record<string, string> = {
      ".cjs": "JavaScript",
      ".css": "CSS",
      ".go": "Go",
      ".js": "JavaScript",
      ".json": "JSON",
      ".jsx": "JavaScript",
      ".md": "Markdown",
      ".mjs": "JavaScript",
      ".prisma": "Prisma",
      ".py": "Python",
      ".rs": "Rust",
      ".sql": "SQL",
      ".tsx": "TypeScript",
      ".ts": "TypeScript",
      ".yaml": "YAML",
      ".yml": "YAML"
    };

    if (filename === "dockerfile") {
      return "Dockerfile";
    }

    return languageByExtension[extension] ?? null;
  }
}
