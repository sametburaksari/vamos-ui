#!/usr/bin/env node
// Regenerates the world address data of @vamos-ui/react from public sources:
//
//   formats       src/locale-data/world/address-formats.json
//                 Google Address Data Service (the metadata behind libaddressinput / Chromium
//                 autofill), CC BY 4.0: field order, required fields, upper-casing, postal code
//                 pattern and examples, the name of each field ("state", "prefecture", "PIN code").
//
//   subdivisions  src/locale-data/world/subdivisions/<CC>.json + subdivisions-bundled.ts
//                 The regions an address names (US states, JP prefectures, IT provinces): Google's
//                 lists where it has one (what the post expects, with ISO 3166-2 ids), else the
//                 level-1 subdivisions of Unicode CLDR (Unicode License v3) with English and
//                 local-language names. TR comes from address-tr.json (official names) and is
//                 checked against CLDR's codes and Turkish names.
//
//   node packages/ui/scripts/world-address.mjs --download       fetch the sources, then build
//   node packages/ui/scripts/world-address.mjs                  build from an earlier download
//   node packages/ui/scripts/world-address.mjs --only formats   one step
//   --raw DIR   where downloads live (default: <os tmpdir>/vamos-ui-world-address). Raw downloads are
//               never written inside the repository; only the normalised output is.
//
// Refresh once a year (or when a country changes its postal system): run with --download, review
// the diff (`git diff --stat`), run the tests, commit the output with the new `generated` dates.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORLD = path.join(PKG, "src/locale-data/world");
const STEPS = ["formats", "subdivisions"];
const CLDR_VERSION = process.env.CLDR_VERSION ?? "49";

const { values } = parseArgs({
  options: {
    raw: { type: "string" },
    download: { type: "boolean", default: false },
    only: { type: "string" },
  },
});
const RAW = path.resolve(values.raw ?? path.join(os.tmpdir(), "vamos-ui-world-address"));
if (RAW.startsWith(path.resolve(PKG, "../..") + path.sep)) {
  console.error(`world-address: --raw must be outside the repository (${RAW})`);
  process.exit(1);
}
const only = values.only ? values.only.split(",") : STEPS;
for (const s of only) if (!STEPS.includes(s)) throw new Error(`unknown step ${s} (${STEPS.join(", ")})`);
const generated = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/* Downloads                                                           */
/* ------------------------------------------------------------------ */

async function get(url, { tries = 4 } = {}) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "vamos-ui-data-generator" } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return res;
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

async function pool(items, size, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

const GOOGLE = "https://chromium-i18n.appspot.com/ssl-address/data";

async function downloadGoogle() {
  const dir = path.join(RAW, "google");
  fs.mkdirSync(dir, { recursive: true });
  const index = await (await get(GOOGLE)).json();
  const countries = index.countries.split("~");
  await pool([...countries, "ZZ"], 6, async (cc) => {
    const text = await (await get(`${GOOGLE}/${cc}`)).text();
    const d = JSON.parse(text);
    if (d.id !== `data/${cc}`) throw new Error(`unexpected answer for ${cc}`);
    fs.writeFileSync(path.join(dir, `${cc}.json`), text);
  });
  fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify({ countries, fetched: generated }));
  console.log(`↓ Google address data: ${countries.length} countries`);
}

function readGoogle() {
  const dir = path.join(RAW, "google");
  if (!fs.existsSync(path.join(dir, "index.json"))) throw new Error(`no Google data in ${dir}; run with --download`);
  const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
  const byCountry = new Map();
  for (const cc of [...index.countries, "ZZ"]) byCountry.set(cc, JSON.parse(fs.readFileSync(path.join(dir, `${cc}.json`), "utf8")));
  return { countries: index.countries, fetched: index.fetched, byCountry };
}

/* ------------------------------------------------------------------ */
/* Step: formats                                                       */
/* ------------------------------------------------------------------ */

