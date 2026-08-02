import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import type { Provider, Session } from "./types.js";

export interface Invocation {
  command: string;
  args: string[];
}

function providerName(provider: Provider): string {
  return provider === "claude" ? "Claude Code" : "Codex";
}

function handoffName(session: Session): string {
  const prefix = `From Codex: ${session.title}`;
  return prefix.length <= 80 ? prefix : `${prefix.slice(0, 79)}…`;
}

export function handoffPrompt(session: Session, target: Provider): string {
  return [
    `Take over the unfinished work from a ${providerName(session.provider)} conversation titled “${session.title}”.`,
    `Its local, read-only JSONL transcript is at: ${session.transcriptPath}`,
    `The project directory is: ${session.cwd}`,
    "Read the relevant recent transcript entries, inspect the current working tree, briefly state what you are continuing, and then continue from the latest unfinished user request.",
    `This is a cross-provider handoff into ${providerName(target)}, not a native resume. Do not modify the source transcript.`,
  ].join("\n");
}

export function openCommand(session: Session, target: Provider = session.provider): Invocation {
  if (target === session.provider) {
    return session.provider === "claude"
      ? { command: "claude", args: ["--resume", session.id] }
      : { command: "codex", args: ["resume", session.id] };
  }

  const prompt = handoffPrompt(session, target);
  return target === "claude"
    ? {
        command: "claude",
        args: ["--add-dir", path.dirname(session.transcriptPath), "--name", handoffName(session), prompt],
      }
    : { command: "codex", args: [prompt] };
}

export function resumeCommand(session: Session): Invocation {
  return openCommand(session, session.provider);
}

export function printableCommand(session: Session, target: Provider = session.provider): string {
  const { command, args } = openCommand(session, target);
  const quote = (value: string): string => `'${value.replaceAll("'", `'\\''`)}'`;
  return [command, ...args.map(quote)].join(" ");
}

export async function launchSession(session: Session, target: Provider = session.provider): Promise<number> {
  const invocation = openCommand(session, target);
  let cwd = process.cwd();
  try {
    await access(session.cwd);
    cwd = session.cwd;
  } catch {
    // Resume from the caller's directory when the saved project moved.
  }

  return new Promise((resolve, reject) => {
    const child = spawn(invocation.command, invocation.args, { cwd, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}
