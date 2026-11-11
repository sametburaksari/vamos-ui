"use client";

import * as React from "react";
import { Check, Flag, MessageSquare, X } from "lucide-react";
import { Avatar, Badge, Button, DiffView, ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { riskLabels, type Clause } from "./contract-data";

export type ClauseFilter = "all" | "decide" | "changed";

const riskTone = { standard: "neutral", negotiated: "info", attention: "warning" } as const;

/** Clause outline (wide screens) + the agreement text with counterparty proposals inline. */
export function ClauseDocument({
  clauses,
  flagged,
  onToggleFlag,
  onAccept,
  onReject,
}: {
  clauses: Clause[];
  flagged: Set<string>;
  onToggleFlag: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const { c, t } = useBlockFormat();
  const [filter, setFilter] = React.useState<ClauseFilter>("all");
  const [active, setActive] = React.useState(clauses[0]?.id ?? "");
  const pending = clauses.filter((x) => x.redline).length;
  const changed = clauses.filter((x) => x.changed).length;

  const visible = clauses.filter((x) => (filter === "all" ? true : filter === "decide" ? x.redline || flagged.has(x.id) : x.changed));

  const jump = (id: string) => {
    setActive(id);
    const el = document.getElementById(`clause-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    el?.focus({ preventScroll: true });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[188px_minmax(0,1fr)]">
      <nav aria-label={c("Clauses", "Maddeler")} className="max-xl:hidden">
        <div className="sticky top-4">
          <p className="mb-2 ps-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{c("Outline", "İçindekiler")}</p>
          <ol className="grid gap-px">
            {clauses.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => jump(x.id)}
                  aria-current={active === x.id ? "location" : undefined}
                  className={cn(
                    "focus-ring flex w-full items-baseline gap-2 rounded-ui-sm px-2.5 py-1.5 text-start text-[13px] transition-colors",
                    active === x.id ? "bg-selected text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
                  )}
                >
                  <span className="w-4 shrink-0 font-mono text-[11px] text-fg-subtle tabular">{x.number}</span>
                  <span className="min-w-0 flex-1 truncate">{t(x.title)}</span>
                  {x.redline ? (
                    <span className="tone-warning size-1.5 shrink-0 self-center rounded-full bg-[var(--tone)]" aria-label={c("Proposal waiting", "Bekleyen öneri")} />
                  ) : flagged.has(x.id) ? (
                    <Flag className="size-3 shrink-0 self-center text-fg-subtle" aria-label={c("Flagged", "İşaretli")} />
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <ToggleGroup size="sm" value={filter} onValueChange={(v) => setFilter(v as ClauseFilter)} aria-label={c("Show clauses", "Maddeleri göster")}>
            <ToggleGroupItem value="all">{c("All", "Tümü")} <span className="text-fg-subtle tabular">{clauses.length}</span></ToggleGroupItem>
            <ToggleGroupItem value="decide">{c("To decide", "Karar bekleyen")} <span className="text-fg-subtle tabular">{pending + [...flagged].filter((id) => !clauses.find((x) => x.id === id)?.redline).length}</span></ToggleGroupItem>
            <ToggleGroupItem value="changed">{c("Changed in v4", "v4’te değişen")} <span className="text-fg-subtle tabular">{changed}</span></ToggleGroupItem>
          </ToggleGroup>
          <p className="text-[12px] text-fg-subtle">{c("Draft text · v4", "Taslak metin · v4")}</p>
        </div>

        <article className="surface rounded-ui-lg">
          {visible.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-fg-muted">{c("Nothing waiting for a decision. Every proposal is settled.", "Karar bekleyen bir şey yok. Tüm öneriler sonuçlandı.")}</p>
          ) : (
            <ol className="divide-y divide-line">
              {visible.map((x) => (
                <li
                  key={x.id}
                  id={`clause-${x.id}`}
                  tabIndex={-1}
                  onFocus={() => setActive(x.id)}
                  className="scroll-mt-4 px-4 py-5 outline-none md:px-7 md:py-6"
                >
                  <header className="flex items-start gap-3">
                    <span className="mt-0.5 font-mono text-[12px] text-fg-subtle tabular">§{x.number}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-display text-[17px] leading-snug text-fg">{t(x.title)}</h3>
                        {x.risk !== "standard" ? <Badge tone={riskTone[x.risk]}>{t(riskLabels[x.risk])}</Badge> : null}
                        {x.changed ? <Badge tone="outline" shape="square">{c("Changed", "Değişti")}</Badge> : null}
                      </div>
                    </div>
                    <div className="-me-1.5 -mt-1 flex shrink-0 items-center">
                      {x.comments > 0 ? (
                        <span className="me-1 inline-flex items-center gap-1 text-[12px] text-fg-subtle tabular" aria-label={c(`${x.comments} comments`, `${x.comments} yorum`)}>
                          <MessageSquare className="size-3.5" aria-hidden />
                          {x.comments}
                        </span>
                      ) : null}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-pressed={flagged.has(x.id)}
                        aria-label={flagged.has(x.id) ? c(`Remove flag from §${x.number}`, `§${x.number} işaretini kaldır`) : c(`Flag §${x.number} for legal`, `§${x.number} maddesini hukuka işaretle`)}
                        onClick={() => onToggleFlag(x.id)}
                        className={cn(flagged.has(x.id) && "text-accent-ink")}
                      >
                        <Flag className={cn(flagged.has(x.id) && "fill-current")} />
                      </Button>
                    </div>
                  </header>

                  <p className="mt-2.5 ps-7 text-[14.5px] leading-[1.7] text-fg-muted [text-wrap:pretty]">{t(x.body)}</p>

                  {x.redline ? (
                    <div className="tone-warning mt-4 ms-7 overflow-hidden rounded-ui border border-[color-mix(in_srgb,var(--tone)_35%,transparent)]">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3.5 py-2.5">
                        <Avatar name={x.redline.by} size="xs" />
                        <p className="min-w-0 flex-1 text-[12.5px] text-fg">
                          <span className="font-medium">{x.redline.by}</span>{" "}
                          <span className="text-fg-muted">{c("proposed a change", "bir değişiklik önerdi")}</span>
                        </p>
                      </div>
                      <DiffView
                        before={t(x.body)}
                        after={t(x.redline.text)}
                        toolbar={false}
                        lineNumbers={false}
                        context={Infinity}
                        beforeLabel={c("Draft", "Taslak")}
                        afterLabel={c("Proposal", "Öneri")}
                        className="rounded-none border-x-0"
                      />
                      <div className="flex flex-wrap items-end justify-between gap-3 px-3.5 py-3">
                        <p className="min-w-0 max-w-prose flex-1 basis-56 text-[12.5px] leading-relaxed text-fg-muted">
                          <span className="text-fg-subtle">{c("Reason: ", "Gerekçe: ")}</span>
                          {t(x.redline.reason)}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => onReject(x.id)}>
                            <X /> {c("Keep draft", "Taslağı koru")}
                          </Button>
                          <Button size="sm" variant="solid" onClick={() => onAccept(x.id)}>
                            <Check /> {c("Accept proposal", "Öneriyi kabul et")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </article>
      </div>
    </div>
  );
}
