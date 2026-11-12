# @vamos-ui/mcp

Release notes for the Vamos UI MCP server (local stdio and the hosted server at https://mcp.vamos.ist/mcp).

The format follows [Keep a Changelog](https://keepachangelog.com/) and [semantic versioning](https://semver.org/) (0.x: minor versions may change tools).

## 0.2.12 — 2026-11-12

### Patch Changes

- e5f3dd6: The package includes its CHANGELOG.md, and is published from GitHub Actions with npm provenance.
- Updated dependencies [e5f3dd6]
  - vamos-ui@0.5.1

## 0.2.11 — 2026-11-12

### Fixed

- The hosted `audit_site` decodes gzip, deflate and br responses. 0.2.9 read compressed pages as raw bytes and reported a missing title, description and sitemap on sites that have them.
- 0.2.10 contained the same fix but was packed with an unresolved `workspace:*` dependency and cannot be installed. Use 0.2.11.

## 0.2.10 — 2026-11-12

Broken package (cannot be installed). Use 0.2.11.

## 0.2.9 — 2026-11-12

### Added

- `audit_site`: checks a live website (redirects, title and description length, canonical, Open Graph, JSON-LD, robots, sitemap, llms.txt and AI crawler policy, placeholder contact details, legal pages, broken links, heavy images). On the hosted server it only reaches public addresses: every request and redirect is checked at connect time, so loopback, private, link-local and cloud metadata addresses and DNS rebinding are refused; pages, time and response size are capped.
- Guidance for `vamos.site.json`, the corner axis (`data-radius`) and the AI assistant rule files written by `vamos-ui init`.

## 0.2.8 — 2026-11-12

### Added

- A website launch checklist in `get_rules`; `plan_screen` adds it for website screens.
- `verify_design` with `projectDir` (local server) runs the project checks: placeholder contact details, broken routes, robots, sitemap, metadata, JSON-LD, title and description length, heavy images.

## 0.2.7 — 2026-11-12

### Added

- Anonymous OAuth for the hosted server, for clients that require an authorization flow before connecting.

## 0.2.6 — 2026-11-12

### Changed

- Every tool declares `readOnlyHint`, `destructiveHint` and `openWorldHint` explicitly. On the hosted server `verify_design` and `import_design_system` only take inputs that work without file access.
- The server declares its title, website and icons in `serverInfo`.

## 0.2.5 — 2026-11-12

### Changed

- Tool descriptions say what each tool does instead of instructing the model.

## 0.2.4 — 2026-11-12

### Changed

- Each tool has a `title` inside its annotations, for directory listings.

## 0.2.3 — 2026-11-12

### Added

- Tools and guidance for the 0.4.0 kit: theme presets, the open registry and commerce blocks.

## 0.2.2 — 2026-11-11

### Added

- Guidance and registry data for the 0.3.0 kit: example websites, motion and the new admin blocks.

## 0.2.1 — 2026-11-11

### Added

- Streamable HTTP mode (`--http`, `--port`, `--host`) for hosted use, with setup docs for each MCP client.

## 0.2.0 — 2026-11-10

### Added

- First release: design rules, theming guide, registry search, items and blocks, screen planning, code and design verification, install commands, design system import and accent proposals.
