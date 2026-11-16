import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge, Button, TabsContent } from "@vamos-ui/react";
import { AiClientIcon, type AiClientIconId } from "@/components/ai-client-icons";
import { AiClientPicker } from "@/components/ai-client-picker";
import { C, Code, Step, Steps } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Use Vamos UI with your AI",
  description:
    "Connect Claude, ChatGPT, Cursor, VS Code, Codex or any MCP client to the Vamos UI kit in one step. Pick your AI and copy the setup. No sign-in.",
  path: "/ai/",
});

const URL = "https://mcp.vamos.ist/mcp";
const LOCAL = "npx -y @vamos-ui/mcp";
const json = (v: unknown) => JSON.stringify(v, null, 2);
const LOCAL_SERVER = { command: "npx", args: ["-y", "@vamos-ui/mcp"] };

// One-click installs. Cursor: base64 server config; VS Code: URL-encoded server JSON.
const cursorInstall = `cursor://anysphere.cursor-deeplink/mcp/install?name=vamos-ui&config=${encodeURIComponent(Buffer.from(JSON.stringify({ url: URL })).toString("base64"))}`;
const vscodeConfig = encodeURIComponent(JSON.stringify({ name: "vamos-ui", type: "http", url: URL }));
const vscodeInstall = `vscode:mcp/install?${vscodeConfig}`;
const vscodeInsidersInstall = `vscode-insiders:mcp/install?${vscodeConfig}`;

const S = ({ children }: { children: React.ReactNode }) => <strong className="font-medium text-fg">{children}</strong>;

interface ClientSetup {
  id: AiClientIconId;
  label: string;
  /** Which server this setup connects to. */
  server: "Hosted" | "Local";
  summary: React.ReactNode;
  install?: { label: string; href: string; external?: boolean }[];
  steps: { title: string; body: React.ReactNode }[];
  /** A second way, shown under the steps. */
  also?: React.ReactNode;
}

