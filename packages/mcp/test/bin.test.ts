import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, it } from "vitest";
import { FIXTURE_DIR } from "./helpers.js";

const BIN = fileURLToPath(new URL("../dist/index.js", import.meta.url));

// Runs only after `pnpm build`; exercises the real stdio transport and the bundled verifier.
describe.skipIf(!existsSync(BIN))("built bin over stdio", () => {
  it("lists tools and answers search + verify_code", async () => {
    const transport = new StdioClientTransport({ command: process.execPath, args: [BIN, "--registry", FIXTURE_DIR], stderr: "pipe" });
    const client = new Client({ name: "bin-test", version: "1.0.0" });
    await client.connect(transport);
    try {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(15);
      const found = (await client.callTool({ name: "search", arguments: { query: "date range" } })) as { content: { text: string }[] };
      expect(found.content[0]!.text).toMatch(/`date-range-picker`/);
      const verified = (await client.callTool({
        name: "verify_code",
        arguments: { code: '<button onClick={save}><TrashIcon /></button>', filename: "components/x.tsx" },
      })) as { isError?: boolean; content: { text: string }[] };
      expect(verified.isError, verified.content[0]!.text).toBeFalsy();
    } finally {
      await client.close();
    }
  });
});
