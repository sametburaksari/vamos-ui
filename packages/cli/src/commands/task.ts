import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { findProjectRoot } from "../core/config";
import { CliError } from "../core/types";
import {
  AGENT_MARK,
  PROJECT_FILE,
  TaskError,
  agentFiles,
  formatProcess,
  processState,
  setTaskStatus,
  taskBrief,
  type Lang,
  type ProjectFile,
  type TaskStatus,
} from "../project";
import { out, p, pc, plural, printJson, type Context } from "../ui";

const TASK_HELP = `${pc.bold("vamos-ui task")}  Walk the website plan task by task.

${pc.bold("Usage")}
  npx vamos-ui task [list]                 every task, its status and what it waits for
  npx vamos-ui task next                   the tasks that can start now (+ their briefs with --brief)
  npx vamos-ui task brief <id>             the brief for the specialist that runs the task
  npx vamos-ui task done <id> [--note …]   mark done (its dependencies must be done)
  npx vamos-ui task block <id> --note …    mark blocked and say what is missing
  npx vamos-ui task reset <id>             back to todo (QA found a problem)

Tasks, their order and the specialists come from ${PROJECT_FILE} (written by ${pc.cyan("npx vamos-ui new")}).
Brand and content start together, the build follows the brand, legal / SEO / forms /
measurement follow the build, QA checks everything and deploy comes last. The orchestrator
skill and the specialist subagents (${pc.cyan("npx vamos-ui agents")}) use these commands.

${pc.bold("Options")}
  --lang tr|en   language of titles and briefs (default: the plan's)
  --json         machine-readable output`;

const AGENTS_HELP = `${pc.bold("vamos-ui agents")}  Write the website orchestrator and its specialists for AI assistants.

${pc.bold("Usage")}
  npx vamos-ui agents [--dry-run] [--force]

Writes
  .claude/skills/vamos-site/SKILL.md    the orchestrator: interview → plan → tasks → QA → launch
  .claude/agents/vamos-<role>.md        nine specialist subagents (brand, content, build, legal,
                                        seo, tracking, forms, qa, deploy) for Claude Code
Clients without subagents (Codex, Cursor, Gemini) follow the same process from AGENTS.md
(${pc.cyan("npx vamos-ui init")}). A file whose first marker line you removed is left alone; --force
rewrites it anyway.`;

async function loadProject(root: string): Promise<{ file: string; project: ProjectFile }> {
  const file = path.join(root, PROJECT_FILE);
  if (!existsSync(file)) throw new CliError(`No ${PROJECT_FILE} here.`, `Plan the site first: npx vamos-ui new`);
  let project: ProjectFile;
  try {
    project = JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    throw new CliError(`${PROJECT_FILE} is not valid JSON.`, (err as Error).message);
  }
  if (!project.plan?.tasks?.length) throw new CliError(`${PROJECT_FILE} has no tasks yet.`, `Finish the interview: npx vamos-ui new`);
  return { file, project };
}

function planLang(project: ProjectFile, flag: string | undefined): Lang {
  if (flag === "en" || flag === "tr") return flag;
  return project.plan.languages?.[0]?.startsWith("en") ? "en" : "tr";
}

