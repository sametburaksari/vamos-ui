import path from "node:path";
import { bool, parseArgs, str } from "./args";
import { add, list, search, view } from "./commands/browse";
import { brand } from "./commands/brand";
import { create } from "./commands/create";
import { init } from "./commands/init";
import { mcp } from "./commands/mcp";
import { preset } from "./commands/preset";
import { registry } from "./commands/registry";
import { site } from "./commands/site";
import { diff, upgrade } from "./commands/sync";
import { theme } from "./commands/theme";
import { update } from "./commands/update";
import { verify } from "./commands/verify";
import { CliError } from "./core/types";
import { out, p, pc, type Context } from "./ui";

export const VERSION = "0.3.0";

const HELP = `${pc.bold("vamos-ui")} ${pc.dim(VERSION)}  Add Vamos UI components, blocks and themes to your project.

${pc.bold("Usage")}
  npx vamos-ui <command> [options]

${pc.bold("Commands")}
  create <dir>         Start a new app: --template next|vite, --preset <code>, --no-install
  init                 Set up vamos.json, styles and the base library   --preset <code>
  add <items...>       Add components or blocks (dependencies included). An item is a name,
                       a URL to an item JSON, github:owner/repo[/path][#ref]/item, or @ns/item
                       (namespaces are mapped in vamos.json "registries")
  list                 List registry items         --type, --group, --category, --tag
  search <query>       Search by name, title, description and tags
  view <name>          Show usage, props, guidance and files   --files
  site essentials      Website launch basics: robots, sitemap, legal pages for the footer links
                       (legal-01), metadata hints. Runs after \`add site-…\` too (--no-essentials)
  diff [names...]      Compare installed files with the registry   --summary, --check
  upgrade [names...]   Update installed items, keeping your local edits
  theme                Pick the 5 theme axes and print the <html> attributes
                       --dark, --material, --accent, --density, --font, --preset <code>
  preset [code]        Print this project's shareable preset code, or explain a code
  verify [paths...]    Lint for design-rule and accessibility issues   --quiet
  brand <init|import|apply|check>
                       Define the brand (accent, fonts, theme, voice, assets) and apply it
  update [paths...]    Bring code in line with the brand and the rules   --fix, --dry-run
  registry build [dir] Build your own registry from a folder of components   --out, --homepage
  mcp add              Connect an AI client to the MCP server
                       --client claude|cursor|vscode|windsurf|codex|gemini, --print

${pc.bold("Options")}
  -y, --yes            Skip prompts and accept defaults
  -o, --overwrite      Replace files that were edited locally
      --dry-run        Show what would change without writing
      --no-install     Do not install npm packages
      --agent          (init) Write AGENTS.md / CLAUDE.md rules and the agent skill
      --json           Machine-readable output (list, search, view, diff, theme, verify)
  -r, --registry <url|dir>   Registry location (also VAMOS_REGISTRY)
      --cwd <dir>      Run in another directory

${pc.dim("Docs: https://ui.vamos.ist")}`;

const COMMANDS: Record<string, (ctx: Context, args: ReturnType<typeof parseArgs>) => Promise<number>> = {
  init,
  add,
  list,
  ls: list,
  search,
  find: search,
  view,
  show: view,
  diff,
  upgrade,
  update,
  theme,
  preset,
  create,
  mcp,
  registry,
  brand,
  site,
  verify,
  lint: verify,
};

export interface RunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /** Force non-interactive mode (tests, scripts). */
  interactive?: boolean;
}

/** Runs the CLI and returns the exit code. Never calls process.exit. */
export async function run(argv: string[], opts: RunOptions = {}): Promise<number> {
  const args = parseArgs(argv);
  if (bool(args.flags, "version")) {
    out(VERSION);
    return 0;
  }
  const ownHelp = ["brand", "update", "create", "mcp", "registry", "site"].includes(args.command ?? "");
  if (!args.command || (bool(args.flags, "help") && !ownHelp) || args.command === "help") {
    out(HELP);
    return args.command || bool(args.flags, "help") ? 0 : 1;
  }
  const command = COMMANDS[args.command];
  if (!command) {
    out(`${pc.red("Unknown command")} "${args.command}". Run ${pc.cyan("vamos-ui --help")}.`);
    return 1;
  }
  const env = opts.env ?? process.env;
  const yes = bool(args.flags, "yes");
  const json = bool(args.flags, "json");
  const tty = !!process.stdin.isTTY && !!process.stdout.isTTY && !env.CI;
  const ctx: Context = {
    cwd: str(args.flags, "cwd") ? path.resolve(opts.cwd ?? process.cwd(), str(args.flags, "cwd")!) : (opts.cwd ?? process.cwd()),
    interactive: (opts.interactive ?? tty) && !yes && !json,
    yes,
    json,
    registryFlag: str(args.flags, "registry"),
    env,
  };
  try {
    return await command(ctx, args);
  } catch (err) {
    if (err instanceof CliError) {
      if (err.message === "__cancelled__") return 130;
      if (json) process.stdout.write(JSON.stringify({ error: err.message, hint: err.hint ?? null }) + "\n");
      else {
        p.log.error(err.message);
        if (err.hint) p.log.message(pc.dim(err.hint));
      }
      return 1;
    }
    p.log.error(`Unexpected error: ${(err as Error).stack ?? String(err)}`);
    return 1;
  }
}
