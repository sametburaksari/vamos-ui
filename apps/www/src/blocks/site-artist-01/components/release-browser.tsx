"use client";

import * as React from "react";
import { Badge, Button, cn, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { ArrowUpRight } from "lucide-react";
import { copyFor, releases, type ReleaseKind, type SiteLocale } from "./content";
import { CoverArt } from "./cover-art";

/** Discography: a kind filter, a strip of sleeves, and the chosen release with its tracklist. */
export function ReleaseBrowser({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const [kind, setKind] = React.useState<"all" | ReleaseKind>("all");
  const list = releases.filter((r) => kind === "all" || r.kind === kind);
  const [selected, setSelected] = React.useState(releases[0]!.id);
  const current = list.find((r) => r.id === selected) ?? list[0]!;
  const kindName = (k: ReleaseKind) => (k === "album" ? t({ en: "Album", tr: "Albüm" }) : k === "ep" ? "EP" : t({ en: "Single", tr: "Tekli" }));
  const total = current.tracks.reduce((s, tr) => {
    const [m, sec] = tr.length.split(":").map(Number);
    return s + (m ?? 0) * 60 + (sec ?? 0);
  }, 0);

  return (
    <div>
      <ToggleGroup type="single" variant="segmented" value={kind} onValueChange={(v) => v && setKind(v as typeof kind)} aria-label={t({ en: "Release type", tr: "Yayın türü" })}>
        <ToggleGroupItem value="all">{t({ en: "Everything", tr: "Hepsi" })}</ToggleGroupItem>
        <ToggleGroupItem value="album">{t({ en: "Albums", tr: "Albümler" })}</ToggleGroupItem>
        <ToggleGroupItem value="ep">EP</ToggleGroupItem>
        <ToggleGroupItem value="single">{t({ en: "Singles", tr: "Tekliler" })}</ToggleGroupItem>
      </ToggleGroup>

      <ul className="m-0 mt-6 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-5" aria-label={t({ en: "Releases", tr: "Yayınlar" })}>
        {list.map((r) => (
          <li key={r.id} className="@container">
            <button
              type="button"
              onClick={() => setSelected(r.id)}
              aria-pressed={r.id === current.id}
              className={cn("group block w-full text-start focus-ring", r.id === current.id ? "" : "opacity-70 hover:opacity-100")}
            >
              <span className={cn("block outline-offset-4", r.id === current.id && "outline-2 outline-accent outline-solid")}>
                <CoverArt release={r} />
              </span>
              <span className="mt-2 block truncate text-small font-semibold">{r.title}</span>
              <span className="block font-mono text-[11px] text-fg-muted">
                {kindName(r.kind)} · {r.date.slice(0, 4)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <article className="mt-10 grid gap-8 border-t-2 border-fg pt-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-labelledby="ms-release-title" data-testid="release-detail">
        <div className="@container">
          <CoverArt release={current} size="lg" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={current.upcoming ? "accent" : "outline"} shape="square">
              {current.upcoming ? t({ en: "Pre-order", tr: "Ön sipariş" }) : kindName(current.kind)}
            </Badge>
            <span className="font-mono text-xs text-fg-muted">
              {f.date(current.date, { day: "numeric", month: "long", year: "numeric" })} · {current.label}
            </span>
          </div>
          <h3 id="ms-release-title" className="m-0 mt-3 font-display text-display-m lowercase">
            {current.title}
          </h3>
          <p className="m-0 mt-3 max-w-[52ch] text-fg-muted">{t(current.note)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild variant={current.upcoming ? "primary" : "secondary"} size="sm">
              <a href={`https://shop.mirasol.example.com/${current.id}`} target="_blank" rel="noopener noreferrer">
                {current.upcoming ? t({ en: "Pre-order the LP", tr: "LP’yi ön sipariş ver" }) : t({ en: "Buy", tr: "Satın al" })}
                <span className="sr-only">{t({ en: " (opens in a new tab)", tr: " (yeni sekmede açılır)" })}</span>
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href={`https://listen.mirasol.example.com/${current.id}`} target="_blank" rel="noopener noreferrer">
                {t({ en: "Listen anywhere", tr: "Her yerde dinle" })}
                <span className="sr-only">{t({ en: " (opens in a new tab)", tr: " (yeni sekmede açılır)" })}</span>
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
          </div>
          <Table className="mt-6" density="compact">
            <TableCaption side="top" visuallyHidden>
              {t({ en: `Tracklist of ${current.title}`, tr: `${current.title} şarkı listesi` })}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>{t({ en: "Track", tr: "Şarkı" })}</TableHead>
                <TableHead align="end">{t({ en: "Length", tr: "Süre" })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.tracks.map((tr, i) => (
                <TableRow key={tr.title}>
                  <TableCell className="font-mono text-fg-muted tabular-nums">{String(i + 1).padStart(2, "0")}</TableCell>
                  <TableCell className="font-medium">{tr.title}</TableCell>
                  <TableCell align="end" className="font-mono tabular-nums">
                    {tr.length}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="m-0 mt-3 font-mono text-xs text-fg-muted">
            {t({ en: `${current.tracks.length} tracks · ${Math.round(total / 60)} min`, tr: `${current.tracks.length} şarkı · ${Math.round(total / 60)} dk` })}
          </p>
        </div>
      </article>
    </div>
  );
}
