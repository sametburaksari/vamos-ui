import Link from "next/link";
import { ChevronLeft, ChevronRight, Info, TriangleAlert } from "lucide-react";
import { cn } from "@vamos-cms/ui";
import { highlight } from "@/lib/highlight";
import { CodeFrame } from "./code-frame";

/** Building blocks for hand-written docs pages (no MDX needed). */

export interface TocItem { id: string; title: string; sub?: boolean }

export function DocPage({
  eyebrow, title, description, toc, prev, next, children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  toc?: TocItem[];
  prev?: { href: string; title: string };
  next?: { href: string; title: string };
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_190px]">
      <article className="min-w-0 max-w-[780px] pb-20">
        {eyebrow && <div className="mb-2 text-[12.5px] text-fg-subtle">{eyebrow}</div>}
        <h1 className="font-display text-[length:calc(44px*var(--display-scale))] leading-[1.05]">{title}</h1>
        {description && <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">{description}</p>}
        <div className="mt-8 grid gap-4 text-[14.5px] leading-[1.7] text-fg-muted">{children}</div>
        {(prev || next) && (
          <div className="mt-16 flex justify-between gap-4 border-t border-line pt-6">
            {prev ? <Link href={prev.href} className="group flex items-center gap-2"><ChevronLeft className="size-4 text-fg-subtle" /><span><span className="block text-xs text-fg-subtle">Previous</span><span className="font-medium group-hover:underline">{prev.title}</span></span></Link> : <span />}
            {next ? <Link href={next.href} className="group flex items-center gap-2 text-end"><span><span className="block text-xs text-fg-subtle">Next</span><span className="font-medium group-hover:underline">{next.title}</span></span><ChevronRight className="size-4 text-fg-subtle" /></Link> : <span />}
          </div>
        )}
      </article>
      {toc && toc.length > 0 && (
        <aside className="hidden xl:block">
          <div className="sticky top-20 text-[12.5px]">
            <div className="mb-2 font-semibold">On this page</div>
            <ul className="grid gap-1.5">
              {toc.map((t) => <li key={t.id} className={t.sub ? "ps-3" : ""}><a href={`#${t.id}`} className="text-fg-muted hover:text-fg">{t.title}</a></li>)}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-20 border-b border-line pb-2 text-[21px] font-semibold tracking-[-0.015em] text-fg">
      <a href={`#${id}`}>{children}</a>
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return <h3 id={id} className="mt-6 scroll-mt-20 text-[16px] font-semibold text-fg">{children}</h3>;
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}

export function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded-[5px] bg-selected px-1.5 py-0.5 font-mono text-[12.5px] text-fg">{children}</code>;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return external
    ? <a href={href} target="_blank" rel="noreferrer" className="font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg">{children}</a>
    : <Link href={href} className="font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg">{children}</Link>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="grid list-disc gap-1.5 ps-5 marker:text-fg-subtle">{children}</ul>;
}

export async function Code({ code, lang = "tsx", title }: { code: string; lang?: "tsx" | "bash" | "css"; title?: string }) {
  const html = await highlight(code, lang);
  return <CodeFrame html={html} raw={code.trim()} title={title} collapsible={false} />;
}

export function Callout({ tone = "info", title, children }: { tone?: "info" | "warning"; title?: string; children: React.ReactNode }) {
  const Icon = tone === "warning" ? TriangleAlert : Info;
  return (
    <div className={cn("flex gap-3 rounded-ui border px-4 py-3 text-[14px]", tone === "warning" ? "border-[color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)]" : "border-line bg-surface-2")}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "warning" ? "text-warning" : "text-fg-subtle")} />
      <div>{title && <div className="mb-0.5 font-medium text-fg">{title}</div>}{children}</div>
    </div>
  );
}

/** Numbered steps with a rail. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="relative grid gap-6 border-s border-line ps-7 [counter-reset:step]">{children}</ol>;
}
export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="relative [counter-increment:step] before:absolute before:-start-[42px] before:top-0 before:grid before:size-7 before:place-items-center before:rounded-full before:border before:border-line before:bg-surface before:font-mono before:text-[12px] before:text-fg before:content-[counter(step)]">
      <div className="mb-2 font-semibold text-fg">{title}</div>
      <div className="grid gap-3">{children}</div>
    </li>
  );
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-ui border border-line">
      <table className="w-full text-[13px]">
        <thead className="bg-surface-2 text-[12px] text-fg-muted"><tr>{head.map((h) => <th key={h} className="px-4 py-2.5 text-start font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-line align-top">{r.map((c, j) => <td key={j} className="px-4 py-2.5 text-fg">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
