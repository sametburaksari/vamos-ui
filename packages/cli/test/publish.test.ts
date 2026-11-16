import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { projectSlug, publishIO, publishPlan, stepLine } from "../src/project/publish";

afterEach(() => vi.restoreAllMocks());

describe("publishPlan", () => {
  it("vercel: npx vercel deploy --prod after a whoami check", () => {
    const plan = publishPlan({ host: "vercel", staticExport: false, nextVersion: "16.4.6" });
    expect(plan.steps.map(stepLine)).toEqual(["npx --yes vercel deploy --prod"]);
    expect(stepLine({ kind: "run", label: "", ...plan.check })).toBe("npx --yes vercel whoami");
    expect(plan.login).toBe("npx vercel login");
    expect(plan.notes.join(" ")).toMatch(/Hobby is for non-commercial use/);
  });

  it("cloudflare: build, then wrangler pages deploy out with the project name; a server build is refused", () => {
    const plan = publishPlan({ host: "cloudflare", staticExport: true, project: "sayfa-kitabevi", hasFunctions: true, packageManager: "pnpm" });
    expect(plan.steps.map(stepLine)).toEqual(["pnpm run build", "npx --yes wrangler pages deploy out --project-name sayfa-kitabevi"]);
    expect(plan.directory).toBe("out");
    expect(plan.login).toBe("npx wrangler login");
    expect(plan.check.loggedOut!.test("You are not authenticated. Please run `wrangler login`.")).toBe(true);
    expect(() => publishPlan({ host: "cloudflare", staticExport: false })).toThrow(/static export/);
  });

  it("spacefast: sf publish for a supported server build, else build + functions + --prebuilt", () => {
    const server = publishPlan({ host: "spacefast", staticExport: false, nextVersion: "16.3.8", space: "sayfa" });
    expect(server.steps.map(stepLine)).toEqual(["sf publish --space sayfa"]);
    expect(server.directory).toBe(".");

    const exported = publishPlan({ host: "spacefast", staticExport: true, nextVersion: "16.4.6", space: "sayfa", hasFunctions: true });
    expect(exported.steps.map(stepLine)).toEqual(["npm run build", "cp -R functions out/functions", "sf publish ./out --prebuilt --space sayfa"]);
    expect(exported.target).toBe("Spacefast Space sayfa");
    expect(exported.login).toBe("sf login");
    expect(exported.install).toContain("npm install -g spacefast");

    const linked = publishPlan({ host: "spacefast", staticExport: true, nextVersion: "17.0.0" });
    expect(linked.steps.map(stepLine)).toEqual(["npm run build", "sf publish ./out --prebuilt"]);
    expect(linked.notes[0]).toMatch(/not a version Spacefast builds/);

    expect(() => publishPlan({ host: "spacefast", staticExport: false, nextVersion: "16.4.6" })).toThrow(/output: "export"/);
  });

  it("other hosts have no --publish; package names become project slugs", () => {
    expect(() => publishPlan({ host: "cpanel", staticExport: true })).toThrow(/vercel, cloudflare and spacefast/);
    expect(projectSlug("@studio/Sayfa Kitabevi")).toBe("sayfa-kitabevi");
    expect(projectSlug("")).toBeNull();
  });
});

