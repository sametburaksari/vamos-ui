import { describe, expect, it } from "vitest";
import { VERIFY_RULES, verifySource } from "../src/verify";

const rules = (code: string, file = "src/components/x.tsx") => verifySource(code, file).map((i) => i.rule);
const has = (code: string, rule: string, file?: string) => rules(code, file).includes(rule);

describe("raw-color", () => {
  it.each([
    [`<div className="bg-blue-500" />`],
    [`<div className="hover:text-zinc-900 p-2" />`],
    [`<div className="md:dark-x border-t-slate-200/50" />`],
    [`const v = cva("ring-red-600")`],
    [`const styles = { primary: "bg-emerald-50 text-emerald-950" }`],
    [`<div className="bg-[#ff0000]" />`],
    [`<div className="text-[rgb(0_0_0)]" />`],
    [`<div className="bg-[oklch(0.7_0.1_200)]" />`],
    [`<div style={{ color: "#fff" }} />`],
    [`<div style={{ background: "rgb(0 0 0 / 50%)" }} />`],
    [`<div style={{ borderColor: 'hsl(200 50% 50%)' }} />`],
    [`<div style="color: #abcdef"></div>`],
  ])("flags %s", (code) => {
    expect(has(code, "raw-color")).toBe(true);
  });

  it.each([
    [`<div className="bg-surface text-fg border-line" />`],
    [`<div className="bg-accent text-accent-fg hover:bg-hover" />`],
    [`<div className="text-danger bg-accent-soft" />`],
    [`<div style={{ color: "var(--fg-muted)" }} />`],
    [`<a href="#top">Top</a>`],
    [`const id = "#section-2";`],
    [`// bg-blue-500 in a comment\n<div className="bg-surface" />`],
    [`<div className="grid-cols-[1fr_auto]" />`],
    [`import x from "./bg-blue-500";`],
  ])("allows %s", (code) => {
    expect(has(code, "raw-color")).toBe(false);
  });

  it("reports white/black as a warning, palette as an error", () => {
    const issues = verifySource(`<div className="text-white bg-red-500" />`, "a.tsx");
    expect(issues.find((i) => i.message.includes("text-white"))?.severity).toBe("warning");
    expect(issues.find((i) => i.message.includes("bg-red-500"))?.severity).toBe("error");
  });

  it("gives a token fix and the right position", () => {
    const [issue] = verifySource(`const a = 1;\n  <p className="text-gray-500">x</p>`, "a.tsx");
    expect(issue).toMatchObject({ rule: "raw-color", line: 2, column: 17 });
    expect(issue!.fix).toContain("text-fg-muted");
  });
});

describe("no-dark-variant", () => {
  it("flags dark: classes", () => {
    expect(has(`<div className="bg-surface dark:bg-surface-2" />`, "no-dark-variant")).toBe(true);
    expect(has(`cn("md:dark:text-fg")`, "no-dark-variant")).toBe(true);
  });
  it("ignores plain words", () => {
    expect(has(`const q = "(prefers-color-scheme: dark)";`, "no-dark-variant")).toBe(false);
    expect(has(`<html className="dark">`, "no-dark-variant")).toBe(false);
  });
});

describe("no-hardcoded-font", () => {
  it.each([
    [`<p style={{ fontFamily: "Inter, sans-serif" }} />`],
    [`<p className="font-['Inter']" />`],
    [`<p className="font-[Arial]" />`],
    [`const css = "font-family: Roboto";`],
    [`import { Inter } from "next/font/google";`],
  ])("flags %s", (code) => {
    expect(has(code, "no-hardcoded-font")).toBe(true);
  });
  it.each([
    [`<p className="font-sans font-semibold" />`],
    [`<p className="font-display" />`],
    [`<p style={{ fontFamily: "var(--font-heading)" }} />`],
    [`<p>Inter-company transfers</p>`],
    [`<p className="font-[550]" />`],
    [`<p className="font-[inherit]" />`],
    [`<p style={{ fontFamily: fontStack(font.family) }} />`],
  ])("allows %s", (code) => {
    expect(has(code, "no-hardcoded-font")).toBe(false);
  });
});

