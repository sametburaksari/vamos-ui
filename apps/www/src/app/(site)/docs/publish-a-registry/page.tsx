import { A, C, Callout, Code, DocPage, H2, H3, P, Step, Steps, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Publish a registry",
  description: "Publish your own components and blocks for Vamos UI: the item format, vamos-ui registry build, hosting on GitHub or any static host, naming rules, and installing with npx vamos-ui add.",
  path: "/docs/publish-a-registry/",
});

export default function PublishRegistryPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Publish a registry"
      description="Share your own components and blocks. Anyone with the CLI can install them next to the kit."
      toc={[
        { id: "overview", title: "How it works" },
        { id: "layout", title: "Folder layout" },
        { id: "build", title: "Build" },
        { id: "format", title: "Item format" },
        { id: "dependencies", title: "Dependencies" },
        { id: "naming", title: "Naming rules" },
        { id: "hosting", title: "Hosting" },
        { id: "install", title: "Installing" },
        { id: "checklist", title: "Checklist" },
      ]}
      prev={{ href: "/docs/cli", title: "CLI & registry" }}
      next={{ href: "/blocks", title: "Blocks" }}
    >
      <H2 id="overview">How it works</H2>
      <P>
        A registry is a folder of static JSON files: one <C>&lt;item&gt;.json</C> per component or block, plus an <C>index.json</C>.
        There is no server and no account. Build it from your source with the CLI, host it anywhere that serves files, and
        people install from it with <C>npx vamos-ui add</C>, exactly like the Vamos UI registry at <C>https://ui.vamos.ist/r</C>.
      </P>
      <Code lang="bash" code={`npx vamos-ui registry build                      # components/, lib/, blocks/ → r/*.json
npx vamos-ui add github:acme/ui/stat-card        # what your users run`} />

      <H2 id="layout">Folder layout</H2>
      <P>Write your items the way the kit is written: React 19, Tailwind CSS v4, semantic tokens, and kit imports from <C>@vamos-ui/react</C>.</P>
      <Code lang="bash" code={`acme-ui/
  registry.json                 # optional: name, homepage, titles, Vamos UI dependencies
  package.json                  # optional: version ranges for npm imports
  components/stat-card.tsx      # → item "stat-card" (component)
  components/trend-badge.tsx    # → item "trend-badge" (component)
  components/kanban/            # → item "kanban" (component, every file in the folder)
  lib/format-money.ts           # → item "format-money" (lib)
  blocks/kpi-board/page.tsx     # → item "kpi-board" (block, every file in the folder)`} />
      <P>
        Each file directly in <C>components/</C> or <C>lib/</C> is one item; a sub-folder there is one item with all its files.
        Each folder in <C>blocks/</C> is one block. Tests (<C>*.test.*</C>, <C>*.spec.*</C>), stories and <C>.d.ts</C> files are
        skipped. The description comes from the first <C>{"/** … */"}</C> comment in the file.
      </P>
      <H3>registry.json</H3>
      <P>Everything is optional except <C>homepage</C> (item docs links point to it; <C>--homepage</C> works too). Entries in <C>items</C> override or add to what was discovered:</P>
      <Code code={`{
  "name": "acme-ui",
  "homepage": "https://acme.dev/ui",
  "version": "1.2.0",
  "items": [
    {
      "name": "stat-card",
      "title": "Stat card",
      "registryDependencies": ["card", "badge"],
      "tags": ["kpi", "dashboard"],
      "usage": "import { StatCard } from \\"@vamos-ui/react/components/stat-card\\";"
    },
    { "name": "helpers", "type": "lib", "files": ["utils/format.ts", "utils/dates.ts"] }
  ]
}`} />

      <H2 id="build">Build</H2>
      <Code lang="bash" code={`npx vamos-ui registry build                 # current folder → ./r
npx vamos-ui registry build ./acme-ui --out ./acme-ui/public/r
npx vamos-ui registry build --dry-run       # check without writing
npx vamos-ui registry build --strict        # treat warnings as errors (CI)`} />
      <P>The builder reads imports to fill in dependencies, validates every item against the published schema and stops on errors:</P>
      <UL>
        <li>A relative import of another item&apos;s file becomes a <C>./&lt;item&gt;</C> dependency.</li>
        <li>A relative import of a file that is in no item is an error. Add the file to an item.</li>
        <li>A bare import (<C>lucide-react</C>) becomes an npm dependency with the range from <C>package.json</C>. <C>react</C>, <C>react-dom</C>, <C>next</C> and <C>tailwindcss</C> are provided by the app and skipped.</li>
        <li>A block that imports one of your components is rewritten to <C>@vamos-ui/react/components/…</C>, which the CLI maps to the user&apos;s alias, because blocks and components land in different folders.</li>
        <li>Imports from <C>@vamos-ui/react</C> are not resolved for you: list the kit items you use in <C>registryDependencies</C>. The builder warns when you forget.</li>
      </UL>

      <H2 id="format">Item format</H2>
      <P>The same format as the Vamos UI registry, validated against <C>https://ui.vamos.ist/r/schema.json</C>. Unknown fields are rejected.</P>
      <Code code={`{
  "name": "stat-card",
  "type": "component",
  "title": "Stat card",
  "description": "A KPI tile with a trend badge.",
  "docs": "https://acme.dev/ui",
  "dependencies": ["lucide-react@^1.70.0"],
  "registryDependencies": ["card", "./trend-badge"],
  "files": [{ "path": "components/stat-card.tsx", "content": "…" }],
  "tags": ["kpi"]
}`} />
      <Table
        head={["Field", "Rules"]}
        rows={[
          [<C key="n">name</C>, "Lower-case letters, digits and dashes. Also the file name: r/<name>.json."],
          [<C key="t">type</C>, <span key="td"><C>component</C> and <C>lib</C> files go to the user&apos;s <C>uiDir</C> keeping their path; <C>block</C> files go to <C>blocksDir/&lt;name&gt;/</C>. (<C>style</C> is reserved for the kit.)</span>],
          [<C key="f">files</C>, <span key="fd">Relative paths, no <C>..</C>, with the full source as <C>content</C>.</span>],
          [<C key="d">dependencies</C>, <span key="dd">npm names with a semver range or dist-tag. Git, file, link and URL specs are rejected.</span>],
          [<C key="r">registryDependencies</C>, <span key="rd">See <A href="#dependencies">Dependencies</A>.</span>],
          [<C key="o">optional</C>, <span key="od"><C>group</C>, <C>category</C>, <C>tags</C>, <C>usage</C>, <C>props</C>, <C>examples</C>, <C>guidance</C>, shown by <C>vamos-ui view</C>.</span>],
        ]}
      />

      <H2 id="dependencies">Dependencies</H2>
      <Table
        head={["Entry", "Means"]}
        rows={[
          [<C key="1">card</C>, "A Vamos UI kit item (from the user's configured registry)."],
          [<C key="2">./trend-badge</C>, "Another item in your registry, next to this one (same host, repo, ref and folder)."],
          [<C key="3">@acme/chart-kit</C>, <span key="3d">A namespaced item; the user maps <C>@acme</C> in <C>vamos.json</C>.</span>],
          [<C key="4">github:acme/charts/sparkline</C>, "An item in another GitHub repository."],
          [<C key="5">https://acme.dev/r/x.json</C>, "Any https URL."],
        ]}
      />

      <H2 id="naming">Naming rules</H2>
      <UL>
        <li>Item names are unique within your registry and never reuse a kit name (<C>button</C>, <C>card</C>, <C>data-table</C> …). Prefer a product prefix: <C>acme-stat-card</C>.</li>
        <li>Give files distinctive names (<C>components/acme-stat-card.tsx</C>) so they cannot collide with kit files such as <C>components/card.tsx</C> or <C>lib/cn.ts</C>. The CLI never lets a third-party item replace a file another item installed; such a file is reported and kept.</li>
        <li>Export names are unique too: prefix sub-parts with the component name (<C>StatCardValue</C>, not <C>Value</C>).</li>
        <li>Do not name your registry or items after Vamos UI, and do not use the Vamos UI logo for them.</li>
      </UL>

      <H2 id="hosting">Hosting</H2>
      <Steps>
        <Step title="GitHub, no setup">
          <P>
            Commit the built <C>r/</C> folder to a public repository. Users install with <C>github:owner/repo/&lt;item&gt;</C>, which
            reads <C>raw.githubusercontent.com/owner/repo/HEAD/r/&lt;item&gt;.json</C>. Another folder or a tag:
            <C> github:owner/repo/public/r#v1.2.0/&lt;item&gt;</C>.
          </P>
        </Step>
        <Step title="GitHub Pages">
          <P>Build into the folder Pages serves and commit it, or build in a workflow:</P>
          <Code lang="bash" code={`# .github/workflows/registry.yml
on: { push: { branches: [main] } }
permissions: { pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/checkout@v4
      - run: npx -y vamos-ui registry build --out site/r --strict
      - uses: actions/upload-pages-artifact@v3
        with: { path: site }
      - uses: actions/deploy-pages@v4`} />
          <P>Users then run <C>npx vamos-ui add https://owner.github.io/repo/r/&lt;item&gt;.json</C>.</P>
        </Step>
        <Step title="Any static host">
          <P>
            Upload the folder to Netlify, Vercel, Cloudflare Pages, S3 or your own server. It must be served over https; JSON is
            fetched by the CLI, so no CORS headers are needed. Keep the URL stable: it is recorded in the user&apos;s lock file and
            used by <C>diff</C> and <C>upgrade</C>.
          </P>
        </Step>
      </Steps>

      <H2 id="install">Installing</H2>
      <Code lang="bash" code={`npx vamos-ui add https://acme.dev/r/stat-card.json
npx vamos-ui add github:acme/ui/stat-card
npx vamos-ui add @acme/stat-card          # with "registries": { "@acme": "https://acme.dev/r/{name}.json" }
npx vamos-ui view github:acme/ui/stat-card
npx vamos-ui diff @acme/stat-card         # later: compare with the published version`} />
      <P>
        Test before you publish: <C>npx vamos-ui add ./acme-ui/r/stat-card.json</C> installs from a local file, and plain
        <C> http://localhost</C> URLs are allowed for a local server.
      </P>
      <Callout title="What users see" tone="warning">
        Before writing, the CLI names your host and lists every file. Items are data: nothing in them is executed, npm packages
        they need install with <C>--ignore-scripts</C>, and an item that fails the schema is refused.
      </Callout>

      <H2 id="checklist">Checklist</H2>
      <UL>
        <li>Tokens only: no raw colours, palette classes or <C>dark:</C> variants. Run <C>npx vamos-ui verify components blocks</C>.</li>
        <li>Works in every axis: theme, material, accent, density and font.</li>
        <li>Relative imports between your files; no project aliases like <C>@/</C>.</li>
        <li>Every kit item you import is in <C>registryDependencies</C>; every npm package has a range in <C>package.json</C>.</li>
        <li><C>npx vamos-ui registry build --strict</C> passes, and a fresh <C>npx vamos-ui create</C> app can add each item.</li>
      </UL>
      <P>
        The CLI reference is on <A href="/docs/cli#open-registry">CLI & registry</A>.
      </P>
    </DocPage>
  );
}
