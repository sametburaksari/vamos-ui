"use client";

import * as React from "react";
import { ArrowRight, Globe, MapPin, Phone, SearchX } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Button, Checkbox, Input, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { copyFor, serviceCategories, services, type Channel, type Service, type ServiceCategory, type SiteLocale } from "./content";

const CHANNEL_ICON: Record<Channel, typeof Globe> = { online: Globe, "in-person": MapPin, phone: Phone };

/** Lower-case, accent-free text for matching ("Nikâh" ~ "nikah", "İzin" ~ "izin"). */
const fold = (s: string, locale: string) => s.toLocaleLowerCase(locale).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

/**
 * Services A–Z: search (prefilled from `?q=` when you arrive from the home page search), a
 * category switch and an "online only" filter; results grouped by category as an accordion.
 * Arriving on `#svc-<id>` opens that service.
 */
export function ServiceFinder({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<ServiceCategory | "all">("all");
  const [onlineOnly, setOnlineOnly] = React.useState(false);
  const [open, setOpen] = React.useState<string[]>([]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash.startsWith("svc-")) {
      const id = hash.slice(4);
      setOpen([id]);
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }));
    }
  }, []);

  const words = fold(query.trim(), locale).split(/\s+/).filter(Boolean);
  const haystack = (s: Service) => fold([t(s.title), t(s.summary), ...s.needs.map(t)].join(" "), locale);
  const results = services.filter(
    (s) => (category === "all" || s.category === category) && (!onlineOnly || s.channels.includes("online")) && words.every((w) => haystack(s).includes(w)),
  );
  const groups = serviceCategories.map((c) => ({ ...c, items: results.filter((s) => s.category === c.id) })).filter((g) => g.items.length > 0);

  const channelLabel: Record<Channel, string> = {
    online: t({ en: "Online", tr: "Çevrimiçi" }),
    "in-person": t({ en: "In person", tr: "Yüz yüze" }),
    phone: t({ en: "By phone", tr: "Telefonla" }),
  };

  const reset = () => {
    setQuery("");
    setCategory("all");
    setOnlineOnly(false);
  };

  return (
    <div className="grid gap-10 @4xl:grid-cols-12">
      <div className="@4xl:col-span-4">
        <div className="flex flex-col gap-6 @4xl:sticky @4xl:top-[calc(var(--topbar-h,4rem)+1.5rem)]">
          <div>
            <label htmlFor="svc-q" className="mb-2 block text-body font-semibold">
              {t({ en: "Search services", tr: "Hizmetlerde arayın" })}
            </label>
            <Input id="svc-q" type="search" size="lg" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t({ en: "e.g. parking", tr: "ör. otopark" })} autoComplete="off" />
          </div>
          <div>
            <p id="svc-cat" className="m-0 mb-2 text-body font-semibold">
              {t({ en: "Topic", tr: "Konu" })}
            </p>
            <ToggleGroup type="single" variant="outline" orientation="vertical" aria-labelledby="svc-cat" value={category} onValueChange={(v) => v && setCategory(v as ServiceCategory | "all")} className="w-full [&>button]:justify-start">
              <ToggleGroupItem value="all">{t({ en: "All topics", tr: "Tüm konular" })}</ToggleGroupItem>
              {serviceCategories.map((c) => (
                <ToggleGroupItem key={c.id} value={c.id}>
                  {t(c.title)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Checkbox checked={onlineOnly} onCheckedChange={(v) => setOnlineOnly(v === true)} label={t({ en: "Can be done online", tr: "Çevrimiçi yapılabilenler" })} />
        </div>
      </div>

      <div className="@4xl:col-span-8">
        <p role="status" aria-live="polite" className="m-0 border-b-2 border-fg pb-3 text-body font-semibold">
          {t({ en: `${results.length} of ${services.length} services`, tr: `${services.length} hizmetten ${results.length} tanesi` })}
          {query ? <span className="font-normal text-fg-muted"> {t({ en: `matching “${query}”`, tr: `“${query}” ile eşleşen` })}</span> : null}
        </p>

        {groups.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-10">
            <SearchX aria-hidden className="size-8 text-fg-muted" />
            <p className="m-0 text-h3 font-semibold">{t({ en: "No service matches", tr: "Eşleşen hizmet yok" })}</p>
            <p className="m-0 max-w-[48ch] text-body text-fg-muted">
              {t({ en: "Try a shorter word, or call us on +90 216 000 00 00 — we will tell you where to go.", tr: "Daha kısa bir kelime deneyin ya da +90 216 000 00 00’ı arayın — nereye başvuracağınızı söyleyelim." })}
            </p>
            <Button variant="secondary" onClick={reset}>
              {t({ en: "Clear search and filters", tr: "Aramayı ve filtreleri temizle" })}
            </Button>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.id} aria-labelledby={`svc-group-${g.id}`} className="mt-8">
              <h2 id={`svc-group-${g.id}`} className="m-0 text-small font-bold tracking-[0.08em] text-accent-ink uppercase">
                {t(g.title)}
              </h2>
              <Accordion type="multiple" value={open} onValueChange={setOpen} className="mt-2">
                {g.items.map((s) => (
                  <AccordionItem key={s.id} value={s.id} id={`svc-${s.id}`} className="scroll-mt-28">
                    <AccordionTrigger className="text-body font-semibold [&_[data-slot=accordion-title]]:text-[1.0625em]" meta={s.fee ? f.currency(s.fee, { currency: "TRY", display: "narrowSymbol", maximumFractionDigits: 0 }) : t({ en: "Free", tr: "Ücretsiz" })}>
                      {t(s.title)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-4 pb-5 text-body">
                        <p className="m-0 max-w-[60ch]">{t(s.summary)}</p>
                        <div className="grid gap-4 @2xl:grid-cols-2">
                          <div>
                            <h3 className="m-0 text-small font-bold">{t({ en: "Have ready", tr: "Hazır bulundurun" })}</h3>
                            <ul className="m-0 mt-1.5 list-disc ps-5">
                              {s.needs.map((n) => (
                                <li key={n.en}>{t(n)}</li>
                              ))}
                            </ul>
                          </div>
                          <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-small">
                            <dt className="font-bold">{t({ en: "Fee", tr: "Ücret" })}</dt>
                            <dd className="m-0">
                              {s.fee ? f.currency(s.fee, { currency: "TRY", display: "narrowSymbol", maximumFractionDigits: 0 }) : t({ en: "Free", tr: "Ücretsiz" })}
                              {s.feeNote ? <span className="text-fg-muted"> · {t(s.feeNote)}</span> : null}
                            </dd>
                            <dt className="font-bold">{t({ en: "Takes", tr: "Süre" })}</dt>
                            <dd className="m-0">{t(s.time)}</dd>
                            {s.desk ? (
                              <>
                                <dt className="font-bold">{t({ en: "Desk", tr: "Banko" })}</dt>
                                <dd className="m-0">{s.desk}</dd>
                              </>
                            ) : null}
                          </dl>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {s.channels.map((c) => {
                            const Icon = CHANNEL_ICON[c];
                            return (
                              <Badge key={c} tone={c === "online" ? "accent" : "outline"} size="lg">
                                <Icon aria-hidden />
                                {channelLabel[c]}
                              </Badge>
                            );
                          })}
                        </div>
                        <div>
                          {s.channels.includes("online") ? (
                            <Button asChild>
                              <a href={`https://services.example.com/${s.id}`}>
                                {t({ en: "Start online", tr: "Çevrimiçi başlayın" })}
                                <ArrowRight aria-hidden className="size-4" />
                              </a>
                            </Button>
                          ) : (
                            <Button asChild variant="secondary">
                              <a href="tel:+902160000000">
                                <Phone aria-hidden className="size-4" />
                                {t({ en: "Call to book · +90 216 000 00 00", tr: "Randevu için arayın · +90 216 000 00 00" })}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
