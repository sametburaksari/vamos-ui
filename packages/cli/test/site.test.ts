import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { run } from "../src/cli";
import { LEGAL_SLUGS, planEssentials } from "../src/core/site";
import { collectRoutes, internalHrefs, verifyProject } from "../src/site-check";
import { AI_BOTS, SITE_JSON_SCHEMA, SITE_SCHEMA, siteTemplate, type SiteInfo } from "../src/site-info";

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
      paths: ["app/page.tsx", "app/layout.tsx", "app/robots.ts", "app/sitemap.ts", "app/llms.txt/route.ts", "app/privacy/page.tsx", "app/kvkk/page.tsx", "components/blocks/site-spa-01/page.tsx"],
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
  const base = ["app/page.tsx", "app/layout.tsx", "app/robots.ts", "app/sitemap.ts", "public/llms.txt", "components/blocks/site-spa-01/page.tsx"];
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

/** A fictional business, filled in completely. */
const KIYI: SiteInfo = {
  $schema: SITE_SCHEMA,
  name: "Kıyı Seramik",
  legalName: "Kıyı Seramik Atölyesi Ltd. Şti.",
  description: "Wheel classes, glaze workshops and handmade tableware in a small ceramics studio by the sea.",
  url: "https://kiyiseramik.com.tr",
  locale: "tr-TR",
  type: "ProfessionalService",
  contact: { phone: "+90 216 555 01 23", whatsapp: "+90 555 555 01 23", email: "merhaba@kiyiseramik.com.tr" },
  address: { street: "Deniz Sk. 7", district: "Moda", city: "İstanbul", postalCode: "34710", country: "TR" },
  geo: { latitude: 40.98, longitude: 29.02 },
  openingHours: ["Tu-Sa 10:00-19:00"],
  social: ["https://instagram.com/kiyiseramik"],
  legal: { taxOffice: "Kadıköy", taxNumber: "1234567890", mersis: "0123456789000015", kep: "kiyiseramik@hs01.kep.tr", privacyEmail: "kvkk@kiyiseramik.com.tr" },
  ai: { services: [{ name: "Wheel class", description: "Four evenings, clay and firing included.", url: "/atolye" }], faq: [{ question: "Do I need experience?", answer: "No, the beginner class starts from zero." }] },
};

