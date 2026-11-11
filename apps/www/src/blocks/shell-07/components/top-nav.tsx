"use client";

import * as React from "react";
import { Bell, Check, ChevronDown, Menu, Search, Store } from "lucide-react";
import {
  Avatar, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, IconButton, KbdGroup,
  Sheet, SheetContent, cn,
} from "@vamos-ui/react";
import { me } from "../../_shared/people";
import { useBlockFormat } from "../../_shared/format";
import { storeNav, storefronts } from "../data";

export interface StoreTopNavProps {
  section: string;
  tab: string;
  onNavigate: (section: string, tab?: string) => void;
  store: string;
  onStoreChange: (id: string) => void;
  /** Count badges on sub-tabs, keyed by tab id. */
  counts: Record<string, number>;
}

/**
 * Two stacked bars: the store's sections on top, the active section's sub-tabs below.
 * Below 900px the sections move into a sheet and the sub-tabs scroll sideways.
 */
export function StoreTopNav({ section, tab, onNavigate, store, onStoreChange, counts }: StoreTopNavProps) {
  const { t, c, f } = useBlockFormat();
  const [sheet, setSheet] = React.useState(false);
  const current = storeNav.find((s) => s.id === section)!;
  const sf = storefronts.find((s) => s.id === store)!;
  const tabsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    tabsRef.current?.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [tab]);

  const link = (s: (typeof storeNav)[number], className: string, onClick?: () => void) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      aria-current={s.id === section ? "page" : undefined}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(s.id);
        onClick?.();
      }}
      className={className}
    >
      {t(s.label)}
    </a>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[color-mix(in_srgb,var(--scene)_78%,transparent)] backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-4 md:px-6">
        <IconButton size="sm" label={c("Open menu", "Menüyü aç")} className="min-[900px]:hidden" onClick={() => setSheet(true)}>
          <Menu />
        </IconButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 items-center gap-2 rounded-ui-sm py-1 ps-1 pe-2 text-start hover:bg-hover focus-ring"
            >
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-md bg-fg font-display text-[15px] leading-none text-scene">k</span>
              <span className="min-w-0 leading-tight max-sm:hidden">
                <span className="block truncate text-[13px] font-semibold text-fg">Kiln &amp; Linen</span>
                <span className="block truncate text-[11px] text-fg-subtle">{t(sf.name)}</span>
              </span>
              <span className="sr-only sm:hidden">Kiln &amp; Linen, {t(sf.name)}</span>
              <span className="sr-only">, {c("switch store", "mağaza değiştir")}</span>
              <ChevronDown className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>{c("Sales channels", "Satış kanalları")}</DropdownMenuLabel>
            {storefronts.map((s) => (
              <DropdownMenuItem key={s.id} onSelect={() => onStoreChange(s.id)}>
                <Store aria-hidden />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate">{t(s.name)}</span>
                  <span className="block truncate font-mono text-[11px] text-fg-subtle">{s.domain}</span>
                </span>
                {s.id === store ? <Check aria-hidden className="text-accent-ink" /> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>{c("Add a sales channel…", "Satış kanalı ekle…")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span aria-hidden className="mx-2 h-5 w-px bg-line max-[899px]:hidden" />

        <nav aria-label={c("Store sections", "Mağaza bölümleri")} className="flex min-w-0 items-center gap-0.5 max-[899px]:hidden">
          {storeNav.map((s) =>
            link(
              s,
              cn(
                "relative rounded-ui-sm px-3 py-1.5 text-[13.5px] transition-colors focus-ring",
                s.id === section ? "bg-selected font-medium text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
              ),
            ),
          )}
        </nav>

        <div className="flex-1" />
        <button
          type="button"
          className="flex h-8 items-center gap-2 rounded-full border border-field-border bg-field px-3 text-[13px] text-fg-subtle hover:border-field-border-hover focus-ring max-lg:size-8 max-lg:justify-center max-lg:px-0"
        >
          <Search className="size-3.5" aria-hidden />
          <span className="max-lg:sr-only">{c("Search", "Ara")}</span>
          <KbdGroup keys="mod+k" size="sm" className="max-lg:hidden" />
        </button>
        <IconButton size="sm" label={c("Notifications", "Bildirimler")}>
          <Bell />
        </IconButton>
        <Avatar name={me.name} size="sm" />
      </div>

      {/* Sub-tabs of the active section. */}
      <div ref={tabsRef} className="overflow-x-auto px-4 scrollbar-none md:px-6">
        <nav aria-label={c(`${t(current.label)} views`, `${t(current.label)} görünümleri`)} className="flex w-max items-center gap-5">
          {current.tabs.map((tb) => {
            const on = tb.id === tab;
            const n = counts[tb.id];
            return (
              <a
                key={tb.id}
                href={`#${section}/${tb.id}`}
                aria-current={on ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(section, tb.id);
                }}
                className={cn(
                  "relative flex h-10 items-center gap-1.5 text-[13px] whitespace-nowrap transition-colors focus-ring",
                  on ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {t(tb.label)}
                {n !== undefined ? (
                  <span className={cn("tabular rounded-full px-1.5 text-[11px] leading-[18px]", on ? "bg-accent text-accent-fg" : "bg-selected text-fg-muted")}>{f.number(n)}</span>
                ) : null}
                {on ? <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-fg" /> : null}
              </a>
            );
          })}
        </nav>
      </div>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="start" size="sm" className="max-w-[86vw]">
          <DialogTitle className="px-5 pt-5 font-display text-[22px] text-fg">Kiln &amp; Linen</DialogTitle>
          <nav aria-label={c("Store sections", "Mağaza bölümleri")} className="grid gap-0.5 p-3">
            {storeNav.map((s) =>
              link(
                s,
                cn("rounded-ui-sm px-3 py-2.5 text-[15px] focus-ring", s.id === section ? "bg-selected font-medium text-fg" : "text-fg-muted hover:bg-hover"),
                () => setSheet(false),
              ),
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
