import readline from "node:readline";
import { filterSessions } from "./discover.js";
import { renderTable } from "./table.js";
import type { Terminal } from "./terminal.js";
import { truncate } from "./text.js";
import type { Provider, Session } from "./types.js";

const CLEAR = "\u001b[2J\u001b[H";
const HIDE_CURSOR = "\u001b[?25l";
const SHOW_CURSOR = "\u001b[?25h";
const DIM = "\u001b[2m";
const RESET = "\u001b[0m";
const BOLD = "\u001b[1m";
const CLAUDE = "\u001b[38;5;209m";
const CODEX = "\u001b[38;5;42m";
const POINTER = "\u001b[38;5;45m";

export async function pickSession(sessions: readonly Session[], terminal: Terminal): Promise<Session | undefined> {
  const { input, output } = terminal;

  readline.emitKeypressEvents(input);
  input.setRawMode(true);
  input.resume();

  let query = "";
  let selected = 0;
  let scroll = 0;

  const render = (): Session[] => {
    const matches = filterSessions(sessions, query);
    selected = Math.max(0, Math.min(selected, Math.max(0, matches.length - 1)));
    const pageSize = Math.max(3, (output.rows ?? 24) - 6);
    if (selected < scroll) scroll = selected;
    if (selected >= scroll + pageSize) scroll = selected - pageSize + 1;
    const page = matches.slice(scroll, scroll + pageSize);
    const localSelected = matches.length ? selected - scroll : undefined;

    const title = `Switchboard  ${DIM}${matches.length} conversation${matches.length === 1 ? "" : "s"}${RESET}`;
    const filter = query ? `Filter: ${query}` : `${DIM}Type to filter · ↑/↓ or j/k to move · Enter to open · Esc to quit${RESET}`;
    const body = matches.length
      ? renderTable(page, {
          color: true,
          width: output.columns,
          ...(localSelected === undefined ? {} : { selectedIndex: localSelected }),
        })
      : `${DIM}No conversations match “${query}”.${RESET}`;
    output.write(`${CLEAR}${HIDE_CURSOR}${title}\n\n${body}\n\n${filter}`);
    return matches;
  };

  return new Promise((resolve) => {
    const cleanup = (): void => {
      input.off("keypress", onKeypress);
      output.off("resize", render);
      input.setRawMode(false);
      input.pause();
      output.write(`${SHOW_CURSOR}\n`);
    };

    const finish = (session?: Session): void => {
      cleanup();
      resolve(session);
    };

    const onKeypress = (value: string, key: readline.Key): void => {
      const matches = filterSessions(sessions, query);
      if (key.ctrl && key.name === "c") return finish();
      if (key.name === "escape") return finish();
      if (key.name === "return") return finish(matches[selected]);
      if (key.name === "up" || (key.name === "k" && !query)) selected--;
      else if (key.name === "down" || (key.name === "j" && !query)) selected++;
      else if (key.name === "backspace") query = query.slice(0, -1);
      else if (!key.ctrl && !key.meta && value && value >= " ") query += value;
      render();
    };

    input.on("keypress", onKeypress);
    output.on("resize", render);
    render();
  });
}

export async function pickTargetProvider(session: Session, terminal: Terminal): Promise<Provider | undefined> {
  const { input, output } = terminal;

  const providers: Provider[] = ["claude", "codex"];
  let selected = providers.indexOf(session.provider);
  readline.emitKeypressEvents(input);
  input.setRawMode(true);
  input.resume();

  const render = (): void => {
    const rows = providers.map((provider, index) => {
      const active = index === selected;
      const pointer = active ? `${POINTER}›${RESET}` : " ";
      const name = provider === "claude" ? "Claude" : "Codex";
      const color = provider === "claude" ? CLAUDE : CODEX;
      const sourceName = session.provider === "claude" ? "Claude" : "Codex";
      const mode = provider === session.provider ? "native resume" : `new handoff from ${sourceName}`;
      return `${pointer}  ${color}${name.padEnd(8)}${RESET}  ${active ? BOLD : DIM}${mode}${RESET}`;
    });
    output.write(
      `${CLEAR}${HIDE_CURSOR}Open “${truncate(session.title, Math.max(20, (output.columns ?? 80) - 10))}” in:\n\n${rows.join("\n")}\n\n${DIM}↑/↓ or j/k to move · Enter to open · Esc to go back${RESET}`,
    );
  };

  return new Promise((resolve) => {
    const cleanup = (): void => {
      input.off("keypress", onKeypress);
      output.off("resize", render);
      input.setRawMode(false);
      input.pause();
      output.write(`${SHOW_CURSOR}\n`);
    };
    const finish = (provider?: Provider): void => {
      cleanup();
      resolve(provider);
    };
    const onKeypress = (_value: string, key: readline.Key): void => {
      if (key.ctrl && key.name === "c") return finish();
      if (key.name === "escape") return finish();
      if (key.name === "return") return finish(providers[selected]);
      if (key.name === "up" || key.name === "k") selected = (selected + providers.length - 1) % providers.length;
      else if (key.name === "down" || key.name === "j") selected = (selected + 1) % providers.length;
      render();
    };

    input.on("keypress", onKeypress);
    output.on("resize", render);
    render();
  });
}
