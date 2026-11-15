/**
 * End to end per country: `new --answers` → plan → `task brief` (legal, qa) → `site essentials`,
 * for fictional businesses in Germany, France, the UK, California, the Netherlands, Brazil, the UAE
 * and Türkiye. Checks the regimes, the requirements (with sources), the legal pages and their
 * slugs, and that Turkish legal wording never reaches a non-Turkish site (and the reverse).
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { scaffold } from "../src/commands/create";
import { buildPlan, jurisdictionFromAnswers, nextQuestions, taskBrief, validateAnswers, type Answers, type ProjectPlan } from "../src/project";

const TR_WORDING = /KVKK|MERS[İI]S|ETB[İI]S|\bKEP\b|aydınlatma metni|mesafeli satış|ön bilgilendirme/i;
const LEGAL_BLOCK_SRC = path.join(__dirname, "../../../apps/www/src/blocks/legal-01");

interface Case {
  name: string;
  answers: Answers;
  regimes: string[];
  /** Legal pages the plan lists (path → required). */
  legal: Record<string, boolean>;
  /** Requirement ids that must be in the plan. */
  requirements: string[];
  /** Requirement ids that must not be. */
  absent?: string[];
  /** Legal pages `site essentials` writes (route → `legalPreset(kind, locale)`). */
  written: Record<string, string>;
  tr?: boolean;
}

const base = (over: Answers): Answers => ({
  existing_site: "",
  hosting: "vercel",
  structure: "recommend",
  sections: ["services", "about", "faq"],
  contact_channels: ["form", "email"],
  form_delivery: "resend",
  email: "hello@example.com",
  ...over,
});

