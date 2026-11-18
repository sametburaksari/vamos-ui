import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { findProjectRoot } from "../core/config";
import { detectProject } from "../core/project";
import { CliError } from "../core/types";
import { PROJECT_FILE, secretCommands, type Hosting } from "../project";
import { storeFiles, type StoreProvider, type StoreRuntime } from "../project/store";
import { SITE_FILE } from "../site-info";
import { p, pc, plural, printJson, type Context } from "../ui";
import { staticExport } from "./site-form";

const RUNTIMES: StoreRuntime[] = ["next", "edge"];
const EDGE_HOSTS = ["cloudflare", "spacefast"];
const PROVIDERS: StoreProvider[] = ["iyzico", "paytr"];
/** Settings and bindings that are not secrets (no secret command for them). */
const NOT_SECRET = new Set(["IYZICO_MODE", "PAYTR_TEST_MODE", "ORDERS"]);

function readJson(file: string): Record<string, any> | null {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/**
 * `site store`: writes the store checkout (catalog, iyzico or PayTR checkout endpoints, order
 * emails). --provider paytr also needs an order store (KV binding or Upstash Redis).
 * Runtime: --runtime, else a Next.js server → next, a static site on Cloudflare Pages or Spacefast
 * → edge. Other static hosting (cPanel) has no server to keep the payment keys: refused with the
 * options. Never replaces a file.
 */
export async function siteStore(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const project = detectProject(root);
  const site = readJson(path.join(root, SITE_FILE));
  const plan = readJson(path.join(root, PROJECT_FILE));
  const host = str(args.flags, "host") ?? (plan?.plan?.hosting?.value as string | undefined);
  const isStatic = project.framework !== "next" || staticExport(root);
  const provider = (str(args.flags, "provider") ?? "iyzico") as StoreProvider;
  if (!PROVIDERS.includes(provider)) throw new CliError(`--provider must be one of ${PROVIDERS.join(", ")}, got "${provider}".`);
  let runtime = str(args.flags, "runtime") as StoreRuntime | undefined;
  if (runtime && !RUNTIMES.includes(runtime)) throw new CliError(`--runtime must be one of ${RUNTIMES.join(", ")}, got "${runtime}".`);
  let why = "--runtime";
  if (!runtime) {
    if (!isStatic) [runtime, why] = ["next", "Next.js server"];
    else if (host && EDGE_HOSTS.includes(host)) [runtime, why] = ["edge", `static site on ${host}`];
    else {
      throw new CliError(
        `A store needs a server to keep the payment keys, and this is a static ${project.framework === "next" ? "export" : "site"}${host ? ` on ${host}` : ""}. ` +
          "Host it on Cloudflare Pages or Spacefast (--host cloudflare: checkout runs as edge functions next to the static files), or run Next.js as a server (remove output: \"export\"; Vercel or a VPS).",
      );
    }
  }
  if (runtime === "next" && isStatic) throw new CliError('--runtime next needs a Next.js server, but this project is a static export. Use --runtime edge on Cloudflare Pages or Spacefast.');

  const lang = (str(args.flags, "lang") ?? (String(site?.locale ?? "").startsWith("en") ? "en" : "tr")) as "tr" | "en";
  if (lang !== "tr" && lang !== "en") throw new CliError("--lang must be tr or en.");
  const currency = (str(args.flags, "currency") ?? "TRY").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new CliError("--currency must be an ISO 4217 code such as TRY, USD or EUR.");
  const result = storeFiles({
    runtime,
    provider,
    lang,
    currency,
    siteName: site?.name || plan?.answers?.business_name || undefined,
    appDir: project.srcDir ? "src/app" : "app",
    storeDir: project.srcDir ? "src/store" : "store",
  });

  const dryRun = bool(args.flags, "dry-run");
  const written: string[] = [];
  const kept: string[] = [];
  for (const [rel, content] of Object.entries(result.files)) {
    const abs = path.join(root, rel);
    if (existsSync(abs)) {
      kept.push(rel);
      continue;
    }
    if (!dryRun) {
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, content);
    }
    written.push(rel);
  }
  const secretNames = Object.keys(result.env).filter((k) => !NOT_SECRET.has(k));
  const secrets = host ? secretCommands(host as Hosting, secretNames, { project: str(args.flags, "project"), space: str(args.flags, "space") }) : [];
  if (ctx.json) {
    printJson({ runtime, provider, reason: why, written: dryRun ? [] : written, planned: written, kept, env: result.env, optionalEnv: result.optionalEnv, notes: result.notes, ...(host ? { secretCommands: secrets } : {}) });
    return 0;
  }
  p.intro(pc.bold("vamos-ui site store"));
  p.log.info(`Checkout: ${pc.cyan(provider)} on ${pc.cyan(runtime)} ${pc.dim(`(${why})`)}`);
  p.note(
    [...written.map((f) => `${dryRun ? pc.dim("+") : pc.green("+")} ${f}`), ...kept.map((f) => `${pc.dim("=")} ${f} ${pc.dim("kept, already there")}`)].join("\n"),
    dryRun ? "Store checkout (dry run)" : "Store checkout",
  );
  p.log.info(`Environment:\n${Object.entries(result.env).map(([k, v]) => `  ${k}  ${pc.dim(v)}`).join("\n")}\n${pc.dim("Optional:")}\n${Object.entries(result.optionalEnv).map(([k, v]) => `  ${k}  ${pc.dim(v)}`).join("\n")}`);
  if (secrets.length) p.log.info(`${lang === "tr" ? `${host} üzerinde gizli değerler (her komut değeri sorar)` : `Secrets on ${host} (each command asks for the value)`}:\n${secrets.map((c) => `  ${c}`).join("\n")}`);
  for (const note of result.notes) p.log.message(note);
  p.outro(dryRun ? "Dry run: nothing was written." : written.length ? `Wrote ${plural(written.length, "file")}.` : "Nothing to write.");
  return 0;
}
