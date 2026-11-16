/**
 * `site deploy --publish`: what runs to publish a kit site on the hosts that have a CLI for it
 * (Vercel, Cloudflare Pages, Spacefast). Pure: returns the plan (commands, the account check, the
 * login command); the CLI shows it, asks, then runs it through `publishIO` (tests replace it).
 */

import { spawn } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import type { Hosting } from "./plan";
import { spacefastNextMode } from "./deploy";

export type PackageManagerName = "npm" | "pnpm" | "yarn" | "bun";

export interface PublishInput {
  host: Hosting;
  /** next.config sets output: "export". */
  staticExport: boolean;
  /** Installed Next.js version (or the package.json range). */
  nextVersion?: string | null;
  /** Cloudflare Pages / Vercel project name. */
  project?: string | null;
  /** Spacefast Space (slug, id or domain); empty: the linked Space. */
  space?: string | null;
  /** functions/ exists (the edge contact form). */
  hasFunctions?: boolean;
  packageManager?: PackageManagerName;
}

export type PublishStep =
  | { kind: "run"; label: string; command: string; args: string[] }
  | { kind: "copy"; label: string; from: string; to: string };

export interface PublishPlan {
  host: Hosting;
  /** What is published: project, Space, or how the host picks it. */
  target: string;
  /** Directory that is uploaded, relative to the project root. */
  directory: string;
  steps: PublishStep[];
  /** Command that fails (or prints `loggedOut`) when the CLI is missing or not signed in. */
  check: { command: string; args: string[]; loggedOut?: RegExp };
  /** Shown when the check fails. */
  login: string;
  /** Shown when the host's CLI is not installed (npx-based CLIs install themselves). */
  install?: string;
  notes: string[];
}

/** A command line as it is shown to the user. */
export function stepLine(step: PublishStep): string {
  return step.kind === "copy" ? `cp -R ${step.from} ${step.to}` : [step.command, ...step.args].join(" ");
}

/** A Pages project name from the package name: lowercase letters, digits and dashes. */
export function projectSlug(name: string | null | undefined): string | null {
  const slug = (name ?? "").replace(/^@[^/]+\//, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 58);
  return slug || null;
}

function buildStep(pm: PackageManagerName): PublishStep {
  return { kind: "run", label: "build", command: pm, args: ["run", "build"] };
}

/** The publish plan for a host, or an Error saying why --publish cannot run there. */
export function publishPlan(i: PublishInput): PublishPlan {
  const pm = i.packageManager ?? "npm";
  switch (i.host) {
    case "vercel":
      return {
        host: "vercel",
        target: i.project ? `Vercel project ${i.project} (the one linked in .vercel/, else Vercel asks)` : "the Vercel project linked in .vercel/ (Vercel asks on the first deploy)",
        directory: ".",
        steps: [{ kind: "run", label: "deploy", command: "npx", args: ["--yes", "vercel", "deploy", "--prod"] }],
        check: { command: "npx", args: ["--yes", "vercel", "whoami"] },
        login: "npx vercel login",
        notes: ["Vercel builds the project in its cloud; Hobby is for non-commercial use only, a client or business site needs Pro."],
      };
    case "cloudflare": {
      if (!i.staticExport) throw new Error('Cloudflare Pages publishing needs a static export: set output: "export" in next.config. A Next.js server deploys as a Worker with OpenNext (npx opennextjs-cloudflare deploy).');
      const project = i.project || "site";
      return {
        host: "cloudflare",
        target: `Cloudflare Pages project ${project}`,
        directory: "out",
        steps: [buildStep(pm), { kind: "run", label: "deploy", command: "npx", args: ["--yes", "wrangler", "pages", "deploy", "out", "--project-name", project] }],
        check: { command: "npx", args: ["--yes", "wrangler", "whoami"], loggedOut: /not authenticated|not logged in|wrangler login/i },
        login: "npx wrangler login",
        notes: i.hasFunctions ? ["wrangler runs from the project root, so functions/ (the contact form) deploys with out/."] : [],
      };
    }
    case "spacefast": {
      const mode = spacefastNextMode(i.nextVersion);
      const space = i.space ? ["--space", i.space] : [];
      const target = i.space ? `Spacefast Space ${i.space}` : "the Space linked in .spacefast/ (a new one when none is linked)";
      const base = { host: "spacefast" as const, target, check: { command: "sf", args: ["whoami"] }, login: "sf login", install: "npm install -g spacefast  (https://spacefast.com/docs/cli)" };
      if (!i.staticExport) {
        if (mode !== "server") {
          throw new Error(
            `${i.nextVersion ? `Next.js ${i.nextVersion}` : "This Next.js version"} cannot be server-rendered on Spacefast (server: 16.2.x, 16.3.x, 15.5.24+). Set output: "export" in next.config and run again; it is then built here and uploaded with sf publish ./out --prebuilt.`,
          );
        }
        return { ...base, directory: ".", steps: [{ kind: "run", label: "publish", command: "sf", args: ["publish", ...space] }], notes: [`Next.js ${i.nextVersion}: Spacefast builds it server-rendered with its bundled adapter.`] };
      }
      return {
        ...base,
        directory: "out",
        steps: [
          buildStep(pm),
          ...(i.hasFunctions ? [{ kind: "copy" as const, label: "functions", from: "functions", to: "out/functions" }] : []),
          { kind: "run", label: "publish", command: "sf", args: ["publish", "./out", "--prebuilt", ...space] },
        ],
        notes: [
          mode === "prebuilt" || mode === null
            ? `${i.nextVersion ? `Next.js ${i.nextVersion} is not a version Spacefast builds` : "Next.js version unknown"}: the export is built here and uploaded unchanged (--prebuilt).`
            : "The static export is built here and uploaded unchanged (--prebuilt).",
          ...(i.hasFunctions ? ["functions/ is copied into out/ so the contact form route publishes with the site. Publish signed in: an anonymous Space cannot reach api.resend.com."] : []),
        ],
      };
    }
    default:
      throw new Error(`--publish runs for vercel, cloudflare and spacefast; on ${i.host} follow the printed steps.`);
  }
}

export interface RunResult {
  code: number;
  output: string;
}

/** Side effects of a publish; tests replace these. */
export const publishIO = {
  run(command: string, args: string[], o: { cwd: string; capture?: boolean; stdout?: "inherit" | "stderr" }): Promise<RunResult> {
    return new Promise((resolve) => {
      const out = o.stdout === "stderr" ? process.stderr : "inherit";
      const child = spawn(command, args, { cwd: o.cwd, stdio: o.capture ? ["ignore", "pipe", "pipe"] : ["inherit", out, o.stdout === "stderr" ? process.stderr : "inherit"], shell: process.platform === "win32" });
      let output = "";
      child.stdout?.on("data", (d) => (output += String(d)));
      child.stderr?.on("data", (d) => (output += String(d)));
      child.on("error", (e: NodeJS.ErrnoException) => resolve({ code: e.code === "ENOENT" ? 127 : 1, output: e.message }));
      child.on("close", (code) => resolve({ code: code ?? 1, output }));
    });
  },
  copy(root: string, from: string, to: string): void {
    const dest = path.join(root, to);
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    cpSync(path.join(root, from), dest, { recursive: true });
  },
};
