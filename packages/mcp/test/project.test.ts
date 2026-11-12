import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import type { Lookup } from "../src/audit-tool.js";
import { importSiteTool, loadProject, startProjectTool } from "../src/project-tool.js";
import { createServer } from "../src/server.js";
import { FIXTURE_DIR } from "./helpers.js";

const hasProject = !!(await loadProject());

describe.skipIf(!hasProject)("start_project", () => {
  it("asks the first questions, then returns the plan and files", async () => {
    const first = await startProjectTool({});
    expect(first.text).toMatch(/business_name/);
    expect((first.data as { complete: boolean }).complete).toBe(false);

    const answers = {
      business_name: "Kıyı Atölye",
      site_type: "local-business",
      languages: ["tr"],
      existing_site: "",
      domain: "no",
      hosting: "cpanel",
      structure: "single",
      sections: ["services", "gallery"],
      contact_channels: ["form"],
      form_delivery: "recommend",
      tracking: ["gsc"],
      legal_entity: "sole",
    };
    const done = await startProjectTool({ answers, imported: { url: "https://atolye.example", navigation: [{ path: "/hizmetler", label: "Hizmetler" }], site: { name: "Kıyı Atölye", contact: { phone: "+90 252 444 12 34" } } } });
    const step = done.data as { complete: boolean; files: Record<string, string> };
    expect(step.complete).toBe(true);
    expect(done.text).toMatch(/## Proje planı[\s\S]*php-mail/);
    expect(JSON.parse(step.files["vamos.site.json"]!).contact.phone).toBe("+90 252 444 12 34");
    expect(JSON.parse(step.files["vamos.project.json"]!).importedFrom).toBe("https://atolye.example");
  });

  it("reports invalid answers", async () => {
    const r = await startProjectTool({ answers: { site_type: "castle" }, lang: "en" });
    expect(r.text).toMatch(/Answers to fix[\s\S]*site_type/);
  });
});

describe.skipIf(!hasProject)("import_site", () => {
  const html = `<html lang="tr"><head><title>Kıyı Atölye</title><script type="application/ld+json">{"@type":"LocalBusiness","name":"Kıyı Atölye","telephone":"+90 252 444 12 34"}</script></head><body><nav><a href="/iletisim">İletişim</a></nav><h1>Ahşap</h1></body></html>`;
  const fetch = async (url: string) => new Response(url === "https://atolye.test/" ? html : "<html><h1>İletişim</h1></html>", { headers: { "content-type": "text/html" } });
  const lookup: Lookup = async (host) => (host === "atolye.test" ? [{ address: "93.184.216.34", family: 4 }] : [{ address: "10.0.0.1", family: 4 }]);

  it("summarises what it found, with sources", async () => {
    const r = await importSiteTool({ url: "atolye.test" }, { remote: false, version: "test", fetch });
    expect(r.text).toMatch(/Kıyı Atölye[\s\S]*\+90 252 444 12 34 \(JSON-LD LocalBusiness/);
    expect(r.text).toMatch(/İletişim \/iletisim/);
  });

  it("hosted: refuses private addresses", async () => {
    await expect(importSiteTool({ url: "http://internal.test" }, { remote: true, version: "test", fetch, lookup })).rejects.toThrow(/10\.0\.0\.1|private/);
  });

  it("is listed with read-only hints on the hosted server", async () => {
    const { server } = createServer({ source: FIXTURE_DIR, remote: true });
    const [a, b] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "t", version: "1" });
    await Promise.all([server.connect(b), client.connect(a)]);
    const tools = (await client.listTools()).tools;
    for (const name of ["start_project", "import_site"]) {
      const tool = tools.find((t) => t.name === name)!;
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.annotations?.title).toBeTruthy();
    }
    expect(client.getInstructions()).toMatch(/start_project/);
    await client.close();
  });
});
