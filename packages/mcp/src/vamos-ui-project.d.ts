// Contract of the CLI's "vamos-ui/project" library entry. Keeps this package typecheck-clean
// whether or not packages/cli has been built; the real module's types must match.
declare module "vamos-ui/project" {
  import type { FetchLike } from "vamos-ui/audit";
  export type Answers = Record<string, string | string[] | undefined>;
  export type Lang = "en" | "tr";
  export interface LocalizedQuestion {
    id: string;
    kind: "single" | "multi" | "text" | "url" | "email" | "phone";
    group: string;
    text: string;
    why?: string;
    optional: boolean;
    options?: { value: string; label: string; hint?: string }[];
  }
  export interface ProjectPlan {
    siteType: string;
    pages: { path: string; sections: string[] }[];
    [key: string]: unknown;
  }
  export interface ProjectStep {
    complete: boolean;
    problems: { id: string; problem: string }[];
    questions: LocalizedQuestion[];
    remaining: number;
    plan: ProjectPlan;
    files?: Record<string, string>;
    filled?: string[];
  }
  export interface StartOptions {
    lang?: Lang;
    batch?: number;
    existingSite?: Record<string, unknown> | null;
    imported?: { url?: string; pages?: { path: string; label: string }[]; site?: Record<string, unknown> };
  }
  export function startProject(answers: Answers, opts?: StartOptions): ProjectStep;
  export interface RecipeSection {
    id: string;
    purpose: string;
    use: string[];
    alternatives?: string[];
    fields: string[];
    optional?: boolean;
    when?: { any?: string[]; all?: string[]; not?: string[] };
    notes?: string;
  }
  export interface Recipe {
    id: string;
    title: { en: string; tr: string };
    summary: string;
    match: { siteTypes: string[]; signals: string[]; features?: string[]; markets?: string[]; fallback?: boolean };
    showcase?: string[];
    pages: { id: string; path: { en: string; tr: string }; title: { en: string; tr: string }; purpose: string; when?: RecipeSection["when"]; sections: RecipeSection[] }[];
    content: string[];
    styles: { name: string; axes: Record<string, string>; motion?: string; why: string }[];
    pitfalls: string[];
  }
  export const RECIPES: readonly Recipe[];
  export function recipeById(id: string): Recipe | undefined;
  export function matchRecipes(description: string, recipes: readonly Recipe[], limit?: number): { recipe: Recipe; signals: string[] }[];
  export function formatPlan(plan: ProjectPlan, lang?: Lang): string;
  export type TaskStatus = "todo" | "blocked" | "done";
  export interface TaskView {
    id: string;
    agent: string;
    title: string;
    status: TaskStatus;
    ready: boolean;
    waitingFor: string[];
    needs: string[];
    note?: string;
  }
  export interface ProcessState {
    tasks: TaskView[];
    ready: TaskView[];
    blocked: TaskView[];
    done: number;
    total: number;
    finished: boolean;
  }
  export function processState(plan: ProjectPlan, lang?: Lang): ProcessState;
  export function setTaskStatus(plan: ProjectPlan, id: string, status: TaskStatus, note?: string): ProjectPlan;
  export function taskBrief(plan: ProjectPlan, id: string, lang?: Lang): string;
  export function formatProcess(state: ProcessState, lang?: Lang): string;
  export function orchestratorSkill(): string;
  export interface ImportedValue<T = string> {
    value: T;
    source: string;
    how: string;
  }
  export interface SiteImport {
    url: string;
    finalUrl: string;
    found: {
      name?: ImportedValue;
      description?: ImportedValue;
      phone?: ImportedValue[];
      whatsapp?: ImportedValue[];
      email?: ImportedValue[];
      address?: ImportedValue<Record<string, string>>;
      openingHours?: ImportedValue<string[]>;
      social?: ImportedValue[];
      languages?: ImportedValue<string[]>;
      [key: string]: unknown;
    };
    site: Record<string, unknown>;
    brand: {
      brand: { fonts?: { display?: string; body?: string; mono?: string }; assets?: { path: string; use: string }[]; [key: string]: unknown };
      colours: { hex: string; reasons: string[] }[];
      [key: string]: unknown;
    };
    navigation: { path: string; label: string }[];
    pages: { url: string; path: string; title: string | null }[];
    images: { url: string; alt: string; source: string }[];
    warnings: string[];
  }
  export interface ImportOptions {
    fetch?: FetchLike;
    guard?: (url: URL) => void | Promise<void>;
    maxPages?: number;
    maxStylesheets?: number;
    timeoutMs?: number;
    deadlineMs?: number;
    maxBytes?: number;
    userAgent?: string;
  }
  export function importSite(url: string, options?: ImportOptions): Promise<SiteImport>;
}
