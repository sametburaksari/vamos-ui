"use client";

import * as React from "react";
import { ArrowRight, BellOff, Cpu, Ellipsis, ExternalLink, Globe, Link2, Smartphone, Star, Webhook } from "lucide-react";
import { Avatar, Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";
import { sourceLabels, topicLabels, type FeedEvent, type FeedTopic } from "./feed-data";

const sourceIcon: Record<FeedEvent["source"], React.ReactNode> = {
  web: <Globe aria-hidden />,
  mobile: <Smartphone aria-hidden />,
  api: <Webhook aria-hidden />,
  system: <Cpu aria-hidden />,
};

/** A small tone per topic, used only for the rail marker so the stream stays calm. */
export const topicTone: Record<FeedTopic, string> = {
  sales: "bg-chart-1",
  orders: "bg-chart-2",
  support: "bg-chart-3",
  finance: "bg-chart-4",
  access: "bg-chart-5",
};

export function actorLabel(id: string, system: string) {
  return id === "system" ? system : person(id).name;
}

export function useWhen() {
  const { c, ago } = useBlockFormat();
  return (iso: string) => (Date.parse(iso) >= NOW_MS ? c("Just now", "Az önce") : ago(iso));
}

interface FeedItemProps {
  event: FeedEvent;
  followed: boolean;
  onFollow: (event: FeedEvent) => void;
  onMute: (actorId: string) => void;
}

/** One line of the stream: time gutter, topic marker, actor sentence, entity, field changes. */
export const FeedItem = React.memo(function FeedItem({ event: e, followed, onFollow, onMute }: FeedItemProps) {
  const { c, t, f } = useBlockFormat();
  const when = useWhen();
  const system = c("System", "Sistem");
  const actor = actorLabel(e.actorId, system);
  const time = f.dateTime(e.at, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Istanbul" });

  return (
    <li
      className={cn(
        "group/item relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 py-3 sm:grid-cols-[3.25rem_1.75rem_minmax(0,1fr)]",
        "border-b border-line last:border-b-0",
      )}
      aria-label={`${actor} ${t(e.summary)}, ${when(e.at)}`}
    >
      <time dateTime={e.at} className="tabular hidden whitespace-nowrap pt-1 text-end text-[12px] text-fg-subtle sm:block">
        {time}
      </time>

      <span className="relative flex justify-center pt-0.5">
        {e.actorId === "system" ? (
          <span role="img" aria-label={system} className="grid size-7 place-items-center rounded-ui-sm bg-selected text-fg-muted [&_svg]:size-3.5">
            <Cpu aria-hidden />
          </span>
        ) : (
          <Avatar name={actor} size="sm" />
        )}
        <span aria-hidden className={cn("absolute -bottom-0.5 -end-0.5 size-2 rounded-full ring-2 ring-[var(--surface)]", topicTone[e.topic])} />
      </span>

      <div className="min-w-0 pe-14">
        <p className="text-[13.5px] leading-snug text-fg-muted">
          <span className="font-medium text-fg">{actor}</span> {t(e.summary)}
          {e.live ? (
            <Badge tone="accent" size="sm" className="ms-2 align-[1px]">
              {c("New", "Yeni")}
            </Badge>
          ) : null}
        </p>

        {e.changes?.length ? (
          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11.5px]">
            {e.changes.slice(0, 2).map((ch) => (
              <span key={ch.field} className="inline-flex min-w-0 max-w-full items-baseline gap-1.5">
                <span className="text-fg-subtle">{ch.field.replace(/_/g, " ")}</span>
                {ch.from !== null ? (
                  <>
                    <del className="truncate text-fg-subtle decoration-fg-subtle/60">{ch.from}</del>
                    <ArrowRight className="size-3 shrink-0 translate-y-0.5 text-fg-subtle" aria-label={c("to", "→")} />
                  </>
                ) : null}
                <ins className="truncate text-fg no-underline">{ch.to ?? "—"}</ins>
              </span>
            ))}
          </p>
        ) : null}

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-fg-subtle">
          <a href={`#/${e.entity.type}/${e.entity.id}`} className="focus-ring rounded-ui-sm font-mono text-[11.5px] text-fg-muted underline-offset-2 hover:text-fg hover:underline">
            {e.entity.label}
          </a>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 [&_svg]:size-3">
            {sourceIcon[e.source]}
            {t(sourceLabels[e.source])}
          </span>
          <span aria-hidden className="max-sm:hidden">·</span>
          <span className="max-sm:hidden">{t(topicLabels[e.topic])}</span>
          <span aria-hidden>·</span>
          <time dateTime={e.at}>{when(e.at)}</time>
        </p>
      </div>

      <div className="absolute end-0 top-2.5 flex items-center gap-0.5">
        <Button
          size="icon-xs"
          variant="ghost"
          aria-pressed={followed}
          aria-label={followed ? c(`Unfollow ${e.entity.label}`, `${e.entity.label} takibini bırak`) : c(`Follow ${e.entity.label}`, `${e.entity.label} takip et`)}
          className={cn(!followed && "opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100")}
          onClick={() => onFollow(e)}
        >
          <Star className={cn(followed && "fill-current text-accent-ink")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-xs" variant="ghost" aria-label={c(`More for ${e.entity.label}`, `${e.entity.label} için diğer`)}>
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" size="sm">
            <DropdownMenuItem icon={<ExternalLink />} onSelect={() => (window.location.hash = `/${e.entity.type}/${e.entity.id}`)}>
              {c(`Open ${e.entity.label}`, `${e.entity.label} aç`)}
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<Link2 />}
              onSelect={() => void navigator.clipboard?.writeText(`${window.location.origin}/activity/${e.id}`).catch(() => {})}
            >
              {c("Copy link to event", "Olay bağlantısını kopyala")}
            </DropdownMenuItem>
            {e.actorId !== "system" ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<BellOff />} onSelect={() => onMute(e.actorId)}>
                  {c(`Hide events by ${actor}`, `${actor} olaylarını gizle`)}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
});
