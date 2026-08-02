import assert from "node:assert/strict";
import test from "node:test";
import { openCommand, printableCommand, resumeCommand } from "./launch.js";
import type { Session } from "./types.js";

const base = {
  title: "Conversation",
  cwd: "/work/project",
  project: "project",
  updatedAt: 0,
  sizeBytes: 1_250,
  transcriptPath: "/tmp/session.jsonl",
};

test("builds native Claude and Codex resume commands without a shell", () => {
  const claude: Session = { ...base, provider: "claude", id: "claude-id" };
  const codex: Session = { ...base, provider: "codex", id: "codex-id" };
  assert.deepEqual(resumeCommand(claude), { command: "claude", args: ["--resume", "claude-id"] });
  assert.deepEqual(resumeCommand(codex), { command: "codex", args: ["resume", "codex-id"] });
  assert.equal(printableCommand(codex), "codex 'resume' 'codex-id'");
});

test("builds explicit cross-provider handoff commands", () => {
  const claude: Session = { ...base, provider: "claude", id: "claude-id" };
  const codex: Session = { ...base, provider: "codex", id: "codex-id" };

  const toCodex = openCommand(claude, "codex");
  assert.equal(toCodex.command, "codex");
  assert.match(toCodex.args.at(-1) ?? "", /cross-provider handoff into Codex/);
  assert.match(toCodex.args.at(-1) ?? "", /\/tmp\/session\.jsonl/);

  const toClaude = openCommand(codex, "claude");
  assert.equal(toClaude.command, "claude");
  assert.deepEqual(toClaude.args.slice(0, 2), ["--add-dir", "/tmp"]);
  assert.match(toClaude.args.at(-1) ?? "", /cross-provider handoff into Claude Code/);
});
