"use client";

import * as React from "react";
import { Bell, Lock, Mail, MessageSquareText, Smartphone, type LucideIcon } from "lucide-react";
import { Button, Checkbox, Tooltip, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { destinations, events, notifyChannels, type Matrix, type NotifyChannel, type NotifyEvent } from "./notify-data";

export const channelIcon: Record<NotifyChannel, LucideIcon> = { "in-app": Bell, email: Mail, push: Smartphone, sms: MessageSquareText };

/** Can this cell be changed by the person? */
export const editable = (e: NotifyEvent, ch: NotifyChannel, verified: Record<NotifyChannel, boolean>) => !e.locked?.includes(ch) && !e.unavailable?.includes(ch) && verified[ch];

/**
 * Events × channels. Column headers carry a tri-state "all" box and the destination; group
 * rows separate areas; a locked cell explains itself. Selecting an event drives the preview.
 */
export function ChannelMatrix({
  matrix,
  setCell,
  setColumn,
  verified,
  onVerify,
  selected,
  onSelect,
  paused,
}: {
  matrix: Matrix;
  setCell: (event: string, ch: NotifyChannel, on: boolean) => void;
  setColumn: (ch: NotifyChannel, on: boolean) => void;
  verified: Record<NotifyChannel, boolean>;
  onVerify: (ch: NotifyChannel) => void;
  selected: string;
  onSelect: (event: string) => void;
  paused: boolean;
}) {
  const { c, t } = useBlockFormat();
  const groups = events.reduce<Array<{ name: string; items: NotifyEvent[] }>>((acc, e) => {
    const name = t(e.group);
    const g = acc.find((x) => x.name === name);
    if (g) g.items.push(e);
    else acc.push({ name, items: [e] });
    return acc;
  }, []);

  return (
    <div className={cn("min-w-0 overflow-x-auto transition-opacity", paused && "opacity-55")}>
      <table className="w-full border-collapse text-[13px] max-sm:[&_tr>:not([colspan]):last-child]:pe-3">
        <caption className="sr-only">{c("Which channels each event uses", "Her olayın kullandığı kanallar")}</caption>
        <thead>
          <tr className="align-bottom">
            <th scope="col" className="px-(--card-p) pb-3 text-start text-xs font-medium text-fg-muted">
              {c("Event", "Olay")}
            </th>
            {notifyChannels.map((ch) => {
              const Icon = channelIcon[ch.key];
              const cells = events.filter((e) => editable(e, ch.key, verified));
              const on = cells.filter((e) => matrix[e.key]?.includes(ch.key)).length;
              const state = cells.length && on === cells.length ? true : on ? "indeterminate" : false;
              const dest = destinations[ch.key];
              return (
                <th key={ch.key} scope="col" className="w-12 px-1 pb-3 text-center align-bottom font-normal sm:w-24 sm:px-2">
                  <span className="flex flex-col items-center gap-1.5">
                    <Icon aria-hidden className="size-4 text-fg-muted" />
                    <span className="text-xs font-medium text-fg max-sm:sr-only">{t(ch.label)}</span>
                    <span className="hidden max-w-[5.5rem] truncate text-[11px] text-fg-subtle lg:block" title={t(dest.to)}>
                      {t(dest.to)}
                    </span>
                    <span className="flex h-7 items-center justify-center">
                    {verified[ch.key] ? (
                      <Checkbox
                        size="sm"
                        aria-label={c(`${t(ch.label)} for every event`, `Her olay için ${t(ch.label)}`)}
                        checked={state}
                        disabled={paused || !cells.length}
                        onCheckedChange={(v) => setColumn(ch.key, v === true)}
                      />
                    ) : (
                      <Button size="xs" variant="soft" onClick={() => onVerify(ch.key)}>
                        {c("Verify", "Doğrula")}
                      </Button>
                    )}
                    </span>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.name}>
            <tr>
              <th scope="colgroup" colSpan={notifyChannels.length + 1} className="border-t border-line bg-selected px-(--card-p) py-1.5 text-start text-[11.5px] font-medium tracking-[0.04em] text-fg-muted">
                {g.name}
              </th>
            </tr>
            {g.items.map((e) => {
              const isSel = e.key === selected;
              return (
                <tr key={e.key} className={cn("border-t border-line transition-colors", isSel ? "bg-selected" : "hover:bg-hover")}>
                  <th scope="row" className="relative p-0 text-start font-normal">
                    {isSel ? <span aria-hidden className="absolute inset-y-0 start-0 w-0.5 bg-accent-ink" /> : null}
                    <button
                      type="button"
                      aria-pressed={isSel}
                      onClick={() => onSelect(e.key)}
                      className="block w-full px-(--card-p) py-2.5 text-start focus-ring"
                    >
                      <span className="block text-[13px] font-medium text-fg">{t(e.label)}</span>
                      <span className={cn("mt-0.5 hidden text-xs text-pretty sm:block", isSel ? "text-fg-muted" : "text-fg-subtle")}>{t(e.hint)}</span>
                    </button>
                  </th>
                  {notifyChannels.map((ch) => {
                    const label = `${t(e.label)}: ${t(ch.label)}`;
                    if (e.unavailable?.includes(ch.key))
                      return (
                        <td key={ch.key} className="px-1 text-center text-fg-subtle sm:px-2">
                          <span aria-hidden>—</span>
                          <span className="sr-only">{c(`${label} not available`, `${label} kullanılamaz`)}</span>
                        </td>
                      );
                    if (e.locked?.includes(ch.key))
                      return (
                        <td key={ch.key} className="px-1 text-center sm:px-2">
                          <Tooltip content={c("Security alerts always go by email.", "Güvenlik uyarıları her zaman e-postayla gider.")}>
                            <button type="button" className="inline-flex size-7 items-center justify-center rounded-ui-sm text-fg-muted focus-ring" aria-label={c(`${label}, always on`, `${label}, her zaman açık`)}>
                              {/* Reads as a checked box that cannot be changed: on, with a lock. */}
                              <span aria-hidden className="inline-flex size-4 items-center justify-center rounded-[4px] bg-accent text-accent-ink opacity-60">
                                <Lock className="size-2.5" strokeWidth={2.75} />
                              </span>
                            </button>
                          </Tooltip>
                        </td>
                      );
                    return (
                      <td key={ch.key} className="px-1 text-center sm:px-2">
                        <Checkbox
                          className="justify-center"
                          aria-label={label}
                          checked={verified[ch.key] && !!matrix[e.key]?.includes(ch.key)}
                          disabled={paused || !verified[ch.key]}
                          onCheckedChange={(v) => setCell(e.key, ch.key, v === true)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}
