import { Badge } from "@vamos-ui/react";
import { A, C, Callout, Code, DocPage, H2, P, Table } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "CLI & registry", description: "Copy components and blocks into your project with npx vamos-ui, keep them up to date with diff and upgrade, and connect AI agents through the MCP server.", path: "/docs/cli/" });

export default function CliPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="CLI & registry"
      description="Install the whole kit as a package, or copy single components into your project."
      toc={[
        { id: "package-or-copy", title: "Package or copy" },
        { id: "registry", title: "Registry" },
        { id: "item", title: "Registry item format" },
        { id: "vamos-cli", title: "The vamos CLI" },
        { id: "mcp", title: "MCP server (AI agents)" },
      ]}
      prev={{ href: "/docs/localization", title: "Localization" }}
      next={{ href: "/blocks", title: "Blocks" }}
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

      <H2 id="registry">Registry</H2>
      <P>Every component and block is published as a registry item at <C>https://ui.vamos.ist/r/&lt;name&gt;.json</C>. The CLI reads it:</P>
      <Code lang="bash" code="npx vamos-ui add button" />
      <P>The item brings its dependencies and the shared token stylesheet the first time.</P>

      <H2 id="item">Registry item format</H2>
      <P>Each item is a small JSON file: its files, npm dependencies, other items it needs, and the axes it supports.</P>
      <Code code={`{
  "$schema": "https://ui.vamos.ist/schema/registry-item.json",
  "name": "button",
  "type": "registry:ui",
  "dependencies": ["radix-ui", "class-variance-authority", "lucide-react"],
  "registryDependencies": ["https://ui.vamos.ist/r/tokens.json"],
  "files": [{ "path": "ui/button.tsx", "type": "registry:ui" }],
  "meta": { "vamos": { "version": "0.1.0", "axes": ["theme", "material", "accent", "density", "font"] } }
}`} />

      <H2 id="vamos-cli">The vamos CLI <Badge tone="success" className="ms-2 align-middle">v0.2</Badge></H2>
      <P>A small CLI on top of the same registry, published on npm as <C>vamos-ui</C>:</P>
      <Code lang="bash" code={`npx vamos-ui init            # pick axis presets, write globals.css and the layout boot script
npx vamos-ui add data-table  # copy a component and its dependencies
npx vamos-ui diff button     # show what changed upstream since you copied it
npx vamos-ui upgrade button  # three-way merge upstream changes into your edited copy
npx vamos-ui search calendar # find components and blocks
npx vamos-ui theme           # pick the five theme axes
npx vamos-ui verify src      # lint for design-rule and accessibility issues
npx vamos-ui brand import https://example.com  # turn a site into a brand profile
npx vamos-ui init --agent    # add the agent rules and skill (also: npx @vamos-ui/mcp)`} />
      <Callout title="Why diff matters">
        Copied components usually stop receiving fixes. <C>vamos-ui diff</C> and <C>vamos-ui upgrade</C> record the version you
        copied, so accessibility and bug fixes can still reach your edited code.
      </Callout>

      <H2 id="mcp">MCP server (AI agents)</H2>
      <P>
        Agents get the rules, theming, search, items, blocks, screen plans and code checks through MCP. It works with any
        model your client runs — Claude, GPT, Gemini or a local model.
      </P>
      <Table
        head={["Client", "Setup"]}
        rows={[
          ["ChatGPT, claude.ai, Claude mobile", <span key="1">Add a custom connector with the URL <C>https://mcp.vamos.ist/mcp</C></span>],
          ["Claude Code", <C key="2">claude mcp add vamos-ui -- npx -y @vamos-ui/mcp</C>],
          ["Codex", <C key="3">codex mcp add vamos-ui -- npx -y @vamos-ui/mcp</C>],
          ["Cursor, VS Code, Windsurf, Gemini CLI, Zed, JetBrains", <span key="4">Command <C>npx</C>, arguments <C>-y @vamos-ui/mcp</C></span>],
        ]}
      />
      <P>
        The hosted server cannot see your files, so the project tools (brand profile, apply, update, project-wide verify) run
        only with the local server. Full setup for every client:{" "}
        <A href="https://github.com/sametburaksari/vamos-ui/tree/main/packages/mcp#setup">packages/mcp README</A>.
      </P>
    </DocPage>
  );
}
