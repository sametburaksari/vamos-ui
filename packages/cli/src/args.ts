export interface ParsedArgs {
  command: string | null;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

/** Flags that take a value (`--type block` or `--type=block`). */
const VALUE_FLAGS = new Set([
  "registry", "cwd", "type", "group", "category", "tag",
  "theme", "material", "accent", "density", "font",
  "ui-dir", "blocks-dir", "css", "alias",
  "name", "accent-dark", "display", "body", "mono", "radius", "tone",
  "preset", "template", "client", "out", "homepage", "starter",
]);

const SHORT: Record<string, string> = { y: "yes", h: "help", v: "version", o: "overwrite", r: "registry" };

export function parseArgs(argv: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--") {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const key = a.slice(2, eq === -1 ? undefined : eq);
      if (eq !== -1) flags[key] = a.slice(eq + 1);
      else if (key.startsWith("no-") && !VALUE_FLAGS.has(key)) flags[key.slice(3)] = false;
      else if (VALUE_FLAGS.has(key) && argv[i + 1] !== undefined && !argv[i + 1]!.startsWith("-")) flags[key] = argv[++i]!;
      else flags[key] = true;
      continue;
    }
    if (a.startsWith("-") && a.length > 1) {
      for (const ch of a.slice(1)) {
        const key = SHORT[ch] ?? ch;
        if (VALUE_FLAGS.has(key) && argv[i + 1] !== undefined && !argv[i + 1]!.startsWith("-")) flags[key] = argv[++i]!;
        else flags[key] = true;
      }
      continue;
    }
    positionals.push(a);
  }
  const command = positionals.shift() ?? null;
  return { command, positionals, flags };
}

export function str(flags: ParsedArgs["flags"], key: string): string | undefined {
  const v = flags[key];
  return typeof v === "string" ? v : undefined;
}

export function bool(flags: ParsedArgs["flags"], key: string, fallback = false): boolean {
  const v = flags[key];
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v !== "false" && v !== "0";
  return fallback;
}
