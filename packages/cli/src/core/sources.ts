/**
 * Open registry: items from anywhere, not only https://ui.vamos.ist/r.
 *
 *   button                                  the project's registry (default: Vamos UI)
 *   https://example.com/r/stat-card.json    a full URL to an item JSON
 *   github:owner/repo[/path][#ref]/item     raw.githubusercontent.com/owner/repo/<ref|HEAD>/<path|r>/<item>.json
 *   @acme/stat-card                         "registries": { "@acme": "https://acme.dev/r/{name}.json" } in vamos.json
 *   ./r/stat-card.json                      a local item file (handy while building a registry)
 *
 * Third-party items are fetched as data, validated against the same item schema the Vamos UI build
 * uses, and never executed: the CLI only writes their files, and their npm packages are installed with
 * lifecycle scripts disabled.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { externalItemSchema, NAME_PATTERN, validateSchema } from "./schema";
import { CliError, type ItemSource, type RegistryItem } from "./types";

const NAME_RE = new RegExp(NAME_PATTERN);
const NAMESPACE_RE = /^@([a-z0-9][a-z0-9._-]*)\/([a-z0-9][a-z0-9-]*)$/;
const GH_PART_RE = /^[A-Za-z0-9_.-]+$/;
/** Largest item JSON the CLI accepts (a big block is ~300 KB). */
export const MAX_ITEM_BYTES = 5 * 1024 * 1024;

export interface SourceOptions {
  /** "registries" from vamos.json. */
  registries?: Record<string, string>;
  /** Project root, for local paths. */
  root: string;
}

/** Is this a plain item name for the project's own registry? */
export function isPlainName(spec: string): boolean {
  return NAME_RE.test(spec);
}

function isLocalHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

function nameFromPath(p: string): string {
  const base = p.split("/").filter(Boolean).pop() ?? "";
  return decodeURIComponent(base).replace(/\.json$/i, "");
}

function checkName(name: string, spec: string): string {
  if (!NAME_RE.test(name)) throw new CliError(`"${name}" in "${spec}" is not a valid item name.`, "Item names are lower-case letters, digits and dashes, e.g. stat-card.");
  return name;
}

function fromUrl(spec: string, raw: string, root?: string): ItemSource {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new CliError(`"${spec}" is not a valid URL.`);
  }
  if (url.protocol === "file:") return fromFile(spec, fileURLToPath(url), root);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocalHost(url.hostname))) {
    throw new CliError(`Refusing ${url.protocol}//${url.host}: third-party items must come over https.`, "Plain http is only allowed for localhost while you develop a registry.");
  }
  const name = checkName(nameFromPath(url.pathname), spec);
  return { kind: "url", key: url.href, name, url: url.href, host: url.host };
}

function fromFile(spec: string, abs: string, root?: string): ItemSource {
  const name = checkName(nameFromPath(abs.split(path.sep).join("/")), spec);
  const rel = root ? path.relative(root, abs).split(path.sep).join("/") : "";
  const key = rel && !rel.startsWith("../") && !path.isAbsolute(rel) ? `./${rel}` : abs;
  return { kind: "file", key, name, url: abs, host: "local file" };
}

export interface GithubSpec {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  name: string;
}

/** github:owner/repo[/path][#ref]/item → parts. Path defaults to "r", ref to "HEAD". */
export function parseGithubSpec(spec: string): GithubSpec {
  const body = spec.replace(/^github:/, "").replace(/\.json$/i, "");
  const bad = (why: string) => new CliError(`"${spec}" is not a valid GitHub item: ${why}.`, "Use github:owner/repo/item, github:owner/repo/path/to/r/item or github:owner/repo[/path]#ref/item.");
  let segs: string[];
  let ref = "HEAD";
  let name: string;
  const hash = body.indexOf("#");
  if (hash !== -1) {
    segs = body.slice(0, hash).split("/").filter(Boolean);
    const after = body.slice(hash + 1).split("/").filter(Boolean);
    if (after.length < 2) throw bad("after # comes <ref>/<item>");
    name = after.pop()!;
    ref = after.join("/");
    if (segs.length < 2) throw bad("owner and repo are required");
  } else {
    segs = body.split("/").filter(Boolean);
    if (segs.length < 3) throw bad("owner, repo and item are required");
    name = segs.pop()!;
  }
  const [owner, repo, ...rest] = segs as [string, string, ...string[]];
  if (!GH_PART_RE.test(owner) || !GH_PART_RE.test(repo)) throw bad("owner and repo may only use letters, digits, - _ .");
  if (rest.some((s) => s === ".." || s === "." || !/^[A-Za-z0-9_.@-]+$/.test(s))) throw bad("the path has unsupported characters");
  if (ref.split("/").some((s) => s === ".." || !/^[A-Za-z0-9_.@-]+$/.test(s))) throw bad("the ref has unsupported characters");
  checkName(name, spec);
  return { owner, repo, path: rest.length ? rest.join("/") : "r", ref, name };
}

export function githubKey(g: GithubSpec): string {
  return `github:${g.owner}/${g.repo}${g.path !== "r" ? `/${g.path}` : ""}${g.ref !== "HEAD" ? `#${g.ref}` : ""}/${g.name}`;
}

export function githubRawUrl(g: GithubSpec): string {
  return `https://raw.githubusercontent.com/${g.owner}/${g.repo}/${g.ref}/${g.path}/${g.name}.json`;
}

