import { A, C, Callout, Code, DocPage, H2, H3, P, Step, Steps, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MCP server",
  description:
    "Connect Claude, ChatGPT, Claude Code, Cursor or VS Code to the Vamos UI MCP server at https://mcp.vamos.ist/mcp: 12 read-only tools for components, blocks, screen plans, theming, code checks and brand accents.",
  path: "/docs/mcp/",
});

const URL = "https://mcp.vamos.ist/mcp";
const ISSUES = "https://github.com/sametburaksari/vamos-ui/issues";
const README = "https://github.com/sametburaksari/vamos-ui/tree/main/packages/mcp#setup";

const tools: [name: string, title: string, what: string][] = [
  ["get_rules", "Design rules", "The rules every Vamos UI screen follows: tokens only, accent use, density, kit components over hand-rolled markup, accessibility. Called once at the start of a UI task."],
  ["get_theming", "Theming guide", "The five theme axes (dark, material, accent, density, font), the semantic Tailwind classes and, optionally, the full CSS token table."],
  ["list_items", "List registry items", "Browses components, blocks, lib and style items by docs group, block category or tag."],
  ["search", "Search components and blocks", "Ranked search over names, descriptions, tags and usage guidance, in English or Turkish."],
  ["get_item", "Get a component or item", "Usage snippet, props, examples, when to use or avoid it, dependencies and file list of one item; source on request."],
  ["get_block", "Get a block (whole screen)", "Full source of a block such as dashboard-05 or login-02, the kit components it uses and how to adapt it."],
  ["plan_screen", "Plan a screen", "Turns a screen description into a plan: the block to start from, alternatives, extra components with reasons, the install command and a checklist."],
  ["verify_code", "Verify UI code", "Lints one file against the kit rules: raw colours, dark: variants, hard-coded fonts, missing alt text, click handlers on non-interactive elements, hand-rolled overlays."],
  ["install_command", "Install command", "Validates item names and returns the exact npx vamos-ui add … command."],
  ["import_design_system", "Import a design system from a website", "Reads page HTML (and optional CSS) and drafts a vamos.brand.json: accent, fonts, logo candidates, with the evidence for each value. Writes nothing."],
  ["propose_accent", "Propose a brand accent", "Turns one brand colour into the four accent variables (OKLCH) and checks WCAG contrast for each text pair."],
  ["verify_design", "Verify the design system", "Lints a file against the kit rules and the brand. On the hosted server it takes code + filename; project-wide checks need the local server."],
];

