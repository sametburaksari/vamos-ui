// @ts-check
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  cell,
  findBrokenRelated,
  firstSentence,
  groupBy,
  loadFromRegistry,
  loadFromSource,
  main,
  parseArgs,
  parseBlockMeta,
  parseDocEntry,
  readStringLiteral,
  renderBlocks,
  renderComponents,
} from "./build-catalog.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const temps = /** @type {string[]} */ ([]);
/** A competitor name the naming rule forbids; assembled so this file does not contain it. */
const FORBIDDEN = ["sha", "dcn"].join("");

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vamos-catalog-"));
  temps.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of temps.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

const guidance = { whenToUse: ["More than 10 options."], avoidWhen: ["Fewer than 6 options — use Radio Group."], related: ["select"], a11y: ["Label it."] };

describe("string parsing", () => {
  it("reads double, single and template literals with escapes", () => {
    expect(readStringLiteral('"a \\"b\\" c"', 0)).toBe('a "b" c');
    expect(readStringLiteral("'it\\'s'", 0)).toBe("it's");
    expect(readStringLiteral("`multi\nline`", 0)).toBe("multi\nline");
    expect(readStringLiteral('"\\u00e7"', 0)).toBe("ç");
    expect(readStringLiteral("x", 0)).toBeNull();
    expect(readStringLiteral('"unterminated', 0)).toBeNull();
  });

  it("parses a docs entry and skips prop tables declared above it", () => {
    const src = `const base = [{ name: "x", description: "Prop text, not the entry." }];
const entry: DocEntry = {
  slug: "formatted-input",
  title: "Formatted inputs",
  group: "Forms & inputs",
  description:
    "Business inputs that format while you type — money, \\"IBAN\\".",
};`;
    expect(parseDocEntry(src)).toEqual({
      slug: "formatted-input",
      title: "Formatted inputs",
      group: "Forms & inputs",
      description: 'Business inputs that format while you type — money, "IBAN".',
    });
    expect(parseDocEntry("export const x = 1;")).toBeNull();
  });

  it("parses block meta with tags", () => {
    const meta = parseBlockMeta(`const meta: BlockMeta = { title: "Posts list", description: "CMS posts index.", category: "List pages", order: 10, tags: ["cms", 'crm'], files: [] };`);
    expect(meta).toEqual({ title: "Posts list", description: "CMS posts index.", category: "List pages", tags: ["cms", "crm"] });
  });
});

describe("text helpers", () => {
  it("takes the first sentence, joining very short ones", () => {
    expect(firstSentence("Triggers an action. Eight variants, nine sizes. More.")).toBe("Triggers an action. Eight variants, nine sizes.");
    expect(firstSentence("A hairline divider, e.g. between card sections. Second.")).toBe("A hairline divider, e.g. between card sections.");
  });

  it("caps long text on a word boundary", () => {
    const long = `${"word ".repeat(60)}end.`;
    const out = firstSentence(long, 100);
    expect(out.length).toBeLessThanOrEqual(101);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });

  it("escapes table cells", () => {
    expect(cell("a | b\nc")).toBe("a \\| b c");
  });

  it("groups by a known order, then alphabetically", () => {
    const groups = groupBy([{ g: "Zeta" }, { g: "Charts" }, { g: "Alpha" }, { g: "Foundations" }], (r) => r.g, ["Foundations", "Charts"]);
    expect(groups.map(([k]) => k)).toEqual(["Foundations", "Charts", "Alpha", "Zeta"]);
  });
});

describe("rendering", () => {
  const catalog = {
    source: /** @type {const} */ ("source"),
    components: [
      { name: "select", title: "Select", description: "Pick one of a small set.", group: "Forms & inputs", docs: "https://ui.vamos.ist/docs/components/select", guidance: { ...guidance, related: ["combobox"] } },
      { name: "combobox", title: "Combobox", description: "Searchable selection | with chips.", group: "Forms & inputs", docs: "https://ui.vamos.ist/docs/components/combobox", guidance },
      { name: "button", title: "Button", description: "Triggers an action.", group: "Foundations", docs: "https://ui.vamos.ist/docs/components/button" },
    ],
    blocks: [{ name: "list-01", title: "Posts list", description: "CMS posts index.", category: "List pages", tags: ["cms"], docs: "https://ui.vamos.ist/blocks#list-01", guidance: { ...guidance, related: ["missing-item"] } }],
  };

  it("renders a grouped component table with guidance columns", () => {
    const md = renderComponents(catalog);
    expect(md).toContain("3 components.");
    expect(md.indexOf("## Foundations")).toBeLessThan(md.indexOf("## Forms & inputs"));
    expect(md).toContain("| [`combobox`](https://ui.vamos.ist/docs/components/combobox) | Searchable selection \\| with chips. | More than 10 options. | Fewer than 6 options — use Radio Group. | `select` |");
    expect(md).toContain("| [`button`](https://ui.vamos.ist/docs/components/button) | Triggers an action. | — | — | — |");
    expect(md.indexOf("`combobox`")).toBeLessThan(md.indexOf("[`select`]"));
    expect(md.toLowerCase()).not.toContain(FORBIDDEN);
  });

  it("renders blocks with tags and title", () => {
    const md = renderBlocks(catalog);
    expect(md).toContain("## List pages");
    expect(md).toContain("[`list-01`](https://ui.vamos.ist/blocks#list-01) <sub>cms</sub> | **Posts list** — CMS posts index.");
  });

  it("reports related names that do not exist", () => {
    expect(findBrokenRelated(catalog)).toEqual(["list-01 → missing-item"]);
  });
});

