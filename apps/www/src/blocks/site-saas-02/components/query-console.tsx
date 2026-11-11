"use client";

import * as React from "react";
import { Badge, Button, Delta, Sparkline, Stat, Switch, Tabs, TabsContent, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem, useFormat } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { AreaChart, type ChartConfig } from "@vamos-ui/react/charts";
import { Check, Copy, Database, Play } from "lucide-react";
import { copyFor, demoRunStats, demoSeries, demoSql, metrics, ranges, segments, type MetricId, type RangeId, type SegmentId, type SiteLocale } from "./content";

const SQL_KEYWORDS = /\b(select|from|left|join|on|where|and|group|by|order|as|date_trunc|interval|date|sum|count|distinct|coalesce|nullif|avg|false|true)\b/g;

/** Tiny highlighter: keywords in accent ink, strings bright, comments muted. Text stays selectable. */
function SqlLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("--")) return <span className="text-fg-subtle">{line}</span>;
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = new RegExp(`${SQL_KEYWORDS.source}|('[^']*')`, "g");
  for (const m of line.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(line.slice(last, i));
    parts.push(
      m[2] ? (
        <span key={i} className="text-fg">
          {m[0]}
        </span>
      ) : (
        <span key={i} className="text-accent-ink">
          {m[0]}
        </span>
      ),
    );
    last = i + m[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return <>{parts}</>;
}

/**
 * The signature of the site: a live query console. Pick a metric, a channel and a range; the
 * chart, the headline numbers and the SQL the metric layer compiles all change together.
 * Presets jump to the questions customers actually ask. Every number is seeded demo data.
 */
export function QueryConsole() {
  const { locale } = useSiteShell();
  const { t } = copyFor(locale as SiteLocale);
  const f = useFormat();
  const [metricId, setMetricId] = React.useState<MetricId>("revenue");
  const [segment, setSegment] = React.useState<SegmentId>("all");
  const [range, setRange] = React.useState<RangeId>("26");
  const [compare, setCompare] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const first = React.useRef(true);

  const metric = metrics.find((m) => m.id === metricId)!;
  const data = React.useMemo(() => demoSeries(metricId, segment, range), [metricId, segment, range]);
  const sql = React.useMemo(() => demoSql(metric, segment, range), [metric, segment, range]);
  const run = React.useMemo(() => demoRunStats(metricId, segment, range), [metricId, segment, range]);

  // A short "running" state on each change: the chart keeps its old data dimmed, like a real re-query.
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRunning(true);
    const id = window.setTimeout(() => setRunning(false), 380);
    return () => window.clearTimeout(id);
  }, [metricId, segment, range]);

  const last = data[data.length - 1]!;
  const prev = data[data.length - 2]!;
  const delta = prev.value ? (last.value - prev.value) / prev.value : null;
  const yoy = last.lastYear ? (last.value - last.lastYear) / last.lastYear : null;
  const high = Math.max(...data.map((d) => d.value));
  const low = Math.min(...data.map((d) => d.value));
  const fmt = (v: number) => (metric.format === "currency" ? f.currency(v, "USD", { maximumFractionDigits: v >= 1000 ? 0 : 2 }) : metric.format === "percent" ? f.percent(v, { maximumFractionDigits: 1 }) : f.number(v));

  const config = {
    value: { label: t(metric.label), color: "accent", format: metric.format === "currency" ? { currency: "USD" } : metric.format },
    lastYear: { label: t({ en: "Same week last year", tr: "Geçen yıl aynı hafta" }), color: "fg-subtle", format: metric.format === "currency" ? { currency: "USD" } : metric.format },
  } satisfies ChartConfig;

  const presets: { label: string; metric: MetricId; segment: SegmentId; range: RangeId }[] = [
    { label: t({ en: "Why did refunds jump?", tr: "İadeler neden arttı?" }), metric: "refunds", segment: "marketplace", range: "12" },
    { label: t({ en: "Is wholesale worth it?", tr: "Toptan satış değer mi?" }), metric: "aov", segment: "wholesale", range: "52" },
    { label: t({ en: "Are people coming back?", tr: "Müşteriler geri dönüyor mu?" }), metric: "repeat", segment: "web", range: "26" },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the SQL stays selectable */
    }
  };

  const segLabel = t(segments.find((s) => s.id === segment)!.label);
  const title = `${t(metric.label)} · ${segLabel} · ${t({ en: `last ${range} weeks`, tr: `son ${range} hafta` })}`;

  return (
    <div data-slot="query-console" className="surface overflow-hidden rounded-ui-lg border border-line">
      {/* Title bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface-2 px-4 py-2.5 font-mono text-[11px] text-fg-muted">
        <span className="flex items-center gap-2">
          <Database aria-hidden className="size-3.5" />
          tepe-outdoor / <span className="text-fg">prod-replica</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-success" />
          {t({ en: "connected · synced 2 min ago", tr: "bağlı · 2 dk önce eşitlendi" })}
        </span>
        <span className="ms-auto hidden sm:inline">{t({ en: "Demo workspace — generated numbers", tr: "Demo çalışma alanı — üretilmiş rakamlar" })}</span>
      </div>

      {/* Controls */}
      <div className="grid gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span id="qc-metric" className="me-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
            {t({ en: "Metric", tr: "Metrik" })}
          </span>
          <ToggleGroup aria-labelledby="qc-metric" size="sm" value={metricId} onValueChange={(v) => v && setMetricId(v as MetricId)} className="max-w-full flex-wrap">
            {metrics.map((m) => (
              <ToggleGroupItem key={m.id} value={m.id}>
                {t(m.label)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span id="qc-segment" className="me-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
              {t({ en: "Channel", tr: "Kanal" })}
            </span>
            <ToggleGroup aria-labelledby="qc-segment" variant="outline" size="sm" value={segment} onValueChange={(v) => v && setSegment(v as SegmentId)} className="max-w-full flex-wrap">
              {segments.map((s) => (
                <ToggleGroupItem key={s.id} value={s.id}>
                  {t(s.label)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-2">
            <span id="qc-range" className="me-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">
              {t({ en: "Range", tr: "Aralık" })}
            </span>
            <ToggleGroup aria-labelledby="qc-range" variant="outline" size="sm" value={range} onValueChange={(v) => v && setRange(v as RangeId)}>
              {ranges.map((r) => (
                <ToggleGroupItem key={r.id} value={r.id}>
                  {t(r.label)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Switch checked={compare} onCheckedChange={setCompare} label={t({ en: "Compare with last year", tr: "Geçen yılla karşılaştır" })} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        {/* Headline numbers */}
        <div className="grid grid-cols-2 content-start gap-px border-b border-line bg-line lg:grid-cols-1 lg:border-e lg:border-b-0 lg:bg-surface [&>*]:bg-surface lg:[&>*]:border-b lg:[&>*]:border-line">
          <div className="col-span-2 bg-surface p-4 lg:col-span-1">
            <Stat
              variant="inline"
              size="lg"
              label={t({ en: "Week of 2 Nov", tr: "2 Kasım haftası" })}
              value={fmt(last.value)}
              delta={delta}
              intent={metric.intent}
              comparison={t({ en: "vs previous week", tr: "önceki haftaya göre" })}
            />
            <Sparkline values={data.slice(-12).map((d) => d.value)} variant="area" color="accent-ink" width="100%" height={36} className="mt-3" label={t({ en: "Last 12 weeks", tr: "Son 12 hafta" })} />
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-subtle">{t({ en: "vs last year", tr: "geçen yıla göre" })}</p>
            <p className="mt-1 text-lg font-medium tabular-nums">
              <Delta value={yoy} intent={metric.intent} />
            </p>
          </div>
          <div className="bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-subtle">{t({ en: "Range high / low", tr: "Aralık en yüksek / düşük" })}</p>
            <p className="mt-1 text-[13px] tabular-nums text-fg">
              {fmt(high)}
              <span className="text-fg-subtle"> / </span>
              {fmt(low)}
            </p>
          </div>
        </div>

        {/* Chart / SQL */}
        <Tabs defaultValue="chart" className="min-w-0 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList variant="segmented" aria-label={t({ en: "Result view", tr: "Sonuç görünümü" })}>
              <TabsTrigger value="chart">{t({ en: "Chart", tr: "Grafik" })}</TabsTrigger>
              <TabsTrigger value="sql">SQL</TabsTrigger>
            </TabsList>
            <p className="truncate font-mono text-[11px] text-fg-muted" aria-live="polite">
              {title}
            </p>
          </div>
          <TabsContent value="chart" className="mt-3">
            <AreaChart
              title={title}
              data={data}
              x="week"
              xLabel={t({ en: "Week", tr: "Hafta" })}
              xFormat={{ date: { month: "short", day: "numeric" } }}
              config={config}
              series={compare ? ["value", "lastYear"] : ["value"]}
              compare={compare ? { key: "lastYear" } : undefined}
              legend={compare ? "top" : "none"}
              state={running ? { status: "refreshing" } : undefined}
              height={300}
              tableToggle
            />
          </TabsContent>
          <TabsContent value="sql" className="mt-3">
            <div className="relative overflow-hidden rounded-ui border border-line bg-surface-2">
              <Button size="xs" variant="ghost" onClick={copy} className="absolute end-2 top-2" aria-live="polite">
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {copied ? t({ en: "Copied", tr: "Kopyalandı" }) : t({ en: "Copy SQL", tr: "SQL’i kopyala" })}
              </Button>
              <pre tabIndex={0} aria-label={t({ en: "Compiled SQL", tr: "Derlenmiş SQL" })} className="focus-ring max-h-[300px] overflow-auto p-4 pe-28 font-mono text-[12.5px] leading-[1.7] text-fg-muted">
                <code>
                  {sql.split("\n").map((line, i) => (
                    <React.Fragment key={i}>
                      <SqlLine line={line} />
                      {"\n"}
                    </React.Fragment>
                  ))}
                </code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Presets + run line */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        <span className="me-1 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle">{t({ en: "Try", tr: "Deneyin" })}</span>
        {presets.map((p) => {
          const active = p.metric === metricId && p.segment === segment && p.range === range;
          return (
            <Button
              key={p.label}
              size="xs"
              variant={active ? "soft" : "secondary"}
              aria-pressed={active}
              onClick={() => {
                setMetricId(p.metric);
                setSegment(p.segment);
                setRange(p.range);
              }}
            >
              {p.label}
            </Button>
          );
        })}
        <span className="ms-auto flex items-center gap-2 font-mono text-[11px] text-fg-muted">
          <Play aria-hidden className="size-3" />
          {running ? (
            t({ en: "running…", tr: "çalışıyor…" })
          ) : (
            <>
              {f.number(run.ms)} ms · {f.number(run.rows, { notation: "compact", maximumFractionDigits: 1 })} {t({ en: "rows scanned", tr: "satır tarandı" })}
            </>
          )}
          <Badge size="sm" tone="outline" className="font-mono">
            {metric.owner}
          </Badge>
        </span>
      </div>
    </div>
  );
}