function fromNamespace(spec: string, opts: SourceOptions): ItemSource {
  const m = NAMESPACE_RE.exec(spec)!;
  const ns = `@${m[1]}`;
  const name = m[2]!;
  const template = opts.registries?.[ns];
  if (!template) {
    throw new CliError(`No registry is configured for ${ns}.`, `Add it to vamos.json: "registries": { "${ns}": "https://example.com/r/{name}.json" }`);
  }
  const filled = template.replace(/\{name\}/g, encodeURIComponent(name));
  const source = /^[a-z][a-z0-9+.-]*:\/\//i.test(filled) ? fromUrl(spec, filled, opts.root) : fromFile(spec, path.resolve(opts.root, filled), opts.root);
  return { ...source, kind: "namespace", key: `${ns}/${name}`, name };
}

/**
 * Where an item spec points. Returns null for a plain name (the project's own registry).
 * Throws a CliError for a spec that is malformed or not configured.
 */
export function parseItemSpec(spec: string, opts: SourceOptions): ItemSource | null {
  const s = spec.trim();
  if (isPlainName(s)) return null;
  if (/^https?:\/\//i.test(s) || /^file:\/\//i.test(s)) return fromUrl(s, s, opts.root);
  if (s.startsWith("github:")) {
    const g = parseGithubSpec(s);
    const url = githubRawUrl(g);
    return { kind: "github", key: githubKey(g), name: g.name, url, host: "raw.githubusercontent.com", github: g };
  }
  if (s.startsWith("@")) {
    if (!NAMESPACE_RE.test(s)) throw new CliError(`"${s}" is not a valid namespaced item.`, "Use @namespace/item, e.g. @acme/stat-card.");
    return fromNamespace(s, opts);
  }
  if (/\.json$/i.test(s) && (s.startsWith("./") || s.startsWith("../") || path.isAbsolute(s))) return fromFile(s, path.resolve(opts.root, s), opts.root);
  throw new CliError(`"${spec}" is not an item name, URL, github: spec or @namespace/item.`, "Item names are lower-case letters, digits and dashes. Run `vamos-ui list` to see the registry.");
}

/**
 * Turns a dependency listed by a third-party item into a spec the resolver understands.
 * "./sibling" is relative to the parent's registry; a plain name means a Vamos UI (project registry) item.
 */
export function resolveDependencySpec(dep: string, parent: ItemSource, opts: SourceOptions): string {
  if (!dep.startsWith("./")) return dep;
  const name = checkName(dep.slice(2), dep);
  switch (parent.kind) {
    case "namespace":
      return `${parent.key.slice(0, parent.key.lastIndexOf("/"))}/${name}`;
    case "github":
      return githubKey({ ...parent.github!, name });
    case "url":
      return new URL(`${name}.json`, parent.url).href;
    case "file":
      return path.join(path.dirname(parent.url), `${name}.json`);
  }
  void opts;
  return dep;
}

/** The resolver key for a spec: the plain name, or the source's canonical key. */
export function canonicalSpec(spec: string, opts: SourceOptions): string {
  return parseItemSpec(spec, opts)?.key ?? spec.trim();
}

async function readSource(source: ItemSource, fetchImpl: typeof fetch): Promise<string> {
  if (source.kind === "file") {
    try {
      return await readFile(source.url, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") throw new CliError(`${source.key} does not exist.`);
      throw err;
    }
  }
  let res: Response;
  try {
    res = await fetchImpl(source.url, { headers: { accept: "application/json" }, redirect: "follow" });
  } catch (err) {
    throw new CliError(`Could not reach ${source.host} (${source.url}).`, (err as Error).message);
  }
  if (res.status === 404) throw new CliError(`"${source.key}" was not found at ${source.url}.`, source.kind === "github" ? "Check the owner, repo, path (default r/) and ref (default HEAD); the repo must be public." : undefined);
  if (!res.ok) throw new CliError(`${source.host} answered ${res.status} ${res.statusText} for ${source.url}.`);
  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_ITEM_BYTES) throw new CliError(`${source.url} is larger than ${MAX_ITEM_BYTES / 1024 / 1024} MB; refusing it.`);
  const text = await res.text();
  if (text.length > MAX_ITEM_BYTES) throw new CliError(`${source.url} is larger than ${MAX_ITEM_BYTES / 1024 / 1024} MB; refusing it.`);
  return text;
}

/** Validates parsed JSON as a third-party item. Returns the error list (empty = valid). */
export function validateExternalItem(value: unknown): string[] {
  return validateSchema(value, externalItemSchema());
}

/**
 * Fetches, parses and validates a third-party item. The returned item carries `key` (its lock and
 * resolver key) and `source`, and its registryDependencies are already resolved to specs.
 */
export async function fetchExternalItem(source: ItemSource, opts: SourceOptions & { fetch?: typeof fetch }): Promise<RegistryItem> {
  const text = await readSource(source, opts.fetch ?? fetch);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new CliError(`${source.key} is not valid JSON (from ${source.host}).`);
  }
  const errors = validateExternalItem(raw);
  if (errors.length) {
    throw new CliError(`${source.key} is not a valid Vamos UI registry item (from ${source.host}):\n  ${errors.slice(0, 6).join("\n  ")}${errors.length > 6 ? `\n  … ${errors.length - 6} more` : ""}`, "The item format is documented at https://ui.vamos.ist/docs/publish-a-registry");
  }
  const item = raw as RegistryItem;
  if ((source.kind === "namespace" || source.kind === "github") && item.name !== source.name) {
    throw new CliError(`${source.key} contains an item named "${item.name}", expected "${source.name}".`);
  }
  return {
    ...item,
    key: source.key,
    source: { kind: source.kind, url: source.url, host: source.host },
    registryDependencies: item.registryDependencies.map((d) => resolveDependencySpec(d, source, opts)),
  };
}
