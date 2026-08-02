import type { Provider } from "./types.js";

export interface CliOptions {
  command: "pick" | "list" | "open";
  json: boolean;
  color: boolean;
  dryRun: boolean;
  limit?: number;
  provider?: Provider;
  target?: Provider;
  sessionKey?: string;
  help: boolean;
}

export function parseArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = {
    command: "pick",
    json: false,
    color: true,
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index++) {
    const value = argv[index];
    if (value === "list") options.command = "list";
    else if (value === "open") {
      options.command = "open";
      const sessionKey = argv[++index];
      if (!sessionKey) throw new Error("open requires <provider:id>");
      options.sessionKey = sessionKey;
    } else if (value === "--json") options.json = true;
    else if (value === "--no-color") options.color = false;
    else if (value === "--dry-run") options.dryRun = true;
    else if (value === "--help" || value === "-h") options.help = true;
    else if (value === "--limit") {
      const limit = Number.parseInt(argv[++index] ?? "", 10);
      if (!Number.isFinite(limit) || limit < 1) throw new Error("--limit must be a positive integer");
      options.limit = limit;
    } else if (value === "--provider") {
      const provider = argv[++index];
      if (provider !== "claude" && provider !== "codex") {
        throw new Error("--provider must be claude or codex");
      }
      options.provider = provider;
    } else if (value === "--target") {
      const target = argv[++index];
      if (target !== "claude" && target !== "codex") {
        throw new Error("--target must be claude or codex");
      }
      options.target = target;
    } else if (value?.startsWith("-")) {
      throw new Error(`Unknown option: ${value}`);
    } else {
      throw new Error(`Unexpected argument: ${value}`);
    }
  }

  return options;
}