export default function McpPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="MCP server"
      description="Give Claude, ChatGPT and coding agents the Vamos UI kit: components, blocks, screen plans, theming, code checks and brand accents, over the Model Context Protocol."
      toc={[
        { id: "overview", title: "Overview" },
        { id: "claude", title: "Claude" },
        { id: "chatgpt", title: "ChatGPT" },
        { id: "editors", title: "Claude Code, Cursor, VS Code" },
        { id: "tools", title: "Tools" },
        { id: "prompts", title: "Example prompts" },
        { id: "limits", title: "Hosted server limits" },
        { id: "self-host", title: "Run your own" },
        { id: "privacy", title: "Privacy" },
        { id: "support", title: "Support" },
      ]}
      prev={{ href: "/docs/cli", title: "CLI & registry" }}
      next={{ href: "/docs/publish-a-registry", title: "Publish a registry" }}
    >
      <H2 id="overview">Overview</H2>
      <P>
        The Vamos UI MCP server lets an AI assistant work with the kit the way its docs describe it: find the right component or
        block, read its real API, plan a screen, give you the install command and check the code it writes against the kit&apos;s
        rules. It reads the public registry at <C>https://ui.vamos.ist/r</C>, which currently lists 150+ components and 150+ blocks
        (dashboards, lists, detail pages, settings, sign-in screens and 59 website pages).
      </P>
      <Table
        head={["Setting", "Value"]}
        rows={[
          ["Hosted URL", <C key="u">{URL}</C>],
          ["Transport", "Streamable HTTP, stateless (POST only)"],
          ["Sign-in", "None — no account or API key"],
          ["Tools", "12, all read-only"],
          ["Also runs locally", <span key="l"><C>npx -y @vamos-ui/mcp</C> (stdio), with three extra project tools</span>],
        ]}
      />

      <H2 id="claude">Claude (claude.ai, Desktop, mobile)</H2>
      <Steps>
        <Step title="Open connector settings">
          <P>In Claude, open <strong className="text-fg">Settings → Connectors</strong> and choose <strong className="text-fg">Add custom connector</strong>.</P>
        </Step>
        <Step title="Paste the URL">
          <P>Name it <C>Vamos UI</C>, paste <C>{URL}</C> and add it. There is no sign-in step.</P>
        </Step>
        <Step title="Use it in a chat">
          <P>Enable the connector for the conversation (the tools menu in the message box) and ask for a screen or a component. Connectors added on the web are available in the Desktop and mobile apps too.</P>
        </Step>
      </Steps>
      <P>
        On Team and Enterprise plans an owner may need to add the connector for the organisation first.
      </P>

      <H2 id="chatgpt">ChatGPT</H2>
      <P>
        Custom MCP servers are added in developer mode: <strong className="text-fg">Settings → Apps &amp; Connectors → Advanced settings → Developer mode</strong>,
        then <strong className="text-fg">Create</strong> a connector with the URL <C>{URL}</C> and authentication <strong className="text-fg">No authentication</strong>.
        Select it from the tools menu in a chat. Menu names can differ by plan and app version.
      </P>

      <H2 id="editors">Claude Code, Cursor, VS Code and other editors</H2>
      <P>One command writes the config for the client your project uses and runs the server locally, with full project access:</P>
      <Code lang="bash" code={`npx vamos-ui mcp add                       # detect the clients this project uses
npx vamos-ui mcp add --client claude       # or: cursor, vscode, windsurf, codex, gemini
npx vamos-ui mcp add --client claude --print   # show the config, write nothing`} />
      <H3>Use the hosted server instead</H3>
      <Code lang="bash" code={`claude mcp add --transport http vamos-ui ${URL}`} title="Claude Code" />
      <Code lang="tsx" code={`// .cursor/mcp.json
{
  "mcpServers": {
    "vamos-ui": { "url": "${URL}" }
  }
}`} title="Cursor" />
      <Code lang="tsx" code={`// .vscode/mcp.json
{
  "servers": {
    "vamos-ui": { "type": "http", "url": "${URL}" }
  }
}`} title="VS Code" />
      <P>
        Config for Claude Desktop (local), Codex, Windsurf, Gemini CLI, Zed and others is in the{" "}
        <A href={README}>packages/mcp README</A>.
      </P>

      <H2 id="tools">Tools</H2>
      <P>
        Every tool is marked read-only (<C>readOnlyHint: true</C>): none of them changes anything on your machine, in an account
        or on the server.
      </P>
      <div className="hidden sm:block">
        <Table
          head={["Tool", "Title", "What it does", "Read-only"]}
          rows={tools.map(([name, title, what]) => [<C key={name}>{name}</C>, title, what, "Yes"])}
        />
      </div>
      <ul className="grid divide-y divide-line rounded-ui border border-line sm:hidden">
        {tools.map(([name, title, what]) => (
          <li key={name} className="grid gap-1 px-4 py-3 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <C>{name}</C>
              <span className="text-fg">{title}</span>
              <span className="text-[12px] text-fg-subtle">· read-only</span>
            </div>
            <p className="text-fg-muted">{what}</p>
          </li>
        ))}
      </ul>
      <P>
        The local server adds three tools that need your project folder: <C>get_brand</C> (reads <C>vamos.brand.json</C>),{" "}
        <C>apply_design_system</C> (writes only with <C>write: true</C>, only inside <C>projectDir</C>) and <C>update_design</C>{" "}
        (reports what <C>npx vamos-ui update</C> would change). It also exposes the prompts <C>build-screen</C> and{" "}
        <C>review-ui</C>, which the hosted server offers as well.
      </P>

      <H2 id="prompts">Example prompts</H2>
      <UL>
        <li>&ldquo;Plan a store admin dashboard with KPI cards, a revenue chart and the latest orders using Vamos UI.&rdquo;</li>
        <li>&ldquo;Which Vamos UI component should I use to pick a date range? Show me how to use it.&rdquo;</li>
        <li>&ldquo;Check this component against the Vamos UI rules and fix what it finds.&rdquo; (paste the code)</li>
        <li>&ldquo;Our brand colour is #E4572E. Make it a Vamos UI accent and check the contrast.&rdquo;</li>
        <li>&ldquo;Give me the install command for the data table and the login-02 block.&rdquo;</li>
        <li>&ldquo;Ürün listesi için hangi Vamos UI blokunu kullanmalıyım?&rdquo; (search understands Turkish)</li>
      </UL>

      <H2 id="limits">Hosted server limits</H2>
      <UL>
        <li>
          <strong className="text-fg">No access to your files.</strong> The hosted server only sees what your AI client puts in a
          tool call. Project tools (<C>get_brand</C>, <C>apply_design_system</C>, <C>update_design</C>) are not offered, and{" "}
          <C>verify_design</C> with <C>projectDir</C> returns an error; pass one file as <C>code</C> + <C>filename</C> instead.
        </li>
        <li>
          <strong className="text-fg">No URL fetching.</strong> <C>import_design_system</C> does not fetch <C>url</C> on the hosted
          server: paste the page HTML (and CSS) instead, or use the local server or <C>npx vamos-ui brand import &lt;url&gt;</C>.
        </li>
        <li>
          <strong className="text-fg">It does not install or run code.</strong> It returns source, plans and the{" "}
          <C>npx vamos-ui add</C> command; you or your coding agent run it.
        </li>
        <li><strong className="text-fg">Best effort.</strong> The hosted server is free and has no uptime guarantee. See the <A href="/terms">terms</A>.</li>
      </UL>

      <H2 id="self-host">Run your own</H2>
      <Code lang="bash" code={`npx -y @vamos-ui/mcp --http --port 3333          # Streamable HTTP at http://127.0.0.1:3333/mcp
npx -y @vamos-ui/mcp --registry https://ui.example.com/r   # point at your own registry`} />
      <P>
        It binds to <C>127.0.0.1</C> by default and has no authentication: put it behind your own reverse proxy and sign-in before
        exposing it. More in <A href="/docs/security#mcp">Security</A>.
      </P>

      <H2 id="privacy">Privacy</H2>
      <P>
        The hosted server has no accounts and keeps no state. It processes tool arguments in memory to answer and does not store
        them; the web server logs IP address, time and URL for 30 days. Details in the <A href="/privacy">privacy policy</A>.
        Don&apos;t send secrets or personal data in code you ask it to check.
      </P>

      <H2 id="support">Support</H2>
      <UL>
        <li>Questions, bugs and feature requests: <A href={ISSUES}>GitHub issues</A>.</li>
        <li>Security problems: report privately, as described in <A href="/docs/security">Security</A>.</li>
      </UL>
      <Callout title="Status check">
        <C>https://mcp.vamos.ist/health</C> returns the server name, version and registry location as JSON.
      </Callout>
    </DocPage>
  );
}