describe("loading", () => {
  it("loads from a registry directory, falling back to guidance files", () => {
    const dir = tempDir();
    const gdir = tempDir();
    fs.writeFileSync(
      path.join(dir, "index.json"),
      JSON.stringify({
        name: "vamos-ui",
        items: [
          { name: "combobox", type: "component", title: "Combobox", description: "Search.", group: "Forms & inputs", docs: "https://ui.vamos.ist/docs/components/combobox" },
          { name: "list-01", type: "block", title: "Posts list", description: "CMS.", category: "List pages", tags: ["cms"], docs: "https://ui.vamos.ist/blocks#list-01" },
          { name: "lib-utils", type: "lib", title: "utils", description: "", docs: "" },
          { name: "styles", type: "style", title: "Styles", description: "", docs: "" },
        ],
      }),
    );
    fs.writeFileSync(path.join(dir, "combobox.json"), JSON.stringify({ name: "combobox", guidance }));
    fs.writeFileSync(path.join(gdir, "list-01.json"), JSON.stringify({ ...guidance, related: ["combobox"] }));
    const catalog = loadFromRegistry(dir, gdir);
    expect(catalog.source).toBe("registry");
    expect(catalog.components.map((c) => c.name)).toEqual(["combobox"]);
    expect(catalog.components[0].guidance).toEqual(guidance);
    expect(catalog.blocks[0]).toMatchObject({ name: "list-01", category: "List pages", tags: ["cms"], guidance: { related: ["combobox"] } });
  });

  it("loads the real source tree with guidance for every entry and block", () => {
    const catalog = loadFromSource(repoRoot);
    expect(catalog.components.length).toBeGreaterThan(100);
    expect(catalog.blocks.length).toBeGreaterThan(30);
    const withoutGuidance = [...catalog.components, ...catalog.blocks].filter((r) => !r.guidance).map((r) => r.name);
    expect(withoutGuidance).toEqual([]);
    expect(findBrokenRelated(catalog)).toEqual([]);
    const combobox = catalog.components.find((c) => c.name === "combobox");
    expect(combobox?.group).toBe("Forms & inputs");
    const formatted = catalog.components.find((c) => c.name === "formatted-input");
    expect(formatted?.description).toMatch(/^Business inputs/);
    for (const row of [...catalog.components, ...catalog.blocks]) {
      expect(row.description.length, row.name).toBeGreaterThan(10);
    }
  });
});

describe("guidance files", () => {
  const dir = path.join(repoRoot, "registry/guidance");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  it("all have the contract shape and no forbidden names", () => {
    expect(files.length).toBeGreaterThan(150);
    for (const file of files) {
      const text = fs.readFileSync(path.join(dir, file), "utf8");
      expect(text.toLowerCase(), file).not.toContain(FORBIDDEN);
      const g = JSON.parse(text);
      expect(Object.keys(g).sort(), file).toEqual(["a11y", "avoidWhen", "related", "whenToUse"]);
      for (const key of ["whenToUse", "avoidWhen", "related", "a11y"]) {
        expect(Array.isArray(g[key]), `${file} ${key}`).toBe(true);
        for (const v of g[key]) expect(typeof v === "string" && v.trim().length > 0, `${file} ${key}`).toBe(true);
      }
      expect(g.whenToUse.length, file).toBeGreaterThan(0);
      expect(g.avoidWhen.length, file).toBeGreaterThan(0);
      expect(g.related.length, file).toBeGreaterThan(0);
      expect(g.related, file).not.toContain(file.replace(/\.json$/, ""));
    }
  });
});

describe("cli", () => {
  it("parses options and rejects unknown ones", () => {
    expect(parseArgs(["--source", "--out", "x"])).toMatchObject({ source: true, out: "x", check: false });
    expect(() => parseArgs(["--nope"])).toThrow(/Unknown option/);
    expect(() => parseArgs(["--out"])).toThrow(/needs a value/);
  });

  it("writes both files and --check passes afterwards", () => {
    const out = tempDir();
    const log = console.log;
    console.log = () => {};
    try {
      expect(main(["--root", repoRoot, "--source", "--out", out])).toBe(0);
      expect(fs.readFileSync(path.join(out, "components.md"), "utf8")).toContain("# Vamos UI — component catalog");
      expect(fs.readFileSync(path.join(out, "blocks.md"), "utf8")).toContain("## App shells");
      expect(main(["--root", repoRoot, "--source", "--out", out, "--check"])).toBe(0);
    } finally {
      console.log = log;
    }
  });
});
