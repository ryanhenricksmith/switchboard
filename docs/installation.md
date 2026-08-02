# Installation

Switchboard supports Linux, macOS, and Windows environments where Claude Code or Codex stores local session history. It requires Node.js 22 or newer.

## Install from npm

```bash
npm install --global switchboard-plugin
```

The npm package is named `switchboard-plugin` because the unrelated package names `switchboard` and `switchboard-cli` are already owned. It exposes the short `switchboard` command globally. Confirm it is available:

```bash
switchboard --help
```

Run the same install command again to update to the latest release.

To uninstall:

```bash
npm uninstall --global switchboard-plugin
```

## Install from a checkout

```bash
git clone https://github.com/ryanhenricksmith/switchboard.git
cd switchboard
npm install
npm run build
npm link
```

`npm link` connects the global `switchboard` command to the checkout, so later local builds are immediately available.

## Install the current GitHub version

To install the current `main` branch instead of the latest npm release:

```bash
npm install --global github:ryanhenricksmith/switchboard
```

## Provider requirements

Switchboard can list a provider's conversations without that provider CLI being on `PATH`, but opening one requires the destination command:

```bash
claude --version
codex --version
```

You only need the provider you intend to open.

## Optional agent plugin

The standalone CLI is the full Switchboard experience. The bundled plugin adds an in-agent skill for listing conversations and producing exact resume or handoff commands.

Install the CLI first, then add this repository as a local marketplace while developing from a checkout.

In Claude Code:

```text
/plugin marketplace add /absolute/path/to/switchboard
/plugin install switchboard@switchboard
```

In Codex, add the checkout as a personal plugin marketplace and install **Switchboard** from the plugin browser.

The plugin cannot take over the terminal occupied by an active agent. To use the interactive picker, exit the agent and run `switchboard` in the shell.
