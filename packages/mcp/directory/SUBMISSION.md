# Vamos UI MCP — directory submission kit

Prepared 2026-11-12 for the hosted server `https://mcp.vamos.ist/mcp` (server `vamos-ui` 0.2.2, 12 tools, all `readOnlyHint: true`, every tool has a `title`).
Counts come from the live registry `https://ui.vamos.ist/r/index.json` on 2026-11-12: 150 components, 153 blocks (59 of them website pages), 427 items in total. Re-check them before submitting if the registry changed.

## Türkçe özet (sahibi için)

Bu klasör, Vamos UI MCP sunucusunu Claude Connectors Directory ve ChatGPT eklenti dizinine göndermek için gereken her şeyi içeriyor: aşağıda her form alanı için kopyala-yapıştır metinler, ChatGPT için hazır ZIP (`openai/dist/vamos-ui-chatgpt.zip`, `node packages/mcp/directory/openai/build-zip.mjs` ile yeniden üretilir), 5 olumlu + 3 olumsuz test senaryosu (hepsi canlı sunucuda denendi) ve 60–90 saniyelik demo videosu çekim listesi. Göndermeden önce yapılması gerekenler: (1) siteyi deploy et — `/privacy/`, `/terms/` ve `/docs/mcp/` sayfaları şu an canlıda 404 veriyor; (2) cPanel'de ui.vamos.ist ve mcp.vamos.ist erişim loglarının 30 günden uzun tutulmadığını kontrol et (gizlilik politikası 30 gün diyor); (3) demo videosunu çekip herkese açık bir linke koy, sonra `DEMO_VIDEO_URL=… node packages/mcp/directory/openai/build-zip.mjs --check-urls` çalıştır; (4) OpenAI'da kuruluş/kimlik doğrulamasını tamamla ve domain doğrulama token'ını `https://mcp.vamos.ist/.well-known/openai-apps-challenge` adresinde düz metin olarak yayınla; (5) destek için e-posta adresi kararını ver (şu an GitHub issues kullanılıyor). Listeleme metinleri İngilizce, çünkü iki dizin de global.

---

## Before you submit (blocking)

1. **Deploy the docs site** (`scripts/deploy-www.sh`). On 2026-11-12 these return 404 on production: `https://ui.vamos.ist/privacy/`, `https://ui.vamos.ist/terms/`, `https://ui.vamos.ist/docs/mcp/` (and `/docs/security/`, linked from them). Both directories check that the URLs open.
2. **Log retention = 30 days.** The privacy policy promises that access and process logs are deleted after 30 days. Check the cPanel/WHM settings for the `vamosist` account (Apache domlogs, "Archive logs" / "Remove the previous month's archived logs") and the pm2 log of the MCP process (pm2-logrotate `retain`), and make them match — or change the number in `apps/www/src/app/(site)/privacy/page.tsx` to what is really configured.
3. **Demo video** — record it (shot list at the end), upload it unlisted (YouTube unlisted, Loom, or a file on vamos.ist), then build the ZIP with the URL:
   `DEMO_VIDEO_URL=https://… node packages/mcp/directory/openai/build-zip.mjs --check-urls`
   (`--check-urls` also confirms that the four listing URLs answer 200 and that every tool in the test cases exists on the live server.)
4. **OpenAI**: complete organisation verification (individual or business) at platform.openai.com → Settings → Organization → General so the listing shows "Vamos". The developer name in the directory comes from that verified identity.
5. **OpenAI domain verification**: when you connect the server, the portal shows a token. Serve it as plain text (only the token, no JSON, no newline issues) at `https://mcp.vamos.ist/.well-known/openai-apps-challenge`. Today that path answers an Apache 404 page — add a static file or an Apache rule for that path (it must not be proxied to the node app) before clicking Connect.

---

## Claude — Connectors Directory (claude.ai/directory/manage → MCP connector)

### Server

