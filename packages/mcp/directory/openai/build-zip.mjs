#!/usr/bin/env node
// Validate the ChatGPT plugin package in ./plugin and zip it to ./dist/vamos-ui-chatgpt.zip.
//
//   node packages/mcp/directory/openai/build-zip.mjs                 # validate + zip
//   node packages/mcp/directory/openai/build-zip.mjs --check-only    # validate, no zip
//   node packages/mcp/directory/openai/build-zip.mjs --check-urls    # also check that every listing URL answers 200
//   DEMO_VIDEO_URL=https://… node packages/mcp/directory/openai/build-zip.mjs
//       writes review.demo_recording_url into the zipped plugin.json (the source file is not changed)
//
// Checks: the official Agent Plugins 1.0.0 JSON schemas (vendored in ./schemas, fetched from
// https://agent-plugins.org/schemas/1.0.0/), the OpenAI submission limits from
// https://developers.openai.com/apps-sdk/deploy/submission (listing lengths, HTTPS URLs, icons,
// brand colour contrast, exactly 5 positive + 3 negative test cases, one MCP server).
// Node built-ins only; zipping uses the system `zip` command.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "plugin");
const OUT_DIR = join(HERE, "dist");
const ZIP = join(OUT_DIR, "vamos-ui-chatgpt.zip");
const args = new Set(process.argv.slice(2));

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// ── Minimal JSON Schema (2020-12 subset used by the Agent Plugins schemas) ─────────────────────
function validate(schema, value, root = schema, path = "$") {
  const out = [];
  if (schema.$ref) {
    const target = schema.$ref.replace(/^#\//, "").split("/").reduce((o, k) => o[k], root);
    return validate(target, value, root, path);
  }
  if (schema.oneOf) {
    const ok = schema.oneOf.filter((s) => validate(s, value, root, path).length === 0).length;
    if (ok !== 1) out.push(`${path}: must match exactly one schema in oneOf (matched ${ok})`);
    return out;
  }
  if (schema.const !== undefined && value !== schema.const) out.push(`${path}: must be ${JSON.stringify(schema.const)}`);
  if (schema.not?.enum && schema.not.enum.includes(value)) out.push(`${path}: must not be ${JSON.stringify(value)}`);
  const type = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  if (schema.type && schema.type !== type) return [...out, `${path}: must be ${schema.type}, got ${type}`];
  if (type === "string") {
    if (schema.minLength != null && value.length < schema.minLength) out.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength != null && value.length > schema.maxLength) out.push(`${path}: longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) out.push(`${path}: does not match ${schema.pattern}`);
  }
  if (type === "array" && schema.items) value.forEach((v, i) => out.push(...validate(schema.items, v, root, `${path}[${i}]`)));
  if (type === "object") {
    for (const k of schema.required ?? []) if (!(k in value)) out.push(`${path}: missing required "${k}"`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.propertyNames) out.push(...validate(schema.propertyNames, k, root, `${path}{${k}}`));
      if (schema.properties?.[k]) out.push(...validate(schema.properties[k], v, root, `${path}.${k}`));
      else if (schema.additionalProperties === false) out.push(`${path}: unexpected property "${k}"`);
      else if (typeof schema.additionalProperties === "object") out.push(...validate(schema.additionalProperties, v, root, `${path}.${k}`));
    }
  }
  return out;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────────────────────
function pngSize(file) {
  const b = readFileSync(file);
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function svgSize(file) {
  const s = readFileSync(file, "utf8");
  const vb = s.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/);
  if (vb) return { w: Number(vb[1]), h: Number(vb[2]) };
  const w = s.match(/<svg[^>]*\swidth="([\d.]+)"/), h = s.match(/<svg[^>]*\sheight="([\d.]+)"/);
  return w && h ? { w: Number(w[1]), h: Number(h[1]) } : null;
}
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const len = (field, value, max) => {
  if (typeof value !== "string" || !value.trim()) return err(`${field} is required`);
  if (value.length > max) err(`${field} is ${value.length} characters (max ${max})`);
};
const httpsUrl = (field, value, max = 1024) => {
  if (typeof value !== "string") return err(`${field} is required`);
  let u;
  try { u = new URL(value); } catch { return err(`${field} is not a URL`); }
  if (u.protocol !== "https:") err(`${field} must use HTTPS`);
  if (u.username || u.password) err(`${field} must not embed credentials`);
  if (value.length > max) err(`${field} is longer than ${max}`);
};

// ── Load ────────────────────────────────────────────────────────────────────────────────────────
const plugin = readJson(join(SRC, "plugin.json"));
const mcp = readJson(join(SRC, "mcp.json"));
const pluginSchema = readJson(join(HERE, "schemas/plugin.schema.json"));
const mcpSchema = readJson(join(HERE, "schemas/mcp.schema.json"));

if (process.env.DEMO_VIDEO_URL) plugin.extensions["com.openai"].review.demo_recording_url = process.env.DEMO_VIDEO_URL;

// ── Official schemas ────────────────────────────────────────────────────────────────────────────
for (const e of validate(pluginSchema, plugin)) err(`plugin.json schema: ${e}`);
// OpenAI documents auth under mcpServers.<name>.extensions["com.openai"].auth, which the published
// mcp.schema.json (additionalProperties: false) does not list yet. Validate the rest of each server.
const mcpForSchema = structuredClone(mcp);
for (const s of Object.values(mcpForSchema.mcpServers ?? {})) delete s.extensions;
for (const e of validate(mcpSchema, mcpForSchema)) err(`mcp.json schema: ${e}`);

// ── OpenAI submission rules ─────────────────────────────────────────────────────────────────────
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(plugin.name) || plugin.name.length > 64) err("name must be lowercase letters, numbers and single hyphens, ≤64");
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(plugin.version ?? "")) err("version must be an explicit semantic version");
len("description", plugin.description, 4000);
len("author.name", plugin.author?.name, 120);
if (plugin.author?.url) httpsUrl("author.url", plugin.author.url, 2048);
if (plugin.homepage) httpsUrl("homepage", plugin.homepage, 2048);

const oa = plugin.extensions?.["com.openai"] ?? {};
const i = oa.interface ?? {};
len("interface.displayName", i.displayName, 30);
len("interface.shortDescription", i.shortDescription, 30);
len("interface.longDescription", i.longDescription, 4000);
len("interface.developerName", i.developerName, 80);
len("interface.category", i.category, 200);
if (!Array.isArray(i.capabilities) || i.capabilities.length > 20 || i.capabilities.some((c) => typeof c !== "string" || c.length > 120)) err("interface.capabilities: ≤20 strings of ≤120 characters");
for (const f of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) httpsUrl(`interface.${f}`, i[f]);
const prompts = i.defaultPrompt == null ? [] : [].concat(i.defaultPrompt);
if (prompts.length > 3) err("interface.defaultPrompt: at most 3");
prompts.forEach((p, n) => { if (p.length > 128) err(`interface.defaultPrompt[${n}] is ${p.length} characters (max 128)`); if (/@\w/.test(p)) err(`interface.defaultPrompt[${n}] must not @mention`); });
if (new Set(prompts).size !== prompts.length) err("interface.defaultPrompt entries must be unique");
if (i.brandColor) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(i.brandColor)) err("brandColor must be #RRGGBB");
  else if (contrast(i.brandColor, "#FFFFFF") < 2) err(`brandColor contrast on white is ${contrast(i.brandColor, "#FFFFFF").toFixed(2)}:1 (min 2:1)`);
}
if (i.brandColorDark) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(i.brandColorDark)) err("brandColorDark must be #RRGGBB");
  else if (contrast(i.brandColorDark, "#212121") < 2) err(`brandColorDark contrast on #212121 is ${contrast(i.brandColorDark, "#212121").toFixed(2)}:1 (min 2:1)`);
}

// Icons
for (const f of ["logo", "composerIcon", "logoDark", "composerIconDark"]) {
  const rel = i[f];
  if (rel == null) { if (f === "logo" || f === "composerIcon") err(`interface.${f} is required`); continue; }
  if (!rel.startsWith("./")) { err(`interface.${f} must start with ./`); continue; }
  const file = resolve(SRC, rel);
  if (!file.startsWith(SRC) || !existsSync(file)) { err(`interface.${f}: ${rel} not found in the package`); continue; }
  if (statSync(file).size > 5 * 1024 * 1024) err(`interface.${f}: larger than 5 MiB`);
  const size = /\.png$/i.test(file) ? pngSize(file) : /\.svg$/i.test(file) ? svgSize(file) : null;
  if (!size) { warn(`interface.${f}: could not read the image size (use PNG or SVG)`); continue; }
  if (size.w !== size.h) err(`interface.${f}: must be square (${size.w}×${size.h})`);
  if (size.w < 48) err(`interface.${f}: at least 48×48 (${size.w}×${size.h})`);
  if (size.w > 4096) err(`interface.${f}: at most 4096 px`);
}

// Review
const review = oa.review ?? {};
const pos = review.test_cases?.positive ?? [];
const neg = review.test_cases?.negative ?? [];
if (pos.length !== 5) err(`review.test_cases.positive: exactly 5 required (has ${pos.length})`);
if (neg.length !== 3) err(`review.test_cases.negative: exactly 3 required (has ${neg.length})`);
pos.forEach((c, n) => {
  for (const k of ["description", "prompt", "tools_triggered", "expected_behavior"]) if (!c[k]?.trim()) err(`positive[${n}].${k} is required`);
  if (c.description?.length > 4000) err(`positive[${n}].description longer than 4000`);
});
neg.forEach((c, n) => { for (const k of ["description", "prompt"]) if (!c[k]?.trim()) err(`negative[${n}].${k} is required`); });
if ("test_credentials" in review || "reviewer_instructions" in review) err("review must not contain test_credentials or reviewer_instructions");
if (!review.demo_recording_url) warn("review.demo_recording_url is missing (required before submitting for review): set DEMO_VIDEO_URL when building");
else httpsUrl("review.demo_recording_url", review.demo_recording_url, 2048);
if (oa.apps || oa.hooks) err("packages with apps (.app.json) or hooks cannot be submitted");

// MCP config
const servers = Object.entries(mcp.mcpServers ?? {});
if (servers.length !== 1) err(`mcp.json: exactly one MCP server expected (has ${servers.length})`);
for (const [name, s] of servers) {
  if (s.type !== "streamable-http") err(`mcp.json ${name}: type must be streamable-http for a remote server`);
  httpsUrl(`mcp.json ${name}.url`, s.url, 2048);
  if (s.headers && Object.keys(s.headers).length) err(`mcp.json ${name}: public submission rejects non-empty headers`);
  if (JSON.stringify(s).includes("clientSecret")) err(`mcp.json ${name}: clientSecret is not allowed`);
  const authType = s.extensions?.["com.openai"]?.auth?.type;
  if (authType !== "none") err(`mcp.json ${name}: expected extensions["com.openai"].auth.type "none" (got ${authType})`);
}

// Tool names in the test cases must exist on the live server (checked with --check-urls).
async function liveChecks() {
  const urls = [i.websiteURL, i.supportURL, i.privacyPolicyURL, i.termsOfServiceURL, review.demo_recording_url].filter(Boolean);
  for (const u of urls) {
    try {
      const r = await fetch(u, { redirect: "follow" });
      if (r.status !== 200) err(`${u} answered ${r.status}`);
    } catch (e) { err(`${u}: ${e.message}`); }
  }
  const [name, server] = servers[0] ?? [];
  if (!server) return;
  try {
    const r = await fetch(server.url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    const text = await r.text();
    const json = JSON.parse(text.startsWith("{") ? text : text.split("\n").find((l) => l.startsWith("data: "))?.slice(6) ?? "{}");
    const tools = new Set((json.result?.tools ?? []).map((t) => t.name));
    if (!tools.size) return err(`${name}: tools/list returned no tools`);
    for (const c of pos) for (const t of c.tools_triggered.split(",").map((s) => s.trim())) if (!tools.has(t)) err(`test case "${c.description}": tool ${t} is not on the live server`);
    for (const t of json.result.tools) if (!t.title || t.annotations?.readOnlyHint !== true) warn(`tool ${t.name}: missing title or readOnlyHint`);
  } catch (e) { err(`${name}: tools/list failed: ${e.message}`); }
}
if (args.has("--check-urls")) await liveChecks();

// ── Report ──────────────────────────────────────────────────────────────────────────────────────
for (const w of warnings) console.warn(`warning  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error    ${e}`);
  console.error(`\n${errors.length} error(s). Nothing was zipped.`);
  process.exit(1);
}
console.log(`ok       plugin.json + mcp.json valid (${i.displayName} ${plugin.version}, ${pos.length} positive / ${neg.length} negative cases)`);
if (args.has("--check-only")) process.exit(0);

// ── Zip ─────────────────────────────────────────────────────────────────────────────────────────
const stage = join(OUT_DIR, ".stage");
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(SRC, stage, { recursive: true, filter: (p) => !/(^|\/)\.DS_Store$/.test(p) });
writeFileSync(join(stage, "plugin.json"), JSON.stringify(plugin, null, 2) + "\n");
rmSync(ZIP, { force: true });
execFileSync("zip", ["-q", "-r", "-X", ZIP, "."], { cwd: stage, stdio: "inherit" });
rmSync(stage, { recursive: true, force: true });
console.log(`zipped   ${ZIP} (${(statSync(ZIP).size / 1024).toFixed(1)} KiB)`);
console.log(execFileSync("unzip", ["-l", ZIP], { encoding: "utf8" }).trim());
