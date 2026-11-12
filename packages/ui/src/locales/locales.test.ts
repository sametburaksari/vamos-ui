import { en } from "./en";
import { tr } from "./tr";
import { de } from "./de";
import { fr } from "./fr";
import { es } from "./es";
import { ar } from "./ar";
import { blockLabels, blockLabelsTr, blockLabelsDe, blockLabelsFr, blockLabelsEs, blockLabelsAr } from "../blocks/labels";
import {
  site2Labels,
  site2LabelsTr,
  site2LabelsDe,
  site2LabelsFr,
  site2LabelsEs,
  site2LabelsAr,
} from "../blocks/site/shared/labels-2";
import { formatMessage } from "../lib/message-format";

type Dict = { [k: string]: string | Dict };

/** Flattens nested dictionaries to `ns.key → template`. */
function flatten(d: Dict, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [k, v] of Object.entries(d)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.set(key, v);
    else for (const [kk, vv] of flatten(v, key)) out.set(kk, vv);
  }
  return out;
}

/** Index of the brace that closes the one at `open`. */
function closing(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return -1;
}

/** Placeholder names in an ICU-lite template, including those nested in plural/select branches. */
function placeholders(template: string, out = new Set<string>()): Set<string> {
  for (let i = 0; i < template.length; i++) {
    if (template[i] !== "{") continue;
    const end = closing(template, i);
    if (end < 0) break;
    const inner = template.slice(i + 1, end);
    const m = /^\s*([\w.-]+)\s*(?:,\s*(plural|selectordinal|select)\s*,([\s\S]*))?$/.exec(inner);
    if (m) {
      // Suffixed variants of a value (`timeTo`, `timeAt`) are the same value with a grammatical
      // case some languages need (Turkish "…'e kadar"); the block passes all of them.
      out.add(m[1]!.replace(/^(time)(To|At)$/, "$1"));
      const branches = m[3];
      if (branches) {
        for (let j = 0; j < branches.length; j++) {
          if (branches[j] !== "{") continue;
          const e = closing(branches, j);
          if (e < 0) break;
          placeholders(branches.slice(j + 1, e), out);
          j = e;
        }
      }
    }
    i = end;
  }
  return out;
}

const sorted = (s: Set<string>) => [...s].sort();

function checkLocale(name: string, base: Dict, dict: Dict, intlLocale: string) {
  const ref = flatten(base);
  const got = flatten(dict);
  it(`${name}: has every key and nothing extra`, () => {
    expect([...got.keys()].filter((k) => !ref.has(k))).toEqual([]);
    expect([...ref.keys()].filter((k) => !got.has(k))).toEqual([]);
  });
  it(`${name}: keeps every placeholder`, () => {
    const bad: string[] = [];
    for (const [k, v] of ref) {
      const t = got.get(k);
      if (t === undefined) continue;
      const a = sorted(placeholders(v));
      const b = sorted(placeholders(t));
      if (a.join() !== b.join()) bad.push(`${k}: ${a.join(",")} ≠ ${b.join(",")}`);
    }
    expect(bad).toEqual([]);
  });
  it(`${name}: every template formats without throwing`, () => {
    for (const [, v] of got) expect(() => formatMessage(v, { count: 2, total: 5 }, intlLocale)).not.toThrow();
  });
}

const locales = [
  ["tr", "tr-TR", tr, blockLabelsTr, site2LabelsTr],
  ["de", "de-DE", de, blockLabelsDe, site2LabelsDe],
  ["fr", "fr-FR", fr, blockLabelsFr, site2LabelsFr],
  ["es", "es-ES", es, blockLabelsEs, site2LabelsEs],
  ["ar", "ar", ar, blockLabelsAr, site2LabelsAr],
] as const;

describe("built-in label locales", () => {
  for (const [code, tag, messages, blocks, site2] of locales) {
    checkLocale(`messages/${code}`, en as unknown as Dict, messages as unknown as Dict, tag);
    checkLocale(`blockLabels/${code}`, blockLabels, blocks, tag);
    checkLocale(`site2Labels/${code}`, site2Labels, site2, tag);
  }

  it("finds placeholders inside plural branches", () => {
    expect(sorted(placeholders("{count, plural, one {# by {name}} other {# by {name} and {rest}}}"))).toEqual(["count", "name", "rest"]);
    expect(sorted(placeholders("{role, select, admin {Administrator} other {Member}}"))).toEqual(["role"]);
  });
});
