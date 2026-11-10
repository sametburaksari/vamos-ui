import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, FileCode2 } from "lucide-react";
import { Badge } from "@vamos-cms/ui";
import { docs, docsBySlug } from "@/docs/registry";
import { highlight, readUiSource } from "@/lib/highlight";
import { ComponentPreview } from "@/components/docs/component-preview";
import { InstallTabs } from "@/components/docs/install-tabs";
import { CodeFrame } from "@/components/docs/code-frame";

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const d = docsBySlug[(await params).slug];
  return { title: d ? `${d.title} · Vamos UI` : "Component" };
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-14 mb-4 scroll-mt-20 border-b border-line pb-2 text-[20px] font-semibold tracking-[-0.015em]">
      <a href={`#${id}`} className="hover:underline hover:decoration-line hover:underline-offset-4">{children}</a>
    </h2>
  );
}

export default async function ComponentDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = docsBySlug[slug];
  if (!d) notFound();

  const idx = docs.findIndex((x) => x.slug === slug);
  const prev = docs[idx - 1];
  const next = docs[idx + 1];

  const sources = await Promise.all(
    d.source.map(async (file) => {
      const raw = await readUiSource(file);
      return { file: `packages/ui/src/${file}`, raw, html: await highlight(raw) };
    }),
  );
  const usageHtml = await highlight(d.usage);
  const deps = ["radix-ui", "class-variance-authority", "clsx", "tailwind-merge", "lucide-react"];

  const toc = [
    { id: "installation", t: "Installation" },
    { id: "usage", t: "Usage" },
    { id: "examples", t: "Examples" },
    ...d.examples.map((e) => ({ id: e.id, t: e.title, sub: true })),
    { id: "api", t: "API" },
  ];

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_180px]">
      <article className="min-w-0 max-w-[820px] pb-20">
        <div className="mb-2 flex items-center gap-2 text-[12.5px] text-fg-subtle">
          <Link href="/docs/components" className="hover:text-fg">Components</Link>
          <ChevronRight className="size-3" />
          <span>{d.group}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-[length:calc(44px*var(--display-scale))] leading-[1.05]">{d.title}</h1>
          <div className="flex gap-1 pt-2">
            {prev && <Link href={`/docs/components/${prev.slug}`} aria-label={`Previous: ${prev.title}`} className="grid size-8 place-items-center rounded-ui-sm border border-field-border hover:bg-hover"><ChevronLeft className="size-4" /></Link>}
            {next && <Link href={`/docs/components/${next.slug}`} aria-label={`Next: ${next.title}`} className="grid size-8 place-items-center rounded-ui-sm border border-field-border hover:bg-hover"><ChevronRight className="size-4" /></Link>}
          </div>
        </div>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">{d.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {d.basedOn && <Badge tone="outline" size="md">{d.basedOn}</Badge>}
          <Badge tone="outline" size="md"><FileCode2 /> {d.source.join(", ")}</Badge>
          <Badge tone="accent" size="md">theme · material · accent · density · font</Badge>
        </div>

        <div className="mt-8"><ComponentPreview example={d.demo} /></div>

        <H2 id="installation">Installation</H2>
        <InstallTabs slug={d.slug} deps={deps} sources={sources} />

        <H2 id="usage">Usage</H2>
        <CodeFrame html={usageHtml} raw={d.usage} collapsible={false} />

        {d.notes?.map((n) => <p key={n} className="mt-4 text-[14px] text-fg-muted">{n}</p>)}

        <H2 id="examples">Examples</H2>
        <div className="grid gap-12">
          {d.examples.map((e) => (
            <section key={e.id} id={e.id} className="scroll-mt-20">
              <h3 className="mb-1 text-[16px] font-semibold"><a href={`#${e.id}`}>{e.title}</a></h3>
              {e.description && <p className="mb-3 text-[13.5px] text-fg-muted">{e.description}</p>}
              <ComponentPreview example={e} />
            </section>
          ))}
        </div>

        <H2 id="api">API</H2>
        <div className="grid gap-8">
          {d.api.map((a) => (
            <div key={a.name}>
              <h3 className="mb-3 font-mono text-[14px] font-semibold">{a.name}</h3>
              <div className="overflow-x-auto rounded-ui border border-line">
                <table className="w-full text-start text-[13px]">
                  <thead className="bg-surface-2 text-[12px] text-fg-muted">
                    <tr><th className="px-4 py-2.5 text-start font-medium">Prop</th><th className="px-4 py-2.5 text-start font-medium">Type</th><th className="px-4 py-2.5 text-start font-medium">Default</th></tr>
                  </thead>
                  <tbody>
                    {a.props.map((p) => (
                      <tr key={p.name} className="border-t border-line align-top">
                        <td className="px-4 py-3"><code className="font-mono text-[12.5px] font-medium text-accent-ink">{p.name}</code><div className="mt-1 text-[12.5px] text-fg-muted">{p.description}</div></td>
                        <td className="px-4 py-3"><code className="font-mono text-[12px] text-fg-muted">{p.type}</code></td>
                        <td className="px-4 py-3"><code className="font-mono text-[12px]">{p.default ?? "—"}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-between gap-4 border-t border-line pt-6">
          {prev ? <Link href={`/docs/components/${prev.slug}`} className="group"><div className="text-xs text-fg-subtle">Previous</div><div className="font-medium group-hover:underline">{prev.title}</div></Link> : <span />}
          {next ? <Link href={`/docs/components/${next.slug}`} className="group text-end"><div className="text-xs text-fg-subtle">Next</div><div className="font-medium group-hover:underline">{next.title}</div></Link> : <span />}
        </div>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-20 text-[12.5px]">
          <div className="mb-2 font-semibold">On this page</div>
          <ul className="grid gap-1.5">
            {toc.map((t) => (
              <li key={t.id} className={"sub" in t ? "ps-3" : ""}><a href={`#${t.id}`} className="text-fg-muted hover:text-fg">{t.t}</a></li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
