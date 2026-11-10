import { Badge } from "@vamos-cms/ui";
import { C, Callout, Code, DocPage, H2, P, Table } from "@/components/docs/prose";

export const metadata = { title: "CLI & registry" };

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
      ]}
      prev={{ href: "/docs/localization", title: "Localization" }}
      next={{ href: "/blocks", title: "Blocks" }}
    >
      <H2 id="package-or-copy">Package or copy</H2>
      <Table
        head={["", "npm package", "Copy (registry)"]}
        rows={[
          ["Install", <C key="a">pnpm add @vamos-cms/ui</C>, "One component at a time"],
          ["Updates", "Bump the version", "Re-add, or diff with the vamos CLI (planned)"],
          ["Customise", "Props, tokens, className", "Edit the source freely"],
          ["Best for", "Teams that want a maintained kit", "Projects that need to diverge"],
        ]}
      />

      <H2 id="registry">Registry <Badge tone="outline" className="ms-2 align-middle">Coming with v0.2</Badge></H2>
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

      <H2 id="vamos-cli">The vamos CLI <Badge tone="outline" className="ms-2 align-middle">Planned</Badge></H2>
      <P>A small CLI on top of the same registry:</P>
      <Code lang="bash" code={`npx vamos-ui init            # pick axis presets, write globals.css and the layout boot script
npx vamos-ui add data-table  # copy a component and its dependencies
npx vamos-ui diff button     # show what changed upstream since you copied it
npx vamos-ui upgrade button  # three-way merge upstream changes into your edited copy`} />
      <Callout title="Why diff matters">
        Copied components usually stop receiving fixes. <C>vamos-ui diff</C> and <C>vamos-ui upgrade</C> record the version you
        copied, so accessibility and bug fixes can still reach your edited code.
      </Callout>
    </DocPage>
  );
}
