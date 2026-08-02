# Contributing

Switchboard is currently maintainer-led and intentionally small. Bug reports, compatibility reports, and focused feature ideas are welcome through [GitHub Issues](https://github.com/ryanhenricksmith/switchboard/issues).

Unsolicited pull requests may not be reviewed or merged. For a substantial change, open an issue first so the direction can be agreed before anyone spends time implementing it.

When reporting a bug, include:

- operating system and terminal
- Node.js version
- Claude Code and/or Codex version
- the command and visible error
- whether the conversation appears in `switchboard list --json`

Remove transcript paths, project names, conversation titles, and conversation content from public reports.

For local development:

```bash
npm install
npm run check
npm test
npm pack --dry-run
```

Tests must use synthetic fixtures and must never depend on a developer's real conversation history.
