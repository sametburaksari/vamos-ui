import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "../src/cli";
import {
  buildPlan,
  domainIdeas,
  formatPlan,
  importSite,
  mergeSite,
  nextQuestions,
  startProject,
  validateAnswers,
  type Answers,
} from "../src/project";

const shop: Answers = {
  business_name: "Lumen Aydınlatma",
  site_type: "ecommerce",
  description: "Tasarım avize ve lambalar.",
  languages: ["tr"],
  existing_site: "",
  domain: "yes",
  domain_name: "lumen.example",
  hosting: "unsure",
  structure: "recommend",
  sections: ["about", "faq"],
  product_count: "small",
  payment: ["iyzico", "bank-transfer"],
  shipping: "yes",
  einvoice: "no",
  contact_channels: ["form", "whatsapp"],
  form_delivery: "recommend",
  tracking: ["gsc", "ga4", "meta"],
  legal_entity: "company",
};

const workshop: Answers = {
  business_name: "Kil & Ateş Seramik Atölyesi",
  site_type: "local-business",
  languages: ["tr", "en"],
  existing_site: "",
  domain: "no",
  hosting: "cpanel",
  structure: "recommend",
  sections: ["services", "gallery", "faq", "location"],
  contact_channels: ["form", "phone"],
  form_delivery: "recommend",
  tracking: ["gsc"],
  legal_entity: "sole",
};

describe("project interview", () => {
  it("asks the business questions first and skips what does not apply", () => {
    const first = nextQuestions({}, 3).map((q) => q.id);
    expect(first).toEqual(["business_name", "site_type", "description"]);
    const ids = nextQuestions({ site_type: "corporate" }).map((q) => q.id);
    expect(ids).not.toContain("payment");
    expect(ids).not.toContain("booking_tool");
    expect(nextQuestions({ site_type: "ecommerce", languages: ["tr"] }).map((q) => q.id)).toEqual(expect.arrayContaining(["payment", "shipping", "einvoice"]));
    expect(nextQuestions({ site_type: "ecommerce", languages: ["en"] }).map((q) => q.id)).not.toContain("einvoice");
  });

  it("validates option values, emails and GA4 ids", () => {
    expect(validateAnswers({ site_type: "castle" })[0]?.problem).toMatch(/not one of/);
    expect(validateAnswers({ email: "nope" })[0]?.problem).toMatch(/email/);
    expect(validateAnswers({ ga4_id: "UA-1" })[0]?.problem).toMatch(/G-/);
    expect(validateAnswers({ foo: "x" })[0]?.problem).toBe("unknown question id");
    expect(validateAnswers(shop)).toEqual([]);
  });

  it("optional questions do not hold the plan back", () => {
    const step = startProject(shop);
    expect(step.complete).toBe(true);
    expect(step.remaining).toBe(0);
    expect(Object.keys(step.files ?? {})).toEqual(["vamos.project.json", "vamos.site.json"]);
  });
});

