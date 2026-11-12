import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { LEGAL_SLUGS, planEssentials } from "../src/core/site";
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

  it("points e-commerce legal links without a page to site essentials", () => {
    const content = `<a href="/mesafeli-satis-sozlesmesi">M</a><a href="/iade">I</a><a href="/imprint">L</a><a href="/hakkimizda">H</a>`;
    const missing = verifyProject({ paths: ["app/page.tsx", "app/x.tsx"], sources: [{ path: "app/x.tsx", content }] }).filter((i) => i.rule === "missing-route");
    expect(missing.map((i) => i.fix?.includes("site essentials"))).toEqual([true, true, true, false]);
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
      `const l = [{ href: "/gizlilik" }, { href: "/kvkk" }, { href: "/cerez-politikasi" }, { href: "/terms" }, { href: "/hakkimizda" }];`,
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
    expect(siteTs).not.toContain("/hakkimizda");
    expect(plan.unmatched).toEqual(["/hakkimizda"]);
    expect(plan.layoutMissing).toEqual(["metadataBase", "alternates", "openGraph"]);

    write("public/robots.txt", "User-agent: *\n");
    write("src/app/kvkk/page.tsx", "export default function K() { return null; }");
    const again = planEssentials(dir, { blocksDir: "src/components/blocks" }, { alias: null });
    expect(again.files.map((f) => f.path)).not.toContain("src/app/robots.ts");
    expect(again.files.map((f) => f.path)).not.toContain("src/app/kvkk/page.tsx");
    expect(again.files.find((f) => f.path === "src/app/gizlilik/page.tsx")!.content).toContain(`from "../../components/blocks/legal-01/page"`);
    expect(readFileSync(path.join(dir, "src/app/kvkk/page.tsx"), "utf8")).toContain("function K");
  });

  it("writes the e-commerce legal pages (returns, distance sales, pre-information, legal notice) from their slugs", () => {
    dir = mkdtempSync(path.join(tmpdir(), "vamos-site-"));
    write("app/layout.tsx", `export const metadata = { title: "x" };`);
    write("app/page.tsx", `export default function P() { return null; }`);
    write(
      "components/blocks/site-store-01/components/store-site.tsx",
      `const l = [{ href: "/mesafeli-satis-sozlesmesi" }, { href: "/on-bilgilendirme-formu" }, { href: "/iade" }, { href: "/yasal-uyari" }, { href: "/refund-policy" }, { href: "/imprint" }];`,
    );
    const plan = planEssentials(dir, { blocksDir: "components/blocks" }, { alias: null });
    const pages = Object.fromEntries(plan.files.filter((f) => f.path.endsWith("/page.tsx")).map((f) => [f.path, f.content]));
    expect(Object.keys(pages).sort()).toEqual([
      "app/iade/page.tsx",
      "app/imprint/page.tsx",
      "app/mesafeli-satis-sozlesmesi/page.tsx",
      "app/on-bilgilendirme-formu/page.tsx",
      "app/refund-policy/page.tsx",
      "app/yasal-uyari/page.tsx",
    ]);
    expect(pages["app/mesafeli-satis-sozlesmesi/page.tsx"]).toContain(`legalPreset("distance-sales", "tr")`);
    expect(pages["app/mesafeli-satis-sozlesmesi/page.tsx"]).toContain(`canonical: "/mesafeli-satis-sozlesmesi"`);
    expect(pages["app/on-bilgilendirme-formu/page.tsx"]).toContain(`legalPreset("pre-information", "tr")`);
    expect(pages["app/iade/page.tsx"]).toContain(`legalPreset("returns", "tr")`);
    expect(pages["app/refund-policy/page.tsx"]).toContain(`legalPreset("returns", "en")`);
    expect(pages["app/yasal-uyari/page.tsx"]).toContain(`legalPreset("legal-notice", "tr")`);
    expect(pages["app/imprint/page.tsx"]).toContain(`legalPreset("legal-notice", "en")`);
    expect(plan.unmatched).toEqual([]);
  });

  it("knows every legal-01 slug (kept in step with the block's legalSlugs)", () => {
    const block = readFileSync(path.join(__dirname, "../../../apps/www/src/blocks/legal-01/components/types.ts"), "utf8");
    const map = block.slice(block.indexOf("export const legalSlugs"));
    const entries = [...map.matchAll(/^\s+"?([a-z0-9-]+)"?: \{ kind: "([a-z-]+)", locale: "(en|tr)" \}/gm)].map((m) => [m[1], { kind: m[2], locale: m[3] }]);
    expect(entries.length).toBeGreaterThan(30);
    expect(LEGAL_SLUGS).toEqual(Object.fromEntries(entries));
  });
});

describe("meta-length and image-weight", () => {
  const base = ["app/page.tsx", "app/layout.tsx", "app/robots.ts", "app/sitemap.ts", "components/blocks/site-spa-01/page.tsx"];
  const layout = `export const metadata = { metadataBase: new URL("https://kiyi.com.tr"), alternates: { canonical: "/" }, openGraph: { siteName: "Kıyı" } };`;

  it("flags short or long descriptions and long titles in metadata only", () => {
    const page = [
      `const cards = [{ title: "A card title that is fine to be very long because it is content, not metadata", description: "Short" }];`,
      `export const metadata = {`,
      `  title: { default: "Ceramics studio, wheel classes and glaze workshops in Kadıköy, İstanbul", template: "%s · Kiln" },`,
      `  description: "Pottery.",`,
      `};`,
    ].join("\n");
    const issues = verifyProject({ paths: base, sources: [{ path: "app/layout.tsx", content: layout }, { path: "app/page.tsx", content: page }] }).filter((i) => i.rule === "meta-length");
    expect(issues.map((i) => i.line)).toEqual([3, 4]);
    expect(issues[0]!.message).toContain("Title is");
    expect(issues[1]!.message).toContain("Meta description is 8 characters");
  });

  it("accepts good lengths and skips dynamic values", () => {
    const page = `export async function generateMetadata() { return { title: \`\${post.title} · Kiln\`, description: "Wheel classes for beginners every Tuesday evening, clay and firing included, max six people." }; }`;
    const issues = verifyProject({ paths: base, sources: [{ path: "app/layout.tsx", content: layout }, { path: "app/page.tsx", content: page }] });
    expect(issues.filter((i) => i.rule === "meta-length")).toEqual([]);
  });

  it("warns about heavy images in public/ when sizes are given", () => {
    const issues = verifyProject({
      paths: ["app/page.tsx", "public/hero.jpg", "public/logo.svg", "public/small.webp"],
      sources: [],
      sizes: { "public/hero.jpg": 2_400_000, "public/logo.svg": 900_000, "public/small.webp": 80_000 },
    });
    expect(issues.map((i) => [i.rule, i.file])).toEqual([["image-weight", "public/hero.jpg"]]);
    expect(issues[0]!.message).toContain("2.3 MB");
  });
});
