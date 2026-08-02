# Usage

## Interactive picker

Run:

```bash
switchboard
```

The newest Claude Code and Codex conversations appear together. Each conversation occupies one row with its provider, last update, transcript size, project, and title.

Controls:

- `↑` / `↓` or `j` / `k`: move the selection
- Type: filter by provider, project, title, or path
- Backspace: edit the filter
- Enter: select a conversation, then select Claude or Codex
- Escape: go back or exit
- Ctrl+C: exit

## Non-interactive listing

Print the same unified index without opening the picker:

```bash
switchboard list
switchboard list --limit 20
switchboard list --provider claude
switchboard list --provider codex
```

For scripts and integrations:

```bash
switchboard list --json
```

JSON contains normalized metadata, including each stable `provider:id` key and the local transcript path. Treat transcript paths as sensitive local information when forwarding command output.

## Open a known conversation

Resume on its original provider:

```bash
switchboard open claude:<session-id>
switchboard open codex:<session-id>
```

Handoff to the other provider:

```bash
switchboard open claude:<session-id> --target codex
switchboard open codex:<session-id> --target claude
```

Inspect the exact provider command without running it:

```bash
switchboard open claude:<session-id> --target codex --dry-run
```

## Use from an active agent

The terminal picker must run outside Claude Code or Codex because the active agent already owns the terminal. The dependable switch flow is:

1. Exit the current agent with `/exit` or Ctrl+C.
2. Run `switchboard`.
3. Choose the conversation and destination provider.

The bundled skill is useful for a quick in-chat list or for producing an exact command, but it does not embed the full-screen picker inside `/resume`.

After installing the optional plugin, invoke `/switchboard:switchboard` in Claude Code or `$switchboard` in Codex. The skill can run non-interactive listings inside the current agent; opening the selected provider still requires leaving the active full-screen session and running the printed command in your shell.
