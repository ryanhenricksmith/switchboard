# Switchboard

One local conversation picker for Claude Code and Codex.

[![CI](https://github.com/ryanhenricksmith/switchboard/actions/workflows/ci.yml/badge.svg)](https://github.com/ryanhenricksmith/switchboard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js 22+](https://img.shields.io/badge/node-%3E%3D22-339933.svg)](https://nodejs.org/)

```text
  Provider  Updated  Size     Project       Conversation
› Claude    2m       1.3MB    vigo          Fix checkout validation
  Codex     18m      840KB    vigo          Redesign menu cards
  Claude    1h       92KB     api           Investigate auth race
  Codex     3h       410KB    api           Add refresh-token tests
```

Switchboard finds conversations already stored by the official CLIs, puts them in one searchable list, and lets you choose where to continue. It stays local, needs no API keys, and never edits the original transcripts.

## Install

Requires [Node.js 22 or newer](https://nodejs.org/).

```bash
npm install --global switchboard-plugin
```

Then run:

```bash
switchboard
```

The npm package is named `switchboard-plugin` because the unrelated package names `switchboard` and `switchboard-cli` are already owned. The installed command is still simply `switchboard`.

Use the arrow keys or `j`/`k`, type to filter, and press Enter. You will then choose **Open in Claude** or **Open in Codex**.

## What happens when you open a conversation?

| From | Open in | Behavior |
| --- | --- | --- |
| Claude | Claude | Native `claude --resume` |
| Codex | Codex | Native `codex resume` |
| Claude | Codex | New Codex chat with a read-only handoff to the Claude transcript |
| Codex | Claude | New Claude chat with a read-only handoff to the Codex transcript |

Same-provider opens are true native resumes. Cross-provider opens are handoffs, not converted native sessions: the destination agent receives the source transcript path and project directory, then continues in a new conversation. The original session remains untouched.

## Why Switchboard?

- One recent-first list across Claude Code and Codex
- Provider, age, transcript size, project, and title at a glance
- Fast keyboard filtering across every visible field
- Native resumes and explicit cross-provider handoffs
- Read-only discovery with no account, server, or telemetry
- CLI and JSON output for scripts and integrations

## Command line

```text
switchboard                              Open the interactive picker
switchboard list                         Print the unified conversation table
switchboard list --json                  Return normalized session metadata
switchboard --provider claude            Show only Claude Code conversations
switchboard --provider codex             Show only Codex conversations
switchboard open claude:<id>             Resume a known Claude conversation
switchboard open codex:<id>              Resume a known Codex conversation
switchboard open claude:<id> --target codex
switchboard open codex:<id> --target claude
switchboard open <provider:id> --dry-run  Print the exact launch command
```

Switchboard is designed to run in your terminal, one level above either agent. An in-agent skill can list sessions and produce commands, but a skill cannot replace the terminal UI of a running Claude Code or Codex process. Exit the current agent, run `switchboard`, and choose where to continue.

## Documentation

- [Installation and updates](docs/installation.md)
- [Using the picker and CLI](docs/usage.md)
- [How discovery, resume, and handoff work](docs/how-it-works.md)
- [Troubleshooting](docs/troubleshooting.md)

## Plugins

This repository also contains a shared Agent Skill and plugin manifests for Claude Code and Codex. They provide lightweight in-agent lookup and exact resume commands; the full interactive experience is still the standalone `switchboard` command.

See [Plugin setup](docs/installation.md#optional-agent-plugin) for local installation.

## Privacy

Switchboard reads local session metadata from:

```text
${CLAUDE_CONFIG_DIR:-~/.claude}/projects
${CODEX_HOME:-~/.codex}/sessions
```

Transcript files are never modified or uploaded. Native commands are launched without shell interpolation. Cross-provider transcript access happens locally through the destination CLI.

## Status

Switchboard is early open-source software. The current focus is a small, reliable local picker. Planned work includes a portable handoff snapshot, a diagnostics command, and optional webhook notifications. Cloud sync or team sharing, if added later, will be opt-in and separate from the local-first core.

Issues and ideas are welcome. See [Contributing](CONTRIBUTING.md) and [Security](SECURITY.md).

## Development

```bash
npm install
npm test
npm run check
```

Tests use temporary synthetic transcripts; they do not read developer session history.

## License

[MIT](LICENSE)
