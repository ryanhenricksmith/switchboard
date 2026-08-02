import { readdir } from "node:fs/promises";
import path from "node:path";

export async function findJsonlFiles(root: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(directory: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "subagents") return;
          await walk(fullPath);
          return;
        }
        if (entry.isFile() && entry.name.endsWith(".jsonl")) files.push(fullPath);
      }),
    );
  }

  await walk(root);
  return files;
}

export async function mapLimit<T, R>(
  values: readonly T[],
  limit: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor++;
      if (index >= values.length) return;
      const value = values[index];
      if (value !== undefined) results[index] = await mapper(value);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}
