import os from "node:os";
import path from "node:path";
import { parseClaudeSession } from "./adapters/claude.js";
import { parseCodexSession } from "./adapters/codex.js";
import { findJsonlFiles, mapLimit } from "./files.js";
import type { ScanOptions, Session } from "./types.js";

function defaultClaudeHome(): string {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
}

function defaultCodexHome(): string {
  return process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
}

export async function discoverSessions(options: ScanOptions = {}): Promise<Session[]> {
  const tasks: Array<Promise<Session[]>> = [];

  if (!options.provider || options.provider === "claude") {
    const root = path.join(options.claudeHome ?? defaultClaudeHome(), "projects");
    tasks.push(
      findJsonlFiles(root).then(async (files) => {
        const sessions = await mapLimit(files, 12, parseClaudeSession);
        return sessions.filter((session): session is Session => Boolean(session));
      }),
    );
  }

  if (!options.provider || options.provider === "codex") {
    const root = path.join(options.codexHome ?? defaultCodexHome(), "sessions");
    tasks.push(
      findJsonlFiles(root).then(async (files) => {
        const sessions = await mapLimit(files, 12, parseCodexSession);
        return sessions.filter((session): session is Session => Boolean(session));
      }),
    );
  }

  const discovered = (await Promise.all(tasks)).flat();
  const unique = new Map<string, Session>();
  for (const session of discovered) {
    const key = `${session.provider}:${session.id}`;
    const existing = unique.get(key);
    if (!existing || existing.updatedAt < session.updatedAt) unique.set(key, session);
  }

  return [...unique.values()].sort((left, right) => right.updatedAt - left.updatedAt);
}

export function filterSessions(sessions: readonly Session[], query: string): Session[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [...sessions];

  return sessions.filter((session) =>
    [session.provider, session.project, session.title, session.cwd]
      .join("\n")
      .toLocaleLowerCase()
      .includes(needle),
  );
}
