import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { REMOVED_SITES, removedItemHint } from "../src/core/removed";
import { PRESET_AXES } from "../src/preset";
import { buildPlan, formatPlan, taskBrief, type Answers } from "../src/project";
import { RECIPES, conditionHolds, matchRecipes, pickRecipe, projectFeatures, recipeById, resolveRecipe } from "../src/project/recipes";
import { SITE_TYPES } from "../src/project/questions";
// @ts-expect-error -- plain .mjs helper without types
import { recipeFiles, recipeIndex } from "../scripts/gen-recipes.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../..");
const dataDir = path.resolve(here, "../src/project/recipes/data");

/** Registry names the docs site publishes: component docs entries and block folders. */
function kitNames(): Set<string> {
  const names = new Set<string>();
  const entries = path.join(repo, "apps/www/src/docs/entries");
  for (const f of fs.readdirSync(entries)) {
    if (!f.endsWith(".tsx")) continue;
    const slug = /^\s*slug:\s*"([^"]+)"/m.exec(fs.readFileSync(path.join(entries, f), "utf8"))?.[1];
    if (slug) names.add(slug);
  }
  const blocks = path.join(repo, "apps/www/src/blocks");
  for (const d of fs.readdirSync(blocks)) if (fs.existsSync(path.join(blocks, d, "meta.ts"))) names.add(d);
  return names;
}

const FEATURE = /^(?:section:[a-z-]+|channel:[a-z-]+|booking(?::[a-z-]+)?|shop|shipping:[a-z-]+|newsletter|children|sensitive|multilingual|tracking|structure:(?:single|multi))$/;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EXCLUDED = /\b(?:restaurants?|spa|spas|clinics?|vets?|veterinar\w*|physio\w*|dietitians?|therap\w*|meyhane|lokanta|klinik|diyetisyen|fizyoterap\w*|terapi\w*|veteriner)\b/i;
const FORBIDDEN = /shadcn|\bacme\b|\bglobex\b|\binitech\b/i;

describe("recipes: data", () => {
  const kit = kitNames();

  it("data/index.ts imports every recipe file", () => {
    expect(fs.readFileSync(path.join(dataDir, "index.ts"), "utf8")).toBe(recipeIndex(recipeFiles()));
    expect(RECIPES.length).toBe(recipeFiles().length);
  });

  it.each(RECIPES.map((r) => [r.id, r] as const))("%s is well formed", (id, r) => {
    expect(fs.existsSync(path.join(dataDir, `${id}.json`))).toBe(true);
    expect(id).toMatch(KEBAB);
    expect(r.title.en && r.title.tr && r.summary).toBeTruthy();
    expect(r.match.siteTypes.length).toBeGreaterThan(0);
    for (const t of r.match.siteTypes) expect(SITE_TYPES).toContain(t);
    expect(r.match.signals.length).toBeGreaterThan(3);
    for (const s of r.match.signals) expect(s, `signal "${s}"`).toBe(s.toLowerCase());
    for (const f of r.match.features ?? []) expect(f).toMatch(FEATURE);
    expect(r.pages.some((p) => p.id === "home" && p.path.en === "/" && p.path.tr === "/"), "a home page at /").toBe(true);
    expect(new Set(r.pages.map((p) => p.id)).size).toBe(r.pages.length);
    expect(r.content.length).toBeGreaterThan(2);
    expect(r.pitfalls.length).toBeGreaterThan(2);
    expect(r.styles.length).toBeGreaterThan(0);
    for (const sc of r.showcase ?? []) expect(["site-store-01", "site-estate-01", "site-saas-01", "site-agency-01", "site-news-01"]).toContain(sc);
    for (const page of r.pages) {
      expect(page.id).toMatch(KEBAB);
      expect(page.path.en.startsWith("/") && page.path.tr.startsWith("/")).toBe(true);
      expect(page.sections.length).toBeGreaterThan(0);
      expect(new Set(page.sections.map((s) => s.id)).size, `${page.id}: unique section ids`).toBe(page.sections.length);
      for (const c of [page.when, ...page.sections.map((s) => s.when)]) for (const f of [...(c?.any ?? []), ...(c?.all ?? []), ...(c?.not ?? [])]) expect(f).toMatch(FEATURE);
      for (const s of page.sections) {
        expect(s.id).toMatch(KEBAB);
        expect(s.purpose).toBeTruthy();
        expect(s.use.length, `${page.id}/${s.id}: use`).toBeGreaterThan(0);
        for (const name of s.use) expect(kit.has(name), `${page.id}/${s.id}: "${name}" is not a kit item`).toBe(true);
        for (const alt of s.alternatives ?? []) {
          const name = alt.split(":")[0]!.trim();
          expect(kit.has(name), `${page.id}/${s.id}: alternative "${name}" is not a kit item`).toBe(true);
        }
        expect(Array.isArray(s.fields)).toBe(true);
      }
    }
    for (const st of r.styles) {
      const ax = st.axes;
      if (ax.theme) expect(PRESET_AXES.theme).toContain(ax.theme);
      if (ax.material) expect(PRESET_AXES.material).toContain(ax.material);
      if (ax.accent) expect([...PRESET_AXES.accent, "brand"]).toContain(ax.accent);
      if (ax.density) expect(PRESET_AXES.density).toContain(ax.density);
      if (ax.font) expect(PRESET_AXES.font as readonly string[]).toContain(ax.font);
      if (ax.radius) expect(PRESET_AXES.radius).toContain(ax.radius);
      if (st.motion) expect(["off", "subtle", "full"]).toContain(st.motion);
    }
    const text = JSON.stringify(r);
    expect(text).not.toMatch(FORBIDDEN);
    expect(text, "excluded sectors stay out of recipes").not.toMatch(EXCLUDED);
    // Recipes never point to removed example sites.
    for (const removed of Object.keys(REMOVED_SITES)) expect(text).not.toContain(`"${removed}"`);
  });

  it("every site type has exactly one fallback recipe", () => {
    for (const type of SITE_TYPES) {
      const fallbacks = RECIPES.filter((r) => r.match.fallback && r.match.siteTypes.includes(type) && r.match.siteTypes[0] === type);
      expect(fallbacks.map((r) => r.id), type).toHaveLength(1);
    }
  });

  it("every removed example site points to an existing recipe or none", () => {
    for (const [name, id] of Object.entries(REMOVED_SITES)) if (id) expect(recipeById(id), `${name} → ${id}`).toBeTruthy();
    expect(removedItemHint("site-podcast-01")?.hint).toMatch(/vamos-ui new[\s\S]*"podcast"/);
    expect(removedItemHint("site-spa-01")?.hint).toMatch(/vamos-ui new/);
    expect(removedItemHint("site-store-01")).toBeNull();
  });
});