/** The Google keys kept (the rest are sub-region lists, URLs and names). */
const FORMAT_KEYS = ["fmt", "lfmt", "require", "upper", "zip", "zipex", "postprefix", "zip_name_type", "state_name_type", "locality_name_type", "sublocality_name_type", "lang"];
const NAME_TYPES = {
  zip_name_type: ["postal", "zip", "pin", "eircode"],
  state_name_type: ["area", "county", "department", "district", "do_si", "emirate", "island", "oblast", "parish", "prefecture", "province", "state"],
  locality_name_type: ["city", "district", "post_town", "suburb"],
  sublocality_name_type: ["district", "neighborhood", "suburb", "townland", "village_township"],
};
const TOKENS = new Set(["N", "O", "A", "D", "C", "S", "Z", "X", "T", "F", "L", "n"]);

function buildFormats() {
  const g = readGoogle();
  const pick = (d) => Object.fromEntries(FORMAT_KEYS.filter((k) => d[k] !== undefined && d[k] !== "").map((k) => [k, d[k]]));
  const def = pick(g.byCountry.get("ZZ"));
  const countries = {};
  const problems = [];
  for (const cc of g.countries) {
    const d = pick(g.byCountry.get(cc));
    // Validate what the components rely on: known tokens, compiling postal patterns that accept
    // their own examples, known field names.
    for (const f of ["fmt", "lfmt"]) for (const m of (d[f] ?? "").matchAll(/%(.)/g)) if (!TOKENS.has(m[1])) problems.push(`${cc}: unknown token %${m[1]} in ${f}`);
    if (d.zip) {
      const re = new RegExp(`^(?:${d.zip})$`);
      for (const ex of (d.zipex ?? "").split(",").filter(Boolean)) if (!re.test(ex)) problems.push(`${cc}: example ${ex} does not match ${d.zip}`);
    }
    for (const [k, allowed] of Object.entries(NAME_TYPES)) if (d[k] && !allowed.includes(d[k])) problems.push(`${cc}: unknown ${k} ${d[k]}`);
    // Drop what equals the default to keep the file small.
    for (const k of Object.keys(d)) if (k !== "fmt" && def[k] === d[k]) delete d[k];
    if (d.fmt === def.fmt) delete d.fmt;
    countries[cc] = d;
  }
  if (problems.length) throw new Error(`formats:\n  ${problems.join("\n  ")}`);
  for (const cc of ["US", "DE", "JP", "TR", "GB", "BR"]) if (!countries[cc]) throw new Error(`formats: ${cc} missing`);
  const file = {
    source: `Google Address Data Service (${GOOGLE}), the address metadata of libaddressinput and Chromium autofill, fetched ${g.fetched}. Kept: fmt, lfmt, require, upper, zip, zipex, postprefix, *_name_type, lang; "default" is the ZZ record, countries list only what differs from it.`,
    license: "CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), Google LLC; see https://github.com/google/libaddressinput (code Apache-2.0, data CC BY 4.0)",
    generated,
    default: def,
    countries,
  };
  fs.mkdirSync(WORLD, { recursive: true });
  const out = JSON.stringify(file) + "\n";
  fs.writeFileSync(path.join(WORLD, "address-formats.json"), out);
  console.log(`✓ address-formats.json: ${Object.keys(countries).length} countries, ${(out.length / 1024).toFixed(1)} kB`);
}

/* ------------------------------------------------------------------ */
/* Step: subdivisions                                                  */
/* ------------------------------------------------------------------ */

async function downloadCldr() {
  const dir = path.join(RAW, "cldr");
  fs.mkdirSync(dir, { recursive: true });
  const zip = path.join(dir, `cldr-common-${CLDR_VERSION}.zip`);
  const res = await get(`https://unicode.org/Public/cldr/${CLDR_VERSION}/cldr-common-${CLDR_VERSION}.zip`);
  fs.writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  execFileSync("unzip", ["-q", "-o", zip, "common/subdivisions/*", "common/supplemental/subdivisions.xml", "common/supplemental/likelySubtags.xml", "LICENSE", "-d", dir]);
  fs.writeFileSync(path.join(dir, "version.json"), JSON.stringify({ version: CLDR_VERSION, fetched: generated }));
  console.log(`↓ CLDR ${CLDR_VERSION}`);
}