describe("plan", () => {
  it("store: several pages, store pages, Turkish e-commerce legal pages and compliance", () => {
    const plan = buildPlan(shop);
    expect(plan.structure.value).toBe("multi");
    expect(plan.hosting.value).toBe("vercel");
    expect(plan.pages[0]!.sections).toEqual(expect.arrayContaining(["hero", "site-store-01", "feature-grid"]));
    expect(plan.pages.map((p) => p.path)).toEqual(expect.arrayContaining(["/urunler", "/urun/[slug]", "/sepet", "/odeme", "/iletisim"]));
    expect(plan.legalPages.map((p) => p.path)).toEqual(expect.arrayContaining(["/kvkk-aydinlatma-metni", "/mesafeli-satis-sozlesmesi", "/on-bilgilendirme-formu", "/iade-politikasi"]));
    expect(plan.compliance.map((c) => c.tr).join(" ")).toMatch(/ETBİS/);
    expect(plan.commerce?.catalog.value).toBe("files");
    expect(plan.tasks.map((t) => t.id)).toEqual(expect.arrayContaining(["payments", "bank-transfer", "shipping", "catalog"]));
    expect(plan.tracking.consentMode).toBe(true);
    expect(plan.pages[0]!.sections).toContain("consent-banner");
  });

  it("shared hosting: static output and the PHP mailer; Search Console alone needs no cookie banner", () => {
    const plan = buildPlan(workshop);
    expect(plan.structure.value).toBe("single");
    expect(plan.hosting).toMatchObject({ value: "cpanel", output: "static" });
    expect(plan.forms.value).toBe("php-mail");
    expect(plan.forms.spam).toContain("honeypot");
    expect(plan.pages[0]!.sections).not.toContain("consent-banner");
    expect(plan.legalPages.find((p) => p.path === "/cerez-politikasi")?.required).toBe(false);
    expect(plan.domain.ideas[0]).toBe("kilates.com.tr");
  });

  it("keeps the current site's addresses: planned sections reuse them, other pages are kept", () => {
    const plan = buildPlan(
      { ...workshop, site_type: "corporate", structure: "multi", sections: ["services", "testimonials"], contact_channels: ["form"] },
      { pages: [{ path: "/hizmetler", label: "Hizmetler" }, { path: "/referanslar", label: "Referanslar" }, { path: "/bize-ulasin", label: "Bize Ulaşın" }, { path: "/hizmetler/web", label: "Web" }, { path: "/sektorler", label: "Tümünü Gör →" }] },
    );
    const paths = plan.pages.map((p) => p.path);
    expect(paths).toContain("/referanslar");
    expect(paths).toContain("/bize-ulasin");
    expect(paths).not.toContain("/iletisim");
    expect(paths).not.toContain("/yorumlar");
    expect(plan.pages.find((p) => p.path === "/hizmetler/web")!.sections).toEqual(expect.arrayContaining(["media-text", "faq"]));
    expect(plan.pages.find((p) => p.path === "/sektorler")!.title.tr).toBe("Sektorler");
  });

  it("domain ideas drop filler words", () => {
    expect(domainIdeas("Pusula Muhasebe ve Danışmanlık Ltd. Şti.", true)[0]).toBe("pusulamuhasebe.com.tr");
    expect(domainIdeas("Nordwind Studio", false)).toEqual(["nordwind.com", "nordwind.co", "nordwind.io"]);
  });

  it("formats a readable summary in both languages", () => {
    const plan = buildPlan(shop);
    expect(formatPlan(plan, "tr")).toMatch(/## Proje planı[\s\S]*### Sayfalar[\s\S]*### Yasal sayfalar/);
    expect(formatPlan(plan, "en")).toMatch(/## Project plan[\s\S]*Catalogue/);
  });
});

describe("mergeSite", () => {
  it("fills only empty fields, never replaces values, keeps $schema first", () => {
    const { site, filled } = mergeSite({ name: "Own name", contact: { email: "own@example.org" } }, { name: "Draft", description: "D", contact: { email: "x@y.z", phone: "+90 212 000 00 01" } });
    expect(site.name).toBe("Own name");
    expect(site.contact).toEqual({ email: "own@example.org", phone: "+90 212 000 00 01" });
    expect(filled).toEqual(["description", "contact.phone"]);
    expect(Object.keys(site)[0]).toBe("$schema");
  });
});

// A fictional business site, served by a fake fetch.
const PAGES: Record<string, string> = {
  "https://atolye.example/": `<!doctype html><html lang="tr"><head><title>Kıyı Atölye | Ahşap mobilya</title>
    <meta name="description" content="Bodrum'da el yapımı ahşap mobilya ve tamir.">
    <meta property="og:site_name" content="Kıyı Atölye">
    <link rel="alternate" hreflang="en" href="https://atolye.example/en/">
    <link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/site.css">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Kıyı Atölye","telephone":"+90 252 444 12 34","email":"info@atolye.example","address":{"@type":"PostalAddress","streetAddress":"Çarşı Sk. 5","addressLocality":"Bodrum","addressRegion":"Muğla","postalCode":"48400","addressCountry":"TR"},"openingHours":["Mo-Sa 09:00-18:00"],"sameAs":["https://www.instagram.com/kiyiatolye"]}</script>
    </head><body><header><a href="/"><img src="/logo.png" alt="Kıyı Atölye logo"></a>
    <nav><a href="/hakkimizda">Hakkımızda</a><a href="/iletisim">İletişim</a><a href="/hizmetler">Hizmetler</a></nav></header>
    <main><h1>El yapımı ahşap mobilya</h1><p>Her parça atölyemizde, yerel ağaçlardan, siparişe göre üretilir ve ömür boyu bakım garantisiyle gelir.</p>
    <img src="/img/masa.jpg" alt="Ceviz yemek masası" width="1200">
    <a href="tel:+902524441234">Ara</a><a href="https://wa.me/905320001122">WhatsApp</a></main></body></html>`,
  "https://atolye.example/iletisim": `<html><body><h1>İletişim</h1><p>Atölyemize Bodrum merkezden beş dakikada ulaşabilirsiniz; randevu ile gelin.</p><a href="tel:+90 252 444 99 99">Eski hat</a><a href="mailto:info@atolye.example">Mail</a></body></html>`,
  "https://atolye.example/hakkimizda": `<html><body><h1>Hakkımızda</h1><p>1998'den beri aynı tezgâhta; üç kuşak marangozluk deneyimi.</p></body></html>`,
  "https://atolye.example/hizmetler": `<html><body><h1>Hizmetler</h1><h2>Tamir</h2></body></html>`,
  "https://atolye.example/site.css": `:root{--brand:#0f766e} .btn-primary{background:#0f766e;color:#fff} body{font-family:"Inter",sans-serif} h1{font-family:"Fraunces",serif}`,
};

const fakeFetch = async (url: string) => {
  const body = PAGES[url];
  return new Response(body ?? "not found", { status: body ? 200 : 404, headers: { "content-type": url.endsWith(".css") ? "text/css" : "text/html; charset=utf-8" } });
};

describe("importSite", () => {
  it("reads business details, brand, navigation and content with sources", async () => {
    const r = await importSite("atolye.example", { fetch: fakeFetch });
    expect(r.found.name?.value).toBe("Kıyı Atölye");
    expect(r.found.description?.how).toMatch(/meta name="description"/);
    expect(r.found.phone?.map((p) => p.value)).toEqual(["+90 252 444 12 34", "+90 252 444 99 99"]);
    expect(r.found.whatsapp?.[0]?.value).toBe("905320001122");
    expect(r.found.email?.[0]?.value).toBe("info@atolye.example");
    expect(r.found.address?.value).toMatchObject({ street: "Çarşı Sk. 5", district: "Bodrum", city: "Muğla" });
    expect(r.found.openingHours?.value).toEqual(["Mo-Sa 09:00-18:00"]);
    expect(r.found.social?.[0]?.value).toBe("https://www.instagram.com/kiyiatolye");
    expect(r.found.languages?.value).toEqual(["tr", "en"]);
    expect(r.navigation.map((n) => n.path)).toEqual(["/hakkimizda", "/iletisim", "/hizmetler"]);
    expect(r.pages.length).toBe(4);
    expect(r.images.map((i) => i.alt)).toEqual(["Ceviz yemek masası"]);
    expect(r.brand.colours[0]?.hex).toBe("#0f766e");
    expect(r.warnings.join(" ")).toMatch(/Different phone numbers/);
    expect(r.site).toMatchObject({ name: "Kıyı Atölye", url: "https://atolye.example", contact: { phone: "+90 252 444 12 34", whatsapp: "905320001122" } });
  });

  it("refuses through the guard and reports instead of throwing", async () => {
    const r = await importSite("https://atolye.example", {
      fetch: fakeFetch,
      guard: () => {
        throw new Error("refused for the test");
      },
    });
    expect(r.pages).toEqual([]);
    expect(r.warnings[0]).toMatch(/refused for the test/);
  });
});

describe("vamos-ui new (non-interactive)", () => {
  it("lists missing questions, then writes the plan and fills only empty site fields", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "vamos-new-"));
    writeFileSync(path.join(dir, "vamos.site.json"), JSON.stringify({ name: "Kept name" }));
    writeFileSync(path.join(dir, "partial.json"), JSON.stringify({ business_name: "Lumen" }));
    expect(await run(["new", "--answers", "partial.json"], { cwd: dir, interactive: false })).toBe(0);
    expect(JSON.parse(readFileSync(path.join(dir, "vamos.project.json"), "utf8")).answers.business_name).toBe("Lumen");

    writeFileSync(path.join(dir, "answers.json"), JSON.stringify({ ...shop, business_name: "Lumen" }));
    expect(await run(["new", "--answers", "answers.json"], { cwd: dir, interactive: false })).toBe(0);
    const project = JSON.parse(readFileSync(path.join(dir, "vamos.project.json"), "utf8"));
    expect(project.plan.siteType).toBe("ecommerce");
    const site = JSON.parse(readFileSync(path.join(dir, "vamos.site.json"), "utf8"));
    expect(site.name).toBe("Kept name");
    expect(site.url).toBe("https://lumen.example");
    expect(site.type).toBe("OnlineStore");
  });

  it("--dry-run writes nothing; invalid answers fail", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "vamos-new-"));
    writeFileSync(path.join(dir, "answers.json"), JSON.stringify(workshop));
    expect(await run(["new", "--answers", "answers.json", "--dry-run"], { cwd: dir, interactive: false })).toBe(0);
    expect(existsSync(path.join(dir, "vamos.project.json"))).toBe(false);
    writeFileSync(path.join(dir, "bad.json"), JSON.stringify({ site_type: "castle" }));
    expect(await run(["new", "--answers", "bad.json"], { cwd: dir, interactive: false })).toBe(1);
  });
});