const CASES: Case[] = [
  {
    name: "DE · online shop (country from the .de domain)",
    answers: base({ business_name: "Nordlicht Keramik", site_type: "ecommerce", languages: ["de"], domain: "yes", domain_name: "ornek.de", product_count: "small", payment: ["stripe"], shipping: "yes", tracking: ["gsc", "ga4"], legal_entity: "company", data_uses: ["newsletter"] }),
    regimes: ["EU", "DE"],
    legal: { "/impressum": true, "/datenschutz": true, "/cookie-richtlinie": true, "/agb": false, "/widerrufsbelehrung": true },
    requirements: ["de-impressum", "de-datenschutz", "de-tdddg", "de-button", "de-widerruf", "de-vsbg", "eu-privacy-notice", "eu-cookie-consent", "eu-shop-withdrawal", "eu-shop-withdrawal-function", "eu-no-odr-link", "eu-shop-price", "eu-marketing-consent"],
    absent: ["shop-etbis", "legal-company", "us-ca-caloppa"],
    written: { "/impressum": 'legalPreset("legal-notice", "de")', "/datenschutz": 'legalPreset("privacy", "de")', "/cookie-richtlinie": 'legalPreset("cookies", "de")', "/widerrufsbelehrung": 'legalPreset("withdrawal", "de")' },
  },
  {
    name: "FR · bookbinding studio (corporate)",
    answers: base({ business_name: "Atelier Brume Reliure", site_type: "corporate", languages: ["fr"], domain: "yes", domain_name: "atelier-brume.test", country: "FR", tracking: ["ga4"], legal_entity: "company" }),
    regimes: ["EU", "FR"],
    legal: { "/mentions-legales": true, "/politique-de-confidentialite": true, "/gestion-des-cookies": true },
    requirements: ["fr-mentions-legales", "fr-cnil-cookies", "eu-privacy-notice", "eu-provider-info", "eu-cookie-consent"],
    absent: ["de-impressum", "eu-shop-withdrawal", "corp-kep"],
    written: { "/mentions-legales": 'legalPreset("legal-notice", "fr")', "/politique-de-confidentialite": 'legalPreset("privacy", "fr")', "/gestion-des-cookies": 'legalPreset("cookies", "fr")' },
  },
  {
    name: "UK · joinery company",
    answers: base({ business_name: "Fernhill Joinery", site_type: "corporate", languages: ["en"], domain: "yes", domain_name: "fernhill-joinery.test", country: "GB", tracking: ["ga4"], legal_entity: "company" }),
    regimes: ["UK"],
    legal: { "/legal-notice": false, "/privacy-policy": true, "/cookie-policy": true },
    requirements: ["uk-privacy-notice", "uk-pecr-cookies", "uk-pecr-marketing", "uk-company-details", "uk-ecommerce-info", "uk-ico-fee"],
    absent: ["eu-privacy-notice", "de-impressum"],
    written: { "/privacy-policy": 'legalPreset("privacy", "en")', "/cookie-policy": 'legalPreset("cookies", "en")' },
  },
  {
    name: "US (California) · bike parts shop with ad pixels and a newsletter",
    answers: base({ business_name: "Redwood Spoke Supply", site_type: "ecommerce", languages: ["en"], domain: "yes", domain_name: "redwood-spoke.test", country: "US", markets: "US-CA, US", product_count: "medium", payment: ["stripe"], shipping: "yes", tracking: ["ga4", "google-ads", "meta"], legal_entity: "company", data_uses: ["newsletter"] }),
    regimes: ["US", "US-CA", "US-STATES"],
    legal: { "/privacy-policy": true, "/cookie-policy": true, "/do-not-sell-or-share": true, "/terms-of-use": true, "/refund-policy": true, "/accessibility": false },
    requirements: ["us-ca-caloppa", "us-ca-ccpa-scope", "us-ca-do-not-sell", "us-ca-gpc", "us-can-spam", "us-accessibility", "us-state-privacy", "us-shipping-time"],
    absent: ["eu-privacy-notice", "eu-shop-withdrawal", "us-coppa"],
    written: { "/privacy-policy": 'legalPreset("privacy", "en")', "/do-not-sell-or-share": 'legalPreset("do-not-sell", "en")', "/terms-of-use": 'legalPreset("terms", "en")', "/refund-policy": 'legalPreset("returns", "en")' },
  },
  {
    name: "NL · print shop selling across the EU (English site)",
    answers: base({ business_name: "Polder Prints", site_type: "ecommerce", languages: ["en"], domain: "yes", domain_name: "polder-prints.test", country: "NL", markets: ["EU"], product_count: "small", payment: ["stripe"], shipping: "yes", tracking: ["gsc"], legal_entity: "sole" }),
    regimes: ["EU"],
    legal: { "/legal-notice": true, "/privacy-policy": true, "/cookie-policy": false, "/terms-of-use": true, "/withdrawal": true, "/accessibility": false },
    requirements: ["eu-privacy-notice", "eu-provider-info", "eu-shop-identity", "eu-shop-withdrawal", "eu-shop-button", "eu-no-odr-link", "eu-accessibility"],
    absent: ["de-impressum", "fr-mentions-legales", "eu-cookie-consent"],
    written: { "/legal-notice": 'legalPreset("legal-notice", "en")', "/privacy-policy": 'legalPreset("privacy", "en")', "/withdrawal": 'legalPreset("withdrawal", "en")' },
  },
  {
    name: "BR · furniture shop (Portuguese site, English templates)",
    answers: base({ business_name: "Ipê Móveis", site_type: "ecommerce", languages: ["pt"], domain: "yes", domain_name: "ornek.com.br", product_count: "small", payment: ["stripe"], shipping: "yes", tracking: ["ga4"], legal_entity: "company" }),
    regimes: ["BR"],
    legal: { "/privacy-policy": true, "/cookie-policy": true, "/terms-of-use": true, "/refund-policy": true },
    requirements: ["br-lgpd-notice", "br-encarregado", "br-cookies", "br-shop-identity", "br-shop-arrependimento"],
    absent: ["eu-privacy-notice", "eu-shop-withdrawal"],
    written: { "/privacy-policy": 'legalPreset("privacy", "en")', "/refund-policy": 'legalPreset("returns", "en")' },
  },
  {
    name: "AE · freight forwarder (corporate)",
    answers: base({ business_name: "Dune Freight Partners", site_type: "corporate", languages: ["en", "ar"], domain: "yes", domain_name: "dune-freight.test", country: "AE", tracking: ["gsc"], legal_entity: "company" }),
    regimes: ["AE"],
    legal: { "/privacy-policy": true, "/cookie-policy": false },
    requirements: ["ae-pdpl"],
    absent: ["eu-privacy-notice", "uk-privacy-notice"],
    written: { "/privacy-policy": 'legalPreset("privacy", "en")' },
  },
  {
    name: "TR · seramik mağazası (country from the Turkish language, as before)",
    answers: base({ business_name: "Kıyı Seramik", site_type: "ecommerce", languages: ["tr"], domain: "yes", domain_name: "ornek.com.tr", product_count: "small", payment: ["iyzico"], shipping: "yes", einvoice: "no", tracking: ["gsc", "ga4"], legal_entity: "company", email: "merhaba@ornek.com.tr" }),
    regimes: ["TR"],
    legal: { "/kvkk-aydinlatma-metni": true, "/gizlilik-politikasi": true, "/cerez-politikasi": true, "/mesafeli-satis-sozlesmesi": true, "/on-bilgilendirme-formu": true, "/iade-politikasi": true, "/kullanim-kosullari": true, "/yasal-uyari": false },
    requirements: ["shop-etbis", "legal-company", "forms-notice"],
    absent: ["eu-privacy-notice", "de-impressum", "us-ca-caloppa", "eu-no-odr-link"],
    written: { "/gizlilik-politikasi": 'legalPreset("privacy", "tr")', "/mesafeli-satis-sozlesmesi": 'legalPreset("distance-sales", "tr")', "/kvkk-aydinlatma-metni": 'legalPreset("kvkk", "tr")' },
    tr: true,
  },
];

