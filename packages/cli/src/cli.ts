import path from "node:path";
import { bool, parseArgs, str } from "./args";
import { audit } from "./commands/audit";
import { add, list, search, view } from "./commands/browse";
import { brand } from "./commands/brand";
import { create } from "./commands/create";
import { init } from "./commands/init";
import { mcp } from "./commands/mcp";
import { newProject } from "./commands/new";
import { preset } from "./commands/preset";
import { registry } from "./commands/registry";
import { site } from "./commands/site";
import { agents, task } from "./commands/task";
import { diff, upgrade } from "./commands/sync";
import { theme } from "./commands/theme";
import { update } from "./commands/update";
import { verify } from "./commands/verify";
import { isOffline } from "./core/registry";
import { CliError } from "./core/types";
import { out, p, pc, type Context } from "./ui";

export const VERSION = "0.10.0";

const HELP = `${pc.bold("vamos-ui")} ${pc.dim(VERSION)}  Add Vamos UI components, blocks and themes to your project.

${pc.bold("Usage")}
  npx vamos-ui <command> [options]

${pc.bold("Commands")}
  new                  Plan a website by answering a few questions (domain, hosting, current
                       site, pages, store/booking, forms, measurement, legal): writes
                       vamos.project.json and vamos.site.json   --lang, --answers <file>
  task [next|brief|done|block|reset] [id]
                       Walk the plan's tasks in order: what can start, the brief for its
                       specialist, mark done / blocked   --note, --brief, --json
  agents               Write the website orchestrator skill and its nine specialist subagents
                       (.claude/skills/vamos-site, .claude/agents/vamos-*)   --dry-run, --force
  create <dir>         Start a new app: --template next|vite, --preset <code>, --no-install
  init                 Set up vamos.json, styles and the base library   --preset <code>
  add <items...>       Add components or blocks (dependencies included). An item is a name,
                       a URL to an item JSON, github:owner/repo[/path][#ref]/item, or @ns/item
                       (namespaces are mapped in vamos.json "registries")
  list                 List registry items         --type, --group, --category, --tag
  search <query>       Search by name, title, description and tags
  view <name>          Show usage, props, guidance and files   --files
  site init            Write an empty vamos.site.json (business details, legal ids, analytics ids,
                       AI settings) for the website files to read   --name, --url, --locale
  site import <url>    Read a current website: business details, navigation, texts, images
                       (--write fills the empty fields of vamos.site.json)
  site essentials      Website launch basics from vamos.site.json: robots, sitemap, llms.txt,
                       JSON-LD, legal pages for the footer links (legal-01), metadata hints.
                       Runs after \`add site-…\` too (--no-essentials)
  site form            Contact-form sender: contact.php, edge function, Resend or SMTP   --kind, --to, --dry-run
  site store           Store checkout: catalog, iyzico payment, order emails             --runtime, --host, --dry-run
  site deploy          Host config (redirects, security headers, cache) and publishing steps
                       --host vercel|netlify|cloudflare|spacefast|cpanel|vps, --domain, --www, --dry-run,
                       --publish (runs the host CLI after a confirmation), --project, --space
  site check [url]     After publishing: audit the live URL + deploy checks (http → https 301,
                       one host name, security headers, 404, robots/sitemap); exit 1 below
                       --min-score (default 90) or on errors   --ci (GitHub Actions), --json
  diff [names...]      Compare installed files with the registry   --summary, --check
  upgrade [names...]   Update installed items, keeping your local edits
  theme                Pick the 7 theme axes and print the <html> attributes
                       --dark, --material, --accent, --density, --font, --radius, --scene,
                       --preset <code>, --family <name> (a named style family: newsroom,
                       tabloid, luxury, arabic …; --families lists the 13 with their codes)
                       --radius none|sharp|round|pill sets data-radius (pill: pill controls,
                       default cards); --scene paper|warm|ink retints the backdrop
  preset [code]        Print this project's shareable preset code, or explain a code
  verify [paths...]    Lint for design-rule and accessibility issues   --quiet
  audit <url>          Check a live website: SEO and launch basics, broken links, heavy images
                       --max-pages, --external, --strict, --json
  brand <init|import|apply|check>
                       Define the brand (accent, fonts, theme, voice, assets) and apply it
  update [paths...]    Bring code in line with the brand and the rules   --fix, --dry-run
  registry build [dir] Build your own registry from a folder of components   --out, --homepage
  registry export <dir>
                       Write the Vamos UI registry bundled with the CLI to a folder, to host or
                       vendor it (registry info: its version and date)
  mcp add              Connect an AI client to the MCP server
                       --client claude|cursor|vscode|windsurf|codex|gemini, --print

${pc.bold("Options")}
  -y, --yes            Skip prompts and accept defaults
  -o, --overwrite      Replace files that were edited locally
      --dry-run        Show what would change without writing
      --no-install     Do not install npm packages
      --no-agent       (init) Skip the AI rules (AGENTS.md, CLAUDE.md, Copilot, Cursor, agent skill)
      --json           Machine-readable output (list, search, view, diff, theme, verify, audit)
  -r, --registry <url|dir>   Registry location (also VAMOS_REGISTRY)
      --offline        Never use the network for the registry: read the copy bundled with the
                       CLI (also VAMOS_OFFLINE=1). Without it, the bundled copy is used when
                       ui.vamos.ist cannot be reached (timeout VAMOS_REGISTRY_TIMEOUT, ms)
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
  new: newProject,
  task,
  tasks: task,
  agents,
  mcp,
  registry,
  brand,
  site,
  verify,
  lint: verify,
  audit,
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
  const ownHelp = ["brand", "update", "create", "mcp", "registry", "site", "audit", "new", "task", "tasks", "agents"].includes(args.command ?? "");
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
    offline: isOffline(args.flags.offline === undefined ? undefined : bool(args.flags, "offline"), env),
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