/** `vamos-ui task` */
export async function task(ctx: Context, args: ParsedArgs): Promise<number> {
  const [sub = "list", id] = args.positionals;
  if (bool(args.flags, "help") || sub === "help") {
    out(TASK_HELP);
    return 0;
  }
  const root = findProjectRoot(ctx.cwd);
  const { file, project } = await loadProject(root);
  const lang = planLang(project, str(args.flags, "lang"));
  const wrap = <T>(fn: () => T): T => {
    try {
      return fn();
    } catch (err) {
      if (err instanceof TaskError) throw new CliError(err.message);
      throw err;
    }
  };

  if (sub === "list" || sub === "status") {
    const state = processState(project.plan, lang);
    if (ctx.json) printJson(state);
    else out(formatProcess(state, lang));
    return 0;
  }
  if (sub === "next") {
    const state = processState(project.plan, lang);
    const withBriefs = bool(args.flags, "brief");
    if (ctx.json) {
      printJson({
        finished: state.finished,
        done: state.done,
        total: state.total,
        ready: state.ready.map((x) => ({ ...x, subagent: `vamos-${x.agent}`, ...(withBriefs ? { brief: taskBrief(project.plan, x.id, lang) } : {}) })),
        blocked: state.blocked,
      });
      return 0;
    }
    if (state.finished) {
      out(lang === "tr" ? "Tüm görevler tamam." : "All tasks are done.");
      return 0;
    }
    if (!state.ready.length) {
      out(formatProcess(state, lang));
      out("\n" + (lang === "tr" ? "Başlayabilecek görev yok: engelli görevlerin eksiklerini tamamlayın." : "Nothing can start: resolve the blocked tasks first."));
      return 0;
    }
    for (const x of state.ready) {
      if (withBriefs) out(taskBrief(project.plan, x.id, lang) + "\n");
      else out(`${pc.cyan(x.id)} [vamos-${x.agent}] ${x.title}${x.needs.length ? pc.dim(`  — ${x.needs.join(" ")}`) : ""}`);
    }
    if (!withBriefs) out("\n" + pc.dim(`npx vamos-ui task brief <id>`));
    return 0;
  }
  if (sub === "brief") {
    if (!id) throw new CliError("Which task?", "npx vamos-ui task brief <id>  (ids: npx vamos-ui task list)");
    const brief = wrap(() => taskBrief(project.plan, id, lang));
    if (ctx.json) printJson({ id, brief });
    else out(brief);
    return 0;
  }
  const status: Record<string, TaskStatus> = { done: "done", block: "blocked", blocked: "blocked", reset: "todo", todo: "todo" };
  if (status[sub]) {
    if (!id) throw new CliError(`Which task?`, `npx vamos-ui task ${sub} <id>`);
    const note = str(args.flags, "note");
    const plan = wrap(() => setTaskStatus(project.plan, id, status[sub]!, note));
    await writeFile(file, JSON.stringify({ ...project, plan }, null, 2) + "\n");
    const state = processState(plan, lang);
    if (ctx.json) {
      printJson({ id, status: status[sub], ready: state.ready.map((x) => x.id), done: state.done, total: state.total, finished: state.finished });
      return 0;
    }
    p.log.success(`${id} → ${status[sub]}${note ? pc.dim(`  ${note}`) : ""}`);
    if (state.finished) p.log.info(lang === "tr" ? "Tüm görevler tamam." : "All tasks are done.");
    else if (state.ready.length) p.log.info(`${lang === "tr" ? "Sıradaki" : "Next"}: ${state.ready.map((x) => pc.cyan(x.id)).join(", ")}`);
    return 0;
  }
  throw new CliError(`Unknown task command "${sub}".`, "npx vamos-ui task --help");
}

/** Writes the orchestrator skill and specialist subagents. Shared by `agents` and `new`. */
export async function writeOrchestrator(root: string, opts: { dryRun?: boolean; force?: boolean } = {}): Promise<{ written: string[]; kept: string[] }> {
  const written: string[] = [];
  const kept: string[] = [];
  for (const [rel, content] of Object.entries(agentFiles())) {
    const abs = path.join(root, rel);
    if (existsSync(abs)) {
      const current = readFileSync(abs, "utf8");
      if (current === content) continue;
      if (!current.includes(AGENT_MARK) && !opts.force) {
        kept.push(rel);
        continue;
      }
    }
    if (!opts.dryRun) {
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, content);
    }
    written.push(rel);
  }
  return { written, kept };
}

/** `vamos-ui agents` */
export async function agents(ctx: Context, args: ParsedArgs): Promise<number> {
  if (bool(args.flags, "help")) {
    out(AGENTS_HELP);
    return 0;
  }
  const root = findProjectRoot(ctx.cwd);
  const dryRun = bool(args.flags, "dry-run");
  const result = await writeOrchestrator(root, { dryRun, force: bool(args.flags, "force") });
  if (ctx.json) {
    printJson({ ...result, dryRun });
    return 0;
  }
  p.intro(pc.bold("vamos-ui agents"));
  const lines = [...result.written.map((f) => `${dryRun ? pc.dim("+") : pc.green("+")} ${f}`), ...result.kept.map((f) => `${pc.dim("=")} ${f} ${pc.dim("edited by you, kept (--force to replace)")}`)];
  if (lines.length) p.note(lines.join("\n"), dryRun ? "Orchestrator (dry run)" : "Orchestrator");
  p.outro(
    result.written.length
      ? `${dryRun ? "Would write" : "Wrote"} ${plural(result.written.length, "file")}. Ask your assistant: "${existsSync(path.join(root, PROJECT_FILE)) ? `continue the site plan in ${PROJECT_FILE}` : "build a new website with vamos-site"}".`
      : result.kept.length ? "Nothing else to write." : "Up to date.",
  );
  return 0;
}
