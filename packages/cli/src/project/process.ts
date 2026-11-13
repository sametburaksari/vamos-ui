/**
 * The website process: an orchestrator walks the plan's tasks in dependency order and hands
 * each one to a specialist (brand, content, build, legal, SEO, tracking, forms, QA, deploy) with
 * a brief built from the plan. Status lives in vamos.project.json, so any client — Claude Code
 * subagents, Codex, Cursor, an MCP chat — continues where the last one stopped.
 *
 * Pure: no Node built-ins. The CLI (`vamos-ui task`, `vamos-ui agents`) and the MCP server
 * (`next_task`) share it.
 */

import { deployGuide } from "./deploy";
import type { PlanTask, ProjectPlan, TaskStatus } from "./plan";
import type { Lang, Text } from "./questions";
import { AGENTS, type Agent } from "./requirements";

const L = (x: Text, lang: Lang) => x[lang] ?? x.en;

export interface TaskView {
  id: string;
  agent: Agent;
  title: string;
  status: TaskStatus;
  /** Ready: todo and every task in `after` is done. */
  ready: boolean;
  waitingFor: string[];
  needs: string[];
  note?: string;
}

export interface ProcessState {
  tasks: TaskView[];
  /** Tasks that can start now (run them in parallel when there are several). */
  ready: TaskView[];
  blocked: TaskView[];
  done: number;
  total: number;
  finished: boolean;
}

/** Where every task stands and which ones can start now. */
export function processState(plan: ProjectPlan, lang: Lang = "tr"): ProcessState {
  const byId = new Map(plan.tasks.map((x) => [x.id, x]));
  const tasks: TaskView[] = plan.tasks.map((x) => {
    const waitingFor = (x.after ?? []).filter((id) => byId.get(id)?.status !== "done");
    return {
      id: x.id,
      agent: x.agent,
      title: L(x.title, lang),
      status: x.status,
      ready: x.status === "todo" && waitingFor.length === 0,
      waitingFor,
      needs: (x.needs ?? []).map((n) => L(n, lang)),
      ...(x.note ? { note: x.note } : {}),
    };
  });
  const done = tasks.filter((x) => x.status === "done").length;
  return { tasks, ready: tasks.filter((x) => x.ready), blocked: tasks.filter((x) => x.status === "blocked"), done, total: tasks.length, finished: done === tasks.length };
}

export class TaskError extends Error {}

/**
 * Sets a task's status (returns a new plan). `done` needs every task in `after` to be done;
 * `blocked` needs a note saying what is missing.
 */
export function setTaskStatus(plan: ProjectPlan, id: string, status: TaskStatus, note?: string): ProjectPlan {
  const task = plan.tasks.find((x) => x.id === id);
  if (!task) throw new TaskError(`No task "${id}". Tasks: ${plan.tasks.map((x) => x.id).join(", ")}.`);
  if (status === "done") {
    const open = (task.after ?? []).filter((dep) => plan.tasks.find((x) => x.id === dep)?.status !== "done");
    if (open.length) throw new TaskError(`"${id}" waits for ${open.join(", ")}; finish those first.`);
  }
  if (status === "blocked" && !note?.trim()) throw new TaskError(`Say what "${id}" is waiting for (--note "…").`);
  const tasks = plan.tasks.map((x): PlanTask => {
    if (x.id !== id) return x;
    const next: PlanTask = { ...x, status };
    if (note?.trim()) next.note = note.trim();
    else if (status === "todo") delete next.note;
    return next;
  });
  return { ...plan, tasks };
}

/** Keeps status and notes of tasks that still exist when the plan is rebuilt from new answers. */
export function carryTaskState(previous: ProjectPlan | undefined | null, next: ProjectPlan): ProjectPlan {
  if (!previous?.tasks?.length) return next;
  const old = new Map(previous.tasks.map((x) => [x.id, x]));
  return {
    ...next,
    tasks: next.tasks.map((x) => {
      const prev = old.get(x.id);
      if (!prev || prev.status === "todo") return x;
      return { ...x, status: prev.status, ...(prev.note ? { note: prev.note } : {}) };
    }),
  };
}

