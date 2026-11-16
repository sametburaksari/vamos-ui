---
"vamos-ui": minor
---

Deploying to Vercel, Cloudflare Pages and Spacefast with a working contact form on each.

- New host `spacefast` in the plan, the hosting question and `site deploy`: `public/_headers` + `_redirects`, the domain command (`sf domains add`) and a build mode picked from the installed Next.js version (server build on 16.2.x / 16.3.x / 15.5.24+, else a static export uploaded with `sf publish ./out --prebuilt`).
- New form kind `edge` (`site form --kind edge`): `functions/api/contact.ts`, a web-standards handler exporting `onRequestPost` (Cloudflare Pages Functions) and `POST` (Spacefast). JSON, urlencoded or multipart; honeypot and time trap, required consent, field validation, best-effort per-IP rate limit, optional Cloudflare Turnstile (`TURNSTILE_SECRET`), mail through the Resend HTTP API, JSON answers with proper status codes and no secret ever echoed. A static site planned for Cloudflare or Spacefast now gets `edge` by default (Cloudflare plans are static unless the site is a shop).
- The `resend` and `smtp` server actions also verify Turnstile when `TURNSTILE_SECRET` is set.
- `site deploy --publish`: shows the host, project or Space, directory and every command, asks (default no; `--yes` in CI), checks the host CLI and login (prints `npx vercel login`, `npx wrangler login` or `sf login` instead of failing), then runs `npx vercel deploy --prod`, `npx wrangler pages deploy out --project-name <name>` or `sf publish` / `sf publish ./out --prebuilt`. New flags `--project` and `--space`. Guides print the per-host secret commands; the Vercel guide notes that Hobby is for non-commercial use only.
- `site check` sends an empty POST to the form endpoint (`/api/contact`, `/contact.php` or `--form-endpoint`) and fails on 404, and checks that every header in `public/_headers` is served.
