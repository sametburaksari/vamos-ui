import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { applyDesignSystem, getBrand, importDesignSystem, proposeAccent, updateDesign, verifyDesign, type ToolAnswer } from "./design-tools.js";
import { RULES } from "./guidance.js";
import { Registry, RegistryError, type RegistryOptions } from "./registry.js";
import {
  INCLUDE_KEYS,
  ToolError,
  getBlock,
  getItem,
  getRules,
  getTheming,
  installCommand,
  listItems,
  planScreen,
  search,
  verifyCode,
} from "./tools.js";

export const SERVER_NAME = "vamos-ui";
export const SERVER_VERSION = "0.2.2";

const INSTRUCTIONS = `Vamos UI is a design layer (tokens + 5 theme axes + semantic Tailwind classes), a React component kit (@vamos-ui/react) and blocks (whole screens). Docs: https://ui.vamos.ist.
Before building UI with it: call get_rules once per session, and get_brand when the project may have a brand profile (vamos.brand.json). For a new screen call plan_screen, then get_block. For a single component call search or get_item. Install with the command from install_command (npx vamos-ui add …). After writing code call verify_code on each file, and verify_design on the project before you finish.
Brand work: import_design_system (URL or HTML → draft vamos.brand.json, confirm with the user), propose_accent (one colour → contrast-checked accent), apply_design_system (edits + \`npx vamos-ui brand apply\`), update_design (what \`npx vamos-ui update --dry-run\` would change).`;

const itemType = z.enum(["component", "block", "lib", "style"]);

function text(body: string): CallToolResult {
  return { content: [{ type: "text", text: body }] };
}

function answer(result: ToolAnswer): CallToolResult {
  return { content: [{ type: "text", text: result.text }], structuredContent: result.data };
}

async function run(fn: () => Promise<string | CallToolResult> | string): Promise<CallToolResult> {
  try {
    const result = await fn();
    return typeof result === "string" ? text(result) : result;
  } catch (error) {
    const message =
      error instanceof ToolError || error instanceof RegistryError ? error.message : `Unexpected error: ${(error as Error)?.message ?? String(error)}`;
    return { content: [{ type: "text", text: message }], isError: true };
  }
}

export interface CreateServerOptions extends RegistryOptions {
  registry?: Registry;
  /**
   * Hosted (HTTP) mode: the server runs on someone else's machine, so tools that read or write
   * a local project (projectDir) or fetch arbitrary URLs are left out or refuse those inputs.
   */
  remote?: boolean;
}

const REMOTE_NOTE =
  "This is the hosted Vamos UI MCP server, which cannot see your files. For project tools (get_brand, apply_design_system, update_design, verify_design with projectDir) and URL import, run it locally: npx -y @vamos-ui/mcp";

