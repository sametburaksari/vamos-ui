"use client";

import * as React from "react";
import { Badge, cn, Switch } from "@vamos-ui/react";
import { Container, Faq, PageIntro, PricingTable, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Clock } from "lucide-react";
import { useArea } from "./area-provider";
import { AreaChips, mapCopy } from "./body-map";
import { areas, copyFor, fill, groupNames, treatments, tl, type Treatment } from "./content";

const GROUPS: Treatment["group"][] = ["start", "hands", "move"];

const c = {
  crumb: { en: "Treatments", tr: "Tedaviler" },
  title: { en: "Every treatment, *timed and priced*", tr: "Her tedavi, *süresi ve ücretiyle*" },
  lead: {
    en: "Everyone starts with an assessment. After that your physio suggests what to book — here is everything we offer, with the time it takes and what it costs, VAT included.",
    tr: "Herkes bir değerlendirmeyle başlar. Ardından fizyoterapistiniz ne ayırtmanız gerektiğini önerir — sunduğumuz her şey süresi ve KDV dahil ücretiyle burada.",
  },
  only: { en: "Only treatments for {area}", tr: "Yalnızca {area} için tedaviler" },
  forArea: { en: "For {area}", tr: "{area} için" },
  noneFor: { en: "Nothing here is usually needed for the {area} — your physio may still add it after the assessment.", tr: "{area} için genellikle bu gruptan bir şey gerekmez — fizyoterapistiniz değerlendirmeden sonra yine de ekleyebilir." },
  count: { en: "{n} of {total} treatments", tr: "{total} tedaviden {n} tanesi" },
  min: { en: "{n} min", tr: "{n} dk" },
  book: { en: "Book", tr: "Randevu" },
  perSession: { en: "{price} a session", tr: "Seans başı {price}" },
};

