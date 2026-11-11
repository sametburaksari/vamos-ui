"use client";

import * as React from "react";
import { ChevronRight, CircleAlert, Clock3, FolderClosed, Layers, Pin, PinOff, Unlink, X } from "lucide-react";
import { Avatar, IconButton, Progress, Tooltip, cn } from "@vamos-ui/react";
import { me } from "../../_shared/people";
import { useBlockFormat } from "../../_shared/format";
import { folders, railSections, sectionLinks, settingsSection, storage, type RailSection, type SectionId } from "../data";

/* ------------------------------------------------------------------ */
/* Icon rail                                                            */
/* ------------------------------------------------------------------ */

export interface IconRailProps {
  section: SectionId;
  panelOpen: boolean;
  onSelect: (id: SectionId) => void;
  className?: string;
}

/**
 * 60px rail. Each icon opens its flyout panel; pressing the open section again closes it.
 * Tooltips name the icons; the button's `aria-expanded` tells assistive tech the panel's state.
 */
export function IconRail({ section, panelOpen, onSelect, className }: IconRailProps) {
  const { t, c } = useBlockFormat();
  const item = (s: RailSection) => {
    const Icon = s.icon;
    const active = s.id === section;
    return (
      <li key={s.id}>
        <Tooltip content={t(s.label)} side="right">
          <button
            type="button"
            onClick={() => onSelect(s.id)}
            aria-label={s.badge ? `${t(s.label)}, ${s.badge} ${c("new", "yeni")}` : t(s.label)}
            aria-expanded={active && panelOpen}
            aria-controls="shell05-panel"
            aria-current={active ? "true" : undefined}
            className={cn(
              "relative grid size-10 place-items-center rounded-[11px] text-nav-fg transition-colors focus-ring",
              active ? "bg-nav-active text-nav-fg-strong" : "hover:bg-nav-hover hover:text-nav-fg-strong",
            )}
          >
            <Icon className={cn("size-[18px]", active && "text-accent")} strokeWidth={1.8} aria-hidden />
            {s.badge ? <span aria-hidden className="absolute end-1.5 top-1.5 size-[7px] rounded-full bg-accent ring-2 ring-nav" /> : null}
            {active ? <span aria-hidden className="absolute -start-2.5 top-2 bottom-2 w-[3px] rounded-e-full bg-accent" /> : null}
          </button>
        </Tooltip>
      </li>
    );
  };

  return (
    <nav aria-label={c("Sections", "Bölümler")} className={cn("surface-nav flex w-[60px] shrink-0 flex-col items-center gap-1 border-e border-nav-line py-3", className)}>
      <span aria-hidden className="mb-3 grid size-9 place-items-center rounded-[10px] border border-nav-line font-display text-[17px] leading-none text-nav-fg-strong">
        K
      </span>
      <ul className="grid gap-1">{railSections.map(item)}</ul>
      <div className="flex-1" />
      <ul className="grid gap-1">{item(settingsSection)}</ul>
      <span className="mt-2">
        <Avatar name={me.name} size="sm" status="online" />
      </span>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Flyout panel                                                         */
/* ------------------------------------------------------------------ */

export type MediaView = "all" | "recent" | "missing-alt" | "unused" | (string & {});

export interface FlyoutPanelProps {
  section: SectionId;
  pinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
  onClose: () => void;
  /** Media section only. */
  view: MediaView;
  onViewChange: (view: MediaView) => void;
  counts: Record<string, number>;
  /** Hide the pin control (phone sheet). */
  hidePin?: boolean;
  className?: string;
}

export function FlyoutPanel({ section, pinned, onPinnedChange, onClose, view, onViewChange, counts, hidePin, className }: FlyoutPanelProps) {
  const { t, c, f } = useBlockFormat();
  const meta = [...railSections, settingsSection].find((s) => s.id === section)!;
  const [openFolders, setOpenFolders] = React.useState<Record<string, boolean>>({ products: true });

  const row = (id: MediaView, label: string, icon: React.ReactNode, count?: number, tone?: "warning", depth = 0) => {
    const active = view === id;
    return (
      <button
        type="button"
        onClick={() => onViewChange(id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex h-8 w-full items-center gap-2.5 rounded-lg pe-2 text-start text-[13px] transition-colors focus-ring",
          depth ? "ps-9" : "ps-2.5",
          active ? "bg-nav-active font-medium text-nav-fg-strong" : "text-nav-fg hover:bg-nav-hover hover:text-nav-fg-strong",
        )}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {count !== undefined ? (
          <span className={cn("tabular text-[11.5px]", tone === "warning" && count > 0 ? "font-semibold text-warning" : "text-nav-fg/55")}>{f.number(count)}</span>
        ) : null}
      </button>
    );
  };

  return (
    <aside
      id="shell05-panel"
      aria-label={t(meta.label)}
      data-state="open"
      className={cn("surface-nav ui-fade flex w-[272px] shrink-0 flex-col border-e border-nav-line", className)}
    >
      <div className="flex h-14 shrink-0 items-center gap-1 ps-4 pe-2">
        <h2 className="flex-1 truncate font-display text-[19px] leading-none text-nav-fg-strong">{t(meta.label)}</h2>
        {!hidePin && (
          <IconButton
            size="sm"
            variant="ghost"
            className="text-nav-fg hover:text-nav-fg-strong"
            label={pinned ? c("Unpin panel", "Paneli sabitlemeyi kaldır") : c("Pin panel open", "Paneli açık sabitle")}
            aria-pressed={pinned}
            onClick={() => onPinnedChange(!pinned)}
          >
            {pinned ? <PinOff /> : <Pin />}
          </IconButton>
        )}
        <IconButton size="sm" variant="ghost" className="text-nav-fg hover:text-nav-fg-strong" label={c("Close panel", "Paneli kapat")} onClick={onClose}>
          <X />
        </IconButton>
      </div>

      {section === "media" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-none">
            <p className="px-2.5 pt-1 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-nav-fg/50">{c("Library", "Kütüphane")}</p>
            <ul className="grid gap-px">
              <li>{row("all", c("All media", "Tüm medya"), <Layers className="size-4 opacity-80" aria-hidden />, counts.all)}</li>
              {folders.map((fo) => (
                <li key={fo.id}>
                  {fo.children ? (
                    <>
                      <div className="flex items-center">
                        <button
                          type="button"
                          aria-expanded={!!openFolders[fo.id]}
                          aria-label={`${t(fo.name)}: ${openFolders[fo.id] ? c("collapse", "daralt") : c("expand", "genişlet")}`}
                          onClick={() => setOpenFolders((s) => ({ ...s, [fo.id]: !s[fo.id] }))}
                          className="grid size-8 shrink-0 place-items-center rounded-lg text-nav-fg/60 hover:bg-nav-hover hover:text-nav-fg-strong focus-ring"
                        >
                          <ChevronRight className={cn("size-3.5 transition-transform rtl:-scale-x-100", openFolders[fo.id] && "rotate-90 rtl:-rotate-90")} aria-hidden />
                        </button>
                        <div className="min-w-0 flex-1">{row(fo.id, t(fo.name), <FolderClosed className="-ms-1 size-4 opacity-80" aria-hidden />, counts[fo.id])}</div>
                      </div>
                      {openFolders[fo.id] ? (
                        <ul className="grid gap-px">
                          {fo.children.map((ch) => (
                            <li key={ch.id}>{row(ch.id, t(ch.name), null, counts[ch.id], undefined, 1)}</li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    row(fo.id, t(fo.name), <FolderClosed className="size-4 opacity-80" aria-hidden />, counts[fo.id])
                  )}
                </li>
              ))}
            </ul>

            <p className="px-2.5 pt-5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-nav-fg/50">{c("Smart collections", "Akıllı koleksiyonlar")}</p>
            <ul className="grid gap-px">
              <li>{row("recent", c("Added this week", "Bu hafta eklenenler"), <Clock3 className="size-4 opacity-80" aria-hidden />, counts.recent)}</li>
              <li>{row("missing-alt", c("Missing alt text", "Alt metni eksik"), <CircleAlert className="size-4 opacity-80" aria-hidden />, counts["missing-alt"], "warning")}</li>
              <li>{row("unused", c("Not used anywhere", "Hiçbir yerde kullanılmıyor"), <Unlink className="size-4 opacity-80" aria-hidden />, counts.unused)}</li>
            </ul>
          </div>
          <div className="border-t border-nav-line p-4">
            <Progress
              size="xs"
              tone="auto"
              value={storage.usedBytes}
              max={storage.totalBytes}
              label={<span className="text-[12px] text-nav-fg">{c("Storage", "Depolama")}</span>}
              showValue={() => <span className="tabular text-[12px] text-nav-fg/70">{f.bytes(storage.usedBytes)} / {f.bytes(storage.totalBytes)}</span>}
            />
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <ul className="grid gap-px">
            {sectionLinks[section].map((l) => (
              <li key={l.label.en}>
                <span className="flex min-h-8 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-nav-fg">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{t(l.label)}</span>
                    {l.hint ? <span className="block text-[11.5px] text-nav-fg/55">{t(l.hint)}</span> : null}
                  </span>
                  {l.count !== undefined ? <span className="tabular text-[11.5px] text-nav-fg/55">{f.number(l.count)}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          <p className="mx-2.5 mt-4 border-t border-nav-line pt-3 text-[12px] leading-relaxed text-nav-fg/60">
            {c("This preview shows the media library. Open Media in the rail to go back.", "Bu önizleme medya kütüphanesini gösterir. Geri dönmek için şeritten Medya'yı açın.")}
          </p>
        </div>
      )}
    </aside>
  );
}
