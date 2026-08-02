#!/usr/bin/env node
import { parseArgs } from "./args.js";
import { discoverSessions } from "./discover.js";
import { launchSession, printableCommand } from "./launch.js";
import { pickSession, pickTargetProvider } from "./picker.js";
import { renderTable } from "./table.js";
import { openTerminal } from "./terminal.js";

const HELP = `Switchboard — one picker for Claude Code and Codex conversations

Usage:
  switchboard                         Open the interactive picker
  switchboard list [--json]           List conversations without opening one
  switchboard open <provider:id>      Open a specific conversation

Options:
  --provider claude|codex              Show one provider
  --target claude|codex                Open in this provider (for scripted use)
  --limit <number>                     Limit the number of results
  --dry-run                            Print the launch command instead of running it
  --no-color                           Disable ANSI colors
  --help                               Show this help
`;

async function main(): Promise<number> {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(HELP);
    return 0;
  }

  let sessions = await discoverSessions(options.provider ? { provider: options.provider } : {});
  if (options.limit) sessions = sessions.slice(0, options.limit);

  if (options.command === "list") {
    if (options.json) process.stdout.write(`${JSON.stringify(sessions, null, 2)}\n`);
    else if (sessions.length) {
      process.stdout.write(
        `${renderTable(sessions, { color: options.color && process.stdout.isTTY, width: process.stdout.columns })}\n`,
      );
    }
    return 0;
  }

  let selected;
  let target = options.target;
  if (options.command === "open") {
    const key = options.sessionKey;
    if (!key) throw new Error("open requires <provider:id>");
    selected = sessions.find((session) => `${session.provider}:${session.id}` === key || session.id === key);
    if (!selected) throw new Error(`Conversation not found: ${key}`);
  } else {
    if (!sessions.length) {
      process.stderr.write("No Claude Code or Codex conversations were found.\n");
      return 1;
    }
    const terminal = openTerminal();
    if (!terminal) {
      process.stdout.write(`${renderTable(sessions, { color: false })}\n`);
      return 0;
    }
    try {
      while (!selected) {
        selected = await pickSession(sessions, terminal);
        if (!selected) return 0;
        target = await pickTargetProvider(selected, terminal);
        if (!target) selected = undefined;
      }
    } finally {
      terminal.close();
    }
  }

  target ??= selected.provider;

  if (options.dryRun) {
    process.stdout.write(`${printableCommand(selected, target)}\n`);
    return 0;
  }

  const sourceName = selected.provider === "claude" ? "Claude" : "Codex";
  const action = target === selected.provider ? "Resuming" : `Handing off from ${sourceName} to`;
  process.stdout.write(`${action} ${target === "claude" ? "Claude" : "Codex"}: ${selected.title}\n`);
  return launchSession(selected, target);
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`switchboard: ${message}\n`);
    process.exitCode = 1;
  });
