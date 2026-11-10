import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../src/server.js";
import { loadVerifier, setVerifier } from "../src/verify.js";
import { FIXTURE_DIR } from "./helpers.js";

type TextResult = { content: { type: string; text: string }[]; isError?: boolean; structuredContent?: unknown };

const realVerifier = await loadVerifier();
setVerifier(undefined);

let client: Client;

beforeAll(async () => {
  const { server } = createServer({ source: FIXTURE_DIR });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test", version: "1.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterAll(async () => {
  await client.close();
});

const call = async (name: string, args: Record<string, unknown> = {}) => (await client.callTool({ name, arguments: args })) as TextResult;
const textOf = (result: TextResult) => result.content.map((c) => c.text).join("\n");

describe("MCP server over InMemoryTransport", () => {
  it("advertises instructions and every contract tool with descriptions", async () => {
    expect(client.getInstructions()).toMatch(/plan_screen/);
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      [
        "apply_design_system",
        "get_block",
        "get_brand",
        "get_item",
        "get_rules",
        "get_theming",
        "import_design_system",
        "install_command",
        "list_items",
        "plan_screen",
        "propose_accent",
        "search",
        "update_design",
        "verify_code",
        "verify_design",
      ].sort(),
    );
    for (const tool of tools) expect(tool.description!.length).toBeGreaterThan(80);
    const getItem = tools.find((t) => t.name === "get_item")!;
    expect(getItem.inputSchema.required).toEqual(["name"]);
  });

  it("search", async () => {
    const result = await call("search", { query: "modal" });
    expect(result.isError).toBeFalsy();
    expect(textOf(result)).toMatch(/`dialog`/);
  });

  it("get_item and a tool error", async () => {
    expect(textOf(await call("get_item", { name: "dialog", include: ["guidance"] }))).toMatch(/## When to use/);
    const missing = await call("get_item", { name: "dialgo" });
    expect(missing.isError).toBe(true);
    expect(textOf(missing)).toMatch(/Did you mean/);
  });

  it("validates input with zod", async () => {
    const bad = await call("get_item", { name: 42 });
    expect(bad.isError).toBe(true);
  });

  it("verify_code returns text and structured issues", async () => {
    setVerifier(() => [{ rule: "dark-variant", severity: "error", message: "Avoid dark:", line: 1, column: 12 }]);
    const result = await call("verify_code", { code: '<div className="dark:bg-black" />', filename: "x.tsx" });
    setVerifier(undefined);
    expect(textOf(result)).toMatch(/\[dark-variant\]/);
    expect(result.structuredContent).toMatchObject({ ok: false, issues: [{ rule: "dark-variant" }] });
  });

  it.skipIf(!realVerifier)("verify_code with the real vamos-ui verifier", async () => {
    const result = await call("verify_code", {
      code: 'export function A() {\n  return <div className="bg-blue-500 text-[#fff]" onClick={() => {}}>x</div>;\n}\n',
      filename: "components/a.tsx",
    });
    expect(result.isError).toBeFalsy();
    expect((result.structuredContent as { ok: boolean }).ok).toBe(false);
  });

  it("resources: rules, theming and item template", async () => {
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toEqual(expect.arrayContaining(["vamos://rules", "vamos://theming", "vamos://items/button", "vamos://items/dashboard-01"]));
    const rules = await client.readResource({ uri: "vamos://rules" });
    expect((rules.contents[0] as { text: string }).text).toMatch(/Tokens only/);
    const item = await client.readResource({ uri: "vamos://items/button" });
    expect((item.contents[0] as { text: string }).text).toMatch(/^# Button/);
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates[0]!.uriTemplate).toBe("vamos://items/{name}");
  });

  it("prompts: build-screen and review-ui", async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts.map((p) => p.name).sort()).toEqual(["build-screen", "review-ui"]);
    const build = await client.getPrompt({ name: "build-screen", arguments: { description: "HR leave requests list" } });
    expect((build.messages[0]!.content as { text: string }).text).toMatch(/HR leave requests list[\s\S]*plan_screen/);
    const review = await client.getPrompt({ name: "review-ui", arguments: { code: "<div/>", filename: "a.tsx" } });
    expect((review.messages[0]!.content as { text: string }).text).toMatch(/verify_code[\s\S]*<div\/>/);
  });
});