describe("recipes: choosing one", () => {
  const base: Answers = { languages: ["en"], contact_channels: ["form"] };

  it("follows the words in the name and description", () => {
    expect(pickRecipe({ ...base, site_type: "blog", business_name: "Night Shift Radio", description: "A weekly podcast about city history" }, RECIPES)?.recipe.id).toBe("podcast");
    expect(pickRecipe({ ...base, site_type: "corporate", business_name: "Arden & Vale", description: "Business law firm for start-ups" }, RECIPES)?.recipe.id).toBe("professional-firm");
    expect(pickRecipe({ ...base, site_type: "corporate", languages: ["tr"], business_name: "Pusula Hukuk Bürosu" }, RECIPES)?.recipe.id).toBe("professional-firm");
    expect(pickRecipe({ ...base, site_type: "event", business_name: "Northwind Dev Days", description: "A two-day conference with talks and workshops" }, RECIPES)?.recipe.id).toBe("conference");
  });

  it("falls back to the site type's recipe", () => {
    expect(pickRecipe({ ...base, site_type: "ecommerce", business_name: "Lumen" }, RECIPES)?.recipe.id).toBe("online-store");
    expect(pickRecipe({ ...base, site_type: "saas", business_name: "Quillstack" }, RECIPES)?.recipe.id).toBe("software-product");
    for (const type of ["local-business", "corporate", "booking", "portfolio", "blog", "nonprofit", "event"]) expect(pickRecipe({ ...base, site_type: type }, RECIPES), type).not.toBeNull();
  });

  it("derives features and resolves conditional sections", () => {
    const a: Answers = { ...base, site_type: "blog", data_uses: ["newsletter"], languages: ["en", "tr"], sections: ["team"] };
    const f = projectFeatures(a);
    expect([...f]).toEqual(expect.arrayContaining(["newsletter", "multilingual", "section:team", "channel:form"]));
    expect(conditionHolds({ any: ["newsletter", "shop"] }, f)).toBe(true);
    expect(conditionHolds({ all: ["newsletter", "shop"] }, f)).toBe(false);
    expect(conditionHolds({ not: ["newsletter"] }, f)).toBe(false);
    for (const r of RECIPES) {
      const all = resolveRecipe(r, new Set(["newsletter", "booking", "shop", "multilingual", "section:blog", "section:team", "section:pricing", "section:faq", "channel:form"]));
      expect(all.some((p) => p.id === "home"), r.id).toBe(true);
    }
  });

  it("matches a free-text screen description", () => {
    expect(matchRecipes("Website for a weekly podcast with episode pages", RECIPES)[0]?.recipe.id).toBe("podcast");
  });
});

describe("recipes: in the plan", () => {
  const podcast: Answers = {
    business_name: "Night Shift Radio",
    site_type: "blog",
    description: "A weekly podcast about city history.",
    languages: ["en"],
    domain: "later",
    hosting: "vercel",
    structure: "multi",
    sections: ["about"],
    contact_channels: ["email"],
    tracking: ["gsc"],
    data_uses: ["newsletter"],
    legal_entity: "person",
    country: "GB",
  };

  it("carries the recipe and its blueprint; pages follow its sections", () => {
    const plan = buildPlan(podcast);
    expect(plan.recipe?.id).toBe("podcast");
    expect(plan.templates).toBeUndefined();
    expect(plan.blueprint?.length).toBeGreaterThan(1);
    const home = plan.pages.find((p) => p.path === "/")!;
    const homeBp = plan.blueprint!.find((p) => p.id === "home")!;
    expect(home.sections).toContain(homeBp.sections.find((s) => !s.optional)!.use[0]);
    expect(home.sections[0]).toBe("navbar");
    expect(home.sections).toContain("footer");
    expect(JSON.stringify(plan)).not.toMatch(/site-[a-z]+-0\d/);
    expect(formatPlan(plan, "en")).toMatch(/Recipe: \*\*Podcast\*\*/);
    const build = taskBrief(plan, "build", "en");
    expect(build).toMatch(/Recipe `podcast`/);
    expect(build).toMatch(/Pitfalls for this kind of site/);
    expect(taskBrief(plan, "brand", "en")).toMatch(/Looks that suit/);
    expect(taskBrief(plan, "content", "en")).toMatch(/What each section needs/);
  });

  it("drops sections whose condition does not hold", () => {
    const withNews = buildPlan(podcast).blueprint!;
    const without = buildPlan({ ...podcast, data_uses: ["none"] }).blueprint!;
    const count = (bp: typeof withNews) => bp.reduce((n, p) => n + p.sections.length, 0);
    expect(count(without)).toBeLessThanOrEqual(count(withNews));
  });
});
