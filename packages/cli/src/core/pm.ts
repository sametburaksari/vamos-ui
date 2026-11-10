import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseSpec } from "./resolve";
import type { PackageManager } from "./project";
import { CliError } from "./types";

/** Specs whose package is not yet in package.json (dependencies, devDependencies or peerDependencies). */
export function missingDependencies(root: string, specs: string[]): string[] {
  let pkg: any = {};
  try {
    pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  } catch {
    /* no package.json: everything is missing */
  }
  const present = new Set(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }));
  return specs.filter((s) => !present.has(parseSpec(s).name));
}

export function installCommand(pm: PackageManager, specs: string[]): [string, string[]] {
  switch (pm) {
    case "pnpm":
      return ["pnpm", ["add", ...specs]];
    case "yarn":
      return ["yarn", ["add", ...specs]];
    case "bun":
      return ["bun", ["add", ...specs]];
    default:
      return ["npm", ["install", ...specs]];
  }
}

export function runInstall(root: string, pm: PackageManager, specs: string[]): Promise<void> {
  const [cmd, args] = installCommand(pm, specs);
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
    let output = "";
    child.stdout?.on("data", (d) => (output += d));
    child.stderr?.on("data", (d) => (output += d));
    child.on("error", (err) => reject(new CliError(`Could not run ${cmd}: ${err.message}`, `Install manually: ${cmd} ${args.join(" ")}`)));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new CliError(`${cmd} ${args[0]} failed (exit ${code}).`, `${output.trim().split("\n").slice(-8).join("\n")}\n\nInstall manually: ${cmd} ${args.join(" ")}`));
    });
  });
}
