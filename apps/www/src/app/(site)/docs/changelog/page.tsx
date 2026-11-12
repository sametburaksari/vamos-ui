import { Badge } from "@vamos-ui/react";
import { A, C, DocPage, H2, H3, P } from "@/components/docs/prose";
import { readChangelogs } from "@/lib/changelog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Changelog", description: "Release notes for the Vamos UI component kit, CLI and MCP server.", path: "/docs/changelog/" });

const tone: Record<string, "success" | "info" | "warning" | "danger"> = { Added: "success", Changed: "info", Fixed: "warning", Removed: "danger" };

/** `code` and [text](url) inside a changelog line. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) return <C key={i}>{part.slice(1, -1)}</C>;
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) return <A key={i} href={link[2]!}>{link[1]}</A>;
        return part;
      })}
    </>
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
                    <ul className="mt-2 grid list-disc gap-1.5 ps-5 marker:text-fg-subtle">
                      {g.items.map((item) => <li key={item}><Inline text={item} /></li>)}
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
