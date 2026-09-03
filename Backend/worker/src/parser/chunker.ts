export interface SourceChunk {
  content: string;
  startLine: number;
  endLine: number;
  tokenCount: number;
}

export class Chunker {
  chunk(content: string, maxLines = 120): SourceChunk[] {
    const lines = content.split(/\r?\n/);
    const chunks: SourceChunk[] = [];

    for (let index = 0; index < lines.length; index += maxLines) {
      const slice = lines.slice(index, index + maxLines);
      const chunkContent = slice.join("\n");
      chunks.push({
        content: chunkContent,
        startLine: index + 1,
        endLine: index + slice.length,
        tokenCount: Math.ceil(chunkContent.length / 4)
      });
    }

    return chunks;
  }
}
