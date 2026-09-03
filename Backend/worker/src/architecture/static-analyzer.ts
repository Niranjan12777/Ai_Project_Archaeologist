import type { ParsedSourceFile } from "../parser/source-parser.js";

export interface ArchitectureGraph {
  nodes: Array<{ id: string; label: string; type: string }>;
  edges: Array<{ source: string; target: string; type: string }>;
}

export class StaticAnalyzer {
  analyze(files: ParsedSourceFile[]): ArchitectureGraph {
    const nodes = files.map((file) => ({
      id: file.path,
      label: file.path.split("/").at(-1) ?? file.path,
      type: this.inferType(file.path, file.content)
    }));

    const edges = files.flatMap((file) => {
      const imports = [...file.content.matchAll(/import\s+.*?from\s+["'](.+?)["']/g)];
      return imports
        .filter((match) => match[1].startsWith("."))
        .map((match) => ({
          source: file.path,
          target: match[1],
          type: "imports"
        }));
    });

    return { nodes, edges };
  }

  private inferType(filePath: string, content: string): string {
    if (filePath.includes("controller")) return "controller";
    if (filePath.includes("service")) return "service";
    if (filePath.includes("repository")) return "repository";
    if (/export\s+(default\s+)?function\s+[A-Z]/.test(content)) return "react-component";
    if (/model\s+\w+\s+{/.test(content)) return "prisma-model";
    return "source-file";
  }
}