describe("vamos.site.json", () => {
  let dir = "";
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = "";
  });
  const write = (rel: string, content: string) => {
    mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    writeFileSync(path.join(dir, rel), content);
  };
  /** A Next.js site with the store block linking to a few legal pages. */
  const scaffold = (site?: SiteInfo | string) => {
    dir = mkdtempSync(path.join(tmpdir(), "vamos-sitejson-"));
    write("package.json", "{}");
    write("app/layout.tsx", `export const metadata = { title: "x" };`);
    write("app/page.tsx", `export default function P() { return null; }`);
    write("components/blocks/site-spa-01/components/spa-site.tsx", `const l = [{ href: "/gizlilik" }, { href: "/kvkk" }, { href: "/atolye" }];`);
    write("app/atolye/page.tsx", `export default function A() { return null; }`);
    if (site !== undefined) write("vamos.site.json", typeof site === "string" ? site : JSON.stringify(site));
  };
  const plan = () => planEssentials(dir, { blocksDir: "components/blocks" }, { alias: null });
  /** Writes the planned files, plus a stand-in JSX runtime so the generated .tsx can be imported. */
  const materialize = () => {
    const p = plan();
    for (const f of p.files) write(f.path, f.content);
    for (const rt of ["jsx-runtime", "jsx-dev-runtime"])
      write(`node_modules/react/${rt}.js`, "export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx; export const jsxDEV = jsx; export const Fragment = 'f';");
    write("node_modules/react/package.json", `{"name":"react","type":"module"}`);
    return p;
  };
  const load = async <T,>(rel: string): Promise<T> => (await import(path.join(dir, rel))) as T;

  it("the template is empty: no business values, defaults only for the AI switches", () => {
    const t = siteTemplate();
    expect(t.$schema).toBe("https://ui.vamos.ist/r/site-schema.json");
    expect([t.name, t.url, t.contact?.phone, t.contact?.email, t.address?.city, t.legal?.mersis, t.analytics?.ga4, t.analytics?.gtm, t.analytics?.googleAds]).toEqual(["", "", "", "", "", "", "", "", ""]);
    expect(t.ai).toEqual({ llmsTxt: true, allowAiCrawlers: true, services: [], faq: [] });
    expect(JSON.stringify(t).toLowerCase()).not.toMatch(/vamos(?!\.ist\/r\/site-schema)/);
    expect(siteTemplate({ name: "Kıyı", url: "https://kiyi.com.tr/", locale: "tr-TR" })).toMatchObject({ name: "Kıyı", url: "https://kiyi.com.tr", locale: "tr-TR", locales: ["tr-TR"] });
    expect(SITE_JSON_SCHEMA.$id).toBe(SITE_SCHEMA);
    expect(Object.keys(SITE_JSON_SCHEMA.properties)).toEqual(expect.arrayContaining(Object.keys(t)));
  });

  it("site init writes the template once and never overwrites it", async () => {
    scaffold();
    const opts = { cwd: dir, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } };
    expect(await run(["site", "init", "--name", "Kıyı Seramik", "--url", "https://kiyiseramik.com.tr", "--locale", "tr-TR", "--json"], opts)).toBe(0);
    const written = JSON.parse(readFileSync(path.join(dir, "vamos.site.json"), "utf8")) as SiteInfo;
    expect(written).toMatchObject({ name: "Kıyı Seramik", url: "https://kiyiseramik.com.tr", locale: "tr-TR", contact: { phone: "", email: "" } });
    write("vamos.site.json", JSON.stringify({ ...written, name: "Edited" }));
    expect(await run(["site", "init", "--name", "Other", "--json"], opts)).toBe(0);
    expect(JSON.parse(readFileSync(path.join(dir, "vamos.site.json"), "utf8")).name).toBe("Edited");
  });

  it("without vamos.site.json essentials keeps the plain files (no llms.txt, no JSON-LD)", () => {
    scaffold();
    const p = plan();
    expect(p.site).toBeNull();
    expect(p.files.map((f) => f.path)).toEqual(["app/site.ts", "app/robots.ts", "app/sitemap.ts", "app/gizlilik/page.tsx", "app/kvkk/page.tsx"]);
    expect(p.files[0]!.content).not.toContain("vamos.site.json");
    expect(p.files.find((f) => f.path === "app/kvkk/page.tsx")!.content).not.toContain("LEGAL_VALUES");
  });

  it("with vamos.site.json writes a typed site object, llms.txt, JSON-LD and legal pages that read it", async () => {
    scaffold(KIYI);
    const p = materialize();
    expect(p.files.map((f) => f.path)).toEqual([
      "app/site.ts",
      "app/robots.ts",
      "app/sitemap.ts",
      "app/llms.txt/route.ts",
      "app/site-json-ld.tsx",
      "app/gizlilik/page.tsx",
      "app/kvkk/page.tsx",
    ]);
    expect(p.jsonLdInLayout).toBe(true);
    const siteTs = p.files[0]!.content;
    expect(siteTs).toContain(`import siteJson from "../vamos.site.json";`);
    expect(siteTs).toContain("export const site = siteJson as unknown as SiteInfo;");
    expect(p.files.find((f) => f.path === "app/llms.txt/route.ts")!.content).toContain(`export const dynamic = "force-static";`);
    const kvkk = p.files.find((f) => f.path === "app/kvkk/page.tsx")!.content;
    expect(kvkk).toContain(`import { LEGAL_VALUES } from "../site";`);
    expect(kvkk).toContain(`fillLegalDoc(legalPreset("kvkk", "tr"), LEGAL_VALUES)`);
    expect(kvkk).toContain(`values={LEGAL_VALUES}`);

    const site = await load<{ SITE_URL: string; LEGAL_ROUTES: string[]; LEGAL_VALUES: Record<string, string | undefined> }>("app/site.ts");
    expect(site.SITE_URL).toBe(process.env.NEXT_PUBLIC_SITE_URL || "https://kiyiseramik.com.tr");
    expect(site.LEGAL_ROUTES).toEqual(["/gizlilik", "/kvkk"]);
    expect(site.LEGAL_VALUES).toMatchObject({
      companyName: "Kıyı Seramik",
      legalName: "Kıyı Seramik Atölyesi Ltd. Şti.",
      address: "Deniz Sk. 7, Moda, 34710 İstanbul, TR",
      website: "kiyiseramik.com.tr",
      mersis: "0123456789000015",
      privacyEmail: "kvkk@kiyiseramik.com.tr",
      country: undefined,
      etbis: undefined,
    });

    const { llmsTxt } = await load<{ llmsTxt: () => string }>("app/llms.txt/route.ts");
    const txt = llmsTxt();
    expect(txt.startsWith("# Kıyı Seramik\n\n> Wheel classes")).toBe(true);
    expect(txt).toContain("## Services\n\n- [Wheel class](https://kiyiseramik.com.tr/atolye): Four evenings");
    expect(txt).toContain("- Phone: +90 216 555 01 23");
    expect(txt).toContain("- WhatsApp: https://wa.me/905555550123");
    expect(txt).toContain("- Address: Deniz Sk. 7, Moda, 34710 İstanbul, TR");
    expect(txt).toContain("## Opening hours\n\n- Tu-Sa 10:00-19:00");
    expect(txt).toContain("## Pages\n\n- [Home](https://kiyiseramik.com.tr)\n- [Atolye](https://kiyiseramik.com.tr/atolye)");
    expect(txt).toContain("## Legal\n\n- [Gizlilik](https://kiyiseramik.com.tr/gizlilik)\n- [Kvkk](https://kiyiseramik.com.tr/kvkk)");

    const ld = await load<{ siteJsonLd: () => { "@graph": Record<string, any>[] }; SiteJsonLd: () => { props: { dangerouslySetInnerHTML: { __html: string } } } }>("app/site-json-ld.tsx");
    const [business, faq] = ld.siteJsonLd()["@graph"];
    expect(business).toMatchObject({
      "@type": "ProfessionalService",
      name: "Kıyı Seramik",
      telephone: "+90 216 555 01 23",
      address: { "@type": "PostalAddress", streetAddress: "Deniz Sk. 7", addressLocality: "Moda", addressRegion: "İstanbul", postalCode: "34710", addressCountry: "TR" },
      geo: { "@type": "GeoCoordinates", latitude: 40.98, longitude: 29.02 },
      openingHours: ["Tu-Sa 10:00-19:00"],
      sameAs: ["https://instagram.com/kiyiseramik"],
    });
    expect(faq).toMatchObject({ "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Do I need experience?", acceptedAnswer: { text: expect.stringContaining("beginner") } }] });
    expect(ld.SiteJsonLd().props.dangerouslySetInnerHTML.__html).not.toContain("<");
  });

  it("JSON-LD leaves out empty fields and FAQPage without faq; llms.txt is skipped when ai.llmsTxt is false", async () => {
    scaffold({ ...siteTemplate({ name: "Kıyı", url: "https://kiyi.com.tr" }), ai: { llmsTxt: false } });
    const p = materialize();
    expect(p.files.map((f) => f.path)).not.toContain("app/llms.txt/route.ts");
    const ld = await load<{ siteJsonLd: () => { "@graph": Record<string, unknown>[] } }>("app/site-json-ld.tsx");
    const graph = ld.siteJsonLd()["@graph"];
    expect(graph).toHaveLength(1);
    expect(Object.keys(graph[0]!).sort()).toEqual(["@id", "@type", "name", "url"]);
    expect(graph[0]!["@type"]).toBe("LocalBusiness");
  });

  it("robots.ts follows ai.allowAiCrawlers: true allows all, false blocks the AI bots, a list allows only those", async () => {
    type Rules = { rules: { userAgent: string | string[]; allow?: string; disallow?: string }[] };
    const robotsFor = async (allow: boolean | string[]) => {
      scaffold({ ...KIYI, ai: { allowAiCrawlers: allow } });
      materialize();
      const mod = await load<{ default: () => Rules }>("app/robots.ts");
      const out = mod.default();
      rmSync(dir, { recursive: true, force: true });
      dir = "";
      return out.rules;
    };
    expect(await robotsFor(true)).toEqual([{ userAgent: "*", allow: "/" }]);
    expect(await robotsFor(false)).toEqual([{ userAgent: "*", allow: "/" }, { userAgent: [...AI_BOTS], disallow: "/" }]);
    const listed = await robotsFor(["ClaudeBot", "GPTBot"]);
    expect(listed[1]!.userAgent).not.toContain("ClaudeBot");
    expect(listed[1]!.userAgent).not.toContain("GPTBot");
    expect(listed[1]!.userAgent).toContain("CCBot");
    for (const bot of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "meta-externalagent", "Amazonbot"]) {
      expect(AI_BOTS).toContain(bot);
    }
  });

  it("never replaces files, and says when an older site.ts or robots.ts does not read vamos.site.json", () => {
    scaffold({ ...KIYI, ai: { allowAiCrawlers: false } });
    write("app/site.ts", `export const SITE_URL = "x"; export const SITE_ROUTES = ["/"];`);
    write("app/robots.ts", `export default function robots() { return { rules: [] }; }`);
    write("public/llms.txt", "# Kıyı\n");
    const p = plan();
    const paths = p.files.map((f) => f.path);
    expect(paths).not.toContain("app/site.ts");
    expect(paths).not.toContain("app/robots.ts");
    expect(paths).not.toContain("app/site-json-ld.tsx");
    expect(p.files.find((f) => f.path === "app/kvkk/page.tsx")!.content).not.toContain("LEGAL_VALUES");
    expect(p.notes.join("\n")).toContain("app/site.ts predates vamos.site.json");
    expect(p.notes.join("\n")).toContain("does not follow ai.allowAiCrawlers");
  });

  it("reports invalid JSON and falls back to the plain files", () => {
    scaffold("{ nope");
    const p = plan();
    expect(p.site).toBeNull();
    expect(p.siteError).toContain("not valid JSON");
    expect(p.files.map((f) => f.path)).not.toContain("app/site-json-ld.tsx");
  });
});

