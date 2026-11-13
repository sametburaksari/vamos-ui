# vamos-ui

Release notes for the `vamos-ui` command line tool.

The format follows [Keep a Changelog](https://keepachangelog.com/) and [semantic versioning](https://semver.org/) (0.x: minor versions may change commands).

## 0.6.0 — 2026-11-13

### Minor Changes

- 8a44e08: Forms and measurement for websites. `@vamos-ui/react/blocks` adds `Analytics`: GA4, Google Tag Manager, Google Ads and the Meta pixel load only after the visitor's consent in `ConsentBanner` (analytics → GA4 / GTM, marketing → Ads / Meta; `mode="advanced"` loads the Google tag at once under Consent Mode), and phone, WhatsApp, email, directions and booking clicks plus contact form leads become events (`generate_lead`, `click_call`…, the Google Ads conversion per event, Meta `Lead` / `Contact`). `trackEvent()` sends one yourself. `ContactForm` with a URL `action` (a PHP mailer on static hosting) now submits with fetch once hydrated and shows the server's field errors; without JS it still posts and comes back with `?vb_sent=<form>`. A successful submit fires `vb:lead`.
  
  `npx vamos-ui site form` writes the sender: `public/contact.php` for static exports on shared hosting, or a Next.js server action with Resend or SMTP (nodemailer), plus one field list shared by the page and the sender; honeypot, time trap, rate limit, cross-site posts refused, no visitor input in mail headers. `verify` reports `raw-tracking-script` for tags loaded by hand. The website plan's form and measurement tasks point to these.
- 3a3034b: The website process: an orchestrator and nine specialists. The plan's tasks now carry their order (brand and content first, the build after the brand, legal / SEO / forms / measurement after the build, QA after everything, deploy last) and the plan carries a requirement pack per site type on top of a shared baseline (local business, corporate, shop, booking, portfolio, blog, SaaS, nonprofit, event), each item owned by one specialist and, where a tool can tell, checked by a command. `npx vamos-ui task` lists the tasks, `task next` the ones that can start, `task brief <id>` the brief for the specialist (plan context, steps, requirements, checks, report format), `task done|block|reset <id>` updates `vamos.project.json`; rebuilding the plan keeps task status. `npx vamos-ui agents` (also run by `new`) writes the orchestrator skill `.claude/skills/vamos-site` and the subagents `.claude/agents/vamos-*` for Claude Code; `AGENTS.md` describes the same process for other clients. `npx vamos-ui site deploy` writes the host's config (cPanel `.htaccess`, `vercel.json`, `_headers` / `_redirects`, nginx + pm2) for http → https, one host name, security headers and cache, and prints the publishing steps and the checks after launch.
  
  The MCP server adds `next_task`: the same process on a `vamos.project.json` the client passes in.
  
  `audit` counts a footer link for every legal page it stands for, so "Gizlilik ve KVKK Aydınlatma Metni" on `/gizlilik-politikasi` is both the privacy policy and the KVKK notice. The cPanel `.htaccess` limits its redirects and headers to the site's own domain, because subdomain folders inside `public_html` inherit it.
- 25e57f2: `vamos-ui new` plans a website by asking a few questions (business, site type, languages, current site, domain, hosting, one page or several, sections, store or booking needs, contact channels and form delivery, measurement, who runs the site) and writes `vamos.project.json` with the plan: pages and the components on them, legal pages, hosting and build output, forms with spam protection, measurement with consent mode, compliance notes for Turkey (KVKK, ETBİS, distance sales), domain ideas, tasks per specialist and open questions. It fills only the empty fields of `vamos.site.json`. `vamos-ui site import <url>` reads a current website (business details with their sources, navigation, texts, images) and warns about mismatches such as two phone numbers. Both are also a library: `vamos-ui/project`. `vamos.site.json` takes `analytics.metaPixel`.

## 0.5.1 — 2026-11-12

### Patch Changes

- e5f3dd6: The package includes its CHANGELOG.md, and is published from GitHub Actions with npm provenance.

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
