"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Component, LayoutTemplate, Search } from "lucide-react";
import {
  cn,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  IconButton,
  KbdGroup,
  useHotkeys,
} from "@vamos-ui/react";
import { docSections, mainNav, site } from "@/lib/site";
import { ThemeControls } from "./theme-controls";
import { VamosLogo } from "./brand";

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("rounded-md focus-ring", className)}>
      <VamosLogo />
    </Link>
  );
}

type SearchEntry = { id: string; title: string; subtitle?: string; href: string; keywords: string[] };
type SearchIndex = { components: SearchEntry[]; blocks: SearchEntry[] };

// Loaded on first use: the entries and blocks modules pull in every live example.
let indexPromise: Promise<SearchIndex> | null = null;
function loadIndex(): Promise<SearchIndex> {
  indexPromise ??= Promise.all([import("@/docs/entries"), import("@/blocks")]).then(([{ entries }, { blocks }]) => ({
    components: [...entries]
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((e) => ({ id: `c:${e.slug}`, title: e.title, subtitle: e.group, href: `/docs/components/${e.slug}`, keywords: [...e.covers, e.group, e.basedOn ?? ""] })),
    blocks: blocks.map((b) => ({ id: `b:${b.name}`, title: b.title, subtitle: b.category, href: `/blocks#${b.name}`, keywords: [b.name, b.category, ...(b.tags ?? [])] })),
  }));
  return indexPromise;
}

/** ⌘K: search docs pages, components and blocks. */
function DocsSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState<SearchIndex | null>(null);
  const [failed, setFailed] = React.useState(false);
  useHotkeys("mod+k", () => setOpen((o) => !o));
  const prefetch = React.useCallback(() => {
    loadIndex().then(setIndex, () => {
      indexPromise = null;
      setFailed(true);
    });
  }, []);
  React.useEffect(() => {
    if (open && !index) prefetch();
  }, [open, index, prefetch]);
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const row = (e: SearchEntry, icon: React.ReactNode) => (
    <CommandItem key={e.id} value={`${e.title} ${e.id}`} keywords={e.keywords} icon={icon} description={e.subtitle} onSelect={() => go(e.href)}>
      {e.title}
    </CommandItem>
  );
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setOpen(true)}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        className="hidden h-8 w-60 items-center gap-2 rounded-ui-sm border border-field-border bg-field ps-2.5 pe-1.5 text-[13px] text-fg-subtle hover:border-field-border-hover focus-ring lg:flex"
      >
        <Search className="size-3.5" aria-hidden />
        <span className="flex-1 text-start">Search documentation…</span>
        <KbdGroup keys="mod+k" size="sm" />
      </button>
      <IconButton size="sm" label="Search documentation" className="lg:hidden" onClick={() => setOpen(true)}>
        <Search />
      </IconButton>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search documentation">
        <CommandInput placeholder="Search docs, components and blocks…" />
        <CommandList>
          {index ? <CommandEmpty /> : failed ? <p className="px-3 py-6 text-center text-sm text-danger">Couldn&apos;t load the search index.</p> : <CommandLoading />}
          <CommandGroup heading="Docs">
            {docSections.map((d) => row({ id: `d:${d.href}`, title: d.label, href: d.href, keywords: [] }, <BookOpen />))}
          </CommandGroup>
          {index ? (
            <>
              <CommandGroup heading="Components">{index.components.map((e) => row(e, <Component />))}</CommandGroup>
              <CommandGroup heading="Blocks">{index.blocks.map((e) => row(e, <LayoutTemplate />))}</CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/docs" ? path === "/docs" || (path.startsWith("/docs/") && !path.startsWith("/docs/components") && !path.startsWith("/docs/changelog")) : path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[color-mix(in_srgb,var(--scene)_78%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-5">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
          {mainNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={cn("rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors focus-ring", isActive(n.href) ? "font-medium text-fg" : "text-fg-muted hover:text-fg")}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <DocsSearch />
        <ThemeControls />
        <IconButton asChild size="sm" label="GitHub">
          <a href={site.github} target="_blank" rel="noreferrer"><GithubMark /></a>
        </IconButton>
      </div>
    </header>
  );
}