function readCldr() {
  const dir = path.join(RAW, "cldr");
  if (!fs.existsSync(path.join(dir, "version.json"))) throw new Error(`no CLDR data in ${dir}; run with --download`);
  const { version } = JSON.parse(fs.readFileSync(path.join(dir, "version.json"), "utf8"));
  const containment = new Map();
  for (const m of fs.readFileSync(path.join(dir, "common/supplemental/subdivisions.xml"), "utf8").matchAll(/<subgroup type="([A-Z]{2})" contains="([^"]+)"/g)) containment.set(m[1], m[2].split(" "));
  const likely = new Map();
  for (const m of fs.readFileSync(path.join(dir, "common/supplemental/likelySubtags.xml"), "utf8").matchAll(/<likelySubtag from="und_([A-Z]{2})" to="([a-z]{2,3})_/g)) likely.set(m[1], m[2]);
  const nameCache = new Map();
  const names = (lang) => {
    if (!nameCache.has(lang)) {
      const f = path.join(dir, `common/subdivisions/${lang}.xml`);
      const map = new Map();
      if (fs.existsSync(f)) for (const m of fs.readFileSync(f, "utf8").matchAll(/<subdivision type="([a-z0-9]+)"[^>]*>([^<]+)<\/subdivision>/g)) map.set(m[1], decodeXml(m[2]).trim());
      nameCache.set(lang, map);
    }
    return nameCache.get(lang);
  };
  return { version, containment, likely, names };
}

const decodeXml = (s) => s.replace(/&(amp|lt|gt|quot|apos|#\d+);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[e] ?? String.fromCodePoint(Number(e.slice(1))));
const isLatin = (s) => /\p{L}/u.test(s) && !/[^\p{Script=Latin}\P{L}]/u.test(s);
/** "Çankırı (il)", "Artvin ili", "Elâzığ" → comparable with the official "Çankırı", "Artvin", "Elazığ". */
const foldTr = (s) => s.replace(/\s*\(il\)$|\s+ili$/u, "").replace(/[âÂ]/g, "a").replace(/[îÎ]/g, "i").replace(/[ûÛ]/g, "u").toLocaleLowerCase("tr");
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function buildSubdivisions() {
  const g = readGoogle();
  const cldr = readCldr();
  const en = cldr.names("en");
  const dir = path.join(WORLD, "subdivisions");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const GOOGLE_SRC = `Google Address Data Service, fetched ${g.fetched} (regions as addresses name them, ISO 3166-2 ids); missing English names from Unicode CLDR ${cldr.version}`;
  const GOOGLE_LIC = "CC BY 4.0 (Google LLC); CLDR names: Unicode License v3 (Unicode, Inc.)";
  const CLDR_SRC = `Unicode CLDR ${cldr.version}, level-1 subdivisions with English and local-language names`;
  const CLDR_LIC = "Unicode License v3 (https://www.unicode.org/license.txt), © Unicode, Inc.";
  const countries = new Set([...g.countries, ...cldr.containment.keys()]);
  const written = [];
  const problems = [];
  let rowsTotal = 0;
  for (const cc of [...countries].sort()) {
    const d = g.byCountry.get(cc) ?? {};
    const lang = (d.lang ?? cldr.likely.get(cc) ?? "en").split("-")[0];
    const local = cldr.names(lang);
    let rows;
    let from;
    if (cc === "TR") {
      // Official names, the same strings as address-tr.json (and UBL-TR CityName).
      const tr = JSON.parse(fs.readFileSync(path.join(PKG, "src/locale-data/tr/address-tr.json"), "utf8"));
      rows = tr.provinces.map(([plate, name]) => [String(plate).padStart(2, "0"), name, name, name]);
      const codes = new Set(cldr.containment.get("TR").map((c) => c.slice(2)));
      for (const [iso, name] of rows) {
        if (!codes.has(iso)) problems.push(`TR: plate ${iso} is not a CLDR subdivision`);
        else if (local.get(`tr${iso}`) && foldTr(local.get(`tr${iso}`)) !== foldTr(name)) problems.push(`TR-${iso}: ${name} vs CLDR ${local.get(`tr${iso}`)}`);
      }
      if (rows.length !== codes.size) problems.push(`TR: ${rows.length} provinces vs ${codes.size} in CLDR`);
      from = "tr";
    } else if (d.sub_keys) {
      const split = (k) => (d[k] ? d[k].split("~") : []);
      const keys = split("sub_keys");
      const subNames = split("sub_names");
      const lnames = split("sub_lnames");
      const isos = split("sub_isoids");
      rows = keys.map((key, i) => {
        let iso = isos[i] ?? "";
        if (!iso && en.has(`${cc}${key}`.toLowerCase())) iso = key;
        const cldrKey = iso ? `${cc}${iso}`.toLowerCase() : "";
        const localName = subNames[i] || key;
        const latin = lnames[i] || (isLatin(localName) ? localName : "") || (cldrKey && en.get(cldrKey)) || localName;
        return [iso, key, latin, localName];
      });
      from = "google";
    } else if (cldr.containment.has(cc)) {
      rows = cldr.containment.get(cc).map((code) => {
        const name = en.get(code) ?? local.get(code);
        if (!name) problems.push(`${cc}: no name for ${code}`);
        const loc = local.get(code) ?? name;
        return [code.slice(2).toUpperCase(), loc, name, loc];
      });
      rows.sort((a, b) => byText(a[2], b[2]));
      from = "cldr";
    } else continue;
    for (const r of rows) if (r.some((x) => typeof x !== "string") || !r[1] || !r[2]) problems.push(`${cc}: bad row ${JSON.stringify(r)}`);
    const keys = new Set(rows.map((r) => r[1]));
    if (keys.size !== rows.length) problems.push(`${cc}: duplicate values`);
    // On disk: [iso, value, name, local], name / local "" when they equal the value.
    rows = rows.map(([iso, key, name, loc]) => [iso, key, name === key ? "" : name, loc === key ? "" : loc]);
    const file = { source: from === "cldr" ? CLDR_SRC : from === "tr" ? "address-tr.json (official province names, NVİ), ISO 3166-2 codes checked against Unicode CLDR" : GOOGLE_SRC, license: from === "cldr" ? CLDR_LIC : from === "tr" ? "Official public records; codes from Unicode CLDR (Unicode License v3)" : GOOGLE_LIC, generated, country: cc, lang, from, rows };
    fs.writeFileSync(path.join(dir, `${cc}.json`), JSON.stringify(file) + "\n");
    written.push(cc);
    rowsTotal += rows.length;
  }
  if (problems.length) throw new Error(`subdivisions:\n  ${problems.join("\n  ")}`);
  const lines = written.map((cc) => `  ${cc}: () => import("./subdivisions/${cc}.json"),`);
  fs.writeFileSync(
    path.join(WORLD, "subdivisions-bundled.ts"),
    `// AUTO-GENERATED by scripts/world-address.mjs — do not edit by hand.
/**
 * Subdivisions (states, provinces, prefectures…) of ${written.length} countries, ${rowsTotal} entries, one lazy
 * chunk per country. Each file loads the first time its country is picked; nothing reaches the
 * main bundle.
 */
import { createSubdivisionLoader, type SubdivisionFile } from "./subdivisions";

const FILES: Record<string, () => Promise<unknown>> = {
${lines.join("\n")}
};

/** Loads one country's file from the package (\`null\` for a country without subdivisions). */
export function loadSubdivisionFile(country: string): Promise<SubdivisionFile | null> {
  const load = FILES[country.toUpperCase()];
  if (!load) return Promise.resolve(null);
  return load().then((m) => ((m as { default?: unknown }).default ?? m) as SubdivisionFile);
}

/** Countries with a bundled subdivision file. */
export const SUBDIVISION_COUNTRIES: readonly string[] = /*#__PURE__*/ Object.keys(FILES);

/** \`(country) => file\` over the bundled files, cached per country. */
export const bundledSubdivisions = /*#__PURE__*/ createSubdivisionLoader(loadSubdivisionFile);
`,
  );
  const sizes = written.map((cc) => fs.statSync(path.join(dir, `${cc}.json`)).size);
  console.log(`✓ subdivisions: ${written.length} countries, ${rowsTotal} entries, ${(sizes.reduce((a, b) => a + b, 0) / 1024).toFixed(0)} kB (largest ${(Math.max(...sizes) / 1024).toFixed(1)} kB)`);
}

/* ------------------------------------------------------------------ */

if (values.download) {
  fs.mkdirSync(RAW, { recursive: true });
  if (only.includes("formats") || only.includes("subdivisions")) await downloadGoogle();
  if (only.includes("subdivisions")) await downloadCldr();
}
if (only.includes("formats")) buildFormats();
if (only.includes("subdivisions")) buildSubdivisions();
