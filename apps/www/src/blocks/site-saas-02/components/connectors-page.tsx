"use client";

import * as React from "react";
import { Badge, Button, EmptyState, Input, matchText, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { Search } from "lucide-react";
import { connectorKinds, connectors, copyFor, type ConnectorKind, type ConnectorStatus, type SiteLocale } from "./content";

const STATUS_TONE: Record<ConnectorStatus, "success" | "warning" | "neutral"> = { ga: "success", beta: "warning", planned: "neutral" };

/** Connectors: filter by kind and status, search by name or note. */
export function ConnectorsPage() {
  const { locale } = useSiteShell();
  const { t, intl, labels } = copyFor(locale as SiteLocale);
  const [kind, setKind] = React.useState<ConnectorKind | "all">("all");
  const [query, setQuery] = React.useState("");
  const [hidePlanned, setHidePlanned] = React.useState(false);

  const statusLabel: Record<ConnectorStatus, string> = {
    ga: t({ en: "Available", tr: "Hazır" }),
    beta: "Beta",
    planned: t({ en: "Planned · Q1 2027", tr: "Planlı · 2027 Ç1" }),
  };

  const list = connectors.filter((c) => (kind === "all" || c.kind === kind) && (!hidePlanned || c.status !== "planned") && (query.trim() === "" || matchText(`${c.name} ${t(c.note)}`, query)));
  const counts = Object.fromEntries(connectorKinds.map((k) => [k.id, k.id === "all" ? connectors.length : connectors.filter((c) => c.kind === k.id).length]));

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="simple"
        breadcrumb={[{ label: "Plumbline", href: sitePageHref("home") }, { label: t({ en: "Connectors", tr: "Bağlayıcılar" }) }]}
        title={t({ en: "Connect what you *already* have", tr: "Zaten *elinizde* olana bağlanın" })}
        lead={t({ en: "Live queries against your database where possible, scheduled syncs where not. We never copy a table you didn’t pick.", tr: "Mümkünse veritabanınıza canlı sorgu, değilse zamanlanmış eşitleme. Seçmediğiniz bir tabloyu asla kopyalamayız." })}
      />
      <Section anchor="list" headingId="pl-connectors-list" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <h2 id="pl-connectors-list" className="sr-only">
            {t({ en: "Connector list", tr: "Bağlayıcı listesi" })}
          </h2>
          <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
            <ToggleGroup aria-label={t({ en: "Kind", tr: "Tür" })} size="sm" value={kind} onValueChange={(v) => v && setKind(v as ConnectorKind | "all")} className="max-w-full flex-wrap">
              {connectorKinds.map((k) => (
                <ToggleGroupItem key={k.id} value={k.id}>
                  {t(k.label)}
                  <span className="ms-1 font-mono text-[10px] text-fg-muted tabular-nums">{counts[k.id]}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button size="sm" variant={hidePlanned ? "soft" : "ghost"} aria-pressed={hidePlanned} onClick={() => setHidePlanned((v) => !v)}>
              {t({ en: "Hide planned", tr: "Planlananları gizle" })}
            </Button>
            <div className="w-full sm:ms-auto sm:w-64">
              <Input
                type="search"
                size="sm"
                leading={<Search aria-hidden />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                clearable
                onClear={() => setQuery("")}
                aria-label={t({ en: "Search connectors", tr: "Bağlayıcı ara" })}
                placeholder={t({ en: "Search: parquet, invoice…", tr: "Ara: parquet, fatura…" })}
              />
            </div>
          </div>
          <p className="mt-3 font-mono text-[11px] text-fg-muted" aria-live="polite">
            {t({ en: `${list.length} of ${connectors.length} connectors`, tr: `${connectors.length} bağlayıcıdan ${list.length} tanesi` })}
          </p>
          {list.length === 0 ? (
            <EmptyState
              className="mt-6"
              title={t({ en: "No connector matches", tr: "Eşleşen bağlayıcı yok" })}
              description={t({ en: "Tell us what you use — the REST connector covers most tools in an afternoon.", tr: "Ne kullandığınızı yazın — REST bağlayıcısı çoğu aracı bir öğleden sonrada karşılar." })}
            />
          ) : (
            <ul className="mt-4 grid gap-px overflow-hidden rounded-ui-lg border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
              {list.map((c) => (
                <li key={c.name} className="flex flex-col gap-2 bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-mono text-[14px] font-medium text-fg">{c.name}</h3>
                    <Badge size="sm" tone={STATUS_TONE[c.status]} dot>
                      {statusLabel[c.status]}
                    </Badge>
                  </div>
                  <p className="text-[13px] leading-relaxed text-fg-muted">{t(c.note)}</p>
                  <p className="mt-auto pt-1 font-mono text-[11px] text-fg-subtle">
                    {t(connectorKinds.find((k) => k.id === c.kind)!.label)} · {t(c.sync)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-ui-lg border border-dashed border-line p-5">
            <p className="max-w-[60ch] text-sm text-fg-muted">
              {t({ en: "Missing one? The REST / JSON connector handles pagination, OAuth 2 and rate limits from a form — most in-house tools are connected in an afternoon.", tr: "Eksik mi? REST / JSON bağlayıcısı sayfalama, OAuth 2 ve hız sınırlarını bir formla halleder — çoğu iç araç bir öğleden sonrada bağlanır." })}
            </p>
            <Button asChild variant="secondary">
              <a href="/contact?topic=connector">{t({ en: "Request a connector", tr: "Bağlayıcı isteyin" })}</a>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
