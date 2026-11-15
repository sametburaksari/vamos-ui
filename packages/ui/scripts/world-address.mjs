#!/usr/bin/env node
// Regenerates the world address data of @vamos-ui/react from public sources:
//
//   formats       src/locale-data/world/address-formats.json
//                 Google Address Data Service (the metadata behind libaddressinput / Chromium
//                 autofill), CC BY 4.0: field order, required fields, upper-casing, postal code
//                 pattern and examples, the name of each field ("state", "prefecture", "PIN code").
//
//   node packages/ui/scripts/world-address.mjs --download       fetch the sources, then build
//   node packages/ui/scripts/world-address.mjs                  build from an earlier download
//   node packages/ui/scripts/world-address.mjs --only formats   one step
//   --raw DIR   where downloads live (default: <os tmpdir>/vamos-ui-world-address). Raw downloads are
//               never written inside the repository; only the normalised output is.
//
// Refresh once a year (or when a country changes its postal system): run with --download, review
// the diff (`git diff --stat`), run the tests, commit the output with the new `generated` dates.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORLD = path.join(PKG, "src/locale-data/world");
const STEPS = ["formats"];

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

if (values.download) {
  fs.mkdirSync(RAW, { recursive: true });
  if (only.includes("formats")) await downloadGoogle();
}
if (only.includes("formats")) buildFormats();
