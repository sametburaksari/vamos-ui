"use client";

import { ComparisonTable, Container, PageIntro, Section, PricingTable, sitePageHref } from "@vamos-ui/react/blocks";
import { Stagger } from "@vamos-ui/react/motion";
import { copyFor, planFor, programmes, tl, type ProgrammeId } from "./content";
import { usePlan } from "./plan-provider";
import { ProgrammePicker } from "./programme-picker";

const ORDER: ProgrammeId[] = ["kickstart", "steady", "performance", "gut", "bump", "plant", "family"];
const COMPARE: ProgrammeId[] = ["kickstart", "steady", "performance", "gut"];

const c = {
  crumb: { en: "Programmes", tr: "Programlar" },
  title: { en: "Seven programmes, *priced in full*", tr: "Yedi program, *tam fiyatıyla*" },
  lead: {
    en: "Every price below is the total for the whole programme at standard support in the clinic, VAT included. Online is 10% less. Pay in one go or in up to three instalments.",
    tr: "Aşağıdaki her fiyat, klinikte standart destekle tüm programın toplamıdır; KDV dahildir. Çevrim içi %10 daha uygundur. Tek seferde ya da üç taksite kadar ödeyin.",
  },
  cmpEyebrow: { en: "Side by side", tr: "Yan yana" },
  cmpTitle: { en: "The four we are asked about *most*", tr: "En çok *sorulan* dördü" },
  weeks: { en: "Length", tr: "Süre" },
  visits: { en: "Visits", tr: "Görüşme" },
  price: { en: "Total, clinic", tr: "Toplam, klinik" },
  online: { en: "Total, online", tr: "Toplam, çevrim içi" },
  scan: { en: "Body-composition scan", tr: "Vücut analizi" },
  messages: { en: "Weekday messages", tr: "Hafta içi mesajlaşma" },
  plan: { en: "Written plan", tr: "Yazılı plan" },
  menus: { en: "Weekly menus", tr: "Haftalık menüler" },
  sweat: { en: "Sweat-rate test", tr: "Terleme testi" },
  doctor: { en: "Letter to your doctor", tr: "Hekime mektup" },
  wk: { en: "{n} weeks", tr: "{n} hafta" },
  all: { en: "All programmes", tr: "Tüm programlar" },
  visitsLower: { en: "visits", tr: "görüşme" },
  show: { en: "Show in picker", tr: "Seçicide göster" },
  choose: { en: "Choose", tr: "Seç" },
  singleEyebrow: { en: "Not ready for a programme?", tr: "Programa hazır değil misiniz?" },
  singleTitle: { en: "Single *sessions*", tr: "Tek *görüşmeler*" },
  singleLead: { en: "Book one visit at a time. If you move to a programme within a month, the first consultation is deducted.", tr: "Tek tek görüşme ayırtın. Bir ay içinde bir programa geçerseniz ilk görüşme ücreti düşülür." },
};

