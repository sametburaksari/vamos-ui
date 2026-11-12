# @vamos-ui/mcp

MCP server that gives AI coding agents the Vamos UI kit: components, blocks (whole screens), theme axes, tokens, the design rules, a code verifier, the exact install commands, and the project's brand profile (`vamos.brand.json`). Docs: https://ui.vamos.ist

It runs over stdio and reads the public registry at `https://ui.vamos.ist/r` (cached in memory). Nothing is written to your project unless you call `apply_design_system` with `write: true`, and then only inside `projectDir`. The agent installs code with `npx vamos-ui add …` and applies a brand with `npx vamos-ui brand apply`.

## Setup

One command writes the config for the client you use (detected, or `--client claude|cursor|vscode|windsurf|codex|gemini`); running it again changes nothing:

```sh
npx vamos-ui mcp add
```

### Claude Code

```sh
claude mcp add vamos-ui -- npx -y @vamos-ui/mcp
```

Add `--scope project` to share it with your team through `.mcp.json`.

### Claude Desktop

`claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "vamos-ui": {
      "command": "npx",
      "args": ["-y", "@vamos-ui/mcp"]
    }
  }
}
```

### Cursor

`.cursor/mcp.json` in the project (or `~/.cursor/mcp.json` for every project):

```json
{
  "mcpServers": {
    "vamos-ui": {
      "command": "npx",
      "args": ["-y", "@vamos-ui/mcp"]
    }
  }
}
```

### VS Code (Copilot agent mode)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "vamos-ui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@vamos-ui/mcp"]
    }
  }
}
```

### Codex

`~/.codex/config.toml`:

```toml
[mcp_servers.vamos-ui]
command = "npx"
args = ["-y", "@vamos-ui/mcp"]
```

Or: `codex mcp add vamos-ui -- npx -y @vamos-ui/mcp`.

### Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{ "mcpServers": { "vamos-ui": { "command": "npx", "args": ["-y", "@vamos-ui/mcp"] } } }
```

### Gemini CLI

`~/.gemini/settings.json` (or `.gemini/settings.json` in the project):

```json
{ "mcpServers": { "vamos-ui": { "command": "npx", "args": ["-y", "@vamos-ui/mcp"] } } }
```

### Zed

`settings.json`:

```json
{ "context_servers": { "vamos-ui": { "command": { "path": "npx", "args": ["-y", "@vamos-ui/mcp"] } } } }
```

### JetBrains AI Assistant, Cline, Continue, other clients

Any client that starts a local MCP server: command `npx`, arguments `-y @vamos-ui/mcp`.

### Hosted server (ChatGPT, claude.ai, Claude mobile, any remote-MCP client)

No install: add the remote MCP server **`https://mcp.vamos.ist/mcp`** (Streamable HTTP, no sign-in).

- **claude.ai / Claude Desktop / mobile:** Settings → Connectors → Add custom connector → paste the URL.
- **ChatGPT:** Settings → Apps & Connectors → Advanced → Developer mode → Create → paste the URL.
- **Claude Code:** `claude mcp add --transport http vamos-ui https://mcp.vamos.ist/mcp`
- **Cursor / VS Code:** `{ "mcpServers": { "vamos-ui": { "url": "https://mcp.vamos.ist/mcp" } } }` (VS Code: `"servers"` with `"type": "http"`).

The hosted server cannot see your files, so the project tools (`get_brand`, `apply_design_system`, `update_design`, `verify_design` with `projectDir`) and URL import are local-only. Everything else — rules, theming, search, items, blocks, screen plans, code checks, accents, website project plans, current-site import and live-site audits — works the same (`import_site` and `audit_site` reach public sites only). Run your own with `npx -y @vamos-ui/mcp --http --port 3333`.

### Which models?

MCP is model-independent: the tools work with whatever model your client runs — Claude, GPT, Gemini, Llama, Mistral or a local model — as long as the client supports MCP tools.

### Another registry

Point the server at a mirror or a local build with `--registry` or `VAMOS_REGISTRY` (URL or directory):

```sh
claude mcp add vamos-ui -e VAMOS_REGISTRY=./apps/www/public/r -- npx -y @vamos-ui/mcp
npx -y @vamos-ui/mcp --registry https://ui.example.com/r
```

## Tools