describe("icon-button-label", () => {
  it.each([
    [`<Button><Trash2 /></Button>`],
    [`<button onClick={go}><svg viewBox="0 0 1 1"><path d="M0" /></svg></button>`],
    [`<Button variant="ghost">\n  <X className="size-4" />\n</Button>`],
    [`<IconButton><Trash2 /></IconButton>`],
    [`<Button icon={<Plus />} />`],
    [`import { Trash2 } from "lucide-react";\nimport { Button } from "@/components/vamos";\n<Button><Trash2 /></Button>`],
    [`import { Trash } from "@phosphor-icons/react";\n<button><Trash /></button>`],
  ])("flags %s", (code) => {
    expect(has(code, "icon-button-label")).toBe(true);
  });
  it.each([
    [`<Button aria-label="Delete"><Trash2 /></Button>`],
    [`<IconButton label="Delete"><Trash2 /></IconButton>`],
    [`<Button><Trash2 /> Delete</Button>`],
    [`<Button><Trash2 /><span className="sr-only">Delete</span></Button>`],
    [`<Button>{t("save")}</Button>`],
    [`<Button {...props}><X /></Button>`],
    [`<button title="Close"><X /></button>`],
    [`<Button>Save</Button>`],
    [`import { FileName } from "./file-name";\n<button onClick={open}><FileName name={f} /></button>`],
    [`function Label() { return null }\n<Button><Label /></Button>`],
    [`<button aria-hidden tabIndex={-1} onClick={t}><Chevron /></button>`],
  ])("allows %s", (code) => {
    expect(has(code, "icon-button-label")).toBe(false);
  });
});

describe("img-alt", () => {
  it("flags missing alt", () => {
    expect(has(`<img src="/a.png" />`, "img-alt")).toBe(true);
    expect(has(`<Image src={hero} width={10} height={10} />`, "img-alt")).toBe(true);
  });
  it("allows alt, empty alt and spreads", () => {
    expect(has(`<img src="/a.png" alt="" />`, "img-alt")).toBe(false);
    expect(has(`<Image src={hero} alt={title} />`, "img-alt")).toBe(false);
    expect(has(`<img {...rest} />`, "img-alt")).toBe(false);
  });
});

describe("click-events-interactive", () => {
  it("flags onClick on a div or li without role and tabIndex", () => {
    expect(has(`<div onClick={open}>Open</div>`, "click-events-interactive")).toBe(true);
    expect(has(`<li onClick={() => pick(x)} role="listitem">x</li>`, "click-events-interactive")).toBe(true);
  });
  it("allows buttons, links, components and fully wired elements", () => {
    expect(has(`<button onClick={open}>Open</button>`, "click-events-interactive")).toBe(false);
    expect(has(`<a onClick={open} href="#">Open</a>`, "click-events-interactive")).toBe(false);
    expect(has(`<Card onClick={open}>Open</Card>`, "click-events-interactive")).toBe(false);
    expect(has(`<div role="button" tabIndex={0} onClick={open} onKeyDown={k}>Open</div>`, "click-events-interactive")).toBe(false);
  });
  it("skips aria-hidden affordances, composite options and stopPropagation guards", () => {
    expect(has(`<span aria-hidden onClick={toggle} />`, "click-events-interactive")).toBe(false);
    expect(has(`<li role="option" aria-selected={a} onClick={pick}>x</li>`, "click-events-interactive")).toBe(false);
    expect(has(`<div onClick={(e) => e.stopPropagation()}>x</div>`, "click-events-interactive")).toBe(false);
  });
  it("is not fooled by arrow functions inside attributes", () => {
    expect(rules(`<div className="x" onClick={() => a > b && go()} role="button" tabIndex={0}>x</div>`)).toEqual([]);
  });
});

describe("no-positive-tabindex", () => {
  it("flags positive values", () => {
    expect(has(`<div tabIndex={3} role="button" />`, "no-positive-tabindex")).toBe(true);
    expect(has(`<input tabindex="1">`, "no-positive-tabindex", "index.html")).toBe(true);
  });
  it("allows 0 and -1", () => {
    expect(has(`<div tabIndex={0} />`, "no-positive-tabindex")).toBe(false);
    expect(has(`<div tabIndex={-1} />`, "no-positive-tabindex")).toBe(false);
  });
});

describe("use-client", () => {
  const code = `import { useState } from "react";\nexport default function Page() {\n  const [a] = useState(0);\n  return <p>{a}</p>;\n}\n`;
  it("flags hooks in app/ without the directive", () => {
    expect(has(code, "use-client", "src/app/page.tsx")).toBe(true);
    expect(has(code.replace("useState(0)", "React.useEffect(() => {})"), "use-client", "app/dashboard/page.tsx")).toBe(true);
  });
  it("allows the directive (also after comments) and files outside app/", () => {
    expect(has(`"use client";\n${code}`, "use-client", "src/app/page.tsx")).toBe(false);
    expect(has(`// header\n'use client'\n${code}`, "use-client", "src/app/page.tsx")).toBe(false);
    expect(has(code, "use-client", "src/components/counter.tsx")).toBe(false);
    expect(has(`export default async function Page() { return <p /> }`, "use-client", "src/app/page.tsx")).toBe(false);
  });
});

