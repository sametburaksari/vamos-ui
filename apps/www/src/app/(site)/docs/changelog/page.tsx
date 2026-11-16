import { Badge } from "@vamos-ui/react";
import { A, C, DocPage, H2, H3, P } from "@/components/docs/prose";
import { changeId, readChangelogs, type ChangelogItem } from "@/lib/changelog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Changelog", description: "Release notes for the Vamos UI component kit, the vamos-ui CLI and the MCP server: what was added, changed and fixed in each version.", path: "/docs/changelog/" });

const tone: Record<string, "success" | "info" | "warning" | "danger"> = { Added: "success", Changed: "info", Fixed: "warning", Removed: "danger" };

/** `code`, **bold** and [text](url) inside a changelog line. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) return <C key={i}>{part.slice(1, -1)}</C>;
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i} className="font-medium text-fg">{part.slice(2, -2)}</strong>;
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) return <A key={i} href={link[2]!}>{link[1]}</A>;
        return part;
      })}
    </>
  );
}

type Block = { type: "p"; text: string } | { type: "h"; text: string } | { type: "ul"; items: string[] };

/** The Markdown of one item as paragraphs, small headings and lists. */
function blocks(md: string): Block[] {
  const out: Block[] = [];
  for (const chunk of md.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").filter((l) => l.trim());
    if (!lines.length) continue;
    const heading = /^#{2,4}\s+(.+)$/.exec(lines[0]!.trim());
    if (heading && lines.length === 1) { out.push({ type: "h", text: heading[1]! }); continue; }
    if (lines.length === 1 && /^`[^`]+`$/.test(lines[0]!.trim())) { out.push({ type: "h", text: lines[0]!.trim() }); continue; }
    if (/^\s*[-*]\s+/.test(lines[0]!)) {
      const items: string[] = [];
      for (const l of lines) {
        const m = /^\s*[-*]\s+(.+)$/.exec(l);
        if (m) items.push(m[1]!);
        else if (items.length) items[items.length - 1] += " " + l.trim();
      }
      out.push({ type: "ul", items });
      continue;
    }
    out.push({ type: "p", text: lines.map((l) => l.trim()).join(" ") });
  }
  return out;
}

/** "Site recipes. A recipe describes…" → ["Site recipes.", "A recipe describes…"]; no split for a long first sentence. */
function lead(text: string): [string, string] {
  const m = /^(.{6,95}?[.:])\s+(?=[A-Z`"@(*])/.exec(text);
  return m ? [m[1]!, text.slice(m[0].length)] : ["", text];
}

function BlockView({ block }: { block: Block }) {
  if (block.type === "h") return <div className="mt-1 text-[13px] font-medium text-fg"><Inline text={block.text} /></div>;
  if (block.type === "ul")
    return (
      <ul className="grid list-disc gap-1 ps-5 marker:text-fg-subtle">
        {block.items.map((x, i) => <li key={i}><Inline text={x} /></li>)}
      </ul>
    );
  return <p><Inline text={block.text} /></p>;
}

function Change({ item }: { item: ChangelogItem }) {
  const all = blocks(item.body);
  const first = all[0];
  const [title, rest] = first?.type === "p" ? lead(first.text) : ["", ""];
  const head = first?.type === "p" ? (
    <p>
      {title && <strong className="font-medium text-fg"><Inline text={title} /> </strong>}
      <Inline text={rest} />
    </p>
  ) : first ? <BlockView block={first} /> : null;
  if (item.seeAlso) {
    const href = item.hash ? `#${changeId(item.hash)}` : `#${item.seeAlso.slug}-v${item.seeAlso.version}`;
    return (
      <li>
        {title ? <strong className="font-medium text-fg"><Inline text={title} /></strong> : <Inline text={rest || item.body.split("\n")[0]!} />}{" "}
        <a href={href} className="text-[13px] text-fg-subtle underline underline-offset-2 hover:text-fg">
          Details under {item.seeAlso.label} v{item.seeAlso.version}
        </a>
      </li>
    );
  }
  const more = all.slice(1);
  return (
    <li id={item.hash ? changeId(item.hash) : undefined} className="scroll-mt-24">
      {head}
      {more.length > 0 && (
        <details className="group mt-1.5">
          <summary className="cursor-pointer select-none text-[13px] text-fg-subtle hover:text-fg">
            <span className="group-open:hidden">Show details</span>
            <span className="hidden group-open:inline">Hide details</span>
          </summary>
          <div className="mt-2 grid gap-2.5 border-s border-line ps-4">
            {more.map((b, i) => <BlockView key={i} block={b} />)}
          </div>
        </details>
      )}
    </li>
  );
}

export default function ChangelogPage() {
  const packages = readChangelogs();
  return (
    <DocPage
      eyebrow="Docs"
      title="Changelog"
      description="Notable changes to the component kit, the CLI and the MCP server. Follows Keep a Changelog and semantic versioning; each package has its own CHANGELOG.md in the repository and on npm."
      toc={packages.flatMap((p) => [
        { id: p.slug, title: `${p.label} (${p.name})` },
        ...p.releases.slice(0, 3).map((r) => ({ id: `${p.slug}-v${r.version}`, title: `v${r.version}`, sub: true })),
      ])}
      prev={{ href: "/docs/license", title: "License" }}
    >
      {packages.map((p) => (
        <section key={p.slug}>
          <H2 id={p.slug}>
            {p.label} <span className="font-mono text-[15px] font-normal text-fg-subtle">{p.name}</span>
          </H2>
          {p.releases.map((r) => (
            <div key={r.version} className="mt-8">
              <H3 id={`${p.slug}-v${r.version}`}>
                <span className="flex items-center gap-3">
                  v{r.version}
                  {r.date && <span className="font-mono text-[13px] font-normal text-fg-subtle">{r.date}</span>}
                </span>
              </H3>
              {r.note && <P><Inline text={r.note} /></P>}
              <div className="mt-3 grid gap-5">
                {r.groups.map((g) => (
                  <div key={g.kind}>
                    <Badge tone={tone[g.kind] ?? "outline"} size="md">{g.kind}</Badge>
                    <ul className="mt-2 grid list-disc gap-3 ps-5 marker:text-fg-subtle">
                      {g.items.map((item, i) => <Change key={item.hash ?? i} item={item} />)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </DocPage>
  );
}