/** Treatments: the same area chips filter (or highlight) the full list; packs and FAQ below. */
export function TreatmentsPage() {
  const { t, locale, area, setTreatment } = useArea();
  const { intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const [only, setOnly] = React.useState(true);
  const a = areas[area];
  const all = Object.values(treatments);
  const shown = only ? all.filter((tr) => a.treatments.includes(tr.id)) : all;
  const label = t(a.label).toLocaleLowerCase(intl);

  return (
    <>
      <PageIntro {...common} variant="ruled" breadcrumb={[{ label: "Motion Lab", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section aria-label={t(c.crumb)} theme={{ rhythm: "tight" }} className="pt-0!">
        <Container>
          <div className="sticky top-[calc(var(--topbar-h,4rem)+0.5rem)] z-10 mb-8 flex flex-col gap-3 rounded-[var(--radius)] border border-line bg-scene/90 p-3 backdrop-blur-sm @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <AreaChips size="sm" />
            <div className="flex items-center gap-4">
              <Switch size="sm" checked={only} onCheckedChange={setOnly} label={fill(t(c.only), { area: label })} />
            </div>
          </div>
          <p className="mb-6 font-mono text-xs text-fg-muted" aria-live="polite">
            {fill(t(c.count), { n: shown.length, total: all.length })}
          </p>
          <div className="grid gap-10 @4xl:grid-cols-3 @4xl:gap-6">
            {GROUPS.map((g) => {
              const rows = shown.filter((tr) => tr.group === g);
              return (
                <section key={g} aria-labelledby={`ml-g-${g}`} className="flex flex-col">
                  <h2 id={`ml-g-${g}`} className="mb-3 flex items-baseline justify-between border-b-2 border-fg pb-2 font-display text-h3 text-fg uppercase">
                    {t(groupNames[g])}
                    <span className="font-mono text-xs text-fg-muted tabular">{String(rows.length).padStart(2, "0")}</span>
                  </h2>
                  {rows.length ? (
                    <ul className="flex flex-col divide-y divide-line">
                      {rows.map((tr) => {
                        const fits = a.treatments.includes(tr.id);
                        return (
                          <li key={tr.id} className={cn("flex flex-col gap-2 py-4", !fits && "opacity-70")}>
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="font-semibold text-fg">{t(tr.name)}</h3>
                              <span className="shrink-0 font-semibold text-fg tabular">{tl(tr.fee, locale)}</span>
                            </div>
                            <p className="text-small text-fg-muted">{t(tr.text)}</p>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="flex items-center gap-2">
                                <Badge tone="outline">
                                  <Clock aria-hidden />
                                  {fill(t(c.min), { n: tr.minutes })}
                                </Badge>
                                {fits && !only ? <Badge tone="accent">{fill(t(c.forArea), { area: label })}</Badge> : null}
                              </span>
                              <a href={sitePageHref("booking")} onClick={() => setTreatment(tr.id)} className="focus-ring rounded-sm text-small font-semibold text-accent-ink underline-offset-4 hover:underline">
                                {t(c.book)}
                                <span className="sr-only"> — {t(tr.name)}</span>
                              </a>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="py-4 text-small text-fg-muted">{fill(t(c.noneFor), { area: label })}</p>
                  )}
                </section>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-fg-subtle">{t(mapCopy.note)}</p>
        </Container>
      </Section>
      <PricingTable
        {...common}
        anchor="packs"
        variant="columns"
        billing="once"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Packs", tr: "Paketler" })}
        title={t({ en: "Book ahead, *pay less*", tr: "Önceden ayırtın, *daha az ödeyin*" })}
        lead={t({ en: "Packs are valid for six months, can be shared with one family member and are refunded pro rata if you stop.", tr: "Paketler altı ay geçerlidir, bir aile üyesiyle paylaşılabilir ve bırakırsanız kalan kısmı iade edilir." })}
        plans={[
          { name: t({ en: "Single session", tr: "Tek seans" }), description: t({ en: "Treatment or rehab, 45 minutes.", tr: "Tedavi ya da rehabilitasyon, 45 dakika." }), price: { once: { amount: "1900", currency: "TRY" } }, features: [{ text: t({ en: "Any physio", tr: "Herhangi bir fizyoterapist" }) }], cta: { link: { href: sitePageHref("booking"), label: t({ en: "Book", tr: "Ayırt" }) }, style: "secondary" } },
          { name: t({ en: "Six sessions", tr: "Altı seans" }), description: t({ en: "The usual course for one area.", tr: "Tek bölge için olağan süreç." }), price: { once: { amount: "10200", currency: "TRY" } }, features: [{ text: fill(t(c.perSession), { price: tl(1700, locale) }) }, { text: t({ en: "Home programme in the app", tr: "Uygulamada ev programı" }) }], highlight: t({ en: "Most booked", tr: "En çok alınan" }), cta: { link: { href: sitePageHref("booking"), label: t({ en: "Start with an assessment", tr: "Değerlendirmeyle başla" }) }, style: "primary" } },
          { name: t({ en: "Twelve sessions", tr: "On iki seans" }), description: t({ en: "Post-surgery rehab and return to sport.", tr: "Ameliyat sonrası rehabilitasyon ve spora dönüş." }), price: { once: { amount: "19200", currency: "TRY" } }, features: [{ text: fill(t(c.perSession), { price: tl(1600, locale) }) }, { text: t({ en: "Re-test at session 6 and 12", tr: "6. ve 12. seansta yeniden test" }) }], cta: { link: { href: sitePageHref("booking"), label: t({ en: "Book", tr: "Ayırt" }) }, style: "secondary" } },
        ]}
        taxNote={t({ en: "VAT included. Most private health insurers reimburse with a doctor’s referral.", tr: "KDV dahil. Çoğu özel sağlık sigortası hekim sevkiyle geri öder." })}
      />
      <Faq
        {...common}
        variant="split"
        eyebrow={t({ en: "Questions", tr: "Sorular" })}
        title={t({ en: "Before your *first visit*", tr: "İlk ziyaretten *önce*" })}
        items={[
          { q: t({ en: "Do I need a doctor’s referral?", tr: "Hekim sevki gerekiyor mu?" }), a: t({ en: "Not to book with us. Some insurers need one to reimburse you — check your policy before your first visit.", tr: "Bize randevu almak için gerekmez. Bazı sigortalar geri ödeme için ister — ilk ziyaretten önce poliçenize bakın." }) },
          { q: t({ en: "What should I wear?", tr: "Ne giymeliyim?" }), a: t({ en: "Something you can move in, and shorts for knee, hip or ankle problems. We have changing rooms and showers.", tr: "Rahat hareket edebileceğiniz bir şey; diz, kalça ya da ayak bileği için şort. Soyunma odası ve duşumuz var." }) },
          { q: t({ en: "Can I bring my scans?", tr: "Görüntülerimi getirebilir miyim?" }), a: t({ en: "Please do — MRI or X-ray reports and any surgeon’s notes. Bring them on a USB stick or send them to the desk before the visit.", tr: "Lütfen getirin — MR ya da röntgen raporları ve cerrah notları. USB bellekte getirin ya da ziyaretten önce danışmaya gönderin." }) },
          { q: t({ en: "How late can I cancel?", tr: "En geç ne zaman iptal edebilirim?" }), a: t({ en: "Up to 24 hours before at no charge. Later than that we charge half the session fee, unless you are ill.", tr: "24 saat öncesine kadar ücretsiz. Daha geç iptallerde, hasta değilseniz seans ücretinin yarısını alırız." }) },
        ]}
      />
    </>
  );
}
