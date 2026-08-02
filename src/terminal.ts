import tty from "node:tty";

export interface Terminal {
  input: tty.ReadStream;
  output: tty.WriteStream;
  close(): void;
}

export function openTerminal(): Terminal | undefined {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return undefined;
  return {
    input: process.stdin,
    output: process.stdout,
    close() {},
  };
}
