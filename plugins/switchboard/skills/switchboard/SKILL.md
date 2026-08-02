---
name: switchboard
description: Explain or script local Claude Code and Codex conversation switching through the Switchboard CLI. Use when the user wants to find an earlier coding-agent chat, compare sessions, or obtain an exact native-resume or cross-provider-handoff command. The full interactive picker must run outside the current agent TUI.
---

# Switchboard

Use the deterministic `switchboard` executable. Do not parse or modify provider transcript files yourself.

## Interactive picker

Skills cannot replace the running Claude Code or Codex terminal UI. When the user asks to open Switchboard itself, do not dump a JSON listing and do not start another interactive agent inside this session. Tell them concisely:

1. Exit the current agent with `/exit` or Ctrl+C.
2. Run `switchboard` in the terminal.
3. Select a conversation, then choose **Open in Claude** or **Open in Codex**.

## In-chat lookup

1. Check whether `switchboard` is available on `PATH`.
2. For an in-chat listing, run `switchboard list --json --limit 40`.
3. Present only Provider, Updated, Size, Project, and Conversation. Do not expose transcript paths unless the user explicitly asks.
4. Ask which row to resume when the user has not already identified one.

## Resume a conversation

Use the stable key from the JSON listing:

```bash
switchboard open <provider>:<session-id> --dry-run
```

For a cross-provider handoff, add an explicit target:

```bash
switchboard open <provider>:<session-id> --target claude --dry-run
switchboard open <provider>:<session-id> --target codex --dry-run
```

Return the printed command to the user. Opening changes the active terminal process, so let the user run it after leaving the current conversation.

## Safety

- Treat discovery as read-only.
- Never upload transcript contents.
- Never overwrite, delete, or synthesize a native session without explicit user approval.
- Prefer `--dry-run` when the user only asks what command would run.
