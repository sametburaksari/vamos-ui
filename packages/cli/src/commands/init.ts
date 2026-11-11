import { existsSync } from "node:fs";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { writeAgentFiles } from "../core/agent";
import { DEFAULT_CONFIG, findProjectRoot, readConfig, validateConfig, writeConfig, CONFIG_FILE } from "../core/config";
import { detectProject, suggestPaths } from "../core/project";
import { DEFAULT_REGISTRY, Registry, resolveRegistryLocation } from "../core/registry";
import { CliError, type RegistryIndex, type VamosConfig } from "../core/types";
import { p, pc, type Context } from "../ui";
import { installItems } from "./shared";
import { htmlSnippet } from "./theme";
import { applyPreset, parsePresetFlag } from "./preset";
import { describePreset, encodePreset } from "../preset";

/** Base items installed by init: "styles" plus the lib items tagged "base". */
export function baseItems(index: RegistryIndex): string[] {
  const names = new Set(index.items.map((i) => i.name));
  const base = index.items.filter((i) => i.type === "lib" && i.tags?.includes("base")).map((i) => i.name);
  if (!base.length) {
    const fallback = ["lib-base", "lib-cn", "lib-utils"].find((n) => names.has(n));
    if (fallback) base.push(fallback);
  }
  return [...(names.has("styles") ? ["styles"] : []), ...base];
}

export async function init(ctx: Context, args: ParsedArgs): Promise<number> {
  const root = findProjectRoot(ctx.cwd);
  const project = detectProject(root);
  const presetCode = str(args.flags, "preset");
  const preset = presetCode ? parsePresetFlag(presetCode) : null;
  p.intro(pc.bold("Vamos UI"));

  const framework = project.framework === "next" ? `Next.js${project.appRouter ? " (App Router)" : ""}` : project.framework === "vite" ? "Vite" : "no known framework";
  const tw = project.tailwind.v4 ? "Tailwind CSS v4" : project.tailwind.installed ? `Tailwind CSS ${project.tailwind.version}` : "no Tailwind CSS";
  p.log.info(`Detected ${pc.bold(framework)}, ${pc.bold(tw)}, ${pc.bold(project.packageManager)}`);
  if (!project.tailwind.v4) {
    p.log.warn(`Vamos UI needs Tailwind CSS v4. ${project.tailwind.installed ? "Upgrade with `npx @tailwindcss/upgrade`." : "Install it first: https://tailwindcss.com/docs/installation"}`);
  }

  const existing = await readConfig(root);
  let config: VamosConfig;
  if (existing && !bool(args.flags, "force")) {
    config = existing;
    p.log.info(`Using the existing ${CONFIG_FILE}.`);
  } else {
    const s = suggestPaths(project);
    const defaults = {
      uiDir: str(args.flags, "ui-dir") ?? s.uiDir,
      blocksDir: str(args.flags, "blocks-dir") ?? s.blocksDir,
      css: str(args.flags, "css") ?? s.css,
      importAlias: str(args.flags, "alias") ?? s.importAlias,
    };
    if (ctx.interactive) {
      const answers = await p.group(
        {
          uiDir: () => p.text({ message: "Where should components go?", initialValue: defaults.uiDir }),
          blocksDir: () => p.text({ message: "Where should blocks go?", initialValue: defaults.blocksDir }),
          css: () => p.text({ message: "Your global CSS file", initialValue: defaults.css }),
          importAlias: () => p.text({ message: "Import alias for components", initialValue: defaults.importAlias }),
        },
        {
          onCancel: () => {
            p.cancel("Cancelled.");
            throw new CliError("__cancelled__");
          },
        },
      );
      Object.assign(defaults, answers);
    }
    config = validateConfig({
      ...DEFAULT_CONFIG,
      ...defaults,
      registry: ctx.registryFlag ?? DEFAULT_REGISTRY,
    });
    if (bool(args.flags, "dry-run")) p.log.info(pc.dim(`Would write ${CONFIG_FILE} (dry run).`));
    else {
      await writeConfig(root, config);
      p.log.success(`Wrote ${CONFIG_FILE}`);
    }
  }

  if (!project.alias) {
    const [alias] = config.importAlias.split("/");
    p.log.warn(`No path alias found in tsconfig.json. Add "paths": { "${alias}/*": ["./${project.srcDir ? "src/" : ""}*"] } so ${config.importAlias} resolves.`);
  }
  if (!config.tsx) p.log.warn("vamos-ui ships TypeScript sources; tsx: false is not supported yet, files are written as .tsx.");

  const location = resolveRegistryLocation({ flag: ctx.registryFlag, config: config.registry, cwd: root, env: ctx.env });
  const registry = new Registry(location);
  const index = await registry.index();
  const base = baseItems(index);
  const session = { root, config, registry };
  if (base.length) {
    await installItems(ctx, session, base, { overwrite: bool(args.flags, "overwrite"), dryRun: bool(args.flags, "dry-run"), install: bool(args.flags, "install", true) });
  }

  if (preset) {
    const res = await applyPreset(root, config, preset, { dryRun: bool(args.flags, "dry-run") });
    config = { ...config, theme: res.theme };
    p.log.step(`Preset ${pc.bold(encodePreset(preset))}: ${describePreset(preset)}${res.brand ? pc.dim(` (wrote ${res.brand.file} and ${res.brand.cssFile})`) : ""}${bool(args.flags, "dry-run") ? pc.dim(" (dry run)") : ""}`);
  }

  if (bool(args.flags, "agent") && bool(args.flags, "dry-run")) {
    p.log.info(pc.dim("Would write AGENTS.md / CLAUDE.md rules and .claude/skills/vamos-ui (dry run)."));
  } else if (bool(args.flags, "agent")) {
    const res = await writeAgentFiles(root, config, registry);
    p.log.step(`Agent rules: ${res.written.join(", ")}${res.skillSource === "builtin" ? pc.dim(" (built-in skill)") : ""}`);
    p.log.info(`Optional MCP server: ${pc.cyan("npx vamos-ui mcp add")} ${pc.dim("(Claude Code, Cursor, VS Code, Windsurf, Codex, Gemini CLI)")}`);
  }

  p.note(htmlSnippet(project.framework, config.theme ?? {}, project.srcDir && project.appRouter && !existsSync(path.join(root, "app"))), "Theme: set the axes on <html>");
  p.outro(`Ready. Next: ${pc.cyan("npx vamos-ui add button")}  ${pc.dim("·")}  ${pc.cyan("npx vamos-ui list --type block")}`);
  return 0;
}
