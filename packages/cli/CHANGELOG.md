# vamos-ui

Release notes for the `vamos-ui` command line tool.

The format follows [Keep a Changelog](https://keepachangelog.com/) and [semantic versioning](https://semver.org/) (0.x: minor versions may change commands).

## 0.5.0 — 2026-11-12

### Added

- `vamos-ui audit <url>`: checks a live website over HTTP (redirects, title and description length, canonical, Open Graph, JSON-LD, robots, sitemap, llms.txt and AI crawler policy, placeholder contact details, legal pages, broken internal links, heavy images). Score, `--max-pages`, `--external`, `--strict`, `--json` and exit codes for CI. Also importable as `vamos-ui/audit`.
- `vamos-ui site init` writes an empty `vamos.site.json` (business details, legal ids, analytics ids, AI settings). `site essentials` reads it for robots (AI crawlers allowed, blocked or listed), llms.txt, LocalBusiness / FAQ JSON-LD and the legal pages. Nothing defaults to anyone's real data.
- `verify` rule `site-info` lists the empty fields in `vamos.site.json`.
- `vamos-ui theme --radius sharp|round` and `theme.radius` in vamos.json.
- `init` writes AGENTS.md, CLAUDE.md, .github/copilot-instructions.md and .cursor/rules/vamos-ui.mdc by default (existing content kept; `--no-agent` skips them).

### Changed

- Preset codes map the corner letter to `data-radius`; `brand apply` saves `brand.theme.radius` in vamos.json instead of writing `--radius` into brand.css.

## 0.4.0 — 2026-11-12

### Added

- `vamos-ui site essentials`: robots, sitemap and a page for every legal link in the footer; runs after `add site-…` in a Next.js App Router project (`--no-essentials` skips it).
- Legal page presets (legal-01) in English and Turkish, including returns, distance sales, pre-contract information and legal notice.
- `verify` checks for websites: placeholder contact details, links to routes with no page, missing robots / sitemap / metadataBase / canonical / Open Graph / JSON-LD, title and meta description length, images in public/ over 300 KB.

### Changed

- The registry version follows the kit version.

## 0.3.0 — 2026-11-12

### Added

- `vamos-ui create` (Next.js or Vite), preset codes (`init --preset`, `theme --preset`, `preset`), an open registry (`add` from a URL, `github:owner/repo/item` or `@namespace/item`), `registry build` for third-party registries, and `mcp add` for Claude Code, Cursor, VS Code, Windsurf, Gemini CLI and Codex.

## 0.2.0 — 2026-11-10

### Added

- First release: `init`, `add`, `list`, `search`, `view`, `diff`, `upgrade`, `theme`, `verify`, `brand` and `update`.
