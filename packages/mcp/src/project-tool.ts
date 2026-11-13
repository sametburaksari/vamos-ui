/**
 * start_project and import_site: the website project interview and the current-site import from
 * the CLI's "vamos-ui/project" library. On the hosted server import_site goes through the same
 * guarded fetch as audit_site (public addresses only, checked at connect time, capped).
 */

import type { FetchLike } from "vamos-ui/audit";
import type { Answers, ProjectStep, SiteImport } from "vamos-ui/project";
import { pinnedFetch, publicOnlyGuard, type Lookup } from "./audit-tool.js";
import type { ToolAnswer } from "./design-tools.js";
import { ToolError } from "./tools.js";

type ProjectModule = typeof import("vamos-ui/project");

let loaded: Promise<ProjectModule | null> | undefined;
let loadError: string | undefined;

export function loadProject(): Promise<ProjectModule | null> {
  loaded ??= import("vamos-ui/project").then(
    (mod) => {
      if (typeof (mod as Partial<ProjectModule>).startProject !== "function") {
        loadError = '"vamos-ui/project" does not export startProject().';
        return null;
      }
      return mod as ProjectModule;
    },
    (error: unknown) => {
      loadError = (error as Error)?.message ?? String(error);
      return null;
    },
  );
  return loaded;
}

async function lib(): Promise<ProjectModule> {
  const mod = await loadProject();
  if (!mod) throw new ToolError(`Project planning is not available: ${loadError ?? "vamos-ui/project could not be loaded"}. Run npx vamos-ui new instead.`);
  return mod;
}

export interface StartProjectArgs {
  answers?: Record<string, string | string[]>;
  lang?: "tr" | "en";
  imported?: { url?: string; navigation?: { path: string; label: string }[]; site?: Record<string, unknown> };
}

export async function startProjectTool(args: StartProjectArgs): Promise<ToolAnswer> {
  const mod = await lib();
  const lang = args.lang ?? "tr";
  const step: ProjectStep = mod.startProject((args.answers ?? {}) as Answers, {
    lang,
    batch: 4,
    imported: args.imported ? { url: args.imported.url, pages: args.imported.navigation, site: args.imported.site } : undefined,
  });
  const tr = lang === "tr";
  const lines: string[] = [];
  if (step.problems.length) {
    lines.push(tr ? "Düzeltilmesi gereken cevaplar:" : "Answers to fix:");
    for (const p of step.problems) lines.push(`- ${p.id}: ${p.problem}`);
    lines.push("");
  }
  if (!step.complete) {
    lines.push(tr ? `Sıradaki sorular (${step.remaining} zorunlu soru kaldı). Kullanıcıya sorun, cevapları answers içinde id → değer olarak geri gönderin:` : `Next questions (${step.remaining} required left). Ask the user, then send the answers back as id → value in answers:`);
    for (const q of step.questions) {
      lines.push(`- ${q.id}${q.optional ? (tr ? " (isteğe bağlı)" : " (optional)") : ""}: ${q.text}${q.why ? ` — ${q.why}` : ""}`);
      if (q.options) lines.push(`  ${q.kind === "multi" ? (tr ? "birden çok" : "one or more") : tr ? "biri" : "one of"}: ${q.options.map((o) => `${o.value} (${o.label})`).join(", ")}`);
    }
    if (step.questions.some((q) => q.id === "existing_site")) lines.push(tr ? "Mevcut site varsa önce import_site ile okuyun ve sonucun navigation ile site alanlarını imported olarak gönderin." : "If there is a current site, read it with import_site first and pass its navigation and site as imported.");
  } else {
    lines.push(mod.formatPlan(step.plan, lang), "");
    lines.push(tr ? "Proje köküne yazılacak dosyalar (vamos.site.json varsa yalnızca boş alanlar doldurulmalı):" : "Files to write at the project root (if vamos.site.json exists, only fill its empty fields):");
    for (const name of Object.keys(step.files ?? {})) lines.push(`- ${name}`);
    lines.push("", tr ? "Dosya içerikleri yapılandırılmış sonuçtaki files alanında. Yerel olarak aynısı: npx vamos-ui new --answers answers.json" : "File contents are in files in the structured result. Locally the same: npx vamos-ui new --answers answers.json");
  }
  return { text: lines.join("\n"), data: step as unknown as Record<string, unknown> };
}

