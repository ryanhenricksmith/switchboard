import { stat } from "node:fs/promises";
import path from "node:path";
import { readJsonLines } from "../jsonl.js";
import { cleanTitle, projectName, timestamp } from "../text.js";
import type { Session } from "../types.js";

interface ClaudeRecord extends Record<string, unknown> {
  type?: string;
  sessionId?: string;
  timestamp?: string;
  cwd?: string;
  isMeta?: boolean;
  isSidechain?: boolean;
  aiTitle?: string;
  message?: {
    role?: string;
    content?: unknown;
  };
}

function messageText(content: unknown): string | undefined {
  if (typeof content === "string") return cleanTitle(content);
  if (!Array.isArray(content)) return undefined;

  const text = content
    .filter((item): item is { type?: string; text?: string } => Boolean(item && typeof item === "object"))
    .filter((item) => item.type === "text" && typeof item.text === "string")
    .map((item) => item.text)
    .join(" ");
  return cleanTitle(text);
}

export async function parseClaudeSession(filePath: string): Promise<Session | undefined> {
  let id = path.basename(filePath, ".jsonl");
  let cwd = "";
  let generatedTitle: string | undefined;
  let firstPrompt: string | undefined;
  let updatedAt = 0;
  let sizeBytes = 0;

  try {
    for await (const raw of readJsonLines(filePath)) {
      const record = raw as ClaudeRecord;
      if (record.sessionId) id = record.sessionId;
      if (record.cwd) cwd = record.cwd;
      updatedAt = Math.max(updatedAt, timestamp(record.timestamp) ?? 0);

      if (record.type === "ai-title") {
        generatedTitle = cleanTitle(record.aiTitle) ?? generatedTitle;
      }

      if (
        !firstPrompt &&
        record.type === "user" &&
        !record.isMeta &&
        !record.isSidechain &&
        record.message?.role === "user"
      ) {
        firstPrompt = messageText(record.message.content);
      }
    }

    const metadata = await stat(filePath);
    updatedAt = Math.max(updatedAt, metadata.mtimeMs);
    sizeBytes = metadata.size;
  } catch {
    return undefined;
  }

  const title = generatedTitle ?? firstPrompt;
  if (!title || !cwd) return undefined;

  return {
    provider: "claude",
    id,
    title,
    cwd,
    project: projectName(cwd),
    updatedAt,
    sizeBytes,
    transcriptPath: filePath,
  };
}