| Tool | When the agent calls it |
|---|---|
| `get_rules` | Once at the start of any UI task: tokens only, accent scarcity, glass budget, density, kit over hand-rolled markup, no AI-looking patterns, realistic content, accessibility. |
| `plan_screen(description)` | First, for a new page: suggests the block to start from, extra components with reasons, density and the install command. |
| `get_block(name)` | Full source of a block plus the kit components it uses. |
| `search(query, type?, limit?)` | Find items by need, in English or Turkish ("date range picker", "tarih seçici"). |
| `get_item(name, include?, format?)` | Usage, props, examples, when-to-use guidance, dependencies; source with `include: ["files"]`. |
| `list_items(type?, group?, category?, tag?)` | Browse by docs group or block category. |
| `get_theming(include_tokens?)` | The 6 axes (mode, material, accent, density, font, corners) and what the corner setting covers, semantic classes, brand accents, token table. |
| `verify_code(code, filename)` | Lints a file (raw colours, `dark:`, fonts, missing labels/alt, click handlers on divs, z-index, hand-rolled overlays…). Returns text plus structured `{ ok, issues }`. |
| `install_command(names)` | The exact `npx vamos-ui add …` command, with names validated. |
| `start_project(answers?, lang?, imported?)` | The website project interview: returns the next few questions (each with options and why it matters); with enough answers, the plan (pages and components, legal pages, hosting, forms, measurement with consent mode, compliance for Turkey, domain ideas, tasks per specialist, open questions) and the contents of `vamos.project.json` and a `vamos.site.json` draft. Same as `npx vamos-ui new`. Writes nothing. |
| `import_site(url, maxPages?, lang?)` | Reads a current website: name, description, phones, WhatsApp, emails, address, hours, social profiles and languages with their sources; brand candidates (colours, fonts, logos); navigation; texts and images per page; warnings such as different phone numbers. Pass its `url`, `navigation` and `site` to `start_project` as `imported` so existing addresses are kept. Same as `npx vamos-ui site import`. Only GET requests; on the hosted server up to 4 linked pages and public addresses only. |
| `audit_site(url, maxPages?)` | Audits a live website over HTTP, built with the kit or not: redirects, speed, compression, security headers; title, description, canonical, Open Graph, JSON-LD; robots.txt and its AI crawler policy, sitemap.xml, llms.txt; placeholder contact data, missing alt and names, legal links; broken internal links and images over 300 KB across up to `maxPages` pages (default 10, max 30). Same checks as `npx vamos-ui audit`. Only GET/HEAD requests; on the hosted server private, loopback, link-local, CGNAT and metadata addresses are refused on every hop. |

### Design system (brand profile)

| Tool | When the agent calls it |
|---|---|
| `get_brand(projectDir?)` | At the start of UI work: accent (with the generated variables), fonts, theme defaults, voice, assets and any problems from `vamos.brand.json`. |
| `import_design_system(url \| html, css?, base_url?, name?)` | Drafts a `vamos.brand.json` from a website or page source, with the evidence for each value, a contrast-checked accent and what is missing. Writes nothing; the agent confirms the draft with the user. |
| `propose_accent(colour, dark?)` | One colour → `--accent-base`, `--accent-fg`, `--accent-ink-light`, `--accent-ink-dark` (OKLCH), WCAG contrast per pair and what was adjusted. |
| `apply_design_system(projectDir, brand?, write?)` | The exact edits (brand.css, the CSS import, vamos.json theme, `<html>` attributes, font loading) and the command `npx vamos-ui brand apply`. Writes only with `write: true`, never outside `projectDir`. |
| `verify_design(code \| projectDir, filename?, paths?)` | Lints one file, or the project (kit folder skipped) plus the brand checks: profile valid, asset files present, brand.css up to date, import order, vamos.json, `<html>`. Lists what needs screenshots. |
| `update_design(projectDir, paths?)` | The plan `npx vamos-ui update --dry-run` shows: the automatic fixes `update --fix` would make (with the mapping table), brand edits, and the rule violations grouped by rule and file. Changes nothing. |

Brand tools use `vamos-ui/brand` from the CLI (bundled at build time). If it is missing, they say so and point to the CLI command.

Resources: `vamos://rules`, `vamos://theming`, `vamos://items/{name}`.
Prompts: `build-screen` (description, framework?) and `review-ui` (code, filename?).

## Development

```sh
pnpm --filter @vamos-ui/mcp build      # dist/index.js (bundles vamos-ui/verify)
pnpm --filter @vamos-ui/mcp test       # vitest: handlers, in-memory client/server, built bin over stdio
pnpm --filter @vamos-ui/mcp typecheck

# try it against the local registry
node scripts/build-registry.mjs
npx @modelcontextprotocol/inspector node packages/mcp/dist/index.js --registry apps/www/public/r
```

Tests run against `test/fixtures/r` and temporary project folders. Brand tool logic is tested with a stand-in library; `test/brand-real.test.ts` runs against the real `vamos-ui/brand` once `packages/cli/src/brand/index.ts` (or `brand.ts`) exists and skips until then. The stdio test runs after a build. The real-verifier test runs once `packages/cli/src/verify.ts` exists.

## License

MIT