describe("vamos-ui site deploy --publish", () => {
  const opts = (cwd: string) => ({ cwd, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } });

  function project(next = "16.4.6"): string {
    const dir = mkdtempSync(path.join(tmpdir(), "vb-publish-"));
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "sayfa-kitabevi", dependencies: { next: `^${next}`, react: "19.2.0" } }));
    writeFileSync(path.join(dir, "next.config.ts"), 'export default { output: "export", images: { unoptimized: true } };');
    mkdirSync(path.join(dir, "functions/api"), { recursive: true });
    writeFileSync(path.join(dir, "functions/api/contact.ts"), "export async function POST() { return new Response(null); }");
    return dir;
  }

  function mockIO(check: { code: number; output?: string } = { code: 0 }) {
    const calls: string[] = [];
    vi.spyOn(publishIO, "run").mockImplementation(async (command, args) => {
      calls.push([command, ...args].join(" "));
      if (args.includes("whoami")) return { code: check.code, output: check.output ?? "" };
      return { code: 0, output: "" };
    });
    vi.spyOn(publishIO, "copy").mockImplementation((_root, from, to) => {
      calls.push(`copy ${from} ${to}`);
    });
    return calls;
  }

  it("without --publish nothing runs", async () => {
    const calls = mockIO();
    expect(await run(["site", "deploy", "--host", "spacefast"], opts(project()))).toBe(0);
    expect(calls).toEqual([]);
  });

  it("non-interactive without --yes: shows the plan and runs nothing", async () => {
    const calls = mockIO();
    expect(await run(["site", "deploy", "--host", "spacefast", "--publish"], opts(project()))).toBe(1);
    expect(calls).toEqual([]);
  });

  it("--dry-run --publish prints the plan without running it", async () => {
    const calls = mockIO();
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    expect(await run(["site", "deploy", "--host", "spacefast", "--publish", "--dry-run", "--json"], opts(project()))).toBe(0);
    const out = JSON.parse(write.mock.calls.map((c) => String(c[0])).join(""));
    write.mockRestore();
    expect(out.publish.commands).toEqual(["npm run build", "cp -R functions out/functions", "sf publish ./out --prebuilt"]);
    expect(out.secretCommands).toContain("sf env set RESEND_API_KEY --value-from-stdin --space <space>");
    expect(calls).toEqual([]);
  });

  it("spacefast --yes: checks the login, builds, copies functions/ and publishes the export", async () => {
    const calls = mockIO();
    expect(await run(["site", "deploy", "--host", "spacefast", "--space", "sayfa", "--publish", "--yes"], opts(project()))).toBe(0);
    expect(calls).toEqual(["sf whoami", "npm run build", "copy functions out/functions", "sf publish ./out --prebuilt --space sayfa"]);
  });

  it("cloudflare --yes: wrangler pages deploy out with the package name as the project", async () => {
    const calls = mockIO({ code: 0, output: "You are logged in with an OAuth Token" });
    expect(await run(["site", "deploy", "--host", "cloudflare", "--publish", "--yes"], opts(project()))).toBe(0);
    expect(calls).toEqual(["npx --yes wrangler whoami", "npm run build", "npx --yes wrangler pages deploy out --project-name sayfa-kitabevi"]);
  });

  it("vercel --yes runs npx vercel deploy --prod", async () => {
    const calls = mockIO();
    expect(await run(["site", "deploy", "--host", "vercel", "--publish", "--yes"], opts(project()))).toBe(0);
    expect(calls).toEqual(["npx --yes vercel whoami", "npx --yes vercel deploy --prod"]);
  });

  it("signed out or missing CLI: prints the login / install command and publishes nothing", async () => {
    let calls = mockIO({ code: 0, output: "You are not authenticated. Please run `wrangler login`." });
    expect(await run(["site", "deploy", "--host", "cloudflare", "--publish", "--yes"], opts(project()))).toBe(1);
    expect(calls).toEqual(["npx --yes wrangler whoami"]);
    vi.restoreAllMocks();
    calls = mockIO({ code: 10 });
    expect(await run(["site", "deploy", "--host", "spacefast", "--publish", "--yes"], opts(project()))).toBe(1);
    expect(calls).toEqual(["sf whoami"]);
    vi.restoreAllMocks();
    calls = mockIO({ code: 127 });
    expect(await run(["site", "deploy", "--host", "spacefast", "--publish", "--yes"], opts(project()))).toBe(1);
    expect(calls).toEqual(["sf whoami"]);
  });

  it("a host without a CLI flow refuses --publish", async () => {
    const calls = mockIO();
    expect(await run(["site", "deploy", "--host", "cpanel", "--publish", "--yes"], opts(project()))).toBe(1);
    expect(calls).toEqual([]);
  });
});
