import { stat } from "node:fs/promises";
import path from "node:path";
import { readJsonLines } from "../jsonl.js";
import { cleanTitle, projectName, timestamp } from "../text.js";
import type { Session } from "../types.js";

interface CodexRecord extends Record<string, unknown> {
  timestamp?: string;
  type?: string;
  payload?: {
    type?: string;
    session_id?: string;
    id?: string;
    cwd?: string;
    message?: string;
    role?: string;
    content?: Array<{ type?: string; text?: string }>;
  };
}

function fallbackId(filePath: string): string {
  const match = path.basename(filePath, ".jsonl").match(/([0-9a-f]{8}-[0-9a-f-]{27,})$/i);
  return match?.[1] ?? path.basename(filePath, ".jsonl");
}

function userText(record: CodexRecord): string | undefined {
  const payload = record.payload;
  if (!payload) return undefined;

  if (record.type === "event_msg" && payload.type === "user_message") {
    return cleanTitle(payload.message);
  }

  if (record.type === "response_item" && payload.type === "message" && payload.role === "user") {
    const value = payload.content
      ?.filter((item) => item.type === "input_text" && typeof item.text === "string")
      .map((item) => item.text)
      .join(" ");
    return cleanTitle(value);
  }

  return undefined;
}

export async function parseCodexSession(filePath: string): Promise<Session | undefined> {
  let id = fallbackId(filePath);
  let cwd = "";
  let firstPrompt: string | undefined;
  let fallbackPrompt: string | undefined;
  let updatedAt = 0;
  let sizeBytes = 0;

  try {
    for await (const raw of readJsonLines(filePath)) {
      const record = raw as CodexRecord;
      const payload = record.payload;
      updatedAt = Math.max(updatedAt, timestamp(record.timestamp) ?? 0);

      if (record.type === "session_meta" && payload) {
        id = payload.session_id ?? payload.id ?? id;
        cwd = payload.cwd ?? cwd;
      } else if (record.type === "turn_context" && payload?.cwd) {
        cwd = payload.cwd;
      }

      const candidate = userText(record);
      if (candidate) {
        if (record.type === "event_msg") firstPrompt ??= candidate;
        else fallbackPrompt ??= candidate;
      }
    }

    const metadata = await stat(filePath);
    updatedAt = Math.max(updatedAt, metadata.mtimeMs);
    sizeBytes = metadata.size;
  } catch {
    return undefined;
  }

  const title = firstPrompt ?? fallbackPrompt;
  if (!title || !cwd) return undefined;

  return {
    provider: "codex",
    id,
    title,
    cwd,
    project: projectName(cwd),
    updatedAt,
    sizeBytes,
    transcriptPath: filePath,
  };
}
