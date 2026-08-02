import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export async function* readJsonLines(filePath: string): AsyncGenerator<Record<string, unknown>> {
  const input = createReadStream(filePath, { encoding: "utf8" });
  const lines = createInterface({ input, crlfDelay: Infinity });

  for await (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed: unknown = JSON.parse(line);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        yield parsed as Record<string, unknown>;
      }
    } catch {
      // A partially written final JSONL record should not hide the whole session.
    }
  }
}
