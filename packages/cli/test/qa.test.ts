import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { barrelStatements, INDEX_HEADER, refreshIndexes } from "../src/core/indexes";
import { detectProject, stripJsonc } from "../src/core/project";

describe("stripJsonc", () => {
  it("keeps glob strings that look like comments (Next.js tsconfig)", () => {
    const text = `{
      // comment
      "compilerOptions": { "paths": { "@/*": ["./src/*"] }, /* block */ "url": "https://x.dev" },
      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx",],
    }`;
    const parsed = JSON.parse(stripJsonc(stripJsonc(text)));
    expect(parsed.compilerOptions.paths["@/*"]).toEqual(["./src/*"]);
    expect(parsed.compilerOptions.url).toBe("https://x.dev");
    expect(parsed.include).toEqual(["next-env.d.ts", "**/*.ts", "**/*.tsx"]);
  });
});

describe("project detection + barrel indexes", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "vamos-qa-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const write = (rel: string, content: string) => {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), content);
  };

  it("finds the @/* alias in a standard Next.js tsconfig", () => {
    write("package.json", JSON.stringify({ dependencies: { next: "15.5.4" } }));
    write("tsconfig.json", `{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } }, "include": ["**/*.ts", "**/*.tsx"] }`);
    write("src/app/page.tsx", "");
    expect(detectProject(dir).alias).toEqual({ alias: "@", target: "src" });
  });

  it("parses barrel statements", () => {
    const st = barrelStatements(`// header\nexport { z } from "zod";\nexport {\n  a,\n  type B,\n} from "./a";\n/* export * from "./gone"; */\nexport * from "./b";\n`);
    expect(st.map((s) => s.spec)).toEqual(["zod", "./a", "./b"]);
  });

  it("filters the kit's barrels to installed files and inlines lib/public", async () => {
    const ui = "src/components/vamos";
    write(`${ui}/lib/cn.ts`, "export const cn = () => '';");
    write(`${ui}/components/button.tsx`, "export const Button = 1;");
    write(`${ui}/blocks/schema/fields.ts`, "export const f = 1;");
    write(`${ui}/next/index.ts`, "export const real = 1;"); // a module an item owns
    const barrels = {
      "index.ts": `export * from "./lib/public";\nexport * from "./components/button";\nexport * from "./components/card";\n`,
      "lib/public.ts": `export { cn } from "./cn";\nexport { useLocale } from "./locale";\nexport { en } from "../locales/en";\n`,
      "blocks/schema/index.ts": `export { z } from "zod";\nexport { f } from "./fields";\nexport { lint } from "./lint";\n`,
      "media/index.ts": `export { z } from "zod";\nexport * from "./types";\n`,
      "next/index.ts": `export * from "./x";\n`,
    };
    const res = await refreshIndexes(dir, ui, { barrels, owned: new Set([`${ui}/next/index.ts`]) });
    const root = readFileSync(path.join(dir, ui, "index.ts"), "utf8");
    expect(root).toBe(`${INDEX_HEADER}\nexport { cn } from "./lib/cn";\nexport * from "./components/button";\n`);
    const schema = readFileSync(path.join(dir, ui, "blocks/schema/index.ts"), "utf8");
    expect(schema).toBe(`${INDEX_HEADER}\nexport { z } from "zod";\nexport { f } from "./fields";\n`);
    expect(existsSync(path.join(dir, ui, "media/index.ts"))).toBe(false);
    expect(readFileSync(path.join(dir, ui, "next/index.ts"), "utf8")).toBe("export const real = 1;");
    expect(res.kept).toEqual([]);
  });
});