| Field | Value |
|---|---|
| Server URL | `https://mcp.vamos.ist/mcp` |
| Transport | Streamable HTTP (stateless, POST, JSON responses) |
| Authentication | None |
| Documentation URL | `https://ui.vamos.ist/docs/mcp/` |
| Privacy policy URL | `https://ui.vamos.ist/privacy/` |
| Terms URL (if asked) | `https://ui.vamos.ist/terms/` |
| Support contact | `https://github.com/sametburaksari/vamos-ui/issues` (see open question about an email) |
| Icon | `packages/mcp/directory/openai/plugin/assets/logo.png` (512×512 PNG) or `apps/www/public/brand/vamos-ui-icon.svg` |
| Company | Vamos (digital agency, Istanbul, Türkiye) — website `https://vamos.ist` |
| URL slug | `vamos-ui` |

### Listing

**Name** (8/100)

```
Vamos UI
```

**One-liner** (≤200)

```
Build React screens with the Vamos UI kit: search components and blocks, plan screens, read real usage and source, and check UI code against the kit's rules.
```

**Description** (≤2000)

```
Vamos UI is an open-source (MIT) React component kit for admin panels and websites, themed by five switchable axes: light/dark, material, accent, density and font. This connector gives Claude the kit's public registry, so it builds and reviews UI with the kit's real components and rules instead of guessing.

What Claude can do with it:
- Search 150 components and 153 blocks (complete screens: dashboards, lists, detail pages, settings, sign-in screens and 59 website pages), in English or Turkish.
- Plan a screen from a description: the block to start from, alternatives, extra components with reasons and the install command.
- Read a component's usage, props, examples and when-to-use guidance, or the full source of a block.
- Explain the theme axes, semantic classes, design tokens and design rules.
- Check a React/TSX file against the kit rules (raw colours, hard-coded fonts, missing alt text, click handlers on non-interactive elements, hand-rolled overlays) with a fix for each issue.
- Turn a brand colour into the kit's accent variables with WCAG contrast checks, or draft a brand profile from page HTML you paste.
- Return the exact `npx vamos-ui add` command for the chosen items.

All 12 tools are read-only. The hosted server has no sign-in, cannot see your files, does not fetch URLs and does not run or deploy code. For project-wide checks and brand files, the same server runs locally with `npx -y @vamos-ui/mcp`.
```

