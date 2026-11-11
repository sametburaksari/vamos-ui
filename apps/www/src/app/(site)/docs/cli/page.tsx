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
        { id: "presets", title: "Preset codes" },
        { id: "vamos-cli", title: "The vamos CLI" },
        { id: "mcp", title: "MCP server (AI agents)" },
      ]}
      prev={{ href: "/docs/localization", title: "Localization" }}
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
npx vamos-ui create my-app --no-install            # write files only`} />
      <Table
        head={["Flag", "What it does"]}
        rows={[
          [<C key="t">--template next|vite</C>, "Next.js (App Router) is the default."],
          [<C key="p">--preset &lt;code&gt;</C>, <span key="pd">Applies a <A href="#presets">preset code</A>: the axes in <C>vamos.json</C> and on <C>&lt;html&gt;</C>.</span>],
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

      <H2 id="presets">Preset codes</H2>
      <P>
        A preset code is the five theme axes (plus an optional corner radius) in one short string, so a look can be shared in a
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
          ["Radius (optional)", <span key="r"><C>d</C> default, <C>s</C> sharp, <C>r</C> round; left out when default</span>],
        ]}
      />
      <P>
        Codes ignore case and the separators <C>-</C>, <C>_</C> and <C>.</C>. A custom accent or radius is applied through the
        brand file: the CLI writes <C>vamos.brand.json</C> and <C>brand.css</C> and selects <C>data-accent=&quot;brand&quot;</C>.
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
npx vamos-ui theme           # pick the five theme axes
npx vamos-ui preset          # print the shareable preset code
npx vamos-ui verify src      # lint for design-rule and accessibility issues
npx vamos-ui brand import https://example.com  # turn a site into a brand profile
npx vamos-ui registry build  # build your own registry from a folder of components
npx vamos-ui mcp add         # connect your AI client to the MCP server
npx vamos-ui init --agent    # add the agent rules and skill`} />
      <Callout title="Why diff matters">
        Copied components usually stop receiving fixes. <C>vamos-ui diff</C> and <C>vamos-ui upgrade</C> record the version you
        copied, so accessibility and bug fixes can still reach your edited code.
      </Callout>

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
