export type Provider = "claude" | "codex";

export interface Session {
  provider: Provider;
  id: string;
  title: string;
  cwd: string;
  project: string;
  updatedAt: number;
  sizeBytes: number;
  transcriptPath: string;
}

export interface ScanOptions {
  claudeHome?: string;
  codexHome?: string;
  provider?: Provider;
}

export interface TableOptions {
  color?: boolean;
  width?: number;
  selectedIndex?: number;
}