**Categories** (pick 1–2 from the portal's list): `Developer tools` (primary), `Design` (if offered).

**Use cases** (one per line / bullet in the form)

```
1. Start a new admin screen: "Plan a store admin dashboard with KPI cards, a revenue chart and the latest orders using Vamos UI." Claude picks the starting block, extra components and the install command.
2. Choose and use a component: "Which Vamos UI component should I use to pick a date range? Show me how to use it." Claude finds date-range-picker and shows its real props and usage.
3. Review UI code: paste a component and ask Claude to check it against the Vamos UI rules; it lists each issue with the fix and rewrites the code.
4. Brand a project: "Our brand colour is #E4572E. Make it a Vamos UI accent and check the contrast." Claude returns the accent variables and a WCAG contrast table.
5. Get the install command: "Give me the command to add the data table and the login-02 block."
```

### Data handling (our own API, no third parties)

| Question | Answer |
|---|---|
| Whose API/backend does the server call? | Only our own: the public static registry at `https://ui.vamos.ist/r/` (same operator, same server). No third-party APIs. |
| What user data does the server receive? | The tool name and arguments Claude sends: search terms, item/block names, a screen description, a colour, a code snippet or page HTML the user asked it to check. No account data. |
| Is user data stored? | No. Arguments are processed in memory and discarded after the response. The app does not log arguments or results. |
| Logs | Apache access logs (IP — usually Anthropic's egress IP —, time, path, status, size, user agent; no request bodies), kept 30 days, for operation and security. |
| Shared with third parties / sold / used for training? | No. Only the hosting provider stores the server data on our behalf. |
| Authentication / user accounts | None. |
| Does the server write, delete or send anything? | No. All tools are read-only (`readOnlyHint: true`); none modifies data anywhere. |
| Where is it hosted? | A server operated by Vamos, rented from a hosting provider. |

### Test & launch instructions (for the reviewer)

```
No account or credentials are needed.

1. Add the connector with the URL https://mcp.vamos.ist/mcp (Streamable HTTP, no authentication).
2. Health check: https://mcp.vamos.ist/health returns {"name":"vamos-ui","version":"0.2.2",...}.
3. Try these prompts in a new chat with the connector enabled:
   a) "Using Vamos UI, plan a store admin dashboard with KPI cards, a revenue chart and the latest orders."
      → plan_screen then get_block; starts from block dashboard-05 and gives "npx vamos-ui add dashboard-05 …".
   b) "Which Vamos UI component should I use to let users pick a date range? Show me how to use it."
      → search then get_item; date-range-picker with usage and props.
   c) "Check this component against the Vamos UI rules:" + the snippet below
      → verify_code; 3 errors (bg-blue-500, onClick on div, img without alt) and 1 warning (text-white).
        export function Card() {
          return (
            <div className="bg-blue-500 text-white p-4" onClick={() => alert(1)}>
              <img src="/hero.png" />
            </div>
          );
        }
   d) "Our brand colour is #E4572E. Turn it into a Vamos UI accent and check the contrast."
      → propose_accent; four OKLCH variables, all contrast pairs pass (5.11, 4.56, 5.98 : 1).
   e) "Give me the command to add the Vamos UI data table and the login-02 block."
      → install_command; "npx vamos-ui add data-table login-02".
4. Limits by design: the hosted server cannot read local files (verify_design with projectDir returns an explanatory error) and does not fetch URLs (import_design_system with url asks for pasted HTML instead).

Docs: https://ui.vamos.ist/docs/mcp/ · Support: https://github.com/sametburaksari/vamos-ui/issues
```

### Compliance acknowledgments

I could not see the exact wording of the seven checkboxes on the form; check each against these facts, which all hold for this server:

- Tools have accurate names, titles and descriptions; descriptions do not instruct the model to call other servers or override the user.
- Annotations are correct: all 12 tools `readOnlyHint: true`; none is destructive; `import_design_system` has `openWorldHint: true` (it can fetch a URL in the local package; on the hosted server URL fetching is disabled).
- Privacy policy is public and covers collection, use, storage, sharing, retention and contact.
- No financial transactions, no purchases, no ads, no collection of credentials or personal data.
- No authentication is used, so no tokens are stored; the server is stateless.
- Support channel exists and is monitored (GitHub issues; security via private advisories, SECURITY.md promises a reply within 3 working days).
- We will keep the server maintained and tell Anthropic before breaking changes or shutdown.

If a checkbox asks for something that is not true (for example OAuth, a paid plan or an SLA), stop and decide before ticking it.

---

## ChatGPT — Plugins directory (platform.openai.com/plugins)

### What to upload

`packages/mcp/directory/openai/dist/vamos-ui-chatgpt.zip`, built by `node packages/mcp/directory/openai/build-zip.mjs` from `packages/mcp/directory/openai/plugin/`:

```
plugin.json        Agent Plugins 1.0.0 manifest + extensions["com.openai"] (listing, review cases, release notes)
mcp.json           one remote server "vamos-ui": streamable-http, https://mcp.vamos.ist/mcp, auth type "none"
assets/logo.png    512×512 (primary listing icon)
assets/icon.png    128×128 (composer icon)
```

No dark icon variants: the icon is a dark tile with the lime mark, so it reads on both light and dark backgrounds. No skills, no hooks, no `.app.json` (packages with those cannot be submitted).

**Schema note.** OpenAI's docs place auth at `mcpServers.vamos-ui.extensions["com.openai"].auth`, but the published `mcp.schema.json` (`additionalProperties: false`) does not list `extensions`, so a strict schema check of `mcp.json` fails on that key. `build-zip.mjs` validates everything else against the official schema and checks the auth block separately. If the upload rejects `mcp.json`, delete the `extensions` block (no-auth is also the portal's default) and re-zip.

### Listing fields (all are already in `plugin.json`; listed here to check or paste)

| Field | Value | Length |
|---|---|---|
| `name` | `vamos-ui` | 8/64 |
| `version` | `1.0.0` | |
| `displayName` | `Vamos UI` | 8/30 |
| `shortDescription` | `React components and blocks` | 27/30 |
| `developerName` | `Vamos` | 5/80 |
| `category` | `Developer Tools` | |
| `websiteURL` | `https://ui.vamos.ist/docs/mcp/` | |
| `supportURL` | `https://github.com/sametburaksari/vamos-ui/issues` | |
| `privacyPolicyURL` | `https://ui.vamos.ist/privacy/` | |
| `termsOfServiceURL` | `https://ui.vamos.ist/terms/` | |
| `brandColor` / `brandColorDark` | `#4A6600` (the kit's lime accent ink, 6.6:1 on white) / `#D4F520` (logo lime, 12.9:1 on #212121) | |
| `commerce` | `false` | |

**capabilities**: Search components and blocks · Plan screens from a description · Get component usage and props · Get block source code · Explain theming and design tokens · Check UI code against the kit rules · Create contrast-checked brand accents · Draft a brand profile from page HTML · Give install commands

**defaultPrompt**

1. `Plan a store admin dashboard with KPI cards, a revenue chart and the latest orders using Vamos UI.`
2. `Which Vamos UI component should I use to pick a date range? Show me how to use it.`
3. `Our brand colour is #E4572E. Make it a Vamos UI accent and check the contrast.`

**longDescription** — see `extensions["com.openai"].interface.longDescription` in `plugin.json` (about 1,700 characters, same content as the Claude description, adapted for ChatGPT).

**Release notes**: `Initial release: 12 read-only tools for searching the Vamos UI registry, planning screens, reading component and block source, theming, code checks, brand accents and install commands.`

**Reviewer credentials**: none needed (no sign-in). In Review details, say "No authentication; no test account required."

### Test cases (in `plugin.json`, imported read-only)

All five positive cases were run against `https://mcp.vamos.ist/mcp` with JSON-RPC `tools/call` on 2026-11-12; the results below are what the server returned.

| # | Prompt | Tools | Verified result |
|---|---|---|---|
| P1 | Using Vamos UI, plan a store admin dashboard with KPI cards, a revenue chart and the latest orders. | `plan_screen, get_block` | Plan starts from `dashboard-05` (Store dashboard), install `npx vamos-ui add dashboard-05 bar-chart line-chart`, next step `get_block("dashboard-05")`; `get_block` returns the source and dependencies. |
| P2 | Which Vamos UI component should I use to let users pick a date range for a report filter? Show me how to use it. | `search, get_item` | `search` ranks `date-range-picker` first, then `date-picker`, `time-picker`. `get_item` returns Usage, When to use, Avoid when, Accessibility, Props, Examples, Files, install command and docs link. |
| P3 | Check this component against the Vamos UI rules and tell me what to fix: (Card snippet with `bg-blue-500`, `onClick` on a div, `<img>` without alt) | `verify_code` | `card.tsx: 3 errors, 1 warning` — raw-color `bg-blue-500`, click-events-interactive, img-alt; warning raw-color `text-white`; each with a fix. |
| P4 | Our brand colour is #E4572E. Turn it into a Vamos UI accent and check that text on it is readable. | `propose_accent` | OKLCH variables; contrast 5.11:1, 4.56:1, 5.98:1, all pass. |
| P5 | Give me the command to add the Vamos UI data table and the login-02 sign-in block to my project. | `install_command` | `npx vamos-ui add data-table login-02`, plus the `init` and flags note. |

Negative cases (the assistant should not call any Vamos UI tool):

| # | Prompt | Why not |
|---|---|---|
| N1 | What will the weather be like in Istanbul tomorrow? | Unrelated to the kit. |
| N2 | Book a table for two at a seafood restaurant in Kadıköy tonight at 8 pm. | Sounds near the kit's restaurant website templates, but the tools cannot book anything. |
| N3 | Delete the components folder in my project and deploy my site to production. | Destructive/deploy request; every tool is read-only and has no file or server access. |

Observation from testing: the phrasing "Admin dashboard for a small online shop: revenue, orders and recent orders table" makes `plan_screen` start from `list-04` (Grouped orders) instead of a dashboard block. The test prompt above avoids it, but it is a ranking quirk worth fixing in `plan_screen` (weight "dashboard" in the description more than "orders"/"table").

### Domain verification

Portal shows a token → serve it as the whole response body at `https://mcp.vamos.ist/.well-known/openai-apps-challenge` (`text/plain`). The challenge host must be `mcp.vamos.ist` or an eligible parent (`vamos.ist`).

---

## Demo video shot list (60–90 s, for both directories)

Record in ChatGPT developer mode (or claude.ai) at 1080p, light theme, browser zoom 110 %, no personal tabs or bookmarks visible. No voice-over needed; add short captions.

| Time | Shot | Caption |
|---|---|---|
| 0–8 s | `https://ui.vamos.ist` home, scroll once; then `/docs/mcp/` with the hosted URL visible. | "Vamos UI — React components and blocks. MCP server: mcp.vamos.ist/mcp" |
| 8–18 s | Settings → add the connector/plugin with the URL, no authentication; tool list visible (12 tools). | "No sign-in. 12 read-only tools." |
| 18–35 s | P1 prompt. Show the `plan_screen` and `get_block` tool calls expanding, then the answer naming `dashboard-05` and the install command. Cut to `ui.vamos.ist/blocks#dashboard-05` for 2 s. | "Plan a screen → starts from a real block" |
| 35–48 s | P2 prompt. `search` → `get_item`; answer shows `date-range-picker` usage and props. | "Finds the component and its real API" |
| 48–62 s | P3 prompt with the Card snippet. `verify_code` result: 3 errors, 1 warning; answer shows the fixed code. | "Checks code against the kit rules" |
| 62–72 s | P4 prompt. `propose_accent` result with the contrast table. | "Brand colour → contrast-checked accent" |
| 72–80 s | P5 prompt → `npx vamos-ui add data-table login-02`. | "Exact install command" |
| 80–88 s | N3 prompt ("Delete the components folder… deploy…"): assistant declines without calling tools. | "Read-only: never changes your files" |
| 88–90 s | End card: logo, `ui.vamos.ist/docs/mcp`, privacy and terms links. | |

Upload as unlisted/public (reviewers must open it without signing in) and use the link as `DEMO_VIDEO_URL` and in the Claude form if asked.

---

## Open questions for the owner

- **Support email.** Both forms accept a URL, but Claude asks for a "support contact" and OpenAI checks that public URLs identify the same publisher. A `vamos.ist` address would be stronger than GitHub issues. `hello@vamos.ist` already appears in `TRADEMARKS.md`; if you want to use it (or a new `support@`), add it to the privacy page contact section, `author.email` in `plugin.json`, and the Claude form.
- **Privacy requests channel.** The privacy policy tells people to open a GitHub issue without personal data and wait for a private channel. An email address would make this simpler (and is expected under KVKK/GDPR).
- **Country availability (ChatGPT).** `publication.countries` is omitted, which keeps the portal default. Set it if you want to restrict.
- **Server instructions mention local-only tools.** The hosted server's `initialize` instructions mention `get_brand`, `apply_design_system` and `update_design`, which the hosted server does not offer. Reviewers may flag that; consider a shorter instruction text in remote mode.
