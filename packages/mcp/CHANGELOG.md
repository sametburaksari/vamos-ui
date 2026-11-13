# @vamos-ui/mcp

Release notes for the Vamos UI MCP server (local stdio and the hosted server at https://mcp.vamos.ist/mcp).

The format follows [Keep a Changelog](https://keepachangelog.com/) and [semantic versioning](https://semver.org/) (0.x: minor versions may change tools).

## 0.3.0 — 2026-11-13

### Minor Changes

- 064e5d8: New tools `start_project` (the website project interview: the next questions, then the plan and the contents of `vamos.project.json` and `vamos.site.json`) and `import_site` (reads a current website: details with sources, brand candidates, navigation, texts, images). On the hosted server `import_site` reads public sites only, up to 4 linked pages.
- 3a3034b: The website process: an orchestrator and nine specialists. The plan's tasks now carry their order (brand and content first, the build after the brand, legal / SEO / forms / measurement after the build, QA after everything, deploy last) and the plan carries a requirement pack per site type on top of a shared baseline (local business, corporate, shop, booking, portfolio, blog, SaaS, nonprofit, event), each item owned by one specialist and, where a tool can tell, checked by a command. `npx vamos-ui task` lists the tasks, `task next` the ones that can start, `task brief <id>` the brief for the specialist (plan context, steps, requirements, checks, report format), `task done|block|reset <id>` updates `vamos.project.json`; rebuilding the plan keeps task status. `npx vamos-ui agents` (also run by `new`) writes the orchestrator skill `.claude/skills/vamos-site` and the subagents `.claude/agents/vamos-*` for Claude Code; `AGENTS.md` describes the same process for other clients. `npx vamos-ui site deploy` writes the host's config (cPanel `.htaccess`, `vercel.json`, `_headers` / `_redirects`, nginx + pm2) for http → https, one host name, security headers and cache, and prints the publishing steps and the checks after launch.
  
  The MCP server adds `next_task`: the same process on a `vamos.project.json` the client passes in.
  
  `audit` counts a footer link for every legal page it stands for, so "Gizlilik ve KVKK Aydınlatma Metni" on `/gizlilik-politikasi` is both the privacy policy and the KVKK notice. The cPanel `.htaccess` limits its redirects and headers to the site's own domain, because subdomain folders inside `public_html` inherit it.

### Patch Changes

- 8a44e08: Forms and measurement for websites. `@vamos-ui/react/blocks` adds `Analytics`: GA4, Google Tag Manager, Google Ads and the Meta pixel load only after the visitor's consent in `ConsentBanner` (analytics → GA4 / GTM, marketing → Ads / Meta; `mode="advanced"` loads the Google tag at once under Consent Mode), and phone, WhatsApp, email, directions and booking clicks plus contact form leads become events (`generate_lead`, `click_call`…, the Google Ads conversion per event, Meta `Lead` / `Contact`). `trackEvent()` sends one yourself. `ContactForm` with a URL `action` (a PHP mailer on static hosting) now submits with fetch once hydrated and shows the server's field errors; without JS it still posts and comes back with `?vb_sent=<form>`. A successful submit fires `vb:lead`.
  
  `npx vamos-ui site form` writes the sender: `public/contact.php` for static exports on shared hosting, or a Next.js server action with Resend or SMTP (nodemailer), plus one field list shared by the page and the sender; honeypot, time trap, rate limit, cross-site posts refused, no visitor input in mail headers. `verify` reports `raw-tracking-script` for tags loaded by hand. The website plan's form and measurement tasks point to these.
- Updated dependencies [8a44e08]
- Updated dependencies [3a3034b]
- Updated dependencies [25e57f2]
  - vamos-ui@0.6.0

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
