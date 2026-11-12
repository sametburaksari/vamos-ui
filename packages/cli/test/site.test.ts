import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { planEssentials } from "../src/core/site";
import { collectRoutes, internalHrefs, verifyProject } from "../src/site-check";

const footer = `import { Footer } from "@vamos-ui/react/blocks";
export const F = () => <Footer brand={{ name: "Kıyı" }} legalLinks={[{ href: "/privacy", label: "Privacy" }, { href: "/kvkk", label: "KVKK" }]} />;`;

describe("collectRoutes / internalHrefs", () => {
  it("maps app/ pages to routes: groups and slots add no segment, private folders are skipped", () => {
    const { routes, appDir } = collectRoutes(["src/app/page.tsx", "src/app/(legal)/privacy/page.tsx", "src/app/blog/[slug]/page.tsx", "src/app/_parts/x/page.tsx", "src/app/@modal/login/page.tsx"]);
    expect(appDir).toBe("src/app");
    expect(routes.map((r) => r.segments.join("/"))).toEqual(["", "privacy", "blog/[slug]", "login"]);
  });

  it("finds internal hrefs in attributes and objects, without query or hash", () => {
    const hrefs = internalHrefs(`<a href="/menu?x=1">M</a>; const l = { href: "/kvkk#haklar" }; <Link href={"/about"} />; const src = "/img.jpg"; <a href="https://x.dev/y" />`);
    expect(hrefs.map((h) => h.path)).toEqual(["/menu", "/kvkk", "/about"]);
  });
});

describe("verifyProject", () => {
  it("warns about links to routes without a page and honours dynamic routes and public files", () => {
    const issues = verifyProject({
      paths: ["src/app/page.tsx", "src/app/layout.tsx", "src/app/blog/[slug]/page.tsx", "public/menu.pdf", "src/components/f.tsx"],
      sources: [{ path: "src/components/f.tsx", content: `${footer}\n<a href="/blog/first-post">B</a><a href="/menu.pdf">PDF</a><a href="/">Home</a>` }],
    });
    const missing = issues.filter((i) => i.rule === "missing-route");
    expect(missing.map((i) => i.message)).toEqual([expect.stringContaining("/privacy"), expect.stringContaining("/kvkk")]);
    expect(missing[0]!.fix).toContain("vamos-ui site essentials");
    expect(missing[0]).toMatchObject({ file: "src/components/f.tsx", line: 2 });
  });

  it("asks a website for robots, sitemap, metadataBase, Open Graph and canonical", () => {
    const issues = verifyProject({
      paths: ["app/page.tsx", "app/layout.tsx", "components/blocks/site-spa-01/page.tsx"],
      sources: [{ path: "app/layout.tsx", content: `export const metadata = { title: "x" };` }],
    }).filter((i) => i.rule === "site-essentials");
    const text = issues.map((i) => i.message).join("\n");
    for (const word of ["robots", "sitemap", "metadataBase", "openGraph", "canonical", "JSON-LD"]) expect(text).toContain(word);
  });

  it("is quiet for a complete site and for apps that are not websites", () => {
    const layout = `export const metadata = { metadataBase: new URL("https://kiyi.com.tr"), alternates: { canonical: "/" }, openGraph: { siteName: "Kıyı" } };`;
    const site = verifyProject({
      paths: ["app/page.tsx", "app/layout.tsx", "app/robots.ts", "app/sitemap.ts", "app/privacy/page.tsx", "app/kvkk/page.tsx", "components/blocks/site-spa-01/page.tsx"],
      sources: [{ path: "app/layout.tsx", content: layout }, { path: "components/f.tsx", content: footer }],
    });
    expect(site).toEqual([]);
    const dashboard = verifyProject({ paths: ["app/page.tsx", "app/layout.tsx"], sources: [{ path: "app/page.tsx", content: `<a href="/">Home</a>` }] });
    expect(dashboard).toEqual([]);
  });
});

describe("planEssentials", () => {
  let dir: string;
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const write = (rel: string, content: string) => {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), content);
  };

  it("writes robots, sitemap and a legal page per linked legal route (English and Turkish slugs), never an existing file", () => {
    dir = mkdtempSync(path.join(tmpdir(), "vamos-site-"));
    write("src/app/layout.tsx", `export const metadata = { title: "x" };`);
    write("src/app/page.tsx", `export default function P() { return null; }`);
    write("src/app/terms/page.tsx", `export default function T() { return null; }`);
    write(
      "src/components/blocks/site-spa-01/components/spa-site.tsx",
      `const l = [{ href: "/gizlilik" }, { href: "/kvkk" }, { href: "/cerez-politikasi" }, { href: "/terms" }, { href: "/iade" }];`,
    );
    const plan = planEssentials(dir, { blocksDir: "src/components/blocks" }, { alias: { alias: "@", target: "src" } });
    expect(plan.files.map((f) => f.path)).toEqual([
      "src/app/site.ts",
      "src/app/robots.ts",
      "src/app/sitemap.ts",
      "src/app/cerez-politikasi/page.tsx",
      "src/app/gizlilik/page.tsx",
      "src/app/kvkk/page.tsx",
    ]);
    const gizlilik = plan.files.find((f) => f.path === "src/app/gizlilik/page.tsx")!.content;
    expect(gizlilik).toContain(`import Legal01 from "@/components/blocks/legal-01/page";`);
    expect(gizlilik).toContain(`legalPreset("privacy", "tr")`);
    expect(gizlilik).toContain(`canonical: "/gizlilik"`);
    const siteTs = plan.files[0]!.content;
    for (const r of ["/", "/gizlilik", "/kvkk", "/cerez-politikasi", "/terms"]) expect(siteTs).toContain(`"${r}"`);
    expect(siteTs).not.toContain("/iade");
    expect(plan.unmatched).toEqual(["/iade"]);
    expect(plan.layoutMissing).toEqual(["metadataBase", "alternates", "openGraph"]);

    write("public/robots.txt", "User-agent: *\n");
    write("src/app/kvkk/page.tsx", "export default function K() { return null; }");
    const again = planEssentials(dir, { blocksDir: "src/components/blocks" }, { alias: null });
    expect(again.files.map((f) => f.path)).not.toContain("src/app/robots.ts");
    expect(again.files.map((f) => f.path)).not.toContain("src/app/kvkk/page.tsx");
    expect(again.files.find((f) => f.path === "src/app/gizlilik/page.tsx")!.content).toContain(`from "../../components/blocks/legal-01/page"`);
    expect(readFileSync(path.join(dir, "src/app/kvkk/page.tsx"), "utf8")).toContain("function K");
  });
});