describe("jurisdiction", () => {
  it("country from the answer, the ccTLD, the language; old answers without country still load", () => {
    expect(jurisdictionFromAnswers({ country: "de" }).country).toBe("DE");
    expect(jurisdictionFromAnswers({ country: "uk" }).regimes).toEqual(["UK"]);
    expect(jurisdictionFromAnswers({ domain: "yes", domain_name: "shop.co.uk", languages: ["en"] })).toMatchObject({ country: "GB", from: "domain" });
    expect(jurisdictionFromAnswers({ languages: ["tr", "en"] })).toMatchObject({ country: "TR", from: "language", regimes: ["TR"] });
    expect(jurisdictionFromAnswers({})).toMatchObject({ country: "TR", from: "default" });
    expect(jurisdictionFromAnswers({ languages: ["en"] })).toMatchObject({ country: null, regimes: [] });
    expect(jurisdictionFromAnswers({ country: "US" }).regimes).toEqual(["US", "US-CA", "US-STATES"]);
    // Selling into California from abroad: federal + California rules, not the other states.
    expect(jurisdictionFromAnswers({ country: "NL", markets: "NL, US-CA" }).regimes).toEqual(["EU", "US", "US-CA"]);
    expect(jurisdictionFromAnswers({ country: "CA" }).regimes).toEqual(["CA", "CA-QC"]);
    // A shop in Türkiye that sells to the EU gets GDPR on top of KVKK.
    expect(jurisdictionFromAnswers({ country: "TR", markets: ["TR", "EU"] }).regimes).toEqual(["TR", "EU"]);
    // National imprint rules follow the establishment, not the market.
    expect(jurisdictionFromAnswers({ country: "NL", markets: ["DE"] }).regimes).toEqual(["EU"]);
  });

  it("asks country and markets as optional questions with a suggestion, and validates the codes", () => {
    const q = nextQuestions({ domain: "yes", domain_name: "ornek.de" }).find((x) => x.id === "country")!;
    expect(q.optional).toBe(true);
    expect(q.suggest?.({ domain: "yes", domain_name: "ornek.de" })).toBe("DE");
    expect(validateAnswers({ country: "Germany" })[0]?.problem).toMatch(/ISO/);
    expect(validateAnswers({ markets: "EU, US-CA, DE" })).toEqual([]);
    expect(validateAnswers({ markets: ["Europe"] })[0]?.problem).toMatch(/ISO/);
    // e-Arşiv is asked for a shop in Türkiye only
    expect(nextQuestions({ site_type: "ecommerce", country: "DE", languages: ["tr"] }).map((x) => x.id)).not.toContain("einvoice");
  });

  it("an old Turkish plan (no jurisdiction field) still briefs the legal specialist in Turkish terms", () => {
    const plan = buildPlan(CASES.at(-1)!.answers) as ProjectPlan;
    const { jurisdiction: _drop, ...old } = plan;
    const brief = taskBrief(old as ProjectPlan, "legal", "en");
    expect(brief).toMatch(/KVKK aydınlatma metni/);
  });
});

