/**
 * Picks a recipe from the interview answers and resolves it into a blueprint: the recipe's pages
 * with only the sections that apply to this project. Pure and deterministic.
 */

import type { Answers, SiteType } from "../questions";
import type { Condition, Feature, Recipe, RecipePage, SectionPattern, StyleFamily } from "./types";

const list = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? "" : v ?? "");

/** Lower case, Turkish letters and diacritics folded to ASCII, everything else a space. */
export function foldText(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** The facts about a project that recipe conditions test (see `Feature`). */
export function projectFeatures(a: Answers): Set<Feature> {
  const f = new Set<Feature>();
  const type = one(a.site_type);
  for (const s of list(a.sections)) f.add(`section:${s}`);
  for (const c of list(a.contact_channels)) f.add(`channel:${c}`);
  const tool = one(a.booking_tool);
  if (type === "booking" || tool) f.add("booking");
  if (tool) f.add(`booking:${tool}`);
  if (type === "ecommerce") f.add("shop");
  const shipping = one(a.shipping);
  if (shipping) f.add(`shipping:${shipping}`);
  const uses = list(a.data_uses);
  if (uses.includes("newsletter")) f.add("newsletter");
  if (uses.includes("children")) f.add("children");
  if (uses.includes("sensitive")) f.add("sensitive");
  if (list(a.languages).length > 1) f.add("multilingual");
  if (list(a.tracking).some((x) => x !== "none")) f.add("tracking");
  const structure = one(a.structure);
  if (structure === "single" || structure === "multi") f.add(`structure:${structure}`);
  return f;
}

export function conditionHolds(c: Condition | undefined, features: Set<Feature>): boolean {
  if (!c) return true;
  if (c.any?.length && !c.any.some((x) => features.has(x))) return false;
  if (c.all?.length && !c.all.every((x) => features.has(x))) return false;
  if (c.not?.length && c.not.some((x) => features.has(x))) return false;
  return true;
}

export interface RecipeChoice {
  recipe: Recipe;
  score: number;
  /** Signals found in the name or description. */
  signals: string[];
  /** Other recipes that also fit, best first. */
  alternatives: string[];
}

function hasSignal(text: string, signal: string): boolean {
  const s = foldText(signal);
  if (!s) return false;
  // At a word start, so Turkish suffixes still match ("bolum" → "bolumler").
  return ` ${text}`.includes(` ${s}`);
}

/**
 * The recipe that fits the answers best: its site type and the words in the business name and
 * description, plus a little weight for matching features and markets. A recipe of another site
 * type wins only on clear signals (two or more). Null when nothing fits.
 */
export function pickRecipe(a: Answers, recipes: readonly Recipe[], country?: string | null): RecipeChoice | null {
  const type = (one(a.site_type) || "local-business") as SiteType;
  const text = foldText(`${one(a.business_name)} ${one(a.description)}`);
  const features = projectFeatures(a);
  const scored = recipes
    .map((recipe) => {
      const typed = recipe.match.siteTypes.includes(type);
      const signals = recipe.match.signals.filter((s) => hasSignal(text, s));
      if (!typed && signals.length < 2) return null;
      let score = (typed ? 10 : 0) + signals.length * 6;
      score += (recipe.match.features ?? []).filter((x) => features.has(x)).length;
      if (country && recipe.match.markets?.includes(country)) score += 1;
      if (typed && recipe.match.fallback) score += 2;
      // Only the first site type of a recipe is its home: a secondary type with no signal stays below the fallback.
      if (typed && !signals.length && recipe.match.siteTypes[0] !== type) score -= 3;
      return { recipe, score, signals };
    })
    .filter((x): x is { recipe: Recipe; score: number; signals: string[] } => !!x)
    .sort((x, y) => y.score - x.score || Number(!!y.recipe.match.fallback) - Number(!!x.recipe.match.fallback) || x.recipe.id.localeCompare(y.recipe.id));
  const best = scored[0];
  if (!best) return null;
  return { ...best, alternatives: scored.slice(1, 4).map((x) => x.recipe.id) };
}

/** A section as the plan carries it (conditions resolved). */
export type BlueprintSection = Omit<SectionPattern, "when">;

/** A recipe page as the plan carries it: only the sections that apply. */
export interface BlueprintPage {
  id: string;
  path: { en: string; tr: string };
  title: { en: string; tr: string };
  purpose: string;
  sections: BlueprintSection[];
}

/** The recipe's pages and sections that apply to these answers. */
export function resolveRecipe(recipe: Recipe, features: Set<Feature>): BlueprintPage[] {
  return recipe.pages
    .filter((p) => conditionHolds(p.when, features))
    .map((p: RecipePage) => ({
      id: p.id,
      path: p.path,
      title: p.title,
      purpose: p.purpose,
      sections: p.sections.filter((s) => conditionHolds(s.when, features)).map(({ when: _when, ...rest }) => rest),
    }))
    .filter((p) => p.sections.length > 0);
}

/** What the plan keeps from the chosen recipe. */
export interface PlanRecipe {
  id: string;
  title: { en: string; tr: string };
  summary: string;
  /** Signals found in the name or description (empty: chosen by site type). */
  signals: string[];
  alternatives: string[];
  showcase?: string[];
  styles: StyleFamily[];
  content: string[];
  pitfalls: string[];
}

/**
 * Recipes whose signals (or title words) appear in a free-text description, best first: for
 * tools that only have a sentence ("a website for a podcast with episode pages").
 */
export function matchRecipes(description: string, recipes: readonly Recipe[], limit = 3): { recipe: Recipe; signals: string[] }[] {
  const text = foldText(description);
  return recipes
    .map((recipe) => {
      const words = [...recipe.match.signals, recipe.title.en, recipe.title.tr, recipe.id.replace(/-/g, " ")];
      const signals = [...new Set(words.filter((s) => hasSignal(text, s)))];
      return { recipe, signals };
    })
    .filter((x) => x.signals.length > 0)
    .sort((x, y) => y.signals.length - x.signals.length || x.recipe.id.localeCompare(y.recipe.id))
    .slice(0, limit);
}