describe("z-index-token", () => {
  it("flags arbitrary and large z values", () => {
    expect(has(`<div className="z-[999]" />`, "z-index-token")).toBe(true);
    expect(has(`<div className="z-50" />`, "z-index-token")).toBe(true);
    expect(has(`<div style={{ zIndex: 1000 }} />`, "z-index-token")).toBe(true);
  });
  it("allows tokens and local stacking", () => {
    expect(has(`<div className="z-(--z-overlay)" />`, "z-index-token")).toBe(false);
    expect(has(`<div className="z-[var(--z-popover)]" />`, "z-index-token")).toBe(false);
    expect(has(`<div className="z-10 -z-1" />`, "z-index-token")).toBe(false);
    expect(has(`<div style={{ zIndex: "var(--z-toast)" }} />`, "z-index-token")).toBe(false);
  });
});

describe("prefer-kit-component", () => {
  it.each([
    [`<div role="dialog" aria-modal="true">x</div>`],
    [`<div className="fixed inset-0 bg-overlay">x</div>`],
    [`<ul role="menu"><li role="menuitem">a</li></ul>`],
    [`<div role="tooltip">hint</div>`],
    [`<select><option>a</option></select>`],
    [`const [isModalOpen, setIsModalOpen] = useState(false);`],
    [`const [showDropdown, setShowDropdown] = React.useState(false);`],
  ])("hints for %s", (code) => {
    const issue = verifySource(code, "a.tsx").find((i) => i.rule === "prefer-kit-component");
    expect(issue?.severity).toBe("warning");
  });
  it("does not hint for kit components", () => {
    expect(has(`<Dialog open={open}><DialogContent>x</DialogContent></Dialog>`, "prefer-kit-component")).toBe(false);
    expect(has(`const [open, setOpen] = useState(false);`, "prefer-kit-component")).toBe(false);
  });
  it("reports each kind once per file", () => {
    const code = `<div role="dialog" /><div role="dialog" />`;
    expect(rules(code).filter((r) => r === "prefer-kit-component")).toHaveLength(1);
  });
});

describe("general behaviour", () => {
  it("returns no issues for idiomatic kit code", () => {
    const code = `"use client";
import * as React from "react";
import { Button, IconButton, Dialog, DialogContent } from "@/components/vamos";
import { Trash2 } from "lucide-react";

export function Row({ name }: { name: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center gap-2 rounded-ui bg-surface p-3 text-fg">
      <span className="text-fg-muted">{name}</span>
      <img src="/a.png" alt="" />
      <Button variant="primary" onClick={() => setOpen(true)}>Edit</Button>
      <IconButton label="Delete" variant="danger-ghost"><Trash2 /></IconButton>
      <Dialog open={open} onOpenChange={setOpen}><DialogContent>Don't panic</DialogContent></Dialog>
    </div>
  );
}
`;
    expect(verifySource(code, "src/app/row.tsx")).toEqual([]);
  });

  it("honours vamos-ui-ignore comments", () => {
    expect(rules(`// vamos-ui-ignore\n<div className="bg-blue-500" />`)).toEqual([]);
    expect(rules(`<div className="bg-blue-500" /> {/* vamos-ui-ignore */}`)).toEqual([]);
    expect(rules(`/* vamos-ui-ignore-file */\n<div className="bg-blue-500" />`)).toEqual([]);
  });

  it("survives apostrophes in JSX text", () => {
    expect(rules(`<p>Don't do this</p>\n<div className="bg-red-500" />`)).toContain("raw-color");
  });

  it("checks CSS files", () => {
    const issues = verifySource(`.a { color: #fff; font-family: Arial; z-index: 999; --brand: #123456; }`, "src/app.css");
    expect(issues.map((i) => i.rule).sort()).toEqual(["no-hardcoded-font", "raw-color", "z-index-token"]);
  });

  it("ignores unknown file types", () => {
    expect(verifySource(`bg-blue-500`, "README.txt")).toEqual([]);
  });

  it("only reports known rule ids with consistent default severities", () => {
    const ids = new Set(VERIFY_RULES.map((r) => r.id));
    const code = `<div onClick={x} className="bg-blue-500 dark:bg-x z-[99]"><img /><Button><X /></Button></div>`;
    for (const i of verifySource(code, "src/app/page.tsx")) expect(ids.has(i.rule)).toBe(true);
  });

  it("is fast on large files", () => {
    const chunk = `<div className="flex gap-2 bg-surface"><Button onClick={() => go()}>Save</Button><img src="/x" alt="" /></div>\n`;
    const big = chunk.repeat(5000);
    const t = performance.now();
    verifySource(big, "src/big.tsx");
    expect(performance.now() - t).toBeLessThan(1500);
  });
});
