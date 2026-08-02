import assert from "node:assert/strict";
import { mkdtemp, mkdir, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { discoverSessions, filterSessions } from "./discover.js";

test("discovers and sorts synthetic Claude and Codex sessions", async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "switchboard-test-"));
  context.after(async () => {
    const { rm } = await import("node:fs/promises");
    await rm(root, { recursive: true, force: true });
  });

  const claudeHome = path.join(root, "claude");
  const codexHome = path.join(root, "codex");
  const claudeProject = path.join(claudeHome, "projects", "-tmp-vigo");
  const codexDay = path.join(codexHome, "sessions", "2026", "08", "01");
  await mkdir(claudeProject, { recursive: true });
  await mkdir(codexDay, { recursive: true });

  const claudeFile = path.join(claudeProject, "claude-id.jsonl");
  const codexFile = path.join(codexDay, "rollout-codex-id.jsonl");

  await writeFile(
    claudeFile,
    [
      JSON.stringify({
        type: "user",
        sessionId: "claude-id",
        timestamp: "2026-08-01T10:00:00Z",
        cwd: "/tmp/vigo",
        message: { role: "user", content: "Fix checkout validation" },
      }),
      JSON.stringify({ type: "ai-title", sessionId: "claude-id", aiTitle: "Checkout validation" }),
    ].join("\n"),
  );

  await writeFile(
    codexFile,
    [
      JSON.stringify({
        timestamp: "2026-08-01T11:00:00Z",
        type: "session_meta",
        payload: { session_id: "codex-id", cwd: "/tmp/api" },
      }),
      JSON.stringify({
        timestamp: "2026-08-01T11:01:00Z",
        type: "event_msg",
        payload: { type: "user_message", message: "Investigate auth race" },
      }),
    ].join("\n"),
  );
  await utimes(claudeFile, new Date("2026-08-01T10:00:00Z"), new Date("2026-08-01T10:00:00Z"));
  await utimes(codexFile, new Date("2026-08-01T11:01:00Z"), new Date("2026-08-01T11:01:00Z"));

  const sessions = await discoverSessions({ claudeHome, codexHome });
  assert.deepEqual(
    sessions.map(({ provider, id, project, title }) => ({ provider, id, project, title })),
    [
      { provider: "codex", id: "codex-id", project: "api", title: "Investigate auth race" },
      { provider: "claude", id: "claude-id", project: "vigo", title: "Checkout validation" },
    ],
  );
  assert.equal(filterSessions(sessions, "checkout")[0]?.provider, "claude");
  assert.equal(filterSessions(sessions, "api")[0]?.provider, "codex");
});
