/**
 * Site recipes: how to build one kind of website from kit components, as data. A recipe is not
 * an example site to copy. It says which pages a site of this kind has, what each section on a
 * page is for, which kit items build it (with alternatives), which facts the business has to
 * supply, which sections depend on interview answers, which looks suit it and what usually goes
 * wrong. The plan picks one from the answers (`pickRecipe`) and writes its sections into the
 * pages and the build / content briefs.
 *
 * Recipes never carry copy, names, prices or other sample content: every text on the finished
 * site comes from the business.
 */

import type { SiteType } from "../questions";

/**
 * A fact about the project, derived from the interview answers (see `projectFeatures`):
 *
 * - `section:<value>`  an entry of `sections` (`section:blog`, `section:team`, `section:pricing` …)
 * - `channel:<value>`  an entry of `contact_channels` (`channel:form`, `channel:whatsapp`, `channel:map` …)
 * - `booking`          the site takes bookings (site type `booking`, or a booking tool was chosen)
 * - `booking:<tool>`   the chosen booking tool (`booking:calendar`, `booking:form`, `booking:whatsapp`, `booking:existing`)
 * - `shop`             the site sells online (site type `ecommerce`)
 * - `shipping:<value>` how products reach the buyer (`shipping:digital`, `shipping:pickup`, `shipping:yes`)
 * - `newsletter`       sends newsletters or marketing email (`data_uses`)
 * - `children`         aimed at children (`data_uses`)
 * - `multilingual`     more than one language
 * - `tracking`         any measurement tool
 * - `structure:single` / `structure:multi` the chosen structure (when the user chose one)
 */
export type Feature = string;

/**
 * When a page or section applies. `any`: at least one of the features holds. `all`: every one
 * holds. `not`: none holds. Leave it out and it always applies.
 */
export interface Condition {
  any?: Feature[];
  all?: Feature[];
  not?: Feature[];
}

/** One section of a page: what it is for and what builds it. */
export interface SectionPattern {
  /** Stable id within the page (kebab-case), e.g. "hero", "proof", "schedule". */
  id: string;
  /** What the section does for the visitor, in one or two sentences. */
  purpose: string;
  /**
   * Kit items that build it, best first (registry names: components such as `hero`,
   * `feature-grid`, `countdown`, or page blocks such as `product-01`). The first one is what the
   * plan lists for the page.
   */
  use: string[];
  /** Other kit items that also fit, with the situation each suits (`"gallery-section: a photo-led business"`). */
  alternatives?: string[];
  /** The facts the business has to supply for it (no sample values). */
  fields: string[];
  /** Nice to have: the build may leave it out when the business has nothing for it. */
  optional?: boolean;
  /** Only when this holds (e.g. `{ any: ["newsletter"] }`). */
  when?: Condition;
  /** Layout, behaviour or content notes for the builder. */
  notes?: string;
}

/** One page type of the site. */
export interface RecipePage {
  /** Stable id (kebab-case), e.g. "home", "programme", "episode". */
  id: string;
  /** URL path in English and Turkish; `[slug]` / `[id]` for one page per item. */
  path: { en: string; tr: string };
  /** Page title as a plain label (menu / plan), in English and Turkish. */
  title: { en: string; tr: string };
  /** What the page is for. */
  purpose: string;
  /** Only when this holds. */
  when?: Condition;
  /** Top to bottom, between the navbar and the footer (the plan adds the site chrome). */
  sections: SectionPattern[];
}

/** A look that suits the kind of site: theme axes, as a preset code would set them. */
export interface StyleFamily {
  /** Short name of the look, e.g. "quiet editorial", "dense dark product". */
  name: string;
  /** Theme axes (values of the preset axes; accent is a named accent or "brand"). */
  axes: {
    theme?: "light" | "dark";
    material?: "solid" | "glass";
    accent?: string;
    density?: "comfortable" | "compact";
    font?: string;
    radius?: "default" | "sharp" | "round";
  };
  /** SiteShell motion level. */
  motion?: "off" | "subtle" | "full";
  /** Why it fits and what kind of business it suits. */
  why: string;
}

/** When a recipe applies. */
export interface RecipeMatch {
  /** Interview `site_type` values it is written for. */
  siteTypes: SiteType[];
  /**
   * Words in the business name or description that point to it, lower case, English and
   * Turkish (folded: no diacritics needed, they are matched both ways). A multi-word signal
   * matches as a phrase.
   */
  signals: string[];
  /** Features that make it a better fit (each adds a little weight). */
  features?: Feature[];
  /** ISO country codes or regions where it is especially common (a hint, never a requirement). */
  markets?: string[];
  /** The recipe used for its site types when no signal matches. */
  fallback?: boolean;
}

export interface Recipe {
  /** Stable id (kebab-case), e.g. "portfolio-studio". */
  id: string;
  title: { en: string; tr: string };
  /** What kind of site it is, in one or two sentences. */
  summary: string;
  match: RecipeMatch;
  /** Showcase site blocks in the registry that show a finished site of a related kind (optional). */
  showcase?: string[];
  pages: RecipePage[];
  /** What the business has to supply before the site can be written (facts, media, decisions). */
  content: string[];
  /** Looks that suit it (the brand specialist picks one, or the brand overrides all of them). */
  styles: StyleFamily[];
  /** What usually goes wrong with this kind of site. */
  pitfalls: string[];
}
