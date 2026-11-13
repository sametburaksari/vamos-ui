/**
 * vamos-ui/project — start a website project the same way in every client.
 *
 *   startProject(answers)   → the next questions, or (when enough is known) the plan and the
 *                              files to write: vamos.project.json and a vamos.site.json draft.
 *   importSite(url)         → brand, business details, navigation, texts and images of a
 *                              current site, each with its source, for the user to confirm.
 *   mergeSite(existing, …)  → fills only the empty fields of vamos.site.json.
 *
 * Pure (no Node built-ins); fetch is injected for importSite.
 */

import type { SiteInfo } from "../site-info";
import { SITE_SCHEMA } from "../site-info";
import { buildPlan, siteFromAnswers, type ImportedHints, type ProjectPlan } from "./plan";
import { carryTaskState } from "./process";
import { QUESTIONS, nextQuestions, validateAnswers, type Answers, type AnswerProblem, type Lang, type Question } from "./questions";

export * from "./questions";
export * from "./plan";
export * from "./requirements";
export * from "./deploy";
export * from "./process";
export { importSite, readPage, siteFromImport, type ImportOptions, type ImportedPage, type ImportedValue, type SiteImport } from "./import";

export const PROJECT_FILE = "vamos.project.json";
export const PROJECT_SCHEMA = "https://ui.vamos.ist/r/project-schema.json";

export interface ProjectFile {
  $schema: string;
  version: 1;
  /** The interview answers; edit them and run `vamos-ui new --update` to rebuild the plan. */
  answers: Answers;
  plan: ProjectPlan;
  /** The current site the drafts were imported from, if any. */
  importedFrom?: string;
}

/** JSON Schema (draft 2020-12) for vamos.project.json, published at PROJECT_SCHEMA. Built from the questions. */
export const PROJECT_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: PROJECT_SCHEMA,
  title: "vamos.project.json",
  description: "A website project plan written by `npx vamos-ui new` (or the MCP tool start_project): the interview answers and the plan built from them. Edit the answers and run `npx vamos-ui new` again to rebuild the plan.",
  type: "object",
  required: ["version", "answers"],
  properties: {
    $schema: { type: "string" },
    version: { const: 1 },
    importedFrom: { type: "string", description: "The current site the drafts were read from." },
    answers: {
      type: "object",
      additionalProperties: false,
      properties: Object.fromEntries(
        QUESTIONS.map((q) => {
          const description = `${q.text.en}${q.optional ? " (optional)" : ""}`;
          const values = q.options?.map((o) => o.value);
          if (q.kind === "multi") return [q.id, { description, type: "array", items: values ? { enum: values } : { type: "string" }, uniqueItems: true }];
          if (q.kind === "single" && values) return [q.id, { description, enum: [...values, ""] }];
          return [q.id, { description, type: "string" }];
        }),
      ),
    },
    plan: { type: "object", description: "Built from the answers: pages and their components, legal pages, hosting, forms, measurement, compliance, domain, tasks, open questions. Regenerated on every run." },
  },
} as const;

export function projectFile(answers: Answers, plan: ProjectPlan, importedFrom?: string): ProjectFile {
  return { $schema: PROJECT_SCHEMA, version: 1, answers, plan, ...(importedFrom ? { importedFrom } : {}) };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const empty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0) || (isObj(v) && Object.keys(v).length === 0);

/**
 * Fills empty fields of `existing` from the drafts, in order (first draft wins). Values the
 * user already has are never replaced. Returns the merged object and the dotted paths filled.
 */
