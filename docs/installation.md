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

Install the CLI first, then install the public GitHub marketplace in either host.

### Claude Code

From your shell:

```bash
claude plugin marketplace add ryanhenricksmith/switchboard
claude plugin install switchboard@switchboard
```

The equivalent commands inside Claude Code are:

```text
/plugin marketplace add ryanhenricksmith/switchboard
/plugin install switchboard@switchboard
/reload-plugins
```

Start a new session, then invoke `/switchboard:switchboard` or ask Claude to use Switchboard.

### Codex

From your shell:

```bash
codex plugin marketplace add ryanhenricksmith/switchboard
codex plugin add switchboard@switchboard
```

Start a new Codex session, then invoke `$switchboard`, ask Codex to use Switchboard, or use `/plugins` to inspect the installation.

### Update or remove

Refresh the Git marketplace before updating an installed plugin:

```bash
claude plugin marketplace update switchboard
claude plugin update switchboard@switchboard

codex plugin marketplace upgrade switchboard
```

Remove the plugin while leaving the standalone CLI installed:

```bash
claude plugin uninstall switchboard@switchboard
codex plugin remove switchboard@switchboard
```

### Local plugin development

From a repository checkout, replace `ryanhenricksmith/switchboard` in the marketplace-add commands with the absolute checkout path.

The plugin cannot take over the terminal occupied by an active agent. To use the interactive picker, exit the agent and run `switchboard` in the shell.
