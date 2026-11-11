import { Star } from "lucide-react";
import { Button } from "@vamos-ui/react";
import { Container, Cta, Faq, FeatureGrid, Section, StatsBand, Testimonials } from "@vamos-ui/react/blocks";
import { BalanceStack } from "./balance-stack";
import { copyFor, faq, features, goals, netMonthly, PRICING_HREF, quote, RATE, SECURITY_HREF, SIGNUP_HREF, stats, type SiteLocale } from "./content";
import { GoalPlanner } from "./goal-planner";
import { TrustBadges } from "./trust-badges";

/**
 * Home: a calm split hero (promise, two actions, rating) beside the app in glass panes, the
 * trust seals, features, the savings goal planner, figures, one customer, FAQ and a closing band.
 */
export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const open = t({ en: "Open an account", tr: "Hesap açın" });

  return (
    <>
      <Section headingId="fw-title" theme={{ rhythm: "tight" }}>
        <Container className="grid items-center gap-x-(--gutter) gap-y-14 pt-6 @5xl:grid-cols-12 @5xl:pt-14">
          <div className="flex flex-col gap-7 @5xl:col-span-6">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-1 text-eyebrow text-fg-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              {t({ en: "Pot rate today: 39.5% a year, before tax", tr: "Bugünkü kumbara oranı: yıllık %39,5, vergi öncesi" })}
            </p>
            <h1 id="fw-title" className="max-w-[14ch] font-display text-display-xl text-balance">
              {t({ en: "Everyday money, kept calm.", tr: "Gündelik para, sakin tutulur." })}
            </h1>
            <p className="max-w-[44ch] text-lead text-fg-muted text-pretty">
              {t({
                en: "Fernway sets the bills aside before payday spending starts, pays interest on every pot each day, and keeps every lira safeguarded 1:1 at a partner bank.",
                tr: "Fernway, maaş harcamaları başlamadan faturaları kenara ayırır, her kumbaraya her gün faiz işletir ve her lirayı bir iş ortağı bankada 1:1 koruma altında tutar.",
              })}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <a href={SIGNUP_HREF}>{open}</a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={SECURITY_HREF}>{t({ en: "How your money is protected", tr: "Paranız nasıl korunuyor" })}</a>
              </Button>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-fg-muted">
              <span className="inline-flex items-center gap-1 text-fg">
                <Star aria-hidden className="size-4 fill-current text-accent-ink" />
                <span className="font-semibold tabular">{f.number(4.8, { minimumFractionDigits: 1 })}</span>
              </span>
              <span>{t({ en: "21,400 reviews on the app stores", tr: "Uygulama mağazalarında 21.400 yorum" })}</span>
              <span aria-hidden>·</span>
              <span>{t({ en: "iOS 16+ and Android 10+", tr: "iOS 16+ ve Android 10+" })}</span>
            </p>
          </div>
          <div className="@5xl:col-span-6">
            <BalanceStack locale={locale} />
          </div>
        </Container>
      </Section>

      <Section theme={{ rhythm: "tight" }} aria-label={t({ en: "Licences and certifications", tr: "Lisanslar ve sertifikalar" })}>
        <Container>
          <TrustBadges locale={locale} label={t({ en: "Licences and certifications", tr: "Lisanslar ve sertifikalar" })} />
        </Container>
      </Section>

      <FeatureGrid
        {...common}
        variant="grid"
        columns={2}
        anchor="features"
        eyebrow={t({ en: "What it does", tr: "Ne yapar" })}
        title={t({ en: "Four habits, done for you", tr: "Sizin yerinize dört alışkanlık" })}
        lead={t({ en: "Nothing to learn. Fernway runs the routine money tasks most households mean to do and rarely get to.", tr: "Öğrenecek bir şey yok. Fernway, çoğu hanenin yapmayı isteyip pek fırsat bulamadığı rutin para işlerini yürütür." })}
        items={features.map((x) => ({ icon: x.icon, title: t(x.title), text: t(x.text) }))}
      />

      <Section anchor="planner" headingId="fw-planner" theme={{ surface: "surface" }} className="border-y border-line">
        <Container className="flex flex-col gap-10">
          <div className="grid gap-4 @5xl:grid-cols-12">
            <div className="flex flex-col gap-3 @5xl:col-span-6">
              <p className="text-eyebrow font-medium uppercase tracking-[0.12em] text-accent-ink">{t({ en: "Goal planner", tr: "Hedef planlayıcı" })}</p>
              <h2 id="fw-planner" className="font-display text-display-l text-balance">
                {t({ en: "When will you get there?", tr: "Ne zaman ulaşırsınız?" })}
              </h2>
            </div>
            <p className="max-w-[46ch] self-end text-fg-muted text-pretty @5xl:col-span-5 @5xl:col-start-8">
              {t({
                en: "Pick a goal and move the sliders. The pot grows with the interest it earns, compounded monthly after the withholding tax.",
                tr: "Bir hedef seçin ve kaydırıcıları oynatın. Kumbara, stopaj sonrası aylık bileşik faizle büyür.",
              })}
            </p>
          </div>
          <GoalPlanner
            goals={goals.map((g) => ({ ...g, label: t(g.label) }))}
            netMonthly={netMonthly}
            start="2026-12-01"
            labels={{
              goal: t({ en: "Saving for", tr: "Birikim hedefi" }),
              monthly: t({ en: "Each month", tr: "Her ay" }),
              months: t({ en: "For", tr: "Süre" }),
              monthsValue: t({ en: "{n} months", tr: "{n} ay" }),
              years: t({ en: "{n}y", tr: "{n} yıl" }),
              balance: t({ en: "Pot balance", tr: "Kumbara bakiyesi" }),
              deposits: t({ en: "You put in", tr: "Yatırdığınız" }),
              interest: t({ en: "Interest earned", tr: "Kazanılan faiz" }),
              reached: t({ en: "You reach {target} in {month}.", tr: "{target} hedefine {month} itibarıyla ulaşırsınız." }),
              short: t({ en: "You end up {short} short of {target}.", tr: "{target} hedefinin {short} gerisinde kalırsınız." }),
              needed: t({ en: "{amount} a month would get you there.", tr: "Ayda {amount} sizi hedefe ulaştırır." }),
              chartTitle: t({ en: "Pot balance by month", tr: "Aylara göre kumbara bakiyesi" }),
              result: t({ en: "Projection", tr: "Öngörü" }),
              fineprint: t({
                en: `Illustration only, not an offer. Assumes ${f.percent(RATE.grossYearly)} a year gross, ${f.percent(RATE.withholding)} withholding tax and an unchanged rate; first deposit December 2026. Rates can change.`,
                tr: `Yalnızca örnektir, teklif değildir. Yıllık brüt ${f.percent(RATE.grossYearly)}, ${f.percent(RATE.withholding)} stopaj ve değişmeyen bir oran varsayılmıştır; ilk yatırım Aralık 2026. Oranlar değişebilir.`,
              }),
            }}
          />
        </Container>
      </Section>

      <StatsBand
        {...common}
        variant="ledger"
        anchor="figures"
        eyebrow={t({ en: "In figures", tr: "Rakamlarla" })}
        title={t({ en: "Quietly, at scale", tr: "Sessizce, büyük ölçekte" })}
        items={stats.map((s) => ({ value: s.value, unit: s.unit ? t(s.unit) : undefined, label: t(s.label), source: t({ en: "Company data, October 2026", tr: "Şirket verisi, Ekim 2026" }) }))}
      />

      <Testimonials
        {...common}
        variant="feature"
        items={[{ quote: t(quote.text), author: quote.author, role: t(quote.role) }]}
      />

      <Faq
        {...common}
        variant="split"
        anchor="faq"
        eyebrow={t({ en: "Questions", tr: "Sorular" })}
        title={t({ en: "Before you move your salary", tr: "Maaşınızı taşımadan önce" })}
        items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        contact={{ link: { href: `mailto:help@example.com`, label: t({ en: "Ask a person", tr: "Bir kişiye sorun" }) }, style: "secondary" }}
      />

      <Cta
        {...common}
        variant="band"
        theme={{ surface: "accent" }}
        title={t({ en: "Open an account in about six minutes", tr: "Yaklaşık altı dakikada hesap açın" })}
        lead={t({ en: "Free on Essential. Your ID, your phone and a short video check.", tr: "Temel planda ücretsiz. Kimliğiniz, telefonunuz ve kısa bir görüntülü doğrulama." })}
        actions={[
          { link: { href: SIGNUP_HREF, label: open }, style: "primary" },
          { link: { href: PRICING_HREF, label: t({ en: "Compare plans", tr: "Planları karşılaştırın" }) }, style: "secondary" },
        ]}
        fineprint={t({ en: "Fernway is a fictional brand used to demonstrate this template.", tr: "Fernway, bu şablonu göstermek için kullanılan kurgusal bir markadır." })}
      />
    </>
  );
}