describe.each(CASES)("$name", (c) => {
  const dirs: string[] = [];
  afterAll(() => {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  });
  const cli = (dir: string, ...argv: string[]) => run(argv, { cwd: dir, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } });

  it("plan: regimes, legal pages, requirements with sources", () => {
    const plan = buildPlan(c.answers);
    expect(plan.jurisdiction?.regimes).toEqual(c.regimes);
    const legal = Object.fromEntries(plan.legalPages.map((p) => [p.path, p.required]));
    expect(legal).toEqual(c.legal);
    for (const p of plan.legalPages) expect(p.kind, p.path).toBeTruthy();
    const ids = plan.requirements.map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining(c.requirements));
    for (const id of c.absent ?? []) expect(ids).not.toContain(id);
    for (const r of plan.requirements.filter((x) => /^(?:eu|de|at|fr|uk|us|ca|br|ae|sa|au|ch)-/.test(x.id))) expect(r.source, r.id).toMatch(/^https:\/\//);
    const text = JSON.stringify({ legal: plan.legalPages, compliance: plan.compliance, requirements: plan.requirements, tasks: plan.tasks, openQuestions: plan.openQuestions });
    if (c.tr) {
      expect(text).toMatch(TR_WORDING);
      expect(text).not.toMatch(/Impressum|CCPA|GDPR/);
    } else expect(text).not.toMatch(TR_WORDING);
  });

  it("new → task brief (legal, qa) → site essentials", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "vamos-country-"));
    dirs.push(dir);
    await scaffold(dir, { template: "next", name: "country-site", theme: { accent: "ocean" } });
    writeFileSync(path.join(dir, "vamos.json"), JSON.stringify({ registry: "https://ui.vamos.ist/r", uiDir: "src/components/vamos", blocksDir: "src/components/blocks", css: "src/app/globals.css", importAlias: "@/components/vamos", tsx: true, theme: { accent: "ocean" } }));
    // The legal-01 block as `vamos-ui add` installs it (no registry fetch in tests).
    mkdirSync(path.join(dir, "src/components/blocks"), { recursive: true });
    cpSync(LEGAL_BLOCK_SRC, path.join(dir, "src/components/blocks/legal-01"), { recursive: true });
    writeFileSync(path.join(dir, "answers.json"), JSON.stringify(c.answers));

    expect(await cli(dir, "new", "--answers", "answers.json", "--no-import", "--lang", "en")).toBe(0);
    const project = JSON.parse(readFileSync(path.join(dir, "vamos.project.json"), "utf8"));
    expect(project.plan.jurisdiction.regimes).toEqual(c.regimes);
    const site = JSON.parse(readFileSync(path.join(dir, "vamos.site.json"), "utf8"));
    if (c.answers.country) expect(site.address?.country).toBe(String(c.answers.country).toUpperCase());

    const legalBrief = await capture(() => cli(dir, "task", "brief", "legal", "--lang", "en"));
    const qaBrief = await capture(() => cli(dir, "task", "brief", "qa", "--lang", "en"));
    const legalBriefTr = await capture(() => cli(dir, "task", "brief", "legal", "--lang", "tr"));
    for (const p of Object.keys(c.legal)) expect(legalBrief).toContain(`\`${p}\``);
    expect(qaBrief).toContain("Full requirement list");
    if (!c.tr) {
      expect(legalBrief).toContain(`Country: ${project.plan.jurisdiction.country}`);
      expect(legalBrief).toMatch(/source: https:\/\//);
      expect(qaBrief).toMatch(/Sources to check the legal items against/);
      for (const b of [legalBrief, qaBrief, legalBriefTr]) expect(b).not.toMatch(TR_WORDING);
    } else {
      expect(legalBrief).toMatch(/KVKK/);
      expect(legalBrief).not.toMatch(/Impressum|GDPR|CCPA/);
    }

    const res = JSON.parse(await capture(() => cli(dir, "site", "essentials", "--json")));
    for (const [route, preset] of Object.entries(c.written)) {
      const file = `src/app${route}/page.tsx`;
      expect(res.written, route).toContain(file);
      const page = readFileSync(path.join(dir, file), "utf8");
      expect(page).toContain(preset);
      expect(page).toMatch(/Template text/);
      if (!c.tr) expect(page).not.toMatch(TR_WORDING);
    }
    // Recommended (not required) pages are left to the user.
    for (const [route, required] of Object.entries(c.legal)) if (!required) expect(existsSync(path.join(dir, `src/app${route}/page.tsx`)), route).toBe(false);
    expect(res.requiredUnlinked).toEqual(expect.arrayContaining(Object.keys(c.written)));
  });
});

async function capture(fn: () => Promise<number>): Promise<string> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  try {
    expect(await fn()).toBe(0);
  } finally {
    spy.mockRestore();
  }
  return out;
}