export function mergeSite(existing: Partial<SiteInfo> | null | undefined, ...drafts: Partial<SiteInfo>[]): { site: Partial<SiteInfo>; filled: string[] } {
  const filled: string[] = [];
  const merge = (target: Obj, source: Obj, prefix: string) => {
    for (const [key, value] of Object.entries(source)) {
      if (empty(value)) continue;
      const path = prefix ? `${prefix}.${key}` : key;
      if (isObj(value)) {
        const current = isObj(target[key]) ? (target[key] as Obj) : {};
        const before = filled.length;
        merge(current, value, path);
        if (filled.length > before) target[key] = current;
      } else if (empty(target[key])) {
        target[key] = value;
        filled.push(path);
      }
    }
  };
  const merged = structuredClone((existing ?? {}) as Obj);
  for (const d of drafts) merge(merged, d as Obj, "");
  // $schema first, then the fields in the order they were first set.
  const { $schema, ...rest } = merged;
  return { site: { $schema: $schema ?? SITE_SCHEMA, ...rest } as Partial<SiteInfo>, filled };
}

export interface LocalizedQuestion {
  id: string;
  kind: Question["kind"];
  group: Question["group"];
  text: string;
  why?: string;
  optional: boolean;
  options?: { value: string; label: string; hint?: string }[];
}

export function localize(q: Question, lang: Lang): LocalizedQuestion {
  return {
    id: q.id,
    kind: q.kind,
    group: q.group,
    text: q.text[lang],
    ...(q.why ? { why: q.why[lang] } : {}),
    optional: !!q.optional,
    ...(q.options ? { options: q.options.map((o) => ({ value: o.value, label: o.label[lang], ...(o.hint ? { hint: o.hint[lang] } : {}) })) } : {}),
  };
}

export interface ProjectStep {
  /** True when every applicable required question has an answer; optional ones may be left out. */
  complete: boolean;
  problems: AnswerProblem[];
  /** The next questions to ask (a few at a time), in the requested language. */
  questions: LocalizedQuestion[];
  remaining: number;
  /** The plan so far (always built, so an assistant can show progress); final when complete. */
  plan: ProjectPlan;
  /** Files to write when complete: path → content. */
  files?: Record<string, string>;
  /** vamos.site.json fields filled by this step (dotted paths). */
  filled?: string[];
}

export interface StartOptions {
  lang?: Lang;
  /** How many questions to return at once. Default 4. */
  batch?: number;
  /** vamos.site.json already in the project (kept; only empty fields are filled). */
  existingSite?: Partial<SiteInfo> | null;
  /** Result of importSite for the current site (site draft + navigation). */
  imported?: ImportedHints & { url?: string };
  /** The plan already in vamos.project.json: task status and notes are kept when the plan is rebuilt. */
  previousPlan?: ProjectPlan | null;
}

/** One step of the interview: validate, pick the next questions, build the plan and files. */
export function startProject(answers: Answers, opts: StartOptions = {}): ProjectStep {
  const lang = opts.lang ?? "tr";
  const problems = validateAnswers(answers);
  const pending = nextQuestions(answers);
  const plan = carryTaskState(opts.previousPlan, buildPlan(answers, opts.imported ?? {}));
  // Optional questions are still offered, but only required ones hold the plan back.
  const complete = pending.every((q) => q.optional) && problems.length === 0;
  const step: ProjectStep = {
    complete,
    problems,
    questions: pending.slice(0, opts.batch ?? 4).map((q) => localize(q, lang)),
    remaining: pending.filter((q) => !q.optional).length,
    plan,
  };
  if (complete) {
    const fromAnswers = siteFromAnswers(answers);
    const importedAddress = opts.imported?.site?.address;
    // An address answer that is just the imported address on one line would duplicate its fields.
    if (importedAddress && fromAnswers.address?.street === Object.values(importedAddress).filter(Boolean).join(", ")) delete fromAnswers.address;
    const { site, filled } = mergeSite(opts.existingSite, fromAnswers, opts.imported?.site ?? {});
    step.filled = filled;
    step.files = {
      [PROJECT_FILE]: JSON.stringify(projectFile(answers, plan, opts.imported?.url), null, 2) + "\n",
      "vamos.site.json": JSON.stringify(site, null, 2) + "\n",
    };
  }
  return step;
}

