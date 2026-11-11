"use client";

import * as React from "react";
import { ArrowUp, Download, Pause, Play, Star } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Skeleton,
  Sparkline,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  toast,
} from "@vamos-ui/react";
import { CountUp, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { people, person } from "../../_shared/people";
import { NOW_MS, TODAY, day } from "../../_shared/time";
import { OLDER_PAGES, firstPage, hourlyCounts, nextLiveEvent, olderPage, topicLabels, type FeedEvent, type FeedTopic } from "./feed-data";
import { FeedItem, topicTone, useWhen } from "./feed-item";

const topics = Object.keys(topicLabels) as FeedTopic[];
type TopicFilter = FeedTopic | "all";

/** Workspace-wide activity: live stream on top, older pages load as you scroll. */
export function ActivityFeed() {
  const { c, t, f } = useBlockFormat();
  const when = useWhen();

  const [events, setEvents] = React.useState<FeedEvent[]>(firstPage);
  const [pending, setPending] = React.useState<FeedEvent[]>([]);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [live, setLive] = React.useState(true);
  const [topic, setTopic] = React.useState<TopicFilter>("all");
  const [onlyFollowed, setOnlyFollowed] = React.useState(false);
  const [followed, setFollowed] = React.useState<Set<string>>(() => new Set(["d-3", "inv-14"]));
  const [muted, setMuted] = React.useState<Set<string>>(() => new Set());
  const [announce, setAnnounce] = React.useState("");

  const done = page >= OLDER_PAGES;

  // Live stream: a new event every few seconds while live and the tab is visible.
  React.useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setPending((p) => [nextLiveEvent(), ...p].slice(0, 40));
    }, 6500);
    return () => window.clearInterval(id);
  }, [live]);

  const showPending = () => {
    if (!pending.length) return;
    setEvents((all) => [...pending, ...all]);
    setAnnounce(c(`${pending.length} new events shown`, `${pending.length} yeni olay gösterildi`));
    setPending([]);
  };

  const loadOlder = React.useCallback(() => {
    if (loading || done) return;
    setLoading(true);
    window.setTimeout(() => {
      setEvents((all) => {
        const oldest = Date.parse(all[all.length - 1]!.at);
        return [...all, ...olderPage(page + 1, oldest)];
      });
      setPage((p) => p + 1);
      setLoading(false);
    }, 650);
  }, [loading, done, page]);

  // Infinite scroll: load the next page when the sentinel comes near the viewport.
  const sentinel = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = sentinel.current;
    if (!el || done) return;
    const io = new IntersectionObserver((entries) => entries.some((x) => x.isIntersecting) && loadOlder(), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadOlder, done]);

  const follow = React.useCallback((e: FeedEvent) => {
    setFollowed((s) => {
      const n = new Set(s);
      if (n.has(e.entity.id)) n.delete(e.entity.id);
      else n.add(e.entity.id);
      return n;
    });
  }, []);

  const mute = React.useCallback(
    (actorId: string) => {
      setMuted((s) => new Set(s).add(actorId));
      const name = person(actorId).name;
      toast(c(`Events by ${name} are hidden`, `${name} olayları gizlendi`), {
        action: {
          label: c("Undo", "Geri al"),
          onClick: () =>
            setMuted((s) => {
              const n = new Set(s);
              n.delete(actorId);
              return n;
            }),
        },
      });
    },
    [c],
  );

  const visible = events.filter((e) => (topic === "all" || e.topic === topic) && (!onlyFollowed || followed.has(e.entity.id)) && !muted.has(e.actorId));

  // Group by calendar day (dates are +03:00, so the first 10 chars are the local day).
  const groups: Array<{ key: string; items: FeedEvent[] }> = [];
  for (const e of visible) {
    const key = e.at.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(e);
    else groups.push({ key, items: [e] });
  }
  const dayTitle = (key: string) =>
    key >= TODAY
      ? c("Today", "Bugün")
      : key === day(-1)
        ? c("Yesterday", "Dün")
        : f.date(key, { weekday: "long", day: "numeric", month: "long" });

  const all = [...pending, ...events];
  const today = all.filter((e) => e.at.slice(0, 10) >= TODAY);
  const counts = topics.map((k) => ({ k, n: today.filter((e) => e.topic === k).length }));
  const maxCount = Math.max(1, ...counts.map((x) => x.n));
  const lastSeen = new Map<string, string>();
  for (const e of all) if (e.actorId !== "system" && !lastSeen.has(e.actorId)) lastSeen.set(e.actorId, e.at);
  const activeNow = people.filter((p) => p.status === "online" && lastSeen.has(p.id)).slice(0, 6);
  const hourly = hourlyCounts(all);

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <PageHeader
        eyebrow={c("Workspace", "Çalışma alanı")}
        title={c("Activity", "Etkinlik")}
        description={c("Everything your team and your automations did, as it happens.", "Ekibinizin ve otomasyonlarınızın yaptığı her şey, anında.")}
        meta={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-[12px] text-fg-muted">
            <span aria-hidden className="relative flex size-2">
              {live ? <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" /> : null}
              <span className={cn("relative size-2 rounded-full", live ? "bg-success" : "bg-fg-subtle")} />
            </span>
            {live ? c("Live", "Canlı") : c("Paused", "Duraklatıldı")}
          </span>
        }
        actions={
          <>
            <Button onClick={() => setLive((v) => !v)} aria-pressed={!live}>
              {live ? <Pause /> : <Play />}
              {live ? c("Pause stream", "Akışı duraklat") : c("Resume stream", "Akışı sürdür")}
            </Button>
            <Button
              onClick={() =>
                toast.success(c("Export started", "Dışa aktarma başladı"), {
                  description: c(`${visible.length} events, CSV. We'll email you the link.`, `${visible.length} olay, CSV. Bağlantıyı e-postayla göndereceğiz.`),
                })
              }
            >
              <Download /> {c("Export", "Dışa aktar")}
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-labelledby="feed-title" className="min-w-0">
          <h2 id="feed-title" className="sr-only">
            {c("Event stream", "Olay akışı")}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <div className="-mx-1 max-w-full overflow-x-auto px-1 py-0.5">
              <ToggleGroup
                type="single"
                size="sm"
                value={topic}
                onValueChange={(v) => setTopic((v || "all") as TopicFilter)}
                aria-label={c("Filter by topic", "Konuya göre süz")}
              >
                <ToggleGroupItem value="all">{c("All", "Tümü")}</ToggleGroupItem>
                {topics.map((k) => (
                  <ToggleGroupItem key={k} value={k} className="whitespace-nowrap">
                    <span aria-hidden className={cn("size-1.5 rounded-full", topicTone[k])} />
                    {t(topicLabels[k])}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Switch size="sm" checked={onlyFollowed} onCheckedChange={setOnlyFollowed} label={c(`Following (${followed.size})`, `Takip edilenler (${followed.size})`)} />
          </div>

          {muted.size ? (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-fg-subtle">
              {c("Hidden:", "Gizlenen:")}
              {[...muted].map((id) => (
                <Badge key={id} tone="outline" size="sm">
                  {person(id).name}
                  <button
                    type="button"
                    className="focus-ring ms-1 rounded-ui-sm text-fg-subtle hover:text-fg"
                    aria-label={c(`Show events by ${person(id).name}`, `${person(id).name} olaylarını göster`)}
                    onClick={() =>
                      setMuted((s) => {
                        const n = new Set(s);
                        n.delete(id);
                        return n;
                      })
                    }
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </p>
          ) : null}

          <div className="sticky top-[4.25rem] z-10 flex h-0 justify-center">
            {pending.length ? (
              <Button variant="primary" size="sm" pill className="ui-pop mt-3 shadow-lg" onClick={showPending}>
                <ArrowUp />
                {c(`${pending.length} new ${pending.length === 1 ? "event" : "events"}`, `${pending.length} yeni olay`)}
              </Button>
            ) : null}
          </div>
          <span role="status" aria-live="polite" className="sr-only">
            {announce}
          </span>

          {groups.length === 0 ? (
            <EmptyState
              kind="no-results"
              size="md"
              className="mt-8"
              title={onlyFollowed ? c("Nothing you follow moved yet", "Takip ettiklerinizde henüz hareket yok") : c("No events for this topic", "Bu konuda olay yok")}
              description={c("Star a deal, invoice or ticket in the stream to follow it here.", "Burada takip etmek için akıştaki bir fırsatı, faturayı ya da talebi yıldızlayın.")}
            />
          ) : (
            groups.map((g, gi) => (
              <section key={g.key} aria-labelledby={`day-${g.key}`} className="mt-5">
                <h3 id={`day-${g.key}`} className="flex items-baseline gap-3 pb-1">
                  <span className="font-display text-[1.125rem] text-fg">{dayTitle(g.key)}</span>
                  <span className="tabular text-[12px] text-fg-subtle">
                    {g.items.length} {c(g.items.length === 1 ? "event" : "events", "olay")}
                  </span>
                </h3>
                {gi === 0 ? (
                  <Stagger asChild effect="fade">
                    <ul className="grid">
                      {g.items.map((e) => (
                        <FeedItem key={e.id} event={e} followed={followed.has(e.entity.id)} onFollow={follow} onMute={mute} />
                      ))}
                    </ul>
                  </Stagger>
                ) : (
                  <ul className="grid">
                    {g.items.map((e) => (
                      <FeedItem key={e.id} event={e} followed={followed.has(e.entity.id)} onFollow={follow} onMute={mute} />
                    ))}
                  </ul>
                )}
              </section>
            ))
          )}

          <div ref={sentinel} className="mt-2" aria-busy={loading}>
            {loading ? (
              <div className="grid gap-4 py-3" aria-label={c("Loading older events", "Eski olaylar yükleniyor")} role="status">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3.25rem_1.75rem_minmax(0,1fr)]">
                    <Skeleton className="hidden h-3 w-10 justify-self-end sm:block" />
                    <Skeleton className="size-7 rounded-full" />
                    <div className="grid gap-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : done ? (
              <p className="flex items-center gap-3 py-6 text-[12px] text-fg-subtle">
                <span aria-hidden className="h-px flex-1 bg-line" />
                {c("Start of the 7-day activity window", "7 günlük etkinlik penceresinin başı")}
                <span aria-hidden className="h-px flex-1 bg-line" />
              </p>
            ) : (
              <div className="flex justify-center py-4">
                <Button size="sm" variant="ghost" onClick={loadOlder}>
                  {c("Load older events", "Eski olayları yükle")}
                </Button>
              </div>
            )}
          </div>
        </section>

        <aside aria-label={c("Activity summary", "Etkinlik özeti")} className="grid grid-cols-[minmax(0,1fr)] content-start gap-6 max-lg:order-first max-lg:grid-cols-2 max-md:grid-cols-1 lg:sticky lg:top-[4.75rem] lg:self-start">
          <div className="surface rounded-ui-lg p-4">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{c("Today so far", "Bugün şu ana kadar")}</p>
            <p className="tabular mt-1 font-display text-[2rem] leading-none text-fg">
              <CountUp value={today.length} />
            </p>
            <p className="mt-1 text-[12px] text-fg-subtle">{c("events since 00:00", "olay, 00:00'dan beri")}</p>
            <Sparkline values={hourly} variant="bars" width="100%" height={36} className="mt-3" label={c("Events per hour, last 12 hours", "Saatlik olay sayısı, son 12 saat")} />
            <div className="mt-1 flex justify-between text-[11px] text-fg-subtle tabular">
              <span>{f.dateTime(NOW_MS - 11 * 3_600_000, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Istanbul" })}</span>
              <span>{c("now", "şimdi")}</span>
            </div>
          </div>

          <div className="surface rounded-ui-lg p-4 max-md:hidden">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{c("By topic, today", "Konuya göre, bugün")}</p>
            <ul className="mt-3 grid gap-2.5">
              {counts.map(({ k, n }) => (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => setTopic(topic === k ? "all" : k)}
                    aria-pressed={topic === k}
                    className={cn("focus-ring grid w-full gap-1 rounded-ui-sm text-start", topic === k ? "text-fg" : "text-fg-muted hover:text-fg")}
                  >
                    <span className="flex items-center justify-between text-[13px]">
                      <span>{t(topicLabels[k])}</span>
                      <span className="tabular text-fg-subtle">{n}</span>
                    </span>
                    <span aria-hidden className="h-1 overflow-hidden rounded-full bg-surface-2">
                      <span className={cn("block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", topicTone[k])} style={{ width: `${(n / maxCount) * 100}%` }} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface rounded-ui-lg p-4 max-lg:hidden">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-fg-subtle">{c("Online now", "Şu an çevrimiçi")}</p>
            <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3">
              {activeNow.map((p) => (
                <li key={p.id} className="flex items-center gap-2.5">
                  <Avatar name={p.name} size="sm" status="online" statusLabel={c("Online", "Çevrimiçi")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-fg">{p.name}</span>
                    <span className="block truncate text-[12px] text-fg-subtle">
                      {t(p.title)} · {when(lastSeen.get(p.id)!)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-[12px] text-fg-subtle">
              <Star aria-hidden className="size-3.5" />
              {c(`You follow ${followed.size} records`, `${followed.size} kaydı takip ediyorsunuz`)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