// ---------------------------------------------------------------------------
// Specialists
// ---------------------------------------------------------------------------

export interface Role {
  agent: Agent;
  name: Text;
  /** One line: when the orchestrator hands work to this specialist. */
  description: string;
  /** What the specialist does, in order (English: it is read by agents). */
  steps: string[];
  /** Hard rules for this role. */
  rules: string[];
  tools: string[];
}

const SHARED_RULES = [
  "Never invent business facts: phone, email, address, prices, opening hours, legal ids, tracking ids, reviews and client names come from vamos.site.json, vamos.project.json or the user. If one is missing, stop and report it as BLOCKED with what is needed.",
  "Use the kit: blocks and components from `npx vamos-ui search` / `add`, semantic tokens only, no colour literals, no raw tracking scripts. `npx vamos-ui verify` must pass for the files you touched.",
  "Stay inside your task. If you find work for another specialist, list it under Follow-ups instead of doing it.",
];

export const ROLES: Record<Agent, Role> = {
  brand: {
    agent: "brand",
    name: { en: "Brand", tr: "Marka" },
    description: "Brand specialist: logo, accent colour, fonts and tone of voice in vamos.brand.json, applied to the kit theme.",
    steps: [
      "With a current site: `npx vamos-ui brand import <url>`; otherwise `npx vamos-ui brand init` with the colours and fonts the user gave.",
      "Show the proposed accent, fonts and logo to the user through the orchestrator and wait for a yes before applying.",
      "`npx vamos-ui brand apply`, then `npx vamos-ui brand check` until it reports no errors (contrast in light and dark).",
      "Write the tone of voice (3–5 short rules with an example sentence each) into vamos.brand.json → voice for the content specialist.",
    ],
    rules: ["The accent is one colour; derived shades come from the kit. Do not add a second brand colour as a literal.", "Logo files go in public/ as SVG (or a 2x PNG under 50 KB)."],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  content: {
    agent: "content",
    name: { en: "Content", tr: "İçerik" },
    description: "Content specialist: page texts, headings, FAQ, alt texts and translations for every planned page, from the business's real details.",
    steps: [
      "Read vamos.project.json (pages and their sections, languages) and vamos.site.json (business details); with a current site read its texts from `npx vamos-ui site import <url> --json`.",
      "For each page write: title (under 60 characters), meta description (120–160), H1, section texts in the order of the planned sections, one call to action, alt texts for its images.",
      "Keep facts in vamos.site.json and reference them; write copy only. Put the texts where the build specialist expects them (content/<locale>/<page>.json or the page's block props).",
      "List every fact you could not confirm (prices, claims, numbers) as BLOCKED needs instead of guessing.",
    ],
    rules: ["Plain, specific sentences in the brand voice. No filler (\"we are passionate about…\"), no superlatives you cannot prove, no emoji headings.", "Turkish copy uses correct Turkish characters and the formal \"siz\" unless the brand voice says otherwise."],
    tools: ["Read", "Write", "Edit", "Bash", "WebFetch"],
  },
  build: {
    agent: "build",
    name: { en: "Build", tr: "Geliştirme" },
    description: "Build specialist: creates the Next.js app from the starting template and builds every planned page from kit blocks.",
    steps: [
      "If there is no app yet: `npx vamos-ui create site --template next` (static export for cPanel, see the plan's hosting).",
      "`npx vamos-ui add <block>` for the starting template and each planned section; compose pages in the planned order with the content specialist's texts.",
      "Wire vamos.site.json into the blocks (Navbar, Footer, ContactDock, MapHours) instead of copying values.",
      "Images: convert to WebP/AVIF under 300 KB with width/height. Add a designed 404 page.",
      "`npx vamos-ui verify` and `npm run build` must both pass.",
    ],
    rules: ["One primary action per view.", "Kit files in the ui folder are not edited; compose or wrap them."],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  legal: {
    agent: "legal",
    name: { en: "Legal", tr: "Hukuk" },
    description: "Legal pages specialist: KVKK / privacy / cookie / sales texts from the kit presets, filled from vamos.site.json and linked in the footer.",
    steps: [
      "`npx vamos-ui site essentials` writes a page for every legal link with the legal-01 block; fill the fields it reports missing in vamos.site.json (ask the user through the orchestrator).",
      "Check the planned legal pages all exist, are linked in the footer, and that the KVKK notice is linked next to every form.",
      "Tell the user the texts are templates that the business or its lawyer must approve; record that approval in your report.",
    ],
    rules: ["Never present a template as legal advice.", "Trade name, tax number, MERSIS, ETBİS and KEP come only from the user."],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  seo: {
    agent: "seo",
    name: { en: "SEO", tr: "SEO" },
    description: "SEO specialist: metadata, canonical and Open Graph, sitemap, robots, llms.txt, JSON-LD and redirects from a current site.",
    steps: [
      "`npx vamos-ui site essentials` for robots, sitemap, llms.txt and JSON-LD; add the printed layout metadata.",
      "Every page: title under 60, description 120–160, one H1, alternates.canonical, Open Graph image; hreflang for each language.",
      "With a current site: map every old URL that changes to its new page (301 redirects in next.config or .htaccess).",
      "`npx vamos-ui verify` (meta-length, missing-route, site-essentials rules) must be clean.",
    ],
    rules: ["Do not stuff keywords; titles read as a person would write them.", "Never block the site in robots.txt for launch."],
    tools: ["Read", "Write", "Edit", "Bash", "WebFetch"],
  },
  tracking: {
    agent: "tracking",
    name: { en: "Measurement", tr: "Ölçüm" },
    description: "Measurement specialist: consent banner, Consent Mode defaults and the kit's Analytics component with the owner's GA4 / Ads / GTM / Meta ids.",
    steps: [
      "`npx vamos-ui add consent-banner` if missing. `<ConsentDefaults />` in <head>; `<ConsentBanner policyLink={…} />` and `<Analytics {...site.analytics} conversions={…} />` in the root layout.",
      "Ids come from vamos.site.json → analytics; if one is missing, report BLOCKED with which id is needed.",
      "Mark call / WhatsApp / booking buttons with data-track where the automatic link detection does not cover them.",
      "Explain to the user how to check it: GA4 DebugView or Tag Assistant, and which events to mark as key events / Ads conversions.",
    ],
    rules: ["No tag before consent. Never paste gtag, gtm.js or fbevents.js as a raw <script>.", "Reject must be as easy as Accept on the banner."],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  forms: {
    agent: "forms",
    name: { en: "Forms", tr: "Formlar" },
    description: "Forms specialist: the contact or booking form and its sender (contact.php, Resend or SMTP) with spam protection and the KVKK notice.",
    steps: [
      "`npx vamos-ui site form --kind <plan.forms.value>` writes the sender and the shared field list (never overwrites).",
      "Point <ContactForm action=…> at it (\"/contact.php\" for php-mail, the server action otherwise); add the privacy notice link and the optional marketing checkbox.",
      "List the environment values the user must set (plan.forms.env) and how to test a submission.",
    ],
    rules: ["Never hand-roll a mailer or put SMTP passwords in code.", "The recipient address is the business's own (vamos.site.json contact.email or the user's answer)."],
    tools: ["Read", "Write", "Edit", "Bash"],
  },
  qa: {
    agent: "qa",
    name: { en: "QA", tr: "Kalite kontrol" },
    description: "QA specialist: runs verify, build and audit, walks the requirement list and sends failures back to the specialist that owns them.",
    steps: [
      "`npx vamos-ui verify` and `npm run build`; then serve the build and run `npx vamos-ui audit <preview-url>`.",
      "Walk every requirement in the plan: mark each pass / fail with evidence (command output, page, screenshot).",
      "For each failure name the owning specialist and the exact fix. Do not fix other specialists' work yourself unless it is a one-line change.",
      "Check at 360 px and with the keyboard: menu, forms, consent banner, contact dock.",
    ],
    rules: ["DONE only when verify has no errors, the audit score is 90 or more and every requirement passes or the user accepted the exception."],
    tools: ["Read", "Bash", "Grep", "Glob", "WebFetch"],
  },
  deploy: {
    agent: "deploy",
    name: { en: "Deploy", tr: "Yayın" },
    description: "Deploy specialist: hosting config (redirects, security headers, cache), publishing, domain and HTTPS, Search Console.",
    steps: [
      "`npx vamos-ui site deploy` writes the host's config files (never overwrites) and prints the steps.",
      "Prepare everything, then ask the user (through the orchestrator) before the publish itself, DNS changes or anything that replaces a live site. Publishing is the user's call.",
      "After the deploy run the checks the guide lists (audit on the live URL, http → https 301, a test form message).",
      "Report the live URL, what was checked and anything left for the user (Search Console, Google Business Profile link).",
    ],
    rules: ["Never enter passwords, API keys or payment details; the user does that.", "Keep a way back: note the previous version or backup before replacing a live site."],
    tools: ["Read", "Write", "Edit", "Bash", "WebFetch"],
  },
};

/** What a specialist needs to know from the plan for its task (Markdown). */
function planContext(plan: ProjectPlan, task: PlanTask, lang: Lang): string[] {
  const out: string[] = [];
  const pages = () => {
    out.push("Pages (path: sections top to bottom):");
    for (const p of plan.pages) out.push(`- \`${p.path}\` ${L(p.title, lang)}: ${p.sections.join(" → ")}`);
  };
  switch (task.agent) {
    case "brand":
      out.push(`Site type: ${plan.siteType}. Starting templates: ${plan.templates.join(", ") || "—"}.`);
      break;
    case "content":
      out.push(`Languages: ${plan.languages.join(", ")}.`);
      pages();
      break;
    case "build":
      out.push(`Hosting: ${plan.hosting.value} (${plan.hosting.output}). Structure: ${plan.structure.value}. Starting templates: ${plan.templates.join(", ") || "—"}.`);
      pages();
      if (plan.commerce) out.push(`Store: catalogue ${plan.commerce.catalog.value}; payments ${plan.commerce.payments.join(", ") || "—"}; shipping ${plan.commerce.shipping}.`);
      break;
    case "legal":
      out.push("Legal pages:");
      for (const p of plan.legalPages) out.push(`- \`${p.path}\` ${L(p.title, lang)}${p.required ? " (required)" : " (recommended)"}`);
      for (const c of plan.compliance) out.push(`- ${L(c, lang)}`);
      break;
    case "seo":
      out.push(`Languages: ${plan.languages.join(", ")}. Domain: ${plan.domain.name ?? "not decided"}.`);
      pages();
      break;
    case "tracking":
      out.push(`Tools: ${plan.tracking.tools.join(", ") || "—"}; consent mode: ${plan.tracking.consentMode ? "yes" : "no"}.`);
      for (const s of plan.tracking.steps) out.push(`- ${L(s, lang)}`);
      break;
    case "forms":
      out.push(`Sender: ${plan.forms.value} — ${L(plan.forms.reason, lang)}`, `Spam protection: ${plan.forms.spam.join(", ") || "—"}. Environment: ${plan.forms.env.join(", ") || "—"}.`);
      break;
    case "qa":
      out.push(`Hosting: ${plan.hosting.value} (${plan.hosting.output}). ${plan.pages.length} pages, ${plan.legalPages.length} legal pages.`);
      break;
    case "deploy": {
      const guide = deployGuide({ host: plan.hosting.value, domain: plan.domain.name, forms: plan.forms.value, env: plan.forms.env });
      out.push(`Host: ${plan.hosting.value}. Domain: ${plan.domain.name ?? "not decided"}${plan.domain.ideas.length ? ` (ideas: ${plan.domain.ideas.join(", ")})` : ""}.`, "Steps:");
      guide.steps.forEach((s, i) => out.push(`${i + 1}. ${L(s, lang)}`));
      out.push(`Config files (\`npx vamos-ui site deploy\` writes them): ${Object.keys(guide.files).join(", ")}.`, "After the deploy:");
      for (const c of guide.checks) out.push(`- ${L(c, lang)}`);
      break;
    }
    default:
      break;
  }
  return out;
}

/**
 * The brief for one task, for the specialist that runs it: the goal, what to read, the plan
 * context, the steps, the requirements it owns, when it is done and how to report back.
 */
export function taskBrief(plan: ProjectPlan, id: string, lang: Lang = "tr"): string {
  const task = plan.tasks.find((x) => x.id === id);
  if (!task) throw new TaskError(`No task "${id}". Tasks: ${plan.tasks.map((x) => x.id).join(", ")}.`);
  const role = ROLES[task.agent];
  const reqs = plan.requirements?.filter((r) => r.agent === task.agent) ?? [];
  const out: string[] = [];
  out.push(`# Task \`${task.id}\` → ${role.name.en} specialist (vamos-${task.agent})`, "", `**Goal:** ${L(task.title, lang)}`, "");
  if (task.after?.length) out.push(`Done before this: ${task.after.join(", ")}.`, "");
  if (task.note) out.push(`Last note: ${task.note}`, "");
  out.push("## Read first", "- `vamos.project.json` (the plan; do not edit `answers`)", "- `vamos.site.json` (business details: the only source for facts)", "- `vamos.brand.json` if it exists", "");
  out.push("## Plan context", ...planContext(plan, task, lang), "");
  out.push("## Steps", ...role.steps.map((s, i) => `${i + 1}. ${s}`), "");
  if (task.needs?.length) out.push("## Needs from the user", ...task.needs.map((n) => `- ${L(n, lang)}`), "If any of these is still missing, report BLOCKED instead of guessing.", "");
  if (reqs.length) out.push("## Requirements you own", ...reqs.map((r) => `- [ ] \`${r.id}\` ${L(r.text, lang)}${r.check ? ` — check: \`${r.check}\`` : ""}`), "");
  if (task.agent === "qa" && plan.requirements?.length) {
    out.push("## Full requirement list (walk all of it)");
    for (const a of AGENTS) {
      const own = plan.requirements.filter((r) => r.agent === a);
      if (own.length) out.push(`- ${ROLES[a].name.en}: ${own.map((r) => `\`${r.id}\``).join(", ")}`);
    }
    out.push("");
  }
  out.push("## Rules", ...[...SHARED_RULES, ...role.rules].map((r) => `- ${r}`), "");
  out.push(
    "## Report back (last message)",
    "```",
    `STATUS: DONE ${task.id}   (or: BLOCKED ${task.id}: <what is missing, from whom>)`,
    "CHANGED: <files>",
    "CHECKS: <command → result, one per line>",
    "REQUIREMENTS: <id pass|fail|n/a, …>",
    "FOLLOW-UPS: <work for other specialists, or none>",
    "```",
  );
  return out.join("\n");
}

/** Short overview for the orchestrator and the CLI. */
export function formatProcess(state: ProcessState, lang: Lang = "tr"): string {
  const tr = lang === "tr";
  const mark: Record<TaskStatus, string> = { done: "✓", blocked: "!", todo: "·" };
  const out = [`${tr ? "Görevler" : "Tasks"}: ${state.done}/${state.total} ${tr ? "tamam" : "done"}`];
  for (const x of state.tasks) {
    const extra = x.status === "blocked" ? ` — ${x.note ?? ""}` : x.ready ? (tr ? "  ← hazır" : "  ← ready") : x.status === "todo" && x.waitingFor.length ? ` (${tr ? "bekliyor" : "after"}: ${x.waitingFor.join(", ")})` : "";
    out.push(`${mark[x.status]} ${x.id.padEnd(14)} [${x.agent}] ${x.title}${extra}`);
  }
  if (state.finished) out.push("", tr ? "Tüm görevler tamam." : "All tasks are done.");
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Agent files (Claude Code subagents + orchestrator skill)
// ---------------------------------------------------------------------------

export const AGENT_MARK = "<!-- vamos-ui:agent — written by `npx vamos-ui agents`; edit freely, delete this line to stop updates -->";

/** `.claude/agents/vamos-<agent>.md`: a Claude Code subagent for one specialist. */
export function subagentFile(agent: Agent): string {
  const role = ROLES[agent];
  return `---
name: vamos-${agent}
description: ${role.description} Use for a vamos.project.json task with agent "${agent}"; the orchestrator passes the brief from \`npx vamos-ui task brief <id>\`.
tools: ${role.tools.join(", ")}
---

${AGENT_MARK}

You are the ${role.name.en.toLowerCase()} specialist of a website built with Vamos UI (docs: https://ui.vamos.ist, Markdown: https://ui.vamos.ist/llms.txt).

You get one task brief from the orchestrator. Do that task and nothing else, then answer with the report block the brief ends with. If the brief is missing, run \`npx vamos-ui task brief <id>\` yourself.

## How you work
${role.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Rules
${[...SHARED_RULES, ...role.rules].map((r) => `- ${r}`).join("\n")}
- Talk to the user only through the orchestrator: put questions in your BLOCKED report.
`;
}

/** `.claude/skills/vamos-site/SKILL.md`: the orchestrator. Also used as plain instructions by clients without subagents. */
export function orchestratorSkill(): string {
  const roster = AGENTS.map((a) => `| \`${a}\` | vamos-${a} | ${ROLES[a].description} |`).join("\n");
  return `---
name: vamos-site
description: Orchestrate a website build with Vamos UI from first question to launch — interview the user, write the plan (vamos.project.json), run the brand, content, build, legal, SEO, measurement, forms, QA and deploy specialists in order, and report progress. Use when the user wants a new website, a redesign of a current site, or to continue a vamos.project.json plan.
---

${AGENT_MARK}

# Vamos site orchestrator

You run the process; specialists do the work. Keep the user in the loop in their language (Turkish by default when the business is in Türkiye).

## 1. Interview (once)
- If \`vamos.project.json\` has no complete plan: ask the questions from \`npx vamos-ui new --json\` (or the MCP tool \`start_project\`) a few at a time, save the answers to \`answers.json\` and run \`npx vamos-ui new --answers answers.json\` until it writes the plan. Ask; never answer for the user.
- A current site: \`npx vamos-ui site import <url>\` first and confirm what it found; the brand specialist imports the look.
- Show the plan (pages, hosting, forms, measurement, legal pages, open questions) and get a yes before building. Ask the open questions now.

## 2. Run the tasks
Loop until \`npx vamos-ui task next --json\` says finished:
1. \`npx vamos-ui task next --json\` lists the tasks that can start now. Several ready tasks are independent: run them in parallel.
2. For each: if its needs are not met, ask the user first (or mark it \`npx vamos-ui task block <id> --note "…"\`).
3. Get the brief with \`npx vamos-ui task brief <id>\` and hand it to the specialist subagent \`vamos-<agent>\` (Task / Agent tool). Without subagents, do the brief yourself, one task at a time.
4. Read the report. Check its CHECKS yourself (run \`npx vamos-ui verify\` at least). Then \`npx vamos-ui task done <id> --note "<one line>"\`, or \`task block <id> --note "<what is missing>"\` and ask the user.
5. FOLLOW-UPS go to the owning specialist; failures QA reports reopen that task (\`npx vamos-ui task reset <id>\`).
6. Tell the user in one or two lines what finished and what is next.

## 3. Launch
- QA must be done before deploy. The deploy specialist prepares; **publishing, DNS changes and replacing a live site need the user's explicit yes**.
- After launch: the live audit, a test form message, Search Console and the Google Business Profile link. Summarise what was built, what was checked and what the user still owns (legal approval, ids, content updates).

## Specialists
| agent | subagent | does |
|---|---|---|
${roster}

## Rules
- Facts (phone, address, prices, ids, legal details) come only from the user, vamos.site.json or the current site; never invent them.
- Do not skip QA or mark a task done whose checks failed.
- Answers change → \`npx vamos-ui new --answers answers.json\` rebuilds the plan and keeps task status.
`;
}

/** Files `npx vamos-ui agents` writes (path → content). */
export function agentFiles(): Record<string, string> {
  const files: Record<string, string> = { ".claude/skills/vamos-site/SKILL.md": orchestratorSkill() };
  for (const a of AGENTS) files[`.claude/agents/vamos-${a}.md`] = subagentFile(a);
  return files;
}