describe("legal-01 values", () => {
  it("fills the matching [fill-in] fields and leaves the unknown ones visible", async () => {
    const { fillLegalDoc, legalPreset } = await import("../../../apps/www/src/blocks/legal-01/components/presets");
    const doc = fillLegalDoc(legalPreset("kvkk", "tr"), { legalName: "Kıyı Seramik Atölyesi Ltd. Şti.", mersis: "0123456789000015", email: "merhaba@kiyiseramik.com.tr", updated: "2026-11-01" });
    const text = JSON.stringify(doc);
    expect(text).toContain("Kıyı Seramik Atölyesi Ltd. Şti.");
    expect(text).toContain("0123456789000015");
    expect(text).not.toContain("[Şirket unvanı]");
    expect(text).not.toContain("[MERSİS no]");
    expect(text).toContain("[Vergi no]");
    expect(text).toContain("[KEP adresi]");
    expect(doc.updated).toBe("2026-11-01");
    // The data category "[adres]" is not the business address.
    const en = JSON.stringify(fillLegalDoc(legalPreset("kvkk", "en"), { address: "Deniz Sk. 7, Moda, 34710 İstanbul" }));
    expect(en).toContain("phone number, email address, [address].");
    expect(en).not.toContain("[Address]");
    // No values: unchanged.
    expect(fillLegalDoc(legalPreset("privacy", "en"))).toEqual(legalPreset("privacy", "en"));
  });
});