/** The plan as readable Markdown (for chat clients and the CLI summary). */
export function formatPlan(plan: ProjectPlan, lang: Lang = "tr"): string {
  const L = (x: { en: string; tr: string }) => x[lang];
  const tr = lang === "tr";
  const out: string[] = [];
  out.push(`## ${tr ? "Proje planı" : "Project plan"}`);
  out.push(`- ${tr ? "Yapı" : "Structure"}: **${plan.structure.value === "single" ? (tr ? "tek sayfa" : "one page") : tr ? "çok sayfalı" : "several pages"}**. ${L(plan.structure.reason)}`);
  out.push(`- ${tr ? "Diller" : "Languages"}: ${plan.languages.join(", ")}`);
  out.push(`- ${tr ? "Yayın" : "Hosting"}: **${plan.hosting.value}** (${plan.hosting.output === "static" ? (tr ? "statik" : "static") : tr ? "sunuculu" : "server"}). ${L(plan.hosting.reason)}`);
  if (plan.forms.value !== "none") out.push(`- ${tr ? "Form" : "Forms"}: **${plan.forms.value}**. ${L(plan.forms.reason)}${plan.forms.spam.length ? ` ${tr ? "Spam koruması" : "Spam protection"}: ${plan.forms.spam.join(", ")}.` : ""}`);
  if (plan.tracking.tools.length) out.push(`- ${tr ? "Ölçüm" : "Measurement"}: ${plan.tracking.tools.join(", ")}${plan.tracking.consentMode ? ` (${tr ? "çerez onayıyla" : "after cookie consent"})` : ""}`);
  out.push(`- ${tr ? "Alan adı" : "Domain"}: ${plan.domain.name ?? (plan.domain.ideas.length ? `${tr ? "öneriler" : "ideas"}: ${plan.domain.ideas.join(", ")}` : "—")}`);
  if (plan.commerce) {
    out.push(`- ${tr ? "Ürün kataloğu" : "Catalogue"}: **${plan.commerce.catalog.value}**. ${L(plan.commerce.catalog.reason)}`);
    out.push(`- ${tr ? "Ödeme" : "Payments"}: ${plan.commerce.payments.join(", ") || "—"} · ${tr ? "Teslimat" : "Delivery"}: ${({ yes: tr ? "kargo" : "shipping", digital: tr ? "dijital" : "digital", pickup: tr ? "mağazadan teslim" : "pickup" } as Record<string, string>)[plan.commerce.shipping] ?? plan.commerce.shipping}${plan.commerce.einvoice ? " · e-Arşiv" : ""}`);
  }
  out.push(`- ${tr ? "Başlangıç şablonu" : "Starting template"}: ${plan.templates.join(", ")}`);
  out.push("", `### ${tr ? "Sayfalar" : "Pages"}`);
  for (const p of plan.pages) out.push(`- \`${p.path}\` ${L(p.title)}: ${p.sections.join(" → ")}`);
  if (plan.legalPages.length) {
    out.push("", `### ${tr ? "Yasal sayfalar" : "Legal pages"}`);
    for (const p of plan.legalPages) out.push(`- \`${p.path}\` ${L(p.title)}${p.required ? "" : tr ? " (önerilir)" : " (recommended)"}`);
  }
  if (plan.compliance.length) {
    out.push("", `### ${tr ? "Uyum" : "Compliance"}`);
    for (const c of plan.compliance) out.push(`- ${L(c)}`);
  }
  if (plan.tracking.steps.length) {
    out.push("", `### ${tr ? "Ölçüm kurulumu" : "Measurement setup"}`);
    for (const s of plan.tracking.steps) out.push(`- ${L(s)}`);
  }
  out.push("", `### ${tr ? "Görevler" : "Tasks"}`);
  for (const task of plan.tasks) out.push(`- [${task.agent}] ${L(task.title)}${task.needs?.length ? ` — ${tr ? "gerekenler" : "needs"}: ${task.needs.map(L).join(" ")}` : ""}`);
  if (plan.openQuestions.length) {
    out.push("", `### ${tr ? "Açık sorular" : "Open questions"}`);
    for (const q of plan.openQuestions) out.push(`- ${L(q)}`);
  }
  return out.join("\n");
}
