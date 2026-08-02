# How Switchboard works

## Discovery

Switchboard scans the session stores already maintained by the official CLIs:

```text
${CLAUDE_CONFIG_DIR:-~/.claude}/projects
${CODEX_HOME:-~/.codex}/sessions
```

Provider adapters read JSONL incrementally, extract a small normalized record, ignore subagent transcripts, de-duplicate repeated IDs, and combine everything into a recent-first list. No separate cache is required; **Updated** comes from the session metadata and **Size** is the transcript's on-disk size.

Discovery is read-only. Switchboard does not change provider configuration or conversation files.

## Native resume

Opening a conversation in the provider that created it delegates to the provider's own resume command:

```text
Claude → Claude: claude --resume <id>
Codex  → Codex:  codex resume <id>
```

This preserves the provider's native conversation identity and context behavior.

## Cross-provider handoff

Claude and Codex use different private transcript formats and session semantics. Switchboard therefore does not pretend that a cross-provider continuation is a native resume.

When you select the other provider, Switchboard starts a new destination conversation with:

- the source conversation title
- the project directory
- the local read-only transcript path
- instructions to inspect recent relevant work and continue the unfinished request

The destination agent reads the history locally and works in the existing project. The source transcript remains unchanged. Context reuse, billing, and prompt caching are controlled by the destination provider; Switchboard cannot reliably label a cross-provider session as "cached."

### Native import status

Version 0.2.1 uses the read-only handoff above in both directions. Current Codex releases also expose an official Claude Code session importer, so a future Switchboard release can convert a selected Claude conversation into a native Codex session and resume the imported ID. This is not implemented in 0.2.1 yet.

Claude Code currently exposes native resume and fork operations for Claude sessions but no supported external-session importer. The safe Codex → Claude path is therefore a new native Claude session seeded with a provider-neutral handoff, rather than writing private Claude JSONL directly.

## Project directories

Switchboard launches the provider from the saved project directory when it still exists. If the directory has moved or been deleted, it falls back to the directory where `switchboard` was run; native resume behavior then depends on the provider.

## Security model

- No server, account, API key, analytics, or transcript upload
- Argument-array process spawning rather than shell interpolation
- Original transcript files treated as read-only
- Synthetic transcript fixtures in tests

Cross-provider handoff necessarily grants the destination CLI local read access to the source transcript. Only hand off conversations whose contents you are comfortable exposing to that installed provider.

## Current limits

- The interactive picker cannot be mounted inside another full-screen agent TUI.
- Cross-provider handoff starts a new session rather than converting private native history.
- Transcript schemas are owned by their providers and may change; adapters are covered by synthetic regression tests but can require updates.
- Remote or web-only conversations that are absent from the local CLI store are not discoverable.