const clients: ClientSetup[] = [
  {
    id: "claude",
    label: "Claude",
    server: "Hosted",
    summary: "claude.ai, Claude Desktop and the mobile apps share one connector list. Add it once on the web.",
    install: [{ label: "Open connector settings", href: "https://claude.ai/settings/connectors", external: true }],
    steps: [
      { title: "Open connector settings", body: <p>In Claude, open <S>Settings → Connectors</S> and choose <S>Add custom connector</S>.</p> },
      {
        title: "Paste the URL",
        body: (
          <>
            <p>Name it <C>Vamos UI</C>, paste the URL and add it. There is no sign-in step.</p>
            <Code lang="bash" code={URL} />
          </>
        ),
      },
      { title: "Turn it on in a chat", body: <p>Enable the connector from the tools menu in the message box, then ask for a screen or a component.</p> },
    ],
    also: <>On Team and Enterprise plans an owner may need to add the connector for the organisation first.</>,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    server: "Hosted",
    summary: "Custom MCP servers are added in developer mode.",
    steps: [
      { title: "Turn on developer mode", body: <p>Open <S>Settings → Apps &amp; Connectors → Advanced settings → Developer mode</S>.</p> },
      {
        title: "Create the connector",
        body: (
          <>
            <p><S>Create</S> a connector with this URL and authentication <S>No authentication</S>.</p>
            <Code lang="bash" code={URL} />
          </>
        ),
      },
      { title: "Use it in a chat", body: <p>Select it from the tools menu in a chat.</p> },
    ],
    also: <>Menu names can differ by plan and app version.</>,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    server: "Hosted",
    summary: "One command in your terminal.",
    steps: [
      { title: "Add the server", body: <Code lang="bash" code={`claude mcp add --transport http vamos-ui ${URL}`} /> },
      { title: "Check it", body: <p>Run <C>/mcp</C> inside Claude Code; <C>vamos-ui</C> should be listed as connected.</p> },
    ],
    also: (
      <>
        For the project tools, run the server locally instead: <C>claude mcp add vamos-ui -- {LOCAL}</C>. Add <C>--scope project</C> to
        share it with your team through <C>.mcp.json</C>.
      </>
    ),
  },
  {
    id: "cursor",
    label: "Cursor",
    server: "Hosted",
    summary: "Install with one click, or add the server to your project's config.",
    install: [{ label: "Add to Cursor", href: cursorInstall }],
    steps: [
      {
        title: "Add the server",
        body: (
          <>
            <p>Use the button above, or put this in <C>.cursor/mcp.json</C> (or <C>~/.cursor/mcp.json</C> for every project):</p>
            <Code lang="json" title=".cursor/mcp.json" code={json({ mcpServers: { "vamos-ui": { url: URL } } })} />
          </>
        ),
      },
      { title: "Check it", body: <p>Open the MCP list in Cursor&apos;s settings and make sure <C>vamos-ui</C> is enabled.</p> },
    ],
    also: <>Local server with project tools: <C>npx vamos-ui mcp add --client cursor</C>.</>,
  },
  {
    id: "vscode",
    label: "VS Code",
    server: "Hosted",
    summary: "For GitHub Copilot in agent mode.",
    install: [
      { label: "Install in VS Code", href: vscodeInstall },
      { label: "Install in VS Code Insiders", href: vscodeInsidersInstall },
    ],
    steps: [
      {
        title: "Add the server",
        body: (
          <>
            <p>Use a button above, or put this in <C>.vscode/mcp.json</C>:</p>
            <Code lang="json" title=".vscode/mcp.json" code={json({ servers: { "vamos-ui": { type: "http", url: URL } } })} />
          </>
        ),
      },
      { title: "Use it in agent mode", body: <p>Open Copilot Chat, switch to <S>Agent</S> and turn on the Vamos UI tools in the tools picker.</p> },
    ],
    also: <>Local server with project tools: <C>npx vamos-ui mcp add --client vscode</C>.</>,
  },
  {
    id: "codex",
    label: "Codex",
    server: "Local",
    summary: "Runs the server on your machine, with the project tools.",
    steps: [
      { title: "Add the server", body: <Code lang="bash" code={`codex mcp add vamos-ui -- ${LOCAL}`} /> },
      {
        title: "Or edit the config",
        body: <Code lang="toml" title="~/.codex/config.toml" code={`[mcp_servers.vamos-ui]\ncommand = "npx"\nargs = ["-y", "@vamos-ui/mcp"]`} />,
      },
    ],
    also: <>Same result: <C>npx vamos-ui mcp add --client codex</C>.</>,
  },
  {
    id: "windsurf",
    label: "Windsurf",
    server: "Local",
    summary: "Runs the server on your machine, with the project tools.",
    steps: [
      { title: "Write the config", body: <Code lang="bash" code="npx vamos-ui mcp add --client windsurf" /> },
      {
        title: "Or edit it yourself",
        body: <Code lang="json" title="~/.codeium/windsurf/mcp_config.json" code={json({ mcpServers: { "vamos-ui": LOCAL_SERVER } })} />,
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    server: "Local",
    summary: "Runs the server on your machine, with the project tools.",
    steps: [
      { title: "Write the config", body: <Code lang="bash" code="npx vamos-ui mcp add --client gemini" /> },
      {
        title: "Or edit it yourself",
        body: (
          <>
            <p><C>.gemini/settings.json</C> in the project, or <C>~/.gemini/settings.json</C> for every project:</p>
            <Code lang="json" title=".gemini/settings.json" code={json({ mcpServers: { "vamos-ui": LOCAL_SERVER } })} />
          </>
        ),
      },
    ],
  },
  {
    id: "zed",
    label: "Zed",
    server: "Local",
    summary: "Runs the server on your machine, with the project tools.",
    steps: [
      {
        title: "Add a context server",
        body: <Code lang="json" title="settings.json" code={json({ context_servers: { "vamos-ui": { command: { path: "npx", args: ["-y", "@vamos-ui/mcp"] } } } })} />,
      },
      { title: "Use it in the agent panel", body: <p>The Vamos UI tools show up in the agent panel once Zed has started the server.</p> },
    ],
  },
  {
    id: "other",
    label: "Any MCP client",
    server: "Hosted",
    summary: "Any client that supports remote MCP servers, or starts a local one.",
    steps: [
      {
        title: "Remote server",
        body: (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 rounded-ui border border-line px-4 py-3 text-[13.5px]">
            <dt className="text-fg-subtle">URL</dt>
            <dd><C>{URL}</C></dd>
            <dt className="text-fg-subtle">Transport</dt>
            <dd className="text-fg">Streamable HTTP, stateless (POST only)</dd>
            <dt className="text-fg-subtle">Sign-in</dt>
            <dd className="text-fg">None, no account or API key</dd>
          </dl>
        ),
      },
      {
        title: "Or a local server",
        body: (
          <>
            <p>Command <C>npx</C>, arguments <C>-y @vamos-ui/mcp</C> (stdio, Node 20 or later):</p>
            <Code lang="bash" code={LOCAL} />
          </>
        ),
      },
    ],
    also: <>MCP does not depend on the model: the tools work with whatever model your client runs, as long as it supports MCP tools.</>,
  },
];

const prompts: [tool: string, prompt: string][] = [
  ["plan_screen", "Plan a store admin dashboard with KPI cards, a revenue chart and the latest orders using Vamos UI."],
  ["verify_code", "Check this component against the Vamos UI rules and fix what it finds."],
  ["audit_site", "Audit https://kestrel-coffee.example before launch: metadata, sitemap, broken links and placeholder content."],
  ["start_project", "Plan a website for Ada Dental, a two-chair clinic: pages, online booking, forms and the legal pages."],
  ["propose_accent", "Our brand colour is #E4572E. Make it a Vamos UI accent and check the contrast."],
  ["search", "Which Vamos UI component should I use to pick a date range? Show me how to use it."],
];

export default function AiPage() {
  return (
    <main id="main" className="w-full px-5 md:px-8 xl:px-12 py-12">
      <div className="max-w-2xl">
        <div className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Use with AI</div>
        <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">Bring the kit to the AI you already use.</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
          The Vamos UI MCP server gives any assistant the components, blocks, screen plans and code checks. Pick your client below:
          setup is one step, with no account and no API key.
        </p>
      </div>

      <section aria-labelledby="setup" className="mt-10 max-w-3xl">
        <h2 id="setup" className="sr-only">Set up your client</h2>
        <AiClientPicker clients={clients.map(({ id, label }) => ({ id, label }))}>
          {clients.map((c) => (
            <TabsContent key={c.id} value={c.id} forceMount className="data-[state=inactive]:hidden">
              <div className="rounded-ui-lg border border-line bg-surface p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="flex items-center gap-2.5 text-[18px] font-semibold text-fg">
                    <AiClientIcon id={c.id} className="size-5" />
                    {c.label}
                  </h3>
                  <Badge size="sm">{c.server === "Hosted" ? "Hosted server" : "Local server"}</Badge>
                </div>
                <p className="mt-1 text-[14px] text-fg-muted">{c.summary}</p>
                {c.install && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.install.map((i) => (
                      <Button key={i.href} asChild size="sm" variant="secondary">
                        <a href={i.href} {...(i.external ? { target: "_blank", rel: "noreferrer" } : {})}>
                          {i.label} <ArrowUpRight />
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
                <div className="mt-6 text-[14px] leading-[1.65] text-fg-muted">
                  <Steps>
                    {c.steps.map((s) => (
                      <Step key={s.title} title={s.title}>{s.body}</Step>
                    ))}
                  </Steps>
                </div>
                {c.also && <p className="mt-6 border-t border-line pt-4 text-[13px] leading-relaxed text-fg-subtle">{c.also}</p>}
              </div>
            </TabsContent>
          ))}
        </AiClientPicker>
      </section>

      <section aria-labelledby="ask" className="mt-16 max-w-3xl">
        <h2 id="ask" className="border-b border-line pb-2 text-[21px] font-semibold tracking-[-0.015em]">What you can ask</h2>
        <ul className="mt-4 divide-y divide-line">
          {prompts.map(([tool, prompt]) => (
            <li key={tool} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
              <span className="text-[14.5px] text-fg">&ldquo;{prompt}&rdquo;</span>
              <code className="font-mono text-[12px] text-fg-subtle">{tool}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="hosted-local" className="mt-16 max-w-3xl">
        <h2 id="hosted-local" className="border-b border-line pb-2 text-[21px] font-semibold tracking-[-0.015em]">Hosted or local</h2>
        <div className="mt-5 grid gap-px overflow-hidden rounded-ui-lg border border-line bg-line sm:grid-cols-2">
          <div className="bg-scene p-5">
            <h3 className="text-[15px] font-semibold">Hosted</h3>
            <p className="mt-1 font-mono text-[12px] text-fg-subtle">{URL}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">
              Nothing to install. Every tool is read-only, and the server cannot see your files: paste the code you want checked into
              the chat. Works in chat apps such as Claude and ChatGPT.
            </p>
          </div>
          <div className="bg-scene p-5">
            <h3 className="text-[15px] font-semibold">Local</h3>
            <p className="mt-1 font-mono text-[12px] text-fg-subtle">{LOCAL}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">
              Runs next to your code. Adds the project tools: read your brand profile, check the whole project and plan updates.
              It writes files only when you ask it to.
            </p>
          </div>
        </div>
        <Link href="/docs/mcp" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent-ink hover:underline">
          Every tool, the hosted limits and self-hosting in the MCP docs <ArrowRight className="size-4" />
        </Link>
        <p className="mt-16 border-t border-line pt-4 text-[12.5px] text-fg-subtle">
          Product names and logos belong to their owners. They are shown only to indicate compatibility; Vamos UI is not
          affiliated with or endorsed by them.
        </p>
      </section>
    </main>
  );
}
