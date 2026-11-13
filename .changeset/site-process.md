---
"vamos-ui": minor
"@vamos-ui/mcp": minor
---

The website process: an orchestrator and nine specialists. The plan's tasks now carry their order (brand and content first, the build after the brand, legal / SEO / forms / measurement after the build, QA after everything, deploy last) and the plan carries a requirement pack per site type on top of a shared baseline (local business, corporate, shop, booking, portfolio, blog, SaaS, nonprofit, event), each item owned by one specialist and, where a tool can tell, checked by a command. `npx vamos-ui task` lists the tasks, `task next` the ones that can start, `task brief <id>` the brief for the specialist (plan context, steps, requirements, checks, report format), `task done|block|reset <id>` updates `vamos.project.json`; rebuilding the plan keeps task status. `npx vamos-ui agents` (also run by `new`) writes the orchestrator skill `.claude/skills/vamos-site` and the subagents `.claude/agents/vamos-*` for Claude Code; `AGENTS.md` describes the same process for other clients. `npx vamos-ui site deploy` writes the host's config (cPanel `.htaccess`, `vercel.json`, `_headers` / `_redirects`, nginx + pm2) for http → https, one host name, security headers and cache, and prints the publishing steps and the checks after launch.

The MCP server adds `next_task`: the same process on a `vamos.project.json` the client passes in.
