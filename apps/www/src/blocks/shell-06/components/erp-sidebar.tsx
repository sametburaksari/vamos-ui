"use client";

import * as React from "react";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Search } from "lucide-react";
import { Avatar, IconButton, Input, Kbd, cn } from "@vamos-ui/react";
import { me } from "../../_shared/people";
import { useBlockFormat } from "../../_shared/format";
import { erpNav, pinnedItems } from "../data";

export interface ErpSidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  className?: string;
  /** Focus the filter on "/" (desktop only, so the phone sheet doesn't steal it). */
  shortcut?: boolean;
}

/**
 * Two-level ERP sidebar: module sections that collapse, each with its screens underneath.
 * The filter finds a screen by name across every module and opens the sections that match.
 */
export function ErpSidebar({ active, onNavigate, className, shortcut }: ErpSidebarProps) {
  const { t, c, f } = useBlockFormat();
  const owner = erpNav.find((s) => s.items.some((i) => i.id === active))?.id;
  const [open, setOpen] = React.useState<Record<string, boolean>>(() => ({ inventory: true, purchasing: true }));
  const [query, setQuery] = React.useState("");
  const filterRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key !== "/" || el.closest("input, textarea, [contenteditable=true]")) return;
      e.preventDefault();
      filterRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const q = query.trim().toLocaleLowerCase();
  const sections = erpNav
    .map((s) => ({ ...s, items: q && !t(s.label).toLocaleLowerCase().includes(q) ? s.items.filter((i) => t(i.label).toLocaleLowerCase().includes(q)) : s.items }))
    .filter((s) => s.items.length > 0);
  const allOpen = erpNav.every((s) => open[s.id]);

  return (
    <aside className={cn("surface-nav flex h-full w-[264px] shrink-0 flex-col border-e border-nav-line text-nav-fg", className)}>
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-nav-line px-4">
        <span aria-hidden className="grid size-7 place-items-center rounded-md bg-accent font-mono text-[11px] font-bold text-accent-fg">KL</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-nav-fg-strong">Kiln &amp; Linen</span>
          <span className="block truncate font-mono text-[10.5px] tracking-wide text-nav-fg/55">ERP · FY2026 · TRY</span>
        </span>
      </div>

      <div className="flex items-center gap-1 px-3 pt-3 pb-2">
        <Input
          ref={filterRef}
          size="sm"
          variant="nav"
          className="min-w-0 flex-1"
          leading={<Search aria-hidden />}
          trailing={shortcut && !query ? <Kbd>/</Kbd> : undefined}
          placeholder={c("Jump to screen", "Ekrana git")}
          aria-label={c("Filter menu", "Menüyü filtrele")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          clearable
          onClear={() => setQuery("")}
        />
        <IconButton
          size="sm"
          className="text-nav-fg hover:bg-nav-hover hover:text-nav-fg-strong"
          label={allOpen ? c("Collapse all sections", "Tüm bölümleri daralt") : c("Expand all sections", "Tüm bölümleri genişlet")}
          onClick={() => setOpen(Object.fromEntries(erpNav.map((s) => [s.id, !allOpen])))}
        >
          {allOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
        </IconButton>
      </div>

      <nav aria-label={c("Modules", "Modüller")} className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 scrollbar-none">
        {sections.length === 0 ? (
          <p className="px-3 py-6 text-[12.5px] text-nav-fg/60">{c(`No screen called “${query}”.`, `“${query}” adında bir ekran yok.`)}</p>
        ) : null}
        <ul className="grid gap-0.5">
          {sections.map((s) => {
            const expanded = !!q || !!open[s.id];
            const Icon = s.icon;
            const alerts = s.items.filter((i) => i.alert).reduce((n, i) => n + (i.count ?? 0), 0);
            const listId = `erp-sec-${s.id}`;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                  disabled={!!q}
                  className={cn(
                    "group flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-start text-[13px] transition-colors focus-ring disabled:cursor-default",
                    owner === s.id ? "text-nav-fg-strong" : "hover:bg-nav-hover hover:text-nav-fg-strong",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", owner === s.id ? "text-accent" : "opacity-75")} strokeWidth={1.8} aria-hidden />
                  <span className="min-w-0 flex-1 truncate font-medium">{t(s.label)}</span>
                  {!expanded && alerts > 0 ? (
                    <span className="tabular rounded-full bg-[color-mix(in_srgb,var(--warning)_22%,transparent)] px-1.5 text-[10.5px] leading-[18px] font-semibold text-nav-fg-strong">
                      {f.number(alerts)}
                      <span className="sr-only"> {c("need attention", "dikkat gerektiriyor")}</span>
                    </span>
                  ) : null}
                  <ChevronDown aria-hidden className={cn("size-3.5 shrink-0 opacity-50 transition-transform", !expanded && "-rotate-90 rtl:rotate-90")} />
                </button>
                {expanded ? (
                  <ul id={listId} data-state="open" className="ui-fade relative ms-[19px] mb-1.5 grid gap-px border-s border-nav-line ps-2">
                    {s.items.map((i) => {
                      const current = i.id === active;
                      return (
                        <li key={i.id}>
                          <a
                            href={`#${i.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(i.id);
                            }}
                            aria-current={current ? "page" : undefined}
                            className={cn(
                              "relative flex h-8 items-center gap-2 rounded-md px-2.5 text-[12.5px] transition-colors focus-ring",
                              current ? "bg-nav-active font-medium text-nav-fg-strong" : "hover:bg-nav-hover hover:text-nav-fg-strong",
                            )}
                          >
                            {current ? <span aria-hidden className="absolute -start-[9px] top-1.5 bottom-1.5 w-[2px] rounded-full bg-accent" /> : null}
                            <span className="min-w-0 flex-1 truncate">{t(i.label)}</span>
                            {i.count !== undefined ? (
                              <span className={cn("tabular font-mono text-[11px]", i.alert ? "font-semibold text-warning" : "text-nav-fg/50")}>{f.number(i.count)}</span>
                            ) : null}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-nav-line p-2">
        {pinnedItems.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.id}
              href={`#${p.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(p.id);
              }}
              aria-current={active === p.id ? "page" : undefined}
              className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] hover:bg-nav-hover hover:text-nav-fg-strong focus-ring"
            >
              <Icon className="size-4 opacity-75" aria-hidden /> {t(p.label)}
            </a>
          );
        })}
        <div className="mt-1 flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <Avatar name={me.name} size="sm" status={me.status} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[12.5px] font-medium text-nav-fg-strong">{me.name}</span>
            <span className="block truncate text-[11px] text-nav-fg/55">{t(me.title)}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
