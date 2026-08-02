import path from "node:path";

const ANSI_PATTERN = /\u001b\[[0-?]*[ -/]*[@-~]/g;

export function cleanTitle(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const collapsed = value
    .replace(/<environment_context>[\s\S]*?<\/environment_context>/gi, " ")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    !collapsed ||
    collapsed.startsWith("<command-") ||
    collapsed.startsWith("<bash-input>") ||
    collapsed.startsWith("<bash-stdout>") ||
    collapsed.startsWith("<local-command-") ||
    collapsed === "!switchboard"
  ) {
    return undefined;
  }
  return collapsed;
}

export function projectName(cwd: string): string {
  if (!cwd) return "unknown";
  const normalized = path.resolve(cwd);
  return path.basename(normalized) || normalized;
}

export function relativeAge(timestamp: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1_000));
  if (seconds < 60) return seconds < 10 ? "now" : `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1_000) return `${Math.round(bytes)}B`;

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1_000;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1_000; index++) {
    value /= 1_000;
    unit = units[index];
  }
  const digits = value < 10 ? 1 : 0;
  return `${value.toFixed(digits)}${unit}`;
}

export function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, "");
}

export function truncate(value: string, width: number): string {
  if (width <= 0) return "";
  if (value.length <= width) return value;
  if (width === 1) return "…";
  return `${value.slice(0, width - 1)}…`;
}

export function pad(value: string, width: number): string {
  const visible = stripAnsi(value).length;
  return visible >= width ? value : `${value}${" ".repeat(width - visible)}`;
}

export function timestamp(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
