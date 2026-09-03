import { describe, expect, it } from "vitest";
import { Chunker } from "./chunker.js";

describe("Chunker", () => {
  it("splits content into stable line chunks", () => {
    const chunks = new Chunker().chunk(["one", "two", "three"].join("\n"), 2);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({ content: "one\ntwo", startLine: 1, endLine: 2 });
    expect(chunks[1]).toMatchObject({ content: "three", startLine: 3, endLine: 3 });
  });
});
