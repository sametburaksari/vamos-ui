import { Badge } from "@vamos-ui/react";
import { A, C, Callout, Code, DocPage, H2, H3, P, Table } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "CLI & registry", description: "Start an app with npx vamos-ui create, copy components and blocks from any registry, share a theme as a preset code, keep code up to date with diff and upgrade, and connect AI agents with vamos-ui mcp add.", path: "/docs/cli/" });

export default function CliPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="CLI & registry"
      description="Install the whole kit as a package, or copy single components into your project."
      toc={[
        { id: "package-or-copy", title: "Package or copy" },
        { id: "create", title: "Start a new app" },
        { id: "registry", title: "Registry" },
        { id: "item", title: "Registry item format" },
        { id: "open-registry", title: "Items from other registries" },
        { id: "offline", title: "Offline / restricted networks" },
        { id: "presets", title: "Preset codes" },
        { id: "vamos-cli", title: "The vamos CLI" },
        { id: "site", title: "Website essentials" },
        { id: "mcp", title: "MCP server (AI agents)" },
      ]}
      prev={{ href: "/docs/payments", title: "Payments (iyzico, PayTR)" }}
      next={{ href: "/docs/publish-a-registry", title: "Publish a registry" }}
    >
      <H2 id="package-or-copy">Package or copy</H2>
      <Table
        head={["", "npm package", "Copy (registry)"]}
        rows={[
          ["Install", <C key="a">pnpm add @vamos-ui/react</C>, <C key="b">npx vamos-ui add button</C>],
          ["Updates", "Bump the version", <span key="u"><C>npx vamos-ui diff</C> and <C>upgrade</C>, keeping your edits</span>],
          ["Customise", "Props, tokens, className", "Edit the source freely"],
          ["Best for", "Teams that want a maintained kit", "Projects that need to diverge"],
        ]}
      />

      <H2 id="create">Start a new app</H2>
      <P>
        <C>create</C> writes a minimal app, installs it with your package manager, runs <C>init</C> and adds a starter screen
        built from <C>button</C>, <C>card</C> and <C>badge</C>:
      </P>
      <Code lang="bash" code={`npx vamos-ui create my-app                         # Next.js App Router + Tailwind CSS v4
npx vamos-ui create my-app --template vite         # Vite + React + Tailwind CSS v4
npx vamos-ui create my-app --preset v1dgokg --yes  # with a shared theme, no prompts
npx vamos-ui create my-app --locale tr-TR          # <html lang="tr-TR">
npx vamos-ui create my-app --no-install            # write files only`} />
      <Table
        head={["Flag", "What it does"]}
        rows={[
          [<C key="t">--template next|vite</C>, "Next.js (App Router) is the default."],
          [<C key="p">--preset &lt;code&gt;</C>, <span key="pd">Applies a <A href="#presets">preset code</A>: the axes in <C>vamos.json</C> and on <C>&lt;html&gt;</C>.</span>],
          [<C key="l">--locale &lt;tag&gt;</C>, <span key="ld">Sets <C>&lt;html lang&gt;</C> (default <C>en</C>). For a website, <C>site essentials</C> later takes the language from <C>vamos.site.json</C>.</span>],
          [<C key="n">--no-install</C>, "Skips the package install; the files and the kit source are still written."],
          [<C key="y">--yes</C>, "No prompts. Without a terminal the defaults are used anyway."],
        ]}
      />
      <P>The folder must be new or empty. The package manager is the one you ran the command with (npm, pnpm, yarn or bun).</P>

      <H2 id="registry">Registry</H2>
      <P>Every component and block is published as a registry item at <C>https://ui.vamos.ist/r/&lt;name&gt;.json</C>. The CLI reads it:</P>
      <Code lang="bash" code="npx vamos-ui add button" />
      <P>The item brings its dependencies and the shared token stylesheet the first time. <C>index.json</C> lists every item.</P>

      <H2 id="item">Registry item format</H2>
      <P>
        Each item is a small JSON file: its source files, npm dependencies and the other items it needs. The schema is published
        at <C>https://ui.vamos.ist/r/schema.json</C>.
      </P>
      <Code code={`{
  "name": "dialog",
  "type": "component",
  "title": "Dialog",
  "description": "Modal dialog with focus trap",
  "docs": "https://ui.vamos.ist/docs/components/dialog",
  "dependencies": ["radix-ui@^1.8.1"],
  "registryDependencies": ["button", "lib-labels"],
  "files": [{ "path": "components/dialog.tsx", "content": "…" }]
}`} />
      <P>
        <C>type</C> is <C>component</C>, <C>block</C>, <C>lib</C> or <C>style</C>. Component and lib files keep the kit layout
        under <C>uiDir</C>; block files go to <C>blocksDir/&lt;name&gt;/</C>. Imports of <C>@vamos-ui/react</C> are rewritten to your
        alias. Optional fields: <C>group</C>, <C>category</C>, <C>tags</C>, <C>usage</C>, <C>props</C>, <C>examples</C>, <C>guidance</C>.
      </P>

      <H2 id="open-registry">Items from other registries</H2>
      <P><C>add</C>, <C>view</C>, <C>diff</C> and <C>upgrade</C> accept more than names from the Vamos UI registry:</P>
      <Table
        head={["Spec", "Fetched from"]}
        rows={[
          [<C key="1">button</C>, <span key="1d">The project registry (<C>registry</C> in <C>vamos.json</C>, default <C>https://ui.vamos.ist/r</C>)</span>],
          [<C key="2">https://acme.dev/r/stat-card.json</C>, "That URL (https only; http is allowed for localhost)"],
          [<C key="3">github:acme/ui/stat-card</C>, <C key="3d">raw.githubusercontent.com/acme/ui/HEAD/r/stat-card.json</C>],
          [<C key="4">github:acme/ui/public/r#v1.2.0/stat-card</C>, <span key="4d">A path and a ref: <C>…/acme/ui/v1.2.0/public/r/stat-card.json</C></span>],
          [<C key="5">@acme/stat-card</C>, <span key="5d">The <C>@acme</C> entry of <C>registries</C> in <C>vamos.json</C></span>],
          [<C key="6">./r/stat-card.json</C>, "A local item file, for testing a registry you are building"],
        ]}
      />
      <Code code={`// vamos.json
{
  "registry": "https://ui.vamos.ist/r",
  "registries": {
    "@acme": "https://acme.dev/r/{name}.json"
  }
}`} />
      <Callout title="Third-party items are data, not code" tone="warning">
        The CLI prints the source host before it writes anything, validates the item against the same schema the Vamos UI
        registry is built with, and never runs anything from it. Their npm packages install with <C>--ignore-scripts</C>, and a
        third-party item never replaces a file another item installed. Review the files it lists, as you would any copied code.
      </Callout>
      <P>
        To publish your own components and blocks this way, see <A href="/docs/publish-a-registry">Publish a registry</A>.
      </P>

      <H2 id="offline">Offline / restricted networks</H2>
      <P>
        The CLI package carries a copy of the whole Vamos UI registry (about 2.5 MB compressed), so <C>add</C>, <C>list</C>,{" "}
        <C>search</C>, <C>view</C>, <C>init</C>, <C>create</C>, <C>diff</C> and <C>upgrade</C> also work where{" "}
        <C>ui.vamos.ist</C> cannot be reached: corporate proxies, firewalled CI runners, sandboxes. The registry is chosen in
        this order:
      </P>
      <Table
        head={["", "Source", "When"]}
        rows={[
          ["1", <span key="1"><C>--registry &lt;url|dir&gt;</C> or <C>VAMOS_REGISTRY</C> (then <C>registry</C> in <C>vamos.json</C>)</span>, "Always, when set to anything other than the default. Never falls back."],
          ["2", <C key="2">https://ui.vamos.ist/r</C>, "The default, over the network."],
          ["3", "The bundled copy", <span key="3">When the site gives no answer within 5 s (<C>VAMOS_REGISTRY_TIMEOUT</C>, in ms), the connection fails, or a proxy answers instead. The CLI prints one line saying which copy it used, e.g. <C>using the bundled registry (v0.4.3, built 2026-11-15)</C>.</span>],
        ]}
      />
      <Code lang="bash" code={`npx vamos-ui add data-table --offline     # never touch the network
VAMOS_OFFLINE=1 npx vamos-ui init --yes    # the same, for CI
npx vamos-ui registry info                 # version and date of the bundled copy`} />
      <P>
        With <C>--offline</C>, items from other registries (URLs, <C>github:</C>, <C>@ns/item</C> mapped to a URL) are refused
        instead of fetched; local item files still work. npm packages still install from your npm registry or mirror; add{" "}
        <C>--no-install</C> to skip that step.
      </P>
      <H3 id="vendor">Host or vendor the registry</H3>
      <P>
        The bundled copy can lag behind the site until the next CLI release. A team that wants one pinned copy for everyone
        writes it to a folder and points the CLI at it, from the repo or from an internal static host:
      </P>
      <Code lang="bash" code={`npx vamos-ui registry export ./vendor/vamos-registry   # the same files https://ui.vamos.ist/r serves
npx vamos-ui add button --registry ./vendor/vamos-registry

# or set it once in vamos.json: "registry": "./vendor/vamos-registry"
# or upload the folder and use "registry": "https://intranet.example.dev/vamos-registry"`} />

      <H2 id="presets">Preset codes</H2>
      <P>
        A preset code is the six theme axes (the sixth, corners, is optional) in one short string, so a look can be shared in a
        message, a README or an issue:
      </P>
      <Code lang="bash" code={`npx vamos-ui preset                    # print this project's code, e.g. v1dgokg
npx vamos-ui preset v1dgokg            # explain a code: dark · glass · ocean · compact · grotesk
npx vamos-ui theme --preset v1dgokg    # apply it to this project
npx vamos-ui init --preset v1dgokg     # set up a project with it
npx vamos-ui create my-app --preset v1lsx4f46e5ce   # a custom accent colour (#4f46e5)`} />
      <Table
        head={["Position", "Letters"]}
        rows={[
          ["1-2", <span key="v"><C>v1</C>, the format version</span>],
          ["Theme", <span key="t"><C>l</C> light, <C>d</C> dark</span>],
          ["Material", <span key="m"><C>s</C> solid, <C>g</C> glass</span>],
          ["Accent", <span key="a"><C>l</C> lime, <C>o</C> ocean, <C>e</C> ember, <C>r</C> rose, <C>g</C> graphite, or <C>x</C> and six hex digits</span>],
          ["Density", <span key="d"><C>c</C> comfortable, <C>k</C> compact</span>],
          ["Font", <span key="f"><C>s</C> system, <C>e</C> editorial, <C>g</C> grotesk, <C>c</C> corporate</span>],
          ["Corners (optional)", <span key="r"><C>d</C> default, <C>s</C> sharp, <C>r</C> round (<C>data-radius</C>); left out when default</span>],
        ]}
      />
      <P>
        Codes ignore case and the separators <C>-</C>, <C>_</C> and <C>.</C>. Only a custom accent is applied through the brand
        file: the CLI writes <C>vamos.brand.json</C> and <C>brand.css</C> and selects <C>data-accent=&quot;brand&quot;</C>. Corners map
        to <C>data-radius</C> (saved as <C>theme.radius</C> in <C>vamos.json</C>), so <C>v1dgokgs</C> is ocean with sharp corners
        and needs no brand file. See <A href="/docs/theming#corners">Theming → Corners</A> for what follows the setting.
        Tools can use the same codec: <C>{`import { encodePreset, decodePreset } from "vamos-ui/preset"`}</C>.
      </P>

      <H2 id="vamos-cli">The vamos CLI <Badge tone="success" className="ms-2 align-middle">v0.2</Badge></H2>
      <P>A small CLI on top of the same registry, published on npm as <C>vamos-ui</C>:</P>
      <Code lang="bash" code={`npx vamos-ui create my-app   # new Next.js or Vite app with the kit and a starter screen
npx vamos-ui init            # write vamos.json, the styles import and the base library
npx vamos-ui add data-table  # copy a component and its dependencies
npx vamos-ui add github:acme/ui/stat-card   # copy an item from another registry
npx vamos-ui diff button     # show what changed upstream since you copied it
npx vamos-ui upgrade button  # three-way merge upstream changes into your edited copy
npx vamos-ui search calendar # find components and blocks
npx vamos-ui theme           # pick the six theme axes
npx vamos-ui preset          # print the shareable preset code
npx vamos-ui verify src      # lint for design-rule and accessibility issues
npx vamos-ui new                         # plan a website: a few questions → vamos.project.json + vamos.site.json
npx vamos-ui site import https://example.com   # read a current site: details, navigation, texts, images
npx vamos-ui task next                   # the plan's tasks that can start now, with a brief for each
npx vamos-ui agents                      # orchestrator skill + nine specialist subagents for Claude Code
npx vamos-ui site form                   # contact-form sender: contact.php, Resend or SMTP
npx vamos-ui site deploy                 # host config (https, headers, cache) and publishing steps
npx vamos-ui site check                  # after publishing: audit + redirects, headers, 404, sitemap; exit 1 below 90
npx vamos-ui audit https://example.com   # audit a live site: SEO basics, broken links, placeholders
npx vamos-ui audit http://localhost:3000 # a local preview: hosting checks (https, headers) are info only
npx vamos-ui brand import https://example.com  # turn a site into a brand profile
npx vamos-ui site init       # empty vamos.site.json: the business info for a website
npx vamos-ui site essentials # robots, sitemap, llms.txt, JSON-LD and legal pages
npx vamos-ui registry build  # build your own registry from a folder of components
npx vamos-ui registry export ./vendor/vamos-registry   # the registry bundled with the CLI, to host or vendor
npx vamos-ui add button --offline   # no network: use the bundled registry (also VAMOS_OFFLINE=1)
npx vamos-ui mcp add         # connect your AI client to the MCP server
npx vamos-ui init --no-agent # skip the AI rules (AGENTS.md, CLAUDE.md, Copilot, Cursor) and skill`} />
      <Callout title="Why diff matters">
        Copied components usually stop receiving fixes. <C>vamos-ui diff</C> and <C>vamos-ui upgrade</C> record the version you
        copied, so accessibility and bug fixes can still reach your edited code.
      </Callout>

      <H2 id="site">Website essentials</H2>
      <P>
        A website built from <C>site-*</C> blocks keeps its business information in one file, <C>vamos.site.json</C> at the
        project root: name, legal name, description, url, locale, schema.org type, contact, address, geo, opening hours, social
        links, legal ids (tax office and number, MERSİS, trade registry, KEP, ETBİS, data controller, privacy email), analytics
        ids and AI settings. <C>site init</C> writes it with every business field empty; fill it in with the business&apos;s own
        details. Nothing has a default value, analytics ids included.
      </P>
      <Code lang="bash" code={`npx vamos-ui site init --name "Kıyı Seramik" --url https://kiyiseramik.com.tr --locale tr-TR
npx vamos-ui site essentials            # writes what is missing, never replaces a file
npx vamos-ui site essentials --dry-run  # show the plan and the layout diff`} />
      <Table
        head={["File", "What it does"]}
        rows={[
          [<C key="s">app/site.ts</C>, <span key="sd">The typed <C>site</C> object (the JSON), <C>SITE_URL</C> (<C>NEXT_PUBLIC_SITE_URL</C>, else <C>site.url</C>), <C>SITE_ROUTES</C> and the legal page values.</span>],
          [<C key="r">app/robots.ts</C>, <span key="rd"><C>ai.allowAiCrawlers</C>: <C>true</C> allows every crawler; <C>false</C> disallows the known AI bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot …); a list allows only those AI bots.</span>],
          [<C key="m">app/sitemap.ts</C>, "sitemap.xml from SITE_ROUTES."],
          [<C key="l">app/llms.txt/route.ts</C>, <span key="ld"><A href="https://llmstxt.org">llms.txt</A>: name, description, services, contact, opening hours, FAQ, key pages and legal pages. Off with <C>ai.llmsTxt: false</C>.</span>],
          [<C key="j">app/site-json-ld.tsx</C>, <span key="jd"><C>&lt;SiteJsonLd /&gt;</C>: the business type with address, phone, geo, opening hours and <C>sameAs</C>, plus <C>FAQPage</C> when <C>ai.faq</C> is set. Render it once in the root layout.</span>],
          [<C key="i">app/icon.svg</C>, "The favicon: the business name's first letter on a flat tile in the theme accent (or the brand accent)."],
          [<C key="o">app/opengraph-image.tsx</C>, <span key="od">The 1200×630 <C>og:image</C> (<C>next/og</C>): business name and description in the site&apos;s colours.</span>],
          [<C key="p">app/&lt;legal&gt;/page.tsx</C>, <span key="pd">One page per legal link the blocks have, rendering <C>legal-01</C> with <C>values</C> from the site file, so the known <C>[fill-in]</C> fields are filled. A Turkish site (<C>locale</C> <C>tr-*</C>) with a contact form or newsletter also gets <C>/kvkk-aydinlatma-metni</C> when nothing links a KVKK notice yet; the command says to link it from the footer and the form.</span>],
        ]}
      />
      <P>
        The root layout: while it is still the one <C>create</C> wrote, <C>site essentials</C> fills it in: <C>&lt;html lang&gt;</C>{" "}
        from <C>locale</C>, metadata from <C>app/site.ts</C> (<C>metadataBase</C>, canonical, <C>og:url</C>, Open Graph, Twitter
        card) and <C>&lt;SiteJsonLd /&gt;</C> once in <C>&lt;body&gt;</C>. A layout you edited is never changed; the command
        prints the metadata and JSON-LD to add instead. Existing files (a favicon, an og image, a legal page) are always kept.
      </P>
      <P>
        The JSON Schema is at <C>https://ui.vamos.ist/r/site-schema.json</C> (set <C>$schema</C> for editor hints).{" "}
        <C>vamos-ui verify</C> reports empty required fields (name, url, phone or email, city; MERSİS and ETBİS for a shop) and a
        website without llms.txt (rule <C>site-info</C>). The legal pages stay template text: the business or its lawyer reviews them.
      </P>

      <H2 id="process">Website process: orchestrator and specialists</H2>
      <P>
        <C>vamos-ui new</C> writes the plan; the process walks it. Each task in <C>vamos.project.json</C> belongs to one
        specialist and waits for the tasks before it: brand and content start together, the build follows the brand, legal pages,
        SEO, forms and measurement follow the build, QA checks everything and deploy comes last. Status is kept in the file, so
        another assistant (or you, next week) continues where the last one stopped, and rebuilding the plan from new answers keeps it.
      </P>
      <Code lang="bash" code={`npx vamos-ui task              # every task, its status and what it waits for
npx vamos-ui task next         # what can start now (several = run them in parallel)
npx vamos-ui task brief seo    # the brief for the SEO specialist
npx vamos-ui task done brand --note "accent approved"
npx vamos-ui task block content --note "photos from the owner"
npx vamos-ui task reset forms  # QA found a problem: reopen it`} />
      <P>
        A brief has the goal, what to read, the part of the plan that matters for the task, the steps, the requirements the
        specialist owns, the checks that prove it is done and a fixed report format (<C>STATUS / CHANGED / CHECKS / REQUIREMENTS /
        FOLLOW-UPS</C>). The requirements come from a pack per site type on top of a shared baseline: a local business needs the
        same name, address and phone as its Google profile and LocalBusiness JSON-LD; a shop needs Product JSON-LD, the distance
        sales agreement at checkout and ETBİS in the footer; a booking site states its cancellation rules and asks separate explicit
        consent for health data; an event has Event JSON-LD with a time zone. QA walks the whole list before deploy.
      </P>
      <P>
        <C>vamos-ui agents</C> (also run by <C>new</C>) writes <C>.claude/skills/vamos-site/SKILL.md</C>, the orchestrator that
        interviews the user, shows the plan, hands each brief to a subagent and reports progress, and nine subagents in{" "}
        <C>.claude/agents/</C> (<C>vamos-brand</C>, <C>vamos-content</C>, <C>vamos-build</C>, <C>vamos-legal</C>, <C>vamos-seo</C>,{" "}
        <C>vamos-tracking</C>, <C>vamos-forms</C>, <C>vamos-qa</C>, <C>vamos-deploy</C>). Delete the marker line in a file to keep
        your own version. Codex, Cursor and Gemini follow the same process from <C>AGENTS.md</C>; chat clients use the MCP tools{" "}
        <C>start_project</C> and <C>next_task</C>. Publishing, DNS changes and replacing a live site always wait for the user.
      </P>
      <H3 id="deploy">Hosting config</H3>
      <P>
        <C>vamos-ui site deploy</C> writes the config that makes the launch checks pass on the first deploy and prints the
        publishing steps; it never publishes anything itself and never replaces a file.
      </P>
      <Table
        head={["Host", "Files", "What they do"]}
        rows={[
          ["cPanel", <C key="c">public/.htaccess</C>, "http → https and one host name (301), /page → page.html, security headers, long cache for /_next/static, the 404 page, project files denied."],
          ["Vercel", <C key="v">vercel.json</C>, "Security headers, immutable cache for /_next/static, the other host name redirected."],
          ["Netlify, Cloudflare Pages", <C key="n">public/_headers, public/_redirects</C>, "The same headers and redirect in the host's own format."],
          ["VPS", <C key="p">deploy/nginx-&lt;domain&gt;.conf, deploy/ecosystem.config.cjs</C>, "TLS server blocks with redirects and headers in front of Next.js on pm2 (standalone output)."],
        ]}
      />
      <H3 id="site-check">After the deploy</H3>
      <P>
        Once the site is live, <C>vamos-ui site check</C> closes the loop: it runs the audit on the live URL and checks that the
        host config took effect. It only reads the public site. The URL comes from <C>vamos.site.json</C>, else the plan&apos;s
        domain; pass one to check another address.
      </P>
      <Table
        head={["Check", "Passes when"]}
        rows={[
          ["http → https", <span key="h"><C>http://</C> answers 301 (or 308) to <C>https://</C>.</span>],
          ["One host name", "The www or bare twin 301s to the address the site is served on (skipped for subdomains)."],
          ["Security headers", <span key="s"><C>Strict-Transport-Security</C>, <C>X-Content-Type-Options</C> and <C>Referrer-Policy</C> are sent; <C>X-Frame-Options</C> and <C>Permissions-Policy</C> are recommended.</span>],
          ["404", "An unknown path answers 404, not 200 or a redirect to the home page (a soft 404)."],
          ["robots.txt, sitemap.xml", "Both answer, parse, and robots.txt does not block the site."],
          ["Audit", <span key="a">Score at least <C>--min-score</C> (default 90) and no errors.</span>],
        ]}
      />
      <P>
        It exits 1 when anything fails, so it can gate CI; <C>--json</C> gives the result as data. In a planned project a pass
        ends with the command that closes the deploy task (<C>npx vamos-ui task done deploy</C>); the task is never marked for you.{" "}
        <C>--ci</C> prints a GitHub Actions workflow that runs the check after each production deploy, by hand and weekly:
      </P>
      <Code lang="bash" code={`npx vamos-ui site check                          # URL from vamos.site.json
npx vamos-ui site check https://ornek.com.tr --min-score 85 --lang en
npx vamos-ui site check --ci > .github/workflows/site-check.yml`} />

      <H2 id="mcp">MCP server (AI agents)</H2>
      <P>
        Agents get the rules, theming, search, items, blocks, screen plans and code checks through MCP. It works with any
        model your client runs — Claude, GPT, Gemini or a local model. One command sets it up:
      </P>
      <Code lang="bash" code={`npx vamos-ui mcp add                    # detect the clients this project uses
npx vamos-ui mcp add --client cursor    # or name one: claude, cursor, vscode, windsurf, codex, gemini
npx vamos-ui mcp add --client claude --print   # show the config and command, write nothing`} />
      <H3>What it writes</H3>
      <Table
        head={["Client", "File"]}
        rows={[
          ["Claude Code", <span key="c"><C>.mcp.json</C> (or run <C>claude mcp add vamos-ui -- npx -y @vamos-ui/mcp</C>)</span>],
          ["Cursor", <C key="cu">.cursor/mcp.json</C>],
          ["VS Code", <C key="v">.vscode/mcp.json</C>],
          ["Gemini CLI", <C key="g">.gemini/settings.json</C>],
          ["Windsurf", <C key="w">~/.codeium/windsurf/mcp_config.json</C>],
          ["Codex", <span key="x"><C>~/.codex/config.toml</C> (or run <C>codex mcp add vamos-ui -- npx -y @vamos-ui/mcp</C>)</span>],
        ]}
      />
      <P>
        Only the <C>vamos-ui</C> entry is added or updated; other servers and settings are kept, and running it again changes
        nothing. For ChatGPT, claude.ai and Claude mobile, add a custom connector with the URL <C>https://mcp.vamos.ist/mcp</C>.
      </P>
      <P>
        The hosted server cannot see your files, so the project tools (brand profile, apply, update, project-wide verify) run
        only with the local server. Full setup for every client:{" "}
        <A href="https://github.com/sametburaksari/vamos-ui/tree/main/packages/mcp#setup">packages/mcp README</A>.
      </P>
    </DocPage>
  );
}