export function createServer(options: CreateServerOptions = {}): { server: McpServer; registry: Registry } {
  const registry = options.registry ?? new Registry(options);
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { instructions: INSTRUCTIONS });
  const readOnly = { readOnlyHint: true, openWorldHint: false } as const;
  const remote = options.remote === true;
  const local = <T,>(fn: () => T): T | undefined => (remote ? undefined : fn());

  // --- tools ------------------------------------------------------------------

  server.registerTool(
    "get_rules",
    {
      title: "Design rules",
      description:
        "The design rules every screen built with Vamos UI must follow: tokens only, accent only for the one primary action/active state/data highlight, glass budget, density tokens, kit components over hand-rolled markup, no AI-looking patterns, realistic content, accessibility. Call this ONCE at the start of any UI task, before writing code.",
      annotations: readOnly,
    },
    () => run(getRules),
  );

  server.registerTool(
    "get_theming",
    {
      title: "Theming guide",
      description:
        "The 5 theme axes (dark class, data-material, data-accent, data-density, data-font) with values, the semantic Tailwind classes, how to add a brand accent, and the full CSS token table. Call when you set up a project, change colours/fonts/density, or need a token name.",
      inputSchema: {
        include_tokens: z.boolean().optional().describe("Include the full token table (default true). Pass false for a shorter answer."),
      },
      annotations: readOnly,
    },
    (args) => run(() => getTheming(registry, args)),
  );

  server.registerTool(
    "list_items",
    {
      title: "List registry items",
      description:
        "Lists components, blocks (whole screens), lib and style items, grouped by docs group or block category. Call to browse what exists, e.g. all blocks in \"Dashboards\" or every component in \"Overlays & feedback\". For a specific need, search is faster.",
      inputSchema: {
        type: itemType.optional().describe("Only this item type."),
        group: z.string().optional().describe('Component docs group, partial match, e.g. "Forms", "Overlays & feedback", "Charts".'),
        category: z.string().optional().describe('Block category, partial match, e.g. "Dashboards", "Authentication", "List pages".'),
        tag: z.string().optional().describe('Exact tag, e.g. "crm", "cms", "site".'),
      },
      annotations: readOnly,
    },
    (args) => run(() => listItems(registry, args)),
  );

  server.registerTool(
    "search",
    {
      title: "Search components and blocks",
      description:
        "Ranked search over item names, titles, descriptions, tags and usage guidance. Accepts English or Turkish (\"tarih seçici\", \"giriş sayfası\"), case- and accent-insensitive. Call when you know what you need but not its name; then call get_item or get_block with the result.",
      inputSchema: {
        query: z.string().min(1).describe('What you need, e.g. "date range picker", "confirm delete", "kanban board".'),
        type: itemType.optional().describe("Restrict to one item type."),
        limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
      },
      annotations: readOnly,
    },
    (args) => run(() => search(registry, args)),
  );

  server.registerTool(
    "get_item",
    {
      title: "Get a component or item",
      description:
        "Usage snippet, props tables, examples, when-to-use/avoid guidance, dependencies and file list of one registry item. Call before using a component you have not used in this session, so you use its real API. Source files are only included with include: [\"files\"] — usually install it instead.",
      inputSchema: {
        name: z.string().min(1).describe('Registry item name, e.g. "button", "data-table", "lib-utils".'),
        include: z
          .array(z.enum(INCLUDE_KEYS))
          .optional()
          .describe('Sections to include. Default ["examples","props","guidance"]; add "files" for full source.'),
        format: z.enum(["markdown", "json"]).optional().describe("markdown (default, readable) or json (the raw registry item)."),
      },
      annotations: readOnly,
    },
    (args) => run(() => getItem(registry, args)),
  );

  server.registerTool(
    "get_block",
    {
      title: "Get a block (whole screen)",
      description:
        "Full source of a block — a complete screen such as dashboard-01, login-01, list-01 — with the kit components it uses and how to adapt it. Call after plan_screen picked a block, or when the user names one. Start from the block instead of composing the screen from scratch.",
      inputSchema: {
        name: z.string().min(1).describe('Block name, e.g. "dashboard-01", "settings-01".'),
      },
      annotations: readOnly,
    },
    (args) => run(() => getBlock(registry, args)),
  );

  server.registerTool(
    "plan_screen",
    {
      title: "Plan a screen",
      description:
        "Turns a screen description into a plan: the block to start from (plus alternatives), extra components to add with reasons, the install command, density and a build checklist. Call FIRST whenever you are asked to build a new page or screen.",
      inputSchema: {
        description: z
          .string()
          .min(3)
          .describe('The screen in a sentence or two: purpose, data, main action. E.g. "CRM invoices list with filters, status badges and bulk delete".'),
      },
      annotations: readOnly,
    },
    (args) => run(() => planScreen(registry, args)),
  );

  server.registerTool(
    "verify_code",
    {
      title: "Verify UI code",
      description:
        "Lints a file against the Vamos UI rules: raw colours and palette classes, dark: variants, hard-coded fonts, icon-only buttons without aria-label, images without alt, onClick on non-interactive elements, positive tabIndex, missing \"use client\", arbitrary z-index, hand-rolled modals/dropdowns/tooltips. Call on EVERY file you create or edit, fix all errors, and call again until it is clean.",
      inputSchema: {
        code: z.string().describe("The full file contents."),
        filename: z.string().min(1).describe('Path of the file, e.g. "app/invoices/page.tsx" (used for the "use client" rule and messages).'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
    },
    (args) =>
      run(async () => {
        const result = await verifyCode(args);
        return {
          content: [{ type: "text", text: result.text }],
          structuredContent: { ok: result.ok, issues: result.issues },
        } as CallToolResult;
      }),
  );

  server.registerTool(
    "install_command",
    {
      title: "Install command",
      description:
        "Returns the exact `npx vamos-ui add …` command for one or more items (validates the names; dependencies resolve automatically). Call when you are about to add components or blocks to the user's project, and run or show that command instead of copying source by hand.",
      inputSchema: {
        names: z.array(z.string().min(1)).min(1).describe('Item names, e.g. ["dashboard-01", "date-range-picker"].'),
      },
      annotations: readOnly,
    },
    (args) => run(() => installCommand(registry, args)),
  );

  // --- design system (brand profile) -------------------------------------------

  const projectDir = z
    .string()
    .min(1)
    .describe("Absolute path to the project root (the folder with vamos.json / vamos.brand.json).");

  local(() =>
  server.registerTool(
    "get_brand",
    {
      title: "Get the brand profile",
      description:
        "Reads the project's vamos.brand.json: brand name, accent (with the generated accent variables), fonts, theme defaults, voice (tone, copy rules, do/don't examples) and assets (logos with how-to-use notes), plus any problems. Call at the start of UI work in a project that may have a brand, and follow its voice in all copy.",
      inputSchema: { projectDir: projectDir.optional().describe("Project root (default: the server's working directory).") },
      annotations: readOnly,
    },
    (args) => run(async () => answer(await getBrand(args))),
  )
  );

  server.registerTool(
    "import_design_system",
    {
      title: "Import a design system from a website",
      description:
        "Reads a web page (url) or page source (html, optional css and base_url) and drafts a vamos.brand.json: accent from theme-color / CSS variables / most-used colours, fonts from font-family and Google Fonts links, logo and icon candidates, voice hints from title/description. Returns the draft, the evidence for each value, a contrast-checked accent and what is missing. Writes nothing. Always confirm the draft with the user before saving it.",
      inputSchema: {
        url: z.string().min(1).optional().describe("Page to read, e.g. https://example.com. http(s) only."),
        html: z.string().min(1).optional().describe("Page source, when the site cannot be fetched (login, bot protection) or you already have it."),
        css: z.array(z.string()).optional().describe("Extra stylesheet sources to consider (with html, or in addition to the linked ones)."),
        base_url: z.string().optional().describe("Base URL to resolve relative links in html."),
        name: z.string().optional().describe("Brand name, if the user already told you."),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    (args) =>
      run(async () => {
        if (remote && (args.url || args.base_url)) return { content: [{ type: "text", text: `${REMOTE_NOTE}\nHere, pass the page source as html instead of url.` }], isError: true };
        return answer(await importDesignSystem(args));
      }),
  );

  server.registerTool(
    "propose_accent",
    {
      title: "Propose a brand accent",
      description:
        "Turns one brand colour into the four accent variables (--accent-base, --accent-fg, --accent-ink-light, --accent-ink-dark) using OKLCH, checks WCAG contrast (4.5:1 for text) and reports what was adjusted. Call when the user gives a brand colour, before writing it into vamos.brand.json.",
      inputSchema: {
        colour: z.string().min(1).describe('Any CSS colour: "#0f766e", "rgb(15 118 110)", "oklch(0.55 0.1 180)", "teal".'),
        dark: z.string().optional().describe("Optional dark-mode fill (colors.accentDark), when the brand has one."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
    },
    (args) => run(async () => answer(await proposeAccent(args))),
  );

  local(() =>
  server.registerTool(
    "apply_design_system",
    {
      title: "Apply the design system to a project",
      description:
        "Plans what makes a project use its brand: <uiDir>/brand.css (accent + font variables), the brand.css import after the kit styles, theme.accent = \"brand\" in vamos.json, the <html> attributes and font loading. Returns the exact file contents and the CLI command `npx vamos-ui brand apply` (preferred). Nothing is written unless write: true, and never outside projectDir.",
      inputSchema: {
        projectDir,
        brand: z
          .union([z.record(z.string(), z.unknown()), z.string()])
          .optional()
          .describe("A confirmed brand profile (object or JSON string). Omit to use the project's vamos.brand.json."),
        write: z.boolean().optional().describe("Write the planned files inside projectDir (default false: only return the plan). Prefer running the CLI command."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    (args) => run(async () => answer(await applyDesignSystem(args))),
  )
  );

  server.registerTool(
    "verify_design",
    {
      title: "Verify the design system",
      description:
        "Checks UI against the kit rules and the brand. With code (+ filename): lints one file. With projectDir: lints the project's source (skipping the kit folder) and checks vamos.brand.json, its assets, brand.css, the CSS import, vamos.json and the <html> attributes. Lists what it cannot check (screenshots, voice). Call before you finish any UI task.",
      inputSchema: {
        code: z.string().optional().describe("One file's contents."),
        filename: z.string().optional().describe('Its path, e.g. "app/page.tsx" (with code).'),
        projectDir: projectDir.optional(),
        paths: z.array(z.string().min(1)).optional().describe("Project-relative files or folders to lint instead of the defaults (src, app, components, pages, lib)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, idempotentHint: true },
    },
    (args) =>
      run(async () => {
        if (remote && args.projectDir) return { content: [{ type: "text", text: `${REMOTE_NOTE}\nHere, pass one file as code (+ filename).` }], isError: true };
        return answer(await verifyDesign(args));
      }),
  );

  local(() =>
  server.registerTool(
    "update_design",
    {
      title: "Plan a design update",
      description:
        "Plans how to bring an existing project in line with its brand and the kit rules: brand file edits, manual steps, problems and rule violations grouped by rule — the same plan `npx vamos-ui update --dry-run` shows. Changes nothing. Call before restyling or migrating an existing project, and show the plan to the user first.",
      inputSchema: {
        projectDir,
        paths: z.array(z.string().min(1)).optional().describe("Limit the code check to these project-relative paths."),
      },
      annotations: readOnly,
    },
    (args) => run(async () => answer(await updateDesign(args))),
  )
  );

  // --- resources --------------------------------------------------------------

  server.registerResource(
    "rules",
    "vamos://rules",
    { title: "Vamos UI design rules", description: "Design rules agents must follow (same as get_rules).", mimeType: "text/markdown" },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: RULES }] }),
  );

  server.registerResource(
    "theming",
    "vamos://theming",
    { title: "Vamos UI theming", description: "Axes, semantic classes, brand accents and tokens (same as get_theming).", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: await getTheming(registry) }] }),
  );

  server.registerResource(
    "item",
    new ResourceTemplate("vamos://items/{name}", {
      list: async () => {
        try {
          const items = await registry.items();
          return {
            resources: items
              .filter((item) => item.type === "component" || item.type === "block")
              .map((item) => ({
                uri: `vamos://items/${item.name}`,
                name: item.name,
                title: item.title,
                description: item.description,
                mimeType: "text/markdown",
              })),
          };
        } catch {
          return { resources: [] };
        }
      },
      complete: {
        name: async (value) => {
          const items = await registry.items().catch(() => []);
          return items.map((item) => item.name).filter((name) => name.startsWith(value.toLowerCase())).slice(0, 50);
        },
      },
    }),
    { title: "Registry item", description: "One component or block: usage, props, examples, guidance.", mimeType: "text/markdown" },
    async (uri, variables) => {
      const name = String(Array.isArray(variables.name) ? variables.name[0] : variables.name);
      const body = await getItem(registry, { name: decodeURIComponent(name) });
      return { contents: [{ uri: uri.href, mimeType: "text/markdown", text: body }] };
    },
  );

  // --- prompts ----------------------------------------------------------------

  server.registerPrompt(
    "build-screen",
    {
      title: "Build a screen with Vamos UI",
      description: "Plan and build a screen from a description using blocks, kit components and the design rules.",
      argsSchema: {
        description: z.string().describe("What the screen is for, its data and its main action."),
        framework: z.string().optional().describe('Target framework, e.g. "Next.js App Router" or "Vite + React".'),
      },
    },
    ({ description, framework }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Build this screen with Vamos UI${framework ? ` (${framework})` : ""}:`,
              "",
              description,
              "",
              "Steps:",
              "1. Call get_rules and follow every rule.",
              "2. Call plan_screen with the description; pick the suggested block unless the plan explains a better fit.",
              "3. Call get_block for that block and get_item for each extra component you use (use their real props).",
              "4. Call install_command and run (or show) the command; do not hand-copy kit source.",
              "5. Write the screen: semantic token classes only, one primary action per region, realistic domain content, empty/loading/error states, accessible labels.",
              "6. Call verify_code on every file you wrote; fix all errors and re-run until clean.",
              "7. Summarise what you built, the files, and any rule you could not meet.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "review-ui",
    {
      title: "Review UI code against Vamos UI rules",
      description: "Review a file for token, accessibility and design-rule violations and propose fixes.",
      argsSchema: {
        code: z.string().describe("The file contents to review."),
        filename: z.string().optional().describe('File path, e.g. "app/settings/page.tsx".'),
      },
    },
    ({ code, filename }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Review this file${filename ? ` (${filename})` : ""} against the Vamos UI rules.`,
              "",
              `1. Call verify_code with the code and filename "${filename ?? "component.tsx"}" and list every finding.`,
              "2. Call get_rules and check what the linter cannot: one primary action, accent scarcity, glass budget, density tokens, card walls, AI-looking patterns, realistic content, keyboard and screen-reader behaviour.",
              "3. Where a kit component would replace hand-rolled markup, name it and call get_item for its API.",
              "4. Return: findings ranked by severity (file:line, rule, why it matters), then a corrected version of the file.",
              "",
              "```tsx",
              code,
              "```",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  return { server, registry };
}
