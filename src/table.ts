import { formatBytes, pad, relativeAge, truncate } from "./text.js";
import type { Session, TableOptions } from "./types.js";

const RESET = "\u001b[0m";
const BOLD = "\u001b[1m";
const DIM = "\u001b[2m";
const CLAUDE = "\u001b[38;5;209m";
const CODEX = "\u001b[38;5;42m";
const POINTER = "\u001b[38;5;45m";

function paint(value: string, code: string, enabled: boolean): string {
  return enabled ? `${code}${value}${RESET}` : value;
}

export function providerLabel(session: Session, color: boolean): string {
  const label = session.provider === "claude" ? "Claude" : "Codex";
  return paint(label, session.provider === "claude" ? CLAUDE : CODEX, color);
}

export function renderTable(sessions: readonly Session[], options: TableOptions = {}): string {
  const color = options.color ?? true;
  const width = Math.max(64, options.width ?? process.stdout.columns ?? 100);
  const providerWidth = 8;
  const updatedWidth = 7;
  const sizeWidth = 7;
  const projectWidth = Math.min(22, Math.max(10, Math.floor(width * 0.18)));
  const fixedWidth = 2 + providerWidth + updatedWidth + sizeWidth + projectWidth + 10;
  // Filling the terminal's final cell sets its pending-wrap flag, so reserve two
  // columns to guarantee that every conversation remains on exactly one row.
  const conversationWidth = Math.max(14, width - fixedWidth - 2);

  const header = [
    "  ",
    pad("Provider", providerWidth),
    pad("Updated", updatedWidth),
    pad("Size", sizeWidth),
    pad("Project", projectWidth),
    "Conversation",
  ].join("  ");

  const rows = sessions.map((session, index) => {
    const selected = index === options.selectedIndex;
    const pointer = selected ? paint("›", POINTER, color) : " ";
    const title = truncate(session.title, conversationWidth);
    const row = [
      `${pointer} `,
      pad(providerLabel(session, color), providerWidth),
      pad(paint(relativeAge(session.updatedAt), DIM, color), updatedWidth),
      pad(paint(formatBytes(session.sizeBytes), DIM, color), sizeWidth),
      pad(truncate(session.project, projectWidth), projectWidth),
      selected ? paint(title, BOLD, color) : title,
    ].join("  ");
    return row;
  });

  return [paint(header, BOLD, color), ...rows].join("\n");
}
