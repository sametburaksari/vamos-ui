---
"vamos-ui": minor
---

`npx vamos-ui site check [url]` closes the loop after the user publishes, without publishing anything: it runs the audit on the live URL plus the deploy checks (http → https 301, one host name with the www / non-www twin redirected, the security headers `site deploy` writes, a real 404 for an unknown path, robots.txt and sitemap.xml that answer and parse). The URL defaults to `url` in `vamos.site.json`, else the plan's domain. Exits 1 below `--min-score` (default 90), on an audit error or a failed check, so it can gate CI; `--ci` prints a GitHub Actions workflow that runs it after each production deploy; `--json`, `--lang tr|en`. A pass in a planned project suggests `npx vamos-ui task done deploy`. `site deploy` now ends with the check command, and the deploy specialist's brief uses it. The library entry `vamos-ui/audit` adds `runDeployChecks`, `siteCheckVerdict` and `siteCheckWorkflow`.

The audit now pairs `www.ornek.com.tr` with `ornek.com.tr` (second-level suffixes such as `.com.tr` and `.co.uk`), so the www / non-www check also runs on those domains.
