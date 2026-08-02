import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseClaudeSession } from "./claude.js";

test("prefers Claude's generated title over the first prompt", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "switchboard-claude-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "session.jsonl");
  await writeFile(
    file,
    [
      JSON.stringify({
        type: "user",
        sessionId: "abc",
        cwd: "/work/shop",
        timestamp: "2026-08-01T10:00:00Z",
        message: { role: "user", content: "Please fix the checkout" },
      }),
      JSON.stringify({ type: "ai-title", sessionId: "abc", aiTitle: "Fix checkout validation" }),
    ].join("\n"),
  );

  const session = await parseClaudeSession(file);
  assert.equal(session?.title, "Fix checkout validation");
  assert.equal(session?.project, "shop");
  assert.ok((session?.sizeBytes ?? 0) > 0);
});
