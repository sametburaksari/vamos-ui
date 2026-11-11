"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Avatar, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger, KbdGroup, Tooltip, cn,
} from "@vamos-ui/react";
import type { Workspace } from "../../_shared/account";
import { me } from "../../_shared/people";
import { useBlockFormat } from "../../_shared/format";
import { kindLabels, navByKind, workspaces, type WorkspaceKind } from "../data";

const kinds: WorkspaceKind[] = ["company", "client", "partner"];

/** Monogram tile; client and partner tiles get a corner mark so the kind reads at a glance. */
function Tile({ ws, size = 40, active }: { ws: Workspace; size?: number; active?: boolean }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "relative grid shrink-0 place-items-center font-mono text-[12px] font-semibold tracking-wide transition-[border-radius,background-color] duration-200",
        ws.kind === "company" ? "bg-accent text-accent-fg" : active ? "bg-fg text-scene" : "bg-nav-active text-nav-fg-strong",
        active ? "rounded-[12px]" : "rounded-[18px]",
      )}
    >
      {ws.initials}
      {ws.kind !== "company" ? (
        <span className={cn("absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2 border-nav", ws.kind === "client" ? "bg-info" : "bg-warning")} />
      ) : null}
    </span>
  );
}

export interface WorkspaceStripProps {
  active: string;
  onSwitch: (id: string) => void;
  className?: string;
}

/** Vertical strip of every workspace. ⌘/Ctrl + 1…5 switches from anywhere. */
export function WorkspaceStrip({ active, onSwitch, className }: WorkspaceStripProps) {
  const { c, t } = useBlockFormat();
  return (
    <nav aria-label={c("Workspaces", "Çalışma alanları")} className={cn("surface-nav flex w-[68px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-e border-nav-line py-3 scrollbar-none", className)}>
      {kinds.map((k, gi) => (
        <React.Fragment key={k}>
          {gi > 0 ? <span aria-hidden className="my-2 h-px w-7 bg-nav-line" /> : null}
          <ul className="grid gap-2" aria-label={t(kindLabels[k])}>
            {workspaces
              .filter((w) => w.kind === k)
              .map((w) => {
                const on = w.id === active;
                const index = workspaces.indexOf(w) + 1;
                return (
                  <li key={w.id} className="relative">
                    {on ? <span aria-hidden className="absolute -start-[14px] top-1.5 bottom-1.5 w-1 rounded-e-full bg-nav-fg-strong" /> : null}
                    <Tooltip content={`${w.name} · ${t(kindLabels[w.kind])}`} side="right">
                      <button
                        type="button"
                        onClick={() => onSwitch(w.id)}
                        aria-current={on ? "true" : undefined}
                        aria-label={`${w.initials} · ${w.name}, ${t(kindLabels[w.kind])}`}
                        aria-keyshortcuts={`Control+${index} Meta+${index}`}
                        className="block rounded-[14px] focus-ring"
                      >
                        <Tile ws={w} active={on} />
                      </button>
                    </Tooltip>
                  </li>
                );
              })}
          </ul>
        </React.Fragment>
      ))}
      <span aria-hidden className="my-2 h-px w-7 bg-nav-line" />
      <Tooltip content={c("Add a client portal", "Müşteri portalı ekle")} side="right">
        <button type="button" aria-label={c("Add a client portal", "Müşteri portalı ekle")} className="grid size-10 place-items-center rounded-[18px] border border-dashed border-nav-line text-nav-fg hover:border-nav-fg hover:text-nav-fg-strong focus-ring">
          <Plus className="size-4" aria-hidden />
        </button>
      </Tooltip>
    </nav>
  );
}

/** Same list as a menu: the top bar uses it on phones and as a labelled switcher. */
export function WorkspaceMenu({ active, onSwitch, className }: WorkspaceStripProps) {
  const { c, t } = useBlockFormat();
  const ws = workspaces.find((w) => w.id === active)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn("flex min-w-0 items-center gap-2 rounded-ui-sm py-1 ps-1 pe-2 text-start hover:bg-hover focus-ring", className)}>
          <span className="surface-nav rounded-[10px] p-0.5">
            <Tile ws={ws} size={28} active />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-semibold text-fg">{ws.name}</span>
            <span className="block truncate text-[11px] text-fg-subtle">{t(ws.plan)}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
          <span className="sr-only">{c(", switch workspace", ", çalışma alanı değiştir")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {kinds.map((k, gi) => (
          <DropdownMenuGroup key={k}>
            {gi > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel>{t(kindLabels[k])}</DropdownMenuLabel>
            {workspaces
              .filter((w) => w.kind === k)
              .map((w) => (
                <DropdownMenuItem key={w.id} onSelect={() => onSwitch(w.id)}>
                  <span className="flex-1 truncate">{w.name}</span>
                  {w.id === active ? <Check aria-hidden className="text-accent-ink" /> : <KbdGroup keys={`mod+${workspaces.indexOf(w) + 1}`} size="sm" variant="ghost" className="ms-auto ps-4" />}
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface ContextNavProps {
  workspace: Workspace;
  page: string;
  onPage: (id: string) => void;
  counts?: Record<string, number>;
  className?: string;
}

/** The second column: the menu of the open workspace. Agency, client and partner workspaces each bring their own. */
export function ContextNav({ workspace: ws, page, onPage, counts, className }: ContextNavProps) {
  const { c, t, f } = useBlockFormat();
  return (
    <aside className={cn("flex w-[232px] shrink-0 flex-col border-e border-line bg-surface", className)}>
      <div className="px-4 pt-5 pb-4">
        <p className="text-[10.5px] font-semibold tracking-[0.14em] text-fg-subtle uppercase">{t(kindLabels[ws.kind])}</p>
        <p className="mt-1 font-display text-[21px] leading-tight text-fg">{ws.name}</p>
        <p className="mt-1 text-[12px] text-fg-muted">
          {t(ws.plan)} · {c(`${ws.members} members`, `${ws.members} üye`)}
        </p>
      </div>
      <nav aria-label={c(`${ws.name} menu`, `${ws.name} menüsü`)} className="min-h-0 flex-1 overflow-y-auto px-2">
        <ul className="grid gap-px">
          {navByKind[ws.kind].map((n) => {
            const Icon = n.icon;
            const on = n.id === page;
            const count = counts?.[n.id] ?? n.count;
            return (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  aria-current={on ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onPage(n.id);
                  }}
                  className={cn("flex h-9 items-center gap-2.5 rounded-ui-sm px-2.5 text-[13px] transition-colors focus-ring", on ? "bg-selected font-medium text-fg" : "text-fg-muted hover:bg-hover hover:text-fg")}
                >
                  <Icon className={cn("size-4 shrink-0", on ? "text-fg" : "opacity-75")} strokeWidth={1.8} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{t(n.label)}</span>
                  {count ? <span className="tabular rounded-full bg-accent px-1.5 text-[10.5px] leading-[18px] font-semibold text-accent-fg">{f.number(count)}</span> : null}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex items-center gap-2.5 border-t border-line p-3">
        <Avatar name={me.name} size="sm" status={me.status} />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[12.5px] font-medium text-fg">{me.name}</span>
          <span className="block truncate text-[11px] text-fg-subtle">{ws.kind === "company" ? c("Owner", "Sahip") : c("Agency admin · guest", "Ajans yöneticisi · misafir")}</span>
        </span>
      </div>
    </aside>
  );
}