export interface NextTaskArgs {
  project: Record<string, unknown>;
  task?: string;
  status?: "done" | "blocked" | "todo";
  note?: string;
  lang?: "tr" | "en";
}

/**
 * next_task: the website process on a vamos.project.json the client hands in. Optionally sets
 * one task's status first (the updated file comes back), then returns where every task stands,
 * the tasks that can start now and the brief for the requested (or first ready) task.
 */
export async function nextTaskTool(args: NextTaskArgs): Promise<ToolAnswer> {
  const mod = await lib();
  const project = args.project as { plan?: ProjectStep["plan"] & { tasks?: unknown[] } };
  if (!project?.plan || !Array.isArray(project.plan.tasks) || !project.plan.tasks.length) throw new ToolError("project must be the contents of vamos.project.json with a finished plan (run start_project until it returns the files).");
  const lang = args.lang ?? "tr";
  const tr = lang === "tr";
  let plan = project.plan;
  let updated: Record<string, unknown> | undefined;
  try {
    if (args.status) {
      if (!args.task) throw new Error("status needs task (the task id).");
      plan = mod.setTaskStatus(plan, args.task, args.status, args.note);
      updated = { ...project, plan };
    }
    const state = mod.processState(plan, lang);
    const target = args.status ? state.ready[0]?.id : (args.task ?? state.ready[0]?.id);
    const brief = target ? mod.taskBrief(plan, target, lang) : undefined;
    const lines = [mod.formatProcess(state, lang)];
    if (updated) lines.push("", tr ? "Güncellenen vamos.project.json yapılandırılmış sonuçtaki project alanında; dosyaya yazın." : "The updated vamos.project.json is in project in the structured result; write it to the file.");
    if (brief) lines.push("", tr ? `Sıradaki görevin özeti (uzman agent'a verin ya da kendiniz uygulayın; bittiğinde status: "done" ile tekrar çağırın):` : `Brief for the next task (hand it to a specialist or do it yourself; call again with status: "done" when finished):`, "", brief);
    else if (!state.finished) lines.push("", tr ? "Başlayabilecek görev yok: engelli görevlerin eksiklerini kullanıcıdan isteyin." : "Nothing can start: ask the user for what the blocked tasks need.");
    return { text: lines.join("\n"), data: { ...state, ...(target ? { task: target, brief } : {}), ...(updated ? { project: updated } : {}) } as unknown as Record<string, unknown> };
  } catch (error) {
    if (error instanceof ToolError) throw error;
    throw new ToolError((error as Error).message);
  }
}

export const IMPORT_LIMITS = {
  remote: { maxPages: 4, deadlineMs: 30_000, timeoutMs: 8_000, maxBytes: 2 * 1024 * 1024, maxStylesheets: 4 },
  local: { maxPages: 8, deadlineMs: 60_000, timeoutMs: 10_000, maxBytes: 4 * 1024 * 1024, maxStylesheets: 8 },
} as const;
const MAX_PARALLEL = 3;
let running = 0;

export interface ImportToolOptions {
  remote: boolean;
  version: string;
  fetch?: FetchLike;
  lookup?: Lookup;
}

