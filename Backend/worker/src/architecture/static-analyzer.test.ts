import { describe, expect, it } from "vitest";
import { StaticAnalyzer } from "./static-analyzer.js";

describe("StaticAnalyzer", () => {
  it("classifies common architecture file roles and relative imports", () => {
    const graph = new StaticAnalyzer().analyze([
      {
        path: "src/user.controller.ts",
        extension: ".ts",
        language: "TypeScript",
        sizeBytes: 64,
        content: "import { UserService } from './user.service';"
      },
      {
        path: "src/user.service.ts",
        extension: ".ts",
        language: "TypeScript",
        sizeBytes: 32,
        content: "export class UserService {}"
      }
    ]);

    expect(graph.nodes).toContainEqual({ id: "src/user.controller.ts", label: "user.controller.ts", type: "controller" });
    expect(graph.nodes).toContainEqual({ id: "src/user.service.ts", label: "user.service.ts", type: "service" });
    expect(graph.edges).toContainEqual({ source: "src/user.controller.ts", target: "./user.service", type: "imports" });
  });
});
