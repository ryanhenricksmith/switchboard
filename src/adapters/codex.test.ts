import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseCodexSession } from "./codex.js";

test("ignores Codex environment context in favor of the user event", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "switchboard-codex-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "rollout-session.jsonl");
  await writeFile(
    file,
    [
      JSON.stringify({
        timestamp: "2026-08-01T10:00:00Z",
        type: "session_meta",
        payload: { session_id: "xyz", cwd: "/work/api" },
      }),
      JSON.stringify({
        timestamp: "2026-08-01T10:00:01Z",
        type: "response_item",
        payload: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "<environment_context>private</environment_context>" }],
        },
      }),
      JSON.stringify({
        timestamp: "2026-08-01T10:00:02Z",
        type: "event_msg",
        payload: { type: "user_message", message: "Investigate auth race" },
      }),
    ].join("\n"),
  );

  const session = await parseCodexSession(file);
  assert.equal(session?.title, "Investigate auth race");
  assert.equal(session?.project, "api");
  assert.ok((session?.sizeBytes ?? 0) > 0);
});
