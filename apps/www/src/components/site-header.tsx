"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { cn, IconButton } from "@vamos-cms/ui";
import { mainNav, site } from "@/lib/site";
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
        <button className="hidden h-8 w-60 items-center gap-2 rounded-ui-sm border border-field-border bg-field px-2.5 text-[13px] text-fg-subtle hover:border-field-border-hover focus-ring lg:flex">
          <Search className="size-3.5" />
          <span className="flex-1 text-start">Search documentation…</span>
          <kbd className="rounded border border-line px-1 font-mono text-[10.5px]">⌘K</kbd>
        </button>
        <ThemeControls />
        <IconButton asChild size="sm" label="GitHub">
          <a href={site.github} target="_blank" rel="noreferrer"><GithubMark /></a>
        </IconButton>
      </div>
    </header>
  );
}