/** Programmes: the picker again, a comparison table and the single-session prices. */
export function ProgrammesPage() {
  const { t, locale, setProgramme } = usePlan();
  const { intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const wk = (n: number) => t(c.wk).replace("{n}", String(n));
  return (
    <>
      <PageIntro {...common} variant="ruled" breadcrumb={[{ label: "Greenplate", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section aria-labelledby="gp-all-h" theme={{ rhythm: "tight" }} className="pt-0!">
        <Container>
          <h2 id="gp-all-h" className="sr-only">
            {t(c.all)}
          </h2>
          <Stagger asChild step={60}>
          <ol className="grid border-t border-line @3xl:grid-cols-2 @3xl:gap-x-10">
            {ORDER.map((id, i) => {
              const p = programmes[id];
              return (
                <li key={id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 border-b border-line py-4">
                  <span aria-hidden className="font-mono text-xs text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-display text-h3 font-bold text-fg">{t(p.name)}</span>
                    <span className="text-small text-fg-muted">{t(p.summary)}</span>
                    <span className="text-xs text-fg-muted">
                      {wk(p.weeks)} · {p.sessions} {t(c.visitsLower)}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <span className="font-semibold text-fg tabular">{tl(p.price, locale)}</span>
                    <a
                      href={sitePageHref("programmes", "find")}
                      onClick={() => setProgramme(id)}
                      className="focus-ring rounded-sm text-small font-medium text-accent-ink underline-offset-4 hover:underline"
                    >
                      {t(c.show)}
                      <span className="sr-only"> — {t(p.name)}</span>
                    </a>
                  </span>
                </li>
              );
            })}
          </ol>
          </Stagger>
        </Container>
      </Section>
      <ProgrammePicker anchor="find" surface="surface-2" />
      <ComparisonTable
        {...common}
        anchor="compare"
        variant="table"
        eyebrow={t(c.cmpEyebrow)}
        title={t(c.cmpTitle)}
        columns={COMPARE.map((id) => ({
          name: t(programmes[id].name),
          note: tl(programmes[id].price, locale),
          highlight: id === "steady",
          cta: { link: { href: sitePageHref("booking"), label: t(c.choose) }, style: id === "steady" ? "primary" : "secondary" },
        }))}
        groups={[
          {
            rows: [
              { feature: t(c.weeks), values: COMPARE.map((id) => wk(programmes[id].weeks)) },
              { feature: t(c.visits), values: COMPARE.map((id) => String(programmes[id].sessions)) },
              { feature: t(c.price), values: COMPARE.map((id) => tl(planFor(id, "standard", "clinic").price, locale)) },
              { feature: t(c.online), values: COMPARE.map((id) => tl(planFor(id, "standard", "online").price, locale)) },
            ],
          },
          {
            title: t({ en: "Included", tr: "Dahil olanlar" }),
            rows: [
              { feature: t(c.plan), values: COMPARE.map(() => true) },
              { feature: t(c.menus), values: COMPARE.map((id) => id !== "kickstart") },
              { feature: t(c.scan), values: COMPARE.map((id) => id === "steady" || id === "performance") },
              { feature: t(c.messages), values: COMPARE.map((id) => id !== "kickstart") },
              { feature: t(c.sweat), values: COMPARE.map((id) => id === "performance") },
              { feature: t(c.doctor), values: COMPARE.map((id) => id === "gut") },
            ],
          },
        ]}
      />
      <PricingTable
        {...common}
        anchor="single"
        variant="columns"
        billing="once"
        theme={{ surface: "surface-2" }}
        eyebrow={t(c.singleEyebrow)}
        title={t(c.singleTitle)}
        lead={t(c.singleLead)}
        plans={[
          { name: t({ en: "First consultation", tr: "İlk görüşme" }), description: t({ en: "60 minutes: history, a three-day food diary and your first changes.", tr: "60 dakika: geçmiş, üç günlük beslenme günlüğü ve ilk değişiklikler." }), price: { once: { amount: "2200", currency: "TRY" } }, features: [{ text: t({ en: "Written summary by email", tr: "E-postayla yazılı özet" }) }], cta: { link: { href: sitePageHref("booking"), label: t({ en: "Book", tr: "Ayırt" }) }, style: "primary" }, highlight: t({ en: "Where most start", tr: "Çoğu buradan başlar" }) },
          { name: t({ en: "Follow-up", tr: "Kontrol görüşmesi" }), description: t({ en: "30 minutes to adjust the plan.", tr: "Planı ayarlamak için 30 dakika." }), price: { once: { amount: "1200", currency: "TRY" } }, features: [{ text: t({ en: "Clinic or online", tr: "Klinikte ya da çevrim içi" }) }], cta: { link: { href: sitePageHref("booking"), label: t({ en: "Book", tr: "Ayırt" }) }, style: "secondary" } },
          { name: t({ en: "Body-composition scan", tr: "Vücut analizi" }), description: t({ en: "10 minutes on the scale, a printed report and a short explanation.", tr: "Tartıda 10 dakika, basılı rapor ve kısa bir açıklama." }), price: { once: { amount: "600", currency: "TRY" } }, features: [{ text: t({ en: "Clinic only", tr: "Yalnızca klinikte" }) }], cta: { link: { href: sitePageHref("booking"), label: t({ en: "Book", tr: "Ayırt" }) }, style: "secondary" } },
        ]}
        taxNote={t({ en: "VAT included. Cancel or move up to 24 hours before at no cost.", tr: "KDV dahil. 24 saat öncesine kadar ücretsiz iptal ya da erteleme." })}
      />
    </>
  );
}
