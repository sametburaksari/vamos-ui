import { A, C, Callout, DocPage, H2, P, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Security",
  description: "How to report a vulnerability in Vamos UI, what the vamos-ui CLI does and never does with your project, and the limits of the hosted MCP server.",
  path: "/docs/security/",
});

const ADVISORY = "https://github.com/sametburaksari/vamos-ui/security/advisories/new";

export default function SecurityPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Security"
      description="Report vulnerabilities privately. The kit is plain React source; the CLI writes files and never runs remote code."
      toc={[
        { id: "report", title: "Report a vulnerability" },
        { id: "supported", title: "Supported versions" },
        { id: "cli", title: "What the CLI does" },
        { id: "mcp", title: "MCP server" },
        { id: "kit", title: "The component kit" },
      ]}
      prev={{ href: "/docs/accessibility", title: "Accessibility" }}
      next={{ href: "/docs/migration", title: "Migration" }}
    >
      <H2 id="report">Report a vulnerability</H2>
      <P>
        Use GitHub&apos;s private vulnerability reporting: open <A href={ADVISORY}>Report a vulnerability</A> on the repository
        (Security tab). Include the package and version, what an attacker can do, and the steps to reproduce. Please do not
        open a public issue or pull request for a security problem.
      </P>
      <UL>
        <li>Acknowledgement within 3 working days.</li>
        <li>Confirmation and an agreed fix and disclosure timeline within 14 days.</li>
        <li>Fixes ship as a patch release with a GitHub security advisory that credits you, unless you prefer not to be named.</li>
      </UL>
      <P>
        The same policy is in <A href="https://github.com/sametburaksari/vamos-ui/blob/main/SECURITY.md">SECURITY.md</A>.
      </P>

      <H2 id="supported">Supported versions</H2>
      <P>Vamos UI is in early preview. Only the latest minor version of each package receives security fixes.</P>
      <Table
        head={["Package", "Supported"]}
        rows={[
          [<C key="r">@vamos-ui/react</C>, "Latest 0.x minor"],
          [<C key="c">vamos-ui</C>, "Latest 0.x minor (CLI)"],
          [<C key="m">@vamos-ui/mcp</C>, "Latest 0.x minor"],
          ["Registry, docs site, hosted MCP", "Current deployment"],
        ]}
      />

      <H2 id="cli">What the CLI does — and does not do</H2>
      <Table
        head={["It does", "It does not"]}
        rows={[
          [
            <span key="a">Read item JSON from the registry (<C>https://ui.vamos.ist/r</C> unless you set <C>--registry</C>, <C>VAMOS_REGISTRY</C> or <C>vamos.json</C>).</span>,
            "Download and execute scripts. Registry content is written to disk as text; the CLI never evaluates or imports it.",
          ],
          [
            <span key="b">Write source files into <C>uiDir</C> / <C>blocksDir</C>, rewrite kit imports to your alias, and add one <C>@import</C> to your CSS entry.</span>,
            <span key="b2">Write outside those folders: registry paths with <C>../</C>, absolute paths or drive letters are refused.</span>,
          ],
          [
            <span key="c">Record every written file with its sha256 in <C>.vamos-lock.json</C>.</span>,
            <span key="c2">Overwrite files you edited, unless you pass <C>--overwrite</C>; <C>upgrade</C> shows the diff and asks.</span>,
          ],
          [
            <span key="d">Run your package manager (<C>pnpm add</C>, <C>npm install</C>, <C>yarn add</C>, <C>bun add</C>) for the npm dependencies an item declares.</span>,
            <span key="d2">Install anything without telling you. <C>--dry-run</C> prints every file and command first; <C>--no-install</C> skips installs.</span>,
          ],
          [
            <span key="e"><C>brand import &lt;url&gt;</C>: fetch one page, up to 8 stylesheets and logo files, and parse them as text.</span>,
            "Run the page's scripts, send your project files anywhere, or collect telemetry.",
          ],
        ]}
      />
      <Callout tone="warning" title="Two things to know">
        Packages installed from npm can run their own install scripts, exactly as when you install them yourself. And registry
        items are not signed: a custom registry is trusted input, so only point the CLI at registries you control, and review
        changes with <C>--dry-run</C> or <C>npx vamos-ui diff</C>.
      </Callout>

      <H2 id="mcp">MCP server</H2>
      <P>
        <C>@vamos-ui/mcp</C> gives AI agents the registry, the design rules, tokens and a code checker.
      </P>
      <UL>
        <li>
          <strong className="text-fg">Local mode (stdio)</strong> runs on your machine with your user&apos;s permissions. It writes
          nothing unless an agent calls <C>apply_design_system</C> with <C>write: true</C>, and then only inside the{" "}
          <C>projectDir</C> it was given. Your MCP client asks before each tool call according to its own settings.
        </li>
        <li>
          <strong className="text-fg">Remote mode</strong> (<C>--http</C>, and the hosted server at <C>https://mcp.vamos.ist/mcp</C>)
          is stateless and has no sign-in. It cannot see your files: <C>get_brand</C>, <C>apply_design_system</C>,{" "}
          <C>update_design</C>, <C>verify_design</C> with <C>projectDir</C> and URL import are disabled there. The server keeps no session
          state between requests; even so, never send secrets in tool arguments.
        </li>
        <li>
          Self-hosting <C>--http</C>: it binds to <C>127.0.0.1</C> by default and answers any origin (CORS <C>*</C>). Put it behind
          your own reverse proxy and authentication before exposing it on a network.
        </li>
      </UL>

      <H2 id="kit">The component kit</H2>
      <UL>
        <li>The package has no install scripts and collects no telemetry. It makes network requests only through what you configure: the Google Fonts helpers in <C>@vamos-ui/react/fonts</C> when you call them, the media REST adapter, and your own <C>loadItems</C> functions.</li>
        <li>Block editor documents are rendered by <C>@vamos-ui/react/render</C> as React elements, without <C>dangerouslySetInnerHTML</C>.</li>
        <li><strong className="text-fg"><C>Prose html</C> inserts the string as HTML, unchanged.</strong> Only pass HTML you produced or sanitised (for example with DOMPurify on the server); never pass user input directly.</li>
        <li><C>can()</C> on <C>VamosProvider</C> hides navigation items and actions. Hiding is not access control: enforce permissions on the server.</li>
        <li>Dependencies are kept current; security fixes in them are released as patch versions.</li>
      </UL>
    </DocPage>
  );
}