describe("verify site-info", () => {
  const complete = ["app/page.tsx", "app/layout.tsx", "app/robots.ts", "app/sitemap.ts", "components/blocks/site-spa-01/page.tsx"];
  const layout = { path: "app/layout.tsx", content: `export const metadata = { metadataBase: new URL("https://kiyi.com.tr"), alternates: { canonical: "/" }, openGraph: { siteName: "Kıyı" } }; <script type="application/ld+json" />` };
  const siteInfo = (paths: string[], siteJson?: string) => verifyProject({ paths, sources: [layout], siteJson }).filter((i) => i.rule === "site-info");

  it("warns when a website has no llms.txt, unless ai.llmsTxt is false", () => {
    expect(siteInfo(complete).map((i) => i.message)).toEqual([expect.stringContaining("No llms.txt")]);
    expect(siteInfo([...complete, "app/llms.txt/route.ts"])).toEqual([]);
    expect(siteInfo(complete, JSON.stringify({ ...KIYI, ai: { llmsTxt: false } }))).toEqual([]);
  });

  it("warns about empty required fields, and MERSİS / ETBİS for a shop", () => {
    const paths = [...complete, "app/llms.txt/route.ts"];
    const empty = siteInfo(paths, JSON.stringify(siteTemplate()));
    expect(empty).toHaveLength(1);
    expect(empty[0]).toMatchObject({ file: "vamos.site.json" });
    expect(empty[0]!.message).toContain("name, url, contact.phone or contact.email, address.city");
    expect(siteInfo(paths, JSON.stringify(KIYI))).toEqual([]);
    const shop = siteInfo([...paths, "components/blocks/cart-01/page.tsx"], JSON.stringify(KIYI));
    expect(shop[0]!.message).toContain("legal.etbis");
    expect(shop[0]!.message).not.toContain("legal.mersis");
    expect(siteInfo(paths, "{ nope")[0]!.message).toContain("not valid JSON");
  });
});
