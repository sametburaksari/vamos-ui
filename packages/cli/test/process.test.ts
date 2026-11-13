import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "../src/cli";
import {
  AGENTS,
  AGENT_MARK,
  agentFiles,
  buildPlan,
  carryTaskState,
  deployGuide,
  htaccess,
  processState,
  requirementsFor,
  setTaskStatus,
  taskBrief,
  taskDependencies,
  type Answers,
} from "../src/project";

const answers: Answers = {
  business_name: "Kuzey Çiçek Atölyesi",
  site_type: "local-business",
  description: "El yapımı buket atölyesi.",
  languages: ["tr"],
  existing_site: "",
  domain: "yes",
  domain_name: "kuzeycicek.com.tr",
  hosting: "cpanel",
  structure: "recommend",
  sections: ["services", "gallery", "faq", "location"],
  contact_channels: ["form", "phone", "map"],
  form_delivery: "recommend",
  email: "merhaba@kuzeycicek.com.tr",
  tracking: ["ga4", "gsc"],
  legal_entity: "sole",
};

describe("requirements", () => {
  it("adds the site type's pack to the baseline, grouped by specialist", () => {
    const shop = requirementsFor({ siteType: "ecommerce", tr: true, forms: true, tracking: true, cookies: true, multilingual: false, company: true });
    const ids = shop.map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining(["seo-meta", "deploy-https", "shop-etbis", "shop-checkout-legal", "tracking-consent", "legal-company"]));
    const order = shop.map((r) => AGENTS.indexOf(r.agent));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    const blog = requirementsFor({ siteType: "blog", tr: false, forms: false, tracking: false, cookies: false, multilingual: true, company: false });
    expect(blog.map((r) => r.id)).toEqual(expect.arrayContaining(["blog-article", "seo-hreflang"]));
    expect(blog.some((r) => r.id.startsWith("forms-") || r.id === "shop-etbis")).toBe(false);
  });

  it("orders tasks: brand + content first, build after brand, QA after all, deploy last", () => {
    const deps = taskDependencies(["brand", "content", "build", "catalog", "legal", "seo", "forms", "qa", "deploy"]);
    expect(deps.brand).toEqual([]);
    expect(deps.content).toEqual([]);
    expect(deps.build).toEqual(["brand"]);
    expect(deps.catalog).toEqual(["build"]);
    expect(deps.seo).toEqual(["build", "content"]);
    expect(deps.qa).toEqual(["brand", "content", "build", "catalog", "legal", "seo", "forms"]);
    expect(deps.deploy).toEqual(["qa"]);
  });
});

describe("process", () => {
  const plan = buildPlan(answers);

  it("the plan carries requirements and task order", () => {
    expect(plan.requirements.some((r) => r.id === "local-nap")).toBe(true);
    expect(plan.tasks.find((t) => t.id === "deploy")?.after).toEqual(["qa"]);
    expect(processState(plan).ready.map((t) => t.id)).toEqual(["brand", "content"]);
  });

  it("done needs the dependencies; blocked needs a note; reset clears it", () => {
    expect(() => setTaskStatus(plan, "build", "done")).toThrow(/waits for brand/);
    expect(() => setTaskStatus(plan, "content", "blocked")).toThrow(/--note/);
    expect(() => setTaskStatus(plan, "nope", "done")).toThrow(/No task/);
    let next = setTaskStatus(plan, "brand", "done", "accent ok");
    next = setTaskStatus(next, "content", "blocked", "photos");
    const state = processState(next);
    expect(state.ready.map((t) => t.id)).toEqual(["build"]);
    expect(state.blocked.map((t) => t.id)).toEqual(["content"]);
    expect(setTaskStatus(next, "content", "todo").tasks.find((t) => t.id === "content")?.note).toBeUndefined();
    expect(plan.tasks.every((t) => t.status === "todo")).toBe(true);
  });

  it("keeps status when the plan is rebuilt from new answers", () => {
    const done = setTaskStatus(plan, "brand", "done", "ok");
    const rebuilt = carryTaskState(done, buildPlan({ ...answers, sections: ["services"] }));
    expect(rebuilt.tasks.find((t) => t.id === "brand")).toMatchObject({ status: "done", note: "ok" });
  });

  it("briefs carry the plan context, the requirements and the report format", () => {
    const brief = taskBrief(plan, "forms", "en");
    expect(brief).toContain("vamos-forms");
    expect(brief).toContain("Sender: php-mail");
    expect(brief).toContain("`forms-delivery`");
    expect(brief).toContain("STATUS: DONE forms");
    const qa = taskBrief(plan, "qa", "en");
    expect(qa).toContain("Full requirement list");
    expect(taskBrief(plan, "deploy", "tr")).toContain("public/.htaccess");
  });

  it("agent files: the orchestrator skill and one subagent per specialist", () => {
    const files = agentFiles();
    expect(Object.keys(files)).toHaveLength(AGENTS.length + 1);
    expect(files[".claude/skills/vamos-site/SKILL.md"]).toMatch(/^---\nname: vamos-site\n/);
    expect(files[".claude/agents/vamos-qa.md"]).toMatch(/^---\nname: vamos-qa\n/);
    for (const content of Object.values(files)) expect(content).toContain(AGENT_MARK);
  });
});

