"use client";

import * as React from "react";
import { Pause, Play, X } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, PageHeader, PinMap, cn, type MapPin } from "@vamos-ui/react";
import { AreaChart, BarList, type ChartConfig } from "@vamos-ui/react/charts";
import { CountUp } from "@vamos-ui/react/motion";
import { seeded } from "../../_shared/random";
import { useBlockFormat } from "../../_shared/format";
import { LiveFeed } from "./live-feed";
import { advance, countryNames, europeBounds, initialState, totalNow, type LiveState } from "./live-data";

const TICK = 4000;
const whole: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

/** Realtime web analytics: who is on the site now, where from, on which pages, and what they just did. */
export function RealtimeDashboard() {
  const { f, t, c } = useBlockFormat();
  const [state, setState] = React.useState<LiveState>(initialState);
  const [paused, setPaused] = React.useState(false);
  const [city, setCity] = React.useState<string | null>(null);
  const prevTotal = React.useRef(totalNow(state));
  const rand = React.useMemo(() => seeded(9001), []);

  React.useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setState((s) => {
        prevTotal.current = totalNow(s);
        return advance(s, rand, TICK);
      });
    }, TICK);
    return () => window.clearInterval(id);
  }, [paused, rand]);

  const now = totalNow(state);
  const peak = Math.max(...state.perMinute.map((p) => p.visitors));
  const views = state.events.filter((e) => e.kind === "view").length;
  const selectedCity = state.cities.find((x) => x.city === city) ?? null;

  const minuteRows = state.perMinute.map((p) => ({ at: new Date(p.at).toISOString(), visitors: p.visitors }));
  const minuteConfig: ChartConfig = { visitors: { label: c("Visitors", "Ziyaretçi"), color: "chart-1", format: "integer" } };

  const pins: MapPin[] = state.cities.map((x) => ({
    id: x.city,
    lat: x.lat,
    lng: x.lng,
    label: x.city,
    value: x.visitors,
    tone: x.country === "TR" ? "accent" : "info",
    pulse: x.visitors > 60,
    description: c(`${x.visitors} on the site · ${t(countryNames[x.country]!)}`, `Sitede ${x.visitors} kişi · ${t(countryNames[x.country]!)}`),
  }));

  const devices = (["mobile", "desktop", "tablet"] as const).map((d) => ({ d, n: state.events.filter((e) => e.device === d).length }));
  const devTotal = Math.max(1, devices.reduce((s, x) => s + x.n, 0));
  const deviceLabel = { mobile: c("Mobile", "Mobil"), desktop: c("Desktop", "Masaüstü"), tablet: c("Tablet", "Tablet") };

  return (
    <div className="mx-auto max-w-[1360px]">
      <PageHeader
        size="lg"
        eyebrow={c("Site · kilnandlinen.example.com", "Site · kilnandlinen.example.com")}
        title={c("Realtime", "Anlık")}
        description={c("Visitors in the last 30 minutes. Numbers refresh every few seconds.", "Son 30 dakikadaki ziyaretçiler. Rakamlar birkaç saniyede bir yenilenir.")}
        meta={
          paused ? (
            <Badge tone="neutral" dot>{c("Paused", "Duraklatıldı")}</Badge>
          ) : (
            <Badge tone="success" dot>{c("Live", "Canlı")}</Badge>
          )
        }
        actions={
          <Button variant="secondary" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
            {paused ? c("Resume", "Devam et") : c("Pause updates", "Güncellemeyi durdur")}
          </Button>
        }
      />

      {/* Hero band: the one number, its last 30 minutes, and what it turned into. */}
      <Card className="ui-rise min-w-0">
        <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,14rem)] lg:gap-8 lg:p-6">
          <div>
            <p className="text-[13px] text-fg-muted">{c("Visitors right now", "Şu an sitede")}</p>
            <p className="mt-1 font-heading text-[56px] leading-none font-medium tracking-tight text-fg tabular lg:text-[64px]" aria-live="off">
              <CountUp key={state.clock} value={now} from={prevTotal.current} duration={900} format={whole} />
            </p>
            <p className="mt-3 text-xs text-fg-subtle">
              {c(`Peak in the last 30 min: ${peak}`, `Son 30 dakikanın zirvesi: ${peak}`)}
              <span className="mx-1.5" aria-hidden>·</span>
              {c("Updated", "Güncellendi")} <time dateTime={new Date(state.clock).toISOString()}>{f.time(new Date(state.clock), { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Istanbul" })}</time>
            </p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs text-fg-subtle">{c("Visitors per minute", "Dakika başına ziyaretçi")}</p>
            <AreaChart
              title={c("Visitors per minute, last 30 minutes", "Son 30 dakika, dakika başına ziyaretçi")}
              data={minuteRows}
              x="at"
              xFormat={{ date: { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" } }}
              config={minuteConfig}
              height={120}
              curve="monotone"
              animate={false}
            />
          </div>
          <dl className="grid grid-cols-3 gap-4 border-line md:col-span-2 lg:col-span-1 lg:grid-cols-1 lg:border-s lg:ps-8">
            <div>
              <dt className="text-xs text-fg-subtle">{c("Orders today", "Bugünkü sipariş")}</dt>
              <dd className="mt-0.5 font-mono text-xl text-fg tabular">{f.number(state.orders)}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Revenue today", "Bugünkü ciro")}</dt>
              <dd className="mt-0.5 font-mono text-xl text-fg tabular">{f.currency(state.revenue, "TRY", { maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" })}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Page views in feed", "Akıştaki görüntüleme")}</dt>
              <dd className="mt-0.5 font-mono text-xl text-fg tabular">{f.number(views)}</dd>
            </div>
          </dl>
        </div>
      </Card>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="ui-rise min-w-0" style={{ animationDelay: "80ms" }}>
          <CardHeader
            titleAs="h2"
            title={c("Where they are", "Neredeler")}
            description={c("Select a city to filter the activity feed", "Etkinlik akışını süzmek için bir şehir seçin")}
            action={
              selectedCity ? (
                <Button size="sm" variant="ghost" onClick={() => setCity(null)}>
                  <X aria-hidden />
                  {c(`Clear ${selectedCity.city}`, `${selectedCity.city} filtresini kaldır`)}
                </Button>
              ) : null
            }
          />
          <CardBody className="pt-1">
            <PinMap aria-label={c("Visitors right now by city", "Şehre göre anlık ziyaretçiler")} pins={pins} variant="bubble" bounds={europeBounds} aspectRatio={16 / 9} selectedId={city} onSelectedIdChange={setCity} />
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted" aria-label={c("Visitors by country", "Ülkeye göre ziyaretçiler")}>
              {Object.entries(
                state.cities.reduce<Record<string, number>>((acc, x) => ({ ...acc, [x.country]: (acc[x.country] ?? 0) + x.visitors }), {}),
              ).map(([cc, n]) => (
                <li key={cc}>
                  {t(countryNames[cc]!)} <span className="font-mono text-fg tabular">{n}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <LiveFeed events={state.events} city={city} onClearCity={() => setCity(null)} />
      </div>

      <div className="mt-(--gap) grid gap-(--gap) md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
        <Card className="ui-rise min-w-0" style={{ animationDelay: "160ms" }}>
          <CardHeader titleAs="h2" title={c("Pages being viewed", "Görüntülenen sayfalar")} description={c("Visitors on each page now", "Şu an her sayfadaki ziyaretçi")} />
          <CardBody className="pt-1">
            <BarList
              aria-label={c("Top pages now", "Şu anki en çok görüntülenen sayfalar")}
              data={state.pages.map((p) => ({ key: p.path, label: t(p.title), value: p.visitors }))}
              format="integer"
              size="md"
              variant="track"
            />
          </CardBody>
        </Card>
        <Card className="ui-rise min-w-0" style={{ animationDelay: "200ms" }}>
          <CardHeader titleAs="h2" title={c("Sources", "Kaynaklar")} description={c("Where current visitors came from", "Şu anki ziyaretçilerin geldiği yer")} />
          <CardBody className="pt-1">
            <BarList aria-label={c("Traffic sources now", "Anlık trafik kaynakları")} data={state.sources.map((s) => ({ key: s.source, label: s.source === "direct" ? c("Direct", "Doğrudan") : s.source, value: s.visitors }))} format="integer" showShare />
          </CardBody>
        </Card>
        <Card className="ui-rise min-w-0 md:col-span-2 xl:col-span-1" style={{ animationDelay: "240ms" }}>
          <CardHeader titleAs="h2" title={c("Devices", "Cihazlar")} description={c("Share of recent activity", "Son etkinlikteki pay")} />
          <CardBody className="grid gap-3 pt-1">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-track" aria-hidden>
              {devices.map((d, i) => (
                <span key={d.d} className={cn("h-full transition-[width] duration-700", i === 0 ? "bg-chart-1" : i === 1 ? "bg-chart-2" : "bg-chart-3")} style={{ width: `${(d.n / devTotal) * 100}%` }} />
              ))}
            </div>
            <ul className="grid gap-1.5 text-[13px]">
              {devices.map((d, i) => (
                <li key={d.d} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-fg-muted">
                    <span className={cn("size-2 rounded-full", i === 0 ? "bg-chart-1" : i === 1 ? "bg-chart-2" : "bg-chart-3")} aria-hidden />
                    {deviceLabel[d.d]}
                  </span>
                  <span className="font-mono text-fg tabular">{f.percent(d.n / devTotal, { maximumFractionDigits: 0 })}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
