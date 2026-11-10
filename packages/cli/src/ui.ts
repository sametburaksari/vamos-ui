import * as p from "@clack/prompts";
import pc from "picocolors";
import { CliError } from "./core/types";

export { p, pc };

export interface Context {
  cwd: string;
  /** Prompts are allowed (TTY, not CI, no --yes). */
  interactive: boolean;
  yes: boolean;
  json: boolean;
  registryFlag?: string;
  env: NodeJS.ProcessEnv;
}

/**
 * Spinner that animates only on a TTY. Piped output (CI, agents) gets plain start/stop lines
 * instead of hundreds of animation frames.
 */
export function spinner(): { start(msg: string): void; stop(msg: string): void; error(msg: string): void } {
  if (process.stdout.isTTY) return p.spinner();
  return {
    start: () => {},
    stop: (msg) => p.log.step(msg),
    error: (msg) => p.log.error(msg),
  };
}

export function out(text = ""): void {
  process.stdout.write(text + "\n");
}

export function printJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

/** Returns the answer or throws a CliError on Ctrl+C. */
export function unwrap<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    throw new CliError("__cancelled__");
  }
  return value as Exclude<T, symbol>;
}

export async function confirm(ctx: Context, message: string, initial = true): Promise<boolean> {
  if (ctx.yes) return true;
  if (!ctx.interactive) return initial;
  return unwrap(await p.confirm({ message, initialValue: initial }));
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function pad(s: string, width: number): string {
  return s.length >= width ? s : s + " ".repeat(width - s.length);
}

export const symbols = {
  create: pc.green("+"),
  update: pc.yellow("~"),
  identical: pc.dim("="),
  conflict: pc.red("!"),
};

/** Colours a unified diff. */
export function colorDiff(patch: string): string {
  return patch
    .split("\n")
    .map((l) => {
      if (l.startsWith("+++") || l.startsWith("---")) return pc.bold(l);
      if (l.startsWith("+")) return pc.green(l);
      if (l.startsWith("-")) return pc.red(l);
      if (l.startsWith("@@")) return pc.cyan(l);
      return pc.dim(l);
    })
    .join("\n");
}