describe("deploy guides", () => {
  it("cPanel: https + one host name, headers, 404, project files denied", () => {
    const conf = htaccess({ host: "cpanel", domain: "www.ornek.com.tr", www: true });
    expect(conf).toContain("RewriteRule ^ https://www.ornek.com.tr%{REQUEST_URI} [R=301,L]");
    expect(conf).toContain("RewriteCond %{HTTP_HOST} ^ornek\\.com\\.tr$ [NC]");
    expect(conf).toContain('Header always set X-Content-Type-Options "nosniff"');
    expect(conf).toContain("RewriteCond %{HTTP_HOST} ^(www\\.)?ornek\\.com\\.tr$ [NC]");
    expect(conf).toContain('<If "%{HTTP_HOST} =~ /^(www\\.)?ornek\\.com\\.tr$/i">');
    expect(conf).toContain("ErrorDocument 404 /404.html");
    expect(conf).toMatch(/vamos\\\.\.\*\\\.json/);
  });

  it("every host gets config files and steps", () => {
    for (const host of ["vercel", "netlify", "cloudflare", "cpanel", "vps"] as const) {
      const g = deployGuide({ host, domain: "ornek.com", env: ["SMTP_HOST"] });
      expect(Object.keys(g.files).length).toBeGreaterThan(0);
      expect(g.steps.length).toBeGreaterThan(1);
      expect(g.checks[0]!.en).toContain("https://ornek.com");
    }
    const vercel = JSON.parse(deployGuide({ host: "vercel", domain: "ornek.com" }).files["vercel.json"]!);
    expect(vercel.redirects[0]).toMatchObject({ has: [{ type: "host", value: "www.ornek.com" }], destination: "https://ornek.com/:path*", permanent: true });
    expect(deployGuide({ host: "vps", domain: "ornek.com" }).files["deploy/nginx-ornek.com.conf"]).toContain("return 301 https://ornek.com$request_uri;");
  });
});

describe("cli: task, agents, site deploy", () => {
  const opts = (cwd: string) => ({ cwd, interactive: false, env: { ...process.env, CI: "1", NO_COLOR: "1" } });

  it("new writes the agents; task moves through the plan; site deploy writes the host config", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "vb-process-"));
    writeFileSync(path.join(dir, "answers.json"), JSON.stringify(answers));
    expect(await run(["new", "--answers", "answers.json", "--no-import"], opts(dir))).toBe(0);
    expect(existsSync(path.join(dir, ".claude/skills/vamos-site/SKILL.md"))).toBe(true);
    expect(existsSync(path.join(dir, ".claude/agents/vamos-deploy.md"))).toBe(true);

    expect(await run(["task", "done", "build"], opts(dir))).toBe(1);
    expect(await run(["task", "done", "brand", "--note", "ok"], opts(dir))).toBe(0);
    const project = JSON.parse(readFileSync(path.join(dir, "vamos.project.json"), "utf8"));
    expect(project.plan.tasks.find((t: { id: string }) => t.id === "brand")).toMatchObject({ status: "done", note: "ok" });

    // Rebuilding the plan keeps the status.
    expect(await run(["new", "--answers", "answers.json", "--no-import"], opts(dir))).toBe(0);
    const again = JSON.parse(readFileSync(path.join(dir, "vamos.project.json"), "utf8"));
    expect(again.plan.tasks.find((t: { id: string }) => t.id === "brand").status).toBe("done");

    expect(await run(["site", "deploy", "--dry-run"], opts(dir))).toBe(0);
    expect(existsSync(path.join(dir, "public/.htaccess"))).toBe(false);
    expect(await run(["site", "deploy"], opts(dir))).toBe(0);
    expect(readFileSync(path.join(dir, "public/.htaccess"), "utf8")).toContain("https://kuzeycicek.com.tr%{REQUEST_URI}");
    expect(await run(["site", "deploy", "--host", "nope"], opts(dir))).toBe(1);
  });

  it("agents keeps a file the user took over", async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "vb-agents-"));
    expect(await run(["agents"], opts(dir))).toBe(0);
    const file = path.join(dir, ".claude/agents/vamos-seo.md");
    writeFileSync(file, "my own seo agent\n");
    expect(await run(["agents"], opts(dir))).toBe(0);
    expect(readFileSync(file, "utf8")).toBe("my own seo agent\n");
    expect(await run(["agents", "--force"], opts(dir))).toBe(0);
    expect(readFileSync(file, "utf8")).toContain(AGENT_MARK);
  });
});
