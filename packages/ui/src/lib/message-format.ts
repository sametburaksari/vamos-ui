/**
 * ICU-lite message formatting — React-free, ~no dependencies.
 *
 * Supported syntax:
 * - `{name}` — replaced with `vars.name` (numbers are formatted with the locale: 1250 → "1,250").
 * - `{count, plural, =0 {No files} one {# file} other {# files}}` — `Intl.PluralRules`; `#` is the formatted number.
 * - `{count, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`.
 * - `{role, select, admin {Administrator} other {Member}}`.
 *
 * Unknown placeholders are left as-is (`{name}`), so a missing variable is visible, not silent.
 */

const pluralCache = new Map<string, Intl.PluralRules>();
const numberCache = new Map<string, Intl.NumberFormat>();

function pluralRules(locale: string, type: Intl.PluralRuleType) {
  const k = locale + type;
  let r = pluralCache.get(k);
  if (!r) pluralCache.set(k, (r = new Intl.PluralRules(locale, { type })));
  return r;
}
function numberFormat(locale: string) {
  let f = numberCache.get(locale);
  if (!f) numberCache.set(locale, (f = new Intl.NumberFormat(locale)));
  return f;
}

/** Index of the `}` closing the `{` at `open`, or -1. */
function closing(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return -1;
}

function parseBranches(s: string): Map<string, string> {
  const out = new Map<string, string>();
  let i = 0;
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i]!)) i++;
    const start = i;
    while (i < s.length && s[i] !== "{" && !/\s/.test(s[i]!)) i++;
    const key = s.slice(start, i);
    while (i < s.length && /\s/.test(s[i]!)) i++;
    if (s[i] !== "{") break;
    const end = closing(s, i);
    if (end === -1) break;
    if (key) out.set(key, s.slice(i + 1, end));
    i = end + 1;
  }
  return out;
}

/**
 * Formats a message template.
 *
 * ```ts
 * formatMessage("Remove {label}", { label: "Design" }); // "Remove Design"
 * formatMessage("{count, plural, one {# reply} other {# replies}}", { count: 1250 }, "en-US"); // "1,250 replies"
 * ```
 */
export function formatMessage(template: string, vars: Record<string, unknown> = {}, locale = "en-US"): string {
  if (!template.includes("{")) return template;
  let out = "";
  let i = 0;
  while (i < template.length) {
    const open = template.indexOf("{", i);
    if (open === -1) {
      out += template.slice(i);
      break;
    }
    out += template.slice(i, open);
    const close = closing(template, open);
    if (close === -1) {
      out += template.slice(open);
      break;
    }
    const inner = template.slice(open + 1, close);
    const m = /^\s*([\w.-]+)\s*(?:,\s*(plural|selectordinal|select)\s*,([\s\S]*))?$/.exec(inner);
    if (!m) out += `{${inner}}`;
    else {
      const [, name, kind, rest] = m;
      const value = vars[name!];
      if (!kind) {
        out += value === undefined || value === null ? `{${name}}` : typeof value === "number" ? numberFormat(locale).format(value) : String(value);
      } else {
        const branches = parseBranches(rest ?? "");
        let branch: string | undefined;
        if (kind === "select") branch = branches.get(String(value)) ?? branches.get("other");
        else {
          const n = Number(value);
          branch =
            branches.get(`=${n}`) ??
            branches.get(pluralRules(locale, kind === "plural" ? "cardinal" : "ordinal").select(n)) ??
            branches.get("other");
          if (branch !== undefined) branch = branch.replace(/#/g, Number.isFinite(n) ? numberFormat(locale).format(n) : String(value));
        }
        out += branch === undefined ? "" : formatMessage(branch, vars, locale);
      }
    }
    i = close + 1;
  }
  return out;
}
