import assert from "node:assert/strict";
import test from "node:test";
import { renderTable } from "./table.js";
import { stripAnsi } from "./text.js";
import type { Session } from "./types.js";

const session: Session = {
  provider: "claude",
  id: "abc",
  title: "Fix checkout validation",
  cwd: "/work/vigo",
  project: "vigo",
  updatedAt: Date.parse("2026-08-01T11:58:00Z"),
  sizeBytes: 1_250_000,
  transcriptPath: "/private/transcript.jsonl",
};

test("renders the user-facing columns including transcript size", () => {
  const output = renderTable([session], {
    color: false,
    width: 90,
    selectedIndex: 0,
  });
  assert.match(output, /Provider\s+Updated\s+Size\s+Project\s+Conversation/);
  assert.match(output, /Claude\s+.*1\.3MB\s+vigo\s+Fix checkout validation/);
  assert.doesNotMatch(output, /transcript|\/private/);
});

test("never fills the terminal edge or wraps a long conversation title", () => {
  const width = 90;
  const output = renderTable([{ ...session, title: "A very long conversation title ".repeat(20) }], {
    color: true,
    width,
    selectedIndex: 0,
  });
  const lines = output.split("\n");
  assert.equal(lines.length, 2);
  assert.ok(lines.every((line) => stripAnsi(line).length <= width - 2));
});
