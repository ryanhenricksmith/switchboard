# Troubleshooting

## `switchboard: command not found`

Confirm Node.js and npm are available, then reinstall:

```bash
node --version
npm --version
npm install --global switchboard-plugin
```

If npm's global binary directory is not on `PATH`, inspect it with:

```bash
npm prefix --global
```

## No conversations were found

Confirm that at least one official CLI has created local history:

```bash
switchboard list --provider claude
switchboard list --provider codex
```

If you use custom storage locations, export the same variables used by the provider:

```bash
export CLAUDE_CONFIG_DIR=/path/to/claude-config
export CODEX_HOME=/path/to/codex-home
switchboard
```

## A provider cannot be opened

The destination CLI must be installed and on `PATH`:

```bash
claude --version
codex --version
```

Use `--dry-run` to see the exact command Switchboard is trying to launch:

```bash
switchboard open <provider:id> --target <claude-or-codex> --dry-run
```

## The project directory moved

Switchboard uses the directory saved in the transcript. If it no longer exists, Switchboard launches from your current directory. Run `switchboard` from the relocated project before opening the session so the fallback directory is correct.

## The picker prints a table and exits

The interactive picker needs a TTY. When output is redirected, piped, or launched in an environment without direct terminal access, Switchboard intentionally falls back to a plain table. Run it directly in a local terminal.

## A cross-provider handoff lacks context

A handoff is a new destination conversation, not a converted native session. The destination model decides how much of the source transcript to read. Point it to a specific decision or unfinished request, or resume natively on the original provider when exact context continuity matters.

## Reporting a problem

Please open a [GitHub issue](https://github.com/ryanhenricksmith/switchboard/issues) with your OS, Node.js version, provider CLI version, and the Switchboard command you ran. Remove transcript paths, titles, project names, and conversation content before posting logs.
