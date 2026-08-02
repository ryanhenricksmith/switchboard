import assert from "node:assert/strict";
import test from "node:test";
import { cleanTitle, formatBytes, relativeAge, truncate } from "./text.js";

test("cleanTitle collapses whitespace and removes environment context", () => {
  assert.equal(cleanTitle("<environment_context>secret</environment_context>  Fix   checkout\nnow"), "Fix checkout now");
  assert.equal(cleanTitle("<bash-input>switchboard</bash-input>"), undefined);
  assert.equal(cleanTitle("<local-command-stdout>done</local-command-stdout>"), undefined);
});

test("relativeAge uses compact units", () => {
  const now = Date.parse("2026-08-01T12:00:00Z");
  assert.equal(relativeAge(now - 2 * 60_000, now), "2m");
  assert.equal(relativeAge(now - 3 * 60 * 60_000, now), "3h");
  assert.equal(relativeAge(now - 4 * 24 * 60 * 60_000, now), "4d");
});

test("formatBytes stays compact", () => {
  assert.equal(formatBytes(999), "999B");
  assert.equal(formatBytes(1_250), "1.3KB");
  assert.equal(formatBytes(12_500_000), "13MB");
});

test("truncate keeps the requested width", () => {
  assert.equal(truncate("Redesign the menu", 10), "Redesign …");
});
