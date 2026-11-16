export type CodeTokenKind = "keyword" | "string" | "number" | "comment" | "function" | "plain";
export interface CodeToken {
  kind: CodeTokenKind;
  text: string;
}

const HASH_COMMENTS = new Set(["py", "python", "rb", "ruby", "sh", "bash", "shell", "zsh", "console", "yaml", "yml", "toml", "r", "perl", "pl", "ps1", "powershell", "dockerfile", "makefile", "ini", "conf", "elixir", "ex", "nginx"]);
const DASH_COMMENTS = new Set(["sql", "lua", "haskell", "hs"]);
const MARKUP = new Set(["html", "xml", "svg", "vue", "markup"]);

const KEYWORDS = new Set(
  (
    "abstract as async await break case catch class const continue def default defer del delete do elif else enum except export extends false final finally fn for from func function go if impl implements import in instanceof interface is let loop match module mut new nil none not null of or and package private protected pub public raise return self static struct super switch then this throw throws trait true try type typeof undefined unless use var void while with yield " +
    "None True False echo exit local readonly"
  ).split(" "),
);
const SQL_KEYWORDS = new Set(
  "select from where and or not null is in insert into values update set delete create table index view primary key foreign references unique default on join left right inner outer group by order having limit offset as returning distinct case when then else end begin commit rollback alter add drop exists like between union all with conflict do nothing".split(" "),
);

function tokenPattern(language: string): RegExp {
  const lang = language.toLowerCase();
  const comment = HASH_COMMENTS.has(lang)
    ? String.raw`#[^\n]*`
    : DASH_COMMENTS.has(lang)
      ? String.raw`--[^\n]*|\/\*[\s\S]*?\*\/`
      : MARKUP.has(lang)
        ? String.raw`<!--[\s\S]*?-->`
        : String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`;
  // comment | string | number | word
  return new RegExp(String.raw`(${comment})|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|` + "`(?:\\\\.|[^`\\\\])*`" + String.raw`)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b|\b0x[\da-f]+\b)|([A-Za-z_$][\w$]*)`, "gi");
}

/**
 * Splits code into lines of coloured tokens: comments, strings, numbers, keywords and calls.
 * Language-agnostic by design (comment syntax follows `language`); good enough for samples on a
 * website. For full grammars pass a `highlight` adapter (Shiki, Prism…) to CodeBlock instead.
 */
export function highlightCode(code: string, language = ""): CodeToken[][] {
  const lang = language.toLowerCase();
  const sql = lang === "sql";
  const markup = MARKUP.has(lang);
  const flat: CodeToken[] = [];
  let last = 0;
  for (const m of code.matchAll(tokenPattern(lang))) {
    const at = m.index ?? 0;
    if (at > last) flat.push({ kind: "plain", text: code.slice(last, at) });
    const [text, com, str, num, word] = m;
    let kind: CodeTokenKind = "plain";
    if (com) kind = "comment";
    else if (str) kind = lang === "rust" && str.startsWith("'") && str.length > 3 ? "plain" : "string";
    else if (num) kind = "number";
    else if (word && !markup) {
      if (sql ? SQL_KEYWORDS.has(word.toLowerCase()) : KEYWORDS.has(word)) kind = "keyword";
      else if (code[at + word.length] === "(") kind = "function";
    }
    flat.push({ kind, text });
    last = at + text.length;
  }
  if (last < code.length) flat.push({ kind: "plain", text: code.slice(last) });

  // Split tokens on newlines so multi-line comments and strings keep their colour on every line.
  const lines: CodeToken[][] = [[]];
  for (const tk of flat) {
    const parts = tk.text.split("\n");
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1]!.push({ kind: tk.kind, text: p });
    });
  }
  return lines;
}

/** "1,4-6" / [1, [4, 6]] → Set of 1-based line numbers. */
export function parseLineRanges(lines: string | (number | [number, number])[] | undefined): Set<number> {
  const out = new Set<number>();
  if (!lines) return out;
  const items = typeof lines === "string" ? lines.split(/[\s,]+/).filter(Boolean) : lines;
  for (const item of items) {
    let from: number;
    let to: number;
    if (Array.isArray(item)) [from, to] = item;
    else if (typeof item === "number") from = to = item;
    else {
      const [a, b] = item.split("-").map(Number);
      from = a!;
      to = b ?? a!;
    }
    if (!Number.isFinite(from) || !Number.isFinite(to)) continue;
    for (let n = Math.min(from, to); n <= Math.max(from, to); n++) out.add(n);
  }
  return out;
}