export async function importSiteTool(args: { url: string; maxPages?: number; lang?: "tr" | "en" }, options: ImportToolOptions): Promise<ToolAnswer> {
  const mod = await lib();
  if (running >= MAX_PARALLEL) throw new ToolError("The server is already reading several sites. Try again in a minute, or run npx vamos-ui site import <url> locally.");
  const limits = options.remote ? IMPORT_LIMITS.remote : IMPORT_LIMITS.local;
  running++;
  let result: SiteImport;
  try {
    result = await mod.importSite(args.url, {
      fetch: options.fetch ?? (options.remote ? pinnedFetch(options.lookup) : undefined),
      guard: options.remote ? publicOnlyGuard(options.lookup) : undefined,
      maxPages: Math.max(0, Math.min(Math.floor(args.maxPages ?? limits.maxPages), limits.maxPages)),
      maxStylesheets: limits.maxStylesheets,
      deadlineMs: limits.deadlineMs,
      timeoutMs: limits.timeoutMs,
      maxBytes: limits.maxBytes,
      userAgent: `vamos-ui-import/${options.version} (+https://ui.vamos.ist/docs/mcp)`,
    });
  } finally {
    running--;
  }
  if (!result.pages.length) throw new ToolError(result.warnings.join(" ") || `Could not read ${args.url}.`);
  const tr = (args.lang ?? "tr") === "tr";
  const f = result.found;
  const lines: string[] = [tr ? `${result.finalUrl} adresinden bulunanlar (her değer kaynağıyla; kullanıcıya onaylatın):` : `Found on ${result.finalUrl} (each value with its source; confirm with the user):`];
  const row = (label: string, value: string, how?: string) => lines.push(`- ${label}: ${value}${how ? ` (${how})` : ""}`);
  if (f.name) row(tr ? "Ad" : "Name", f.name.value, f.name.how);
  if (f.description) row(tr ? "Açıklama" : "Description", f.description.value, f.description.how);
  for (const v of f.phone ?? []) row(tr ? "Telefon" : "Phone", v.value, `${v.how}, ${v.source}`);
  for (const v of f.whatsapp ?? []) row("WhatsApp", v.value, v.how);
  for (const v of f.email ?? []) row(tr ? "E-posta" : "Email", v.value, v.how);
  if (f.address) row(tr ? "Adres" : "Address", Object.values(f.address.value).join(", "), f.address.how);
  if (f.openingHours) row(tr ? "Saatler" : "Hours", f.openingHours.value.join("; "), f.openingHours.how);
  if (f.social?.length) row(tr ? "Sosyal" : "Social", f.social.map((s) => s.value).join(", "));
  const accent = result.brand.colours[0];
  if (accent) row(tr ? "Vurgu rengi adayı" : "Accent candidate", accent.hex, accent.reasons[0]);
  const fonts = [result.brand.brand.fonts?.display, result.brand.brand.fonts?.body].filter(Boolean);
  if (fonts.length) row(tr ? "Yazı tipleri" : "Fonts", [...new Set(fonts)].join(", "));
  for (const a of (result.brand.brand.assets ?? []).filter((x) => /logo/i.test(x.use)).slice(0, 3)) row("Logo", a.path);
  if (result.navigation.length) row(tr ? "Menü" : "Navigation", result.navigation.map((n) => `${n.label} ${n.path}`).join(" · "));
  lines.push(`- ${tr ? "Okunan" : "Read"}: ${result.pages.length} ${tr ? "sayfa" : "pages"}, ${result.images.length} ${tr ? "içerik görseli" : "content images"}`);
  for (const w of result.warnings) lines.push(`! ${w}`);
  lines.push(
    "",
    tr
      ? "Sayfa metinleri, görseller ve marka adayları (renkler, yazı tipleri, logolar: brand alanı) yapılandırılmış sonuçta. start_project'e imported olarak { url, navigation, site } gönderin; mevcut adresler korunur. Yerelde marka dosyası için: npx vamos-ui brand import <url>."
      : "Page texts, images and brand candidates (colours, fonts, logos: the brand field) are in the structured result. Pass { url, navigation, site } to start_project as imported; existing URLs are kept. Locally, for the brand file: npx vamos-ui brand import <url>.",
  );
  return { text: lines.join("\n"), data: result as unknown as Record<string, unknown> };
}
