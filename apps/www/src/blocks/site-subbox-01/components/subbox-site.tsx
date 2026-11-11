import { Button } from "@vamos-ui/react";
import { BlockHeading, BlockImage, Container, Cta, Faq, Footer, Navbar, PageIntro, Section, SectionHeader, SiteShellPage, Steps, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { BOX_NUMBER, coffees, copyFor, EMAIL, faq, nextShipDate, PHONE, photos, priceFor, reviews, roasters, TODAY, type Copy, type SiteLocale } from "./content";
import { GiftForm } from "./gift-form";
import { HomePicker } from "./home-picker";
import { PlanBuilder } from "./plan-builder";

const home = (anchor?: string) => sitePageHref("home", anchor);
const plans = sitePageHref("plans");
const gift = sitePageHref("gift");

/** Five-step scale as filled and hollow beans. */
function Scale({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
      <dt className="font-mono text-[10px] tracking-[0.08em] text-fg-muted uppercase">{label}</dt>
      <dd className="flex gap-1">
        <span className="sr-only">{value} / 5</span>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} aria-hidden className={i < value ? "h-2.5 w-4 rounded-[50%] bg-accent" : "h-2.5 w-4 rounded-[50%] border border-line"} />
        ))}
      </dd>
    </div>
  );
}

/** The tasting card that comes in every box: origin, process, altitude, notes and three scales. */
function TastingCard({ c, coffee, index }: { c: Copy; coffee: (typeof coffees)[number]; index: number }) {
  const { t } = c;
  return (
    <article className="flex flex-col gap-4 bg-surface p-5 sm:p-6">
      <header className="flex items-baseline justify-between gap-3 border-b border-dashed border-fg/30 pb-3">
        <span className="font-mono text-[10px] tracking-[0.12em] text-fg-muted uppercase">
          {t({ en: "Bag", tr: "Paket" })} {String.fromCharCode(65 + index)} · {coffee.roaster}
        </span>
      </header>
      <div>
        <h3 className="font-display text-[1.7rem] leading-[1.05] text-fg">{coffee.name}</h3>
        <p className="mt-1 text-small text-fg-muted">
          {t(coffee.origin)} · {t(coffee.process)} · {coffee.altitude}
        </p>
      </div>
      <p className="font-display text-lg text-accent-ink italic">{coffee.notes.map((n) => t(n)).join(" · ")}</p>
      <dl className="flex flex-col gap-1.5">
        <Scale label={t({ en: "Sweet", tr: "Tatlılık" })} value={coffee.scores.sweet} />
        <Scale label={t({ en: "Acidity", tr: "Asidite" })} value={coffee.scores.acid} />
        <Scale label={t({ en: "Body", tr: "Gövde" })} value={coffee.scores.body} />
      </dl>
    </article>
  );
}

/**
 * One language version of Brewcraft Box: home (box-number hero, this month's tasting cards, the
 * size × frequency grid, how it works, roasters, reviews, FAQ, gift band), plans (the full
 * builder) and gift. Server component; the grid, builder and gift form are client islands that
 * share the plan through the provider in page.tsx.
 */
export function SubboxSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, tl, intl, labels } = c;
  const common = { locale: intl, labels };
  const ship = nextShipDate(TODAY);
  const from = priceFor("single", "weekly");

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-baseline gap-2">
            <span className="font-display text-[1.35rem] leading-none tracking-[-0.01em]">Brewcraft</span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-fg-muted uppercase">Box Nº {BOX_NUMBER}</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "This month", tr: "Bu ay" }), href: home("this-month") },
          { label: t({ en: "Plans", tr: "Planlar" }), href: plans },
          { label: t({ en: "Roasters", tr: "Kavurucular" }), href: home("roasters") },
          { label: t({ en: "Gift", tr: "Hediye" }), href: gift },
          { label: "FAQ", href: home("faq") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: plans, label: t({ en: "Build your box", tr: "Kutunu oluştur" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Brewcraft Box — specialty coffee by subscription", tr: "Brewcraft Box — abonelikle nitelikli kahve" })}>
          <Section anchor="top" className="overflow-hidden">
            <Container>
              <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-16">
                <div>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">
                    <span className="rounded-full border border-fg/60 px-2.5 py-1 text-fg">Box Nº {BOX_NUMBER}</span>
                    <span>{f.date(TODAY, { month: "long", year: "numeric" })}</span>
                  </p>
                  <BlockHeading level={1} size="display-xl" className="mt-6 max-w-[13ch]" text={t({ en: "Roasted on Tuesday, *in your cup* by Thursday.", tr: "Salı kavrulur, perşembe *fincanınızda*." })} />
                  <p className="mt-7 max-w-[46ch] text-lead text-fg-muted">
                    {t({
                      en: "Each box brings two coffees from small Turkish roasters, a tasting card and the roast date on every bag. Pick a size and a rhythm; skip or pause whenever you like.",
                      tr: "Her kutuda Türkiye’nin küçük kavurucularından iki kahve, bir tadım kartı ve her pakette kavrum tarihi var. Bir boyut ve sıklık seçin; istediğiniz zaman atlayın ya da duraklatın.",
                    })}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Button asChild variant="primary" size="xl">
                      <a href={plans}>
                        {t({ en: "Build your box", tr: "Kutunu oluştur" })}
                        <ArrowRight aria-hidden className="rtl:rotate-180" />
                      </a>
                    </Button>
                    <p className="text-small text-fg-muted">
                      {t({ en: `From ${tl(from)} a box · next roast ${f.date(ship, { day: "numeric", month: "long" })}`, tr: `Kutu başına ${tl(from)}’dan · sonraki kavrum ${f.date(ship, { day: "numeric", month: "long" })}` })}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <BlockImage {...photos.pour} alt={t(photos.pour.alt)} aspect="4:5" priority sizes="(min-width: 1024px) 40vw, 100vw" className="rounded-ui-lg" />
                  <div className="relative -mt-20 ms-6 me-0 max-w-[19rem] rounded-ui border border-fg/70 bg-surface p-4 shadow-[0_20px_40px_-28px_var(--fg)] sm:ms-auto sm:-me-4 lg:absolute lg:-start-12 lg:bottom-10 lg:m-0">
                    <p className="font-mono text-[10px] tracking-[0.12em] text-fg-muted uppercase">{t({ en: "In this box", tr: "Bu kutuda" })}</p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {coffees.map((cf, i) => (
                        <li key={cf.name} className="flex items-baseline gap-3">
                          <span className="font-mono text-xs text-accent-ink">{String.fromCharCode(65 + i)}</span>
                          <span>
                            <span className="block font-display text-[1.1rem] leading-tight text-fg">{cf.name}</span>
                            <span className="block text-xs text-fg-muted">{t(cf.origin)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          <Section anchor="this-month" headingId="bx-month-title" theme={{ surface: "surface-2" }}>
            <Container>
              <SectionHeader headingId="bx-month-title" align="split" eyebrow={t({ en: `Box Nº ${BOX_NUMBER} · tasting cards`, tr: `Kutu Nº ${BOX_NUMBER} · tadım kartları` })} title={t({ en: "One bright, one *round*", tr: "Biri canlı, biri *yuvarlak*" })} lead={t({ en: "Every box pairs two coffees that disagree a little, so you learn what you like. Roaster’s-pick subscribers get both.", tr: "Her kutu biraz ayrışan iki kahveyi eşleştirir; böylece neyi sevdiğinizi öğrenirsiniz. Kavurucunun seçimi abonelerine ikisi de gelir." })} />
              <div className="mt-12 grid gap-px overflow-hidden rounded-ui-lg border border-fg/70 bg-fg/70 md:grid-cols-2">
                {coffees.map((cf, i) => (
                  <TastingCard key={cf.name} c={c} coffee={cf} index={i} />
                ))}
              </div>
            </Container>
          </Section>

          <Section anchor="plans" headingId="bx-plans-title">
            <Container>
              <SectionHeader headingId="bx-plans-title" align="split" eyebrow={t({ en: "Plans", tr: "Planlar" })} title={t({ en: "Nine plans, *one* grid", tr: "Dokuz plan, *tek* tablo" })} lead={t({ en: "Pick a size on the left and how often on top. The more often it comes, the less each bag costs. Delivery is always included.", tr: "Soldan boyutu, üstten sıklığı seçin. Ne kadar sık gelirse paket o kadar ucuzlar. Teslimat her zaman dahil." })} />
              <div className="mt-10">
                <HomePicker locale={locale} />
              </div>
            </Container>
          </Section>

          <Steps
            {...common}
            anchor="how"
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "How it works", tr: "Nasıl çalışır" })}
            title={t({ en: "A week in the *life* of a bag", tr: "Bir paketin *haftası*" })}
            steps={[
              { title: t({ en: "Monday 23:59 — cut-off", tr: "Pazartesi 23.59 — son saat" }), text: t({ en: "Change, skip or pause next week’s box until midnight.", tr: "Gelecek haftanın kutusunu gece yarısına kadar değiştirin, atlayın ya da duraklatın." }), duration: t({ en: "Mon", tr: "Pzt" }) },
              { title: t({ en: "Tuesday — roast", tr: "Salı — kavrum" }), text: t({ en: "Our roasters roast to the exact number of bags ordered. Nothing sits on a shelf.", tr: "Kavurucularımız tam sipariş edilen paket sayısı kadar kavurur. Rafta bekleyen yok." }), duration: t({ en: "Tue", tr: "Sal" }) },
              { title: t({ en: "Wednesday — pack and ship", tr: "Çarşamba — paketle ve gönder" }), text: t({ en: "Ground to order if you asked for it, sealed with a one-way valve, handed to the courier by 16:00.", tr: "İstediyseniz siparişe göre öğütülür, tek yönlü valfle kapatılır, 16.00’ya kadar kargoya verilir." }), duration: t({ en: "Wed", tr: "Çar" }) },
              { title: t({ en: "Thursday — at your door", tr: "Perşembe — kapınızda" }), text: t({ en: "Istanbul, Izmir and Ankara on Thursday; the rest of Türkiye by Friday. It fits a letterbox.", tr: "İstanbul, İzmir ve Ankara perşembe; Türkiye’nin geri kalanı cuma. Posta kutusuna sığar." }), duration: t({ en: "Thu", tr: "Per" }) },
            ]}
          />

          <Section anchor="roasters" headingId="bx-roasters-title">
            <Container>
              <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                <div>
                  <BlockHeading id="bx-roasters-title" size="display-m" text={t({ en: "Four roasters, *no* warehouse", tr: "Dört kavurucu, *depo* yok" })} />
                  <p className="mt-5 max-w-[44ch] text-body text-fg-muted">{t({ en: "We pay roasters per bag before they roast, and print their name on the label — not ours.", tr: "Kavuruculara kavurmadan önce paket başına öderiz ve etikete bizim değil, onların adını basarız." })}</p>
                  <BlockImage {...photos.roaster} alt={t(photos.roaster.alt)} aspect="4:3" className="mt-8 rounded-ui-lg" sizes="(min-width: 1024px) 35vw, 100vw" />
                </div>
                <ol className="border-t border-fg/70">
                  {roasters.map((r, i) => (
                    <li key={r.name} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-line py-6 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto]">
                      <span className="font-mono text-xs text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-display text-[1.5rem] leading-tight text-fg">{r.name}</h3>
                        <p className="mt-1 text-small text-fg-muted">{t(r.note)}</p>
                      </div>
                      <p className="col-start-2 font-mono text-[11px] text-fg-muted sm:col-start-3 sm:text-end">
                        {t(r.place)}
                        <br />
                        {t({ en: "since", tr: "kuruluş" })} {r.since}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </Container>
          </Section>

          <Testimonials {...common} variant="wall" theme={{ surface: "surface-2" }} title={t({ en: "From *subscribers*", tr: "*Abonelerden*" })} items={reviews.map((r) => ({ quote: t(r.quote), author: r.author, role: t(r.place) }))} />

          <Faq {...common} anchor="faq" variant="split" eyebrow="FAQ" title={t({ en: "Before the *first* box", tr: "İlk *kutudan* önce" })} items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))} deepLink={false} />

          <Cta
            {...common}
            variant="band"
            theme={{ surface: "accent" }}
            title={t({ en: "Give three months of *good* mornings", tr: "Üç ay *güzel* sabah hediye edin" })}
            lead={t({ en: "A printed card in the first box, no subscription for them to manage.", tr: "İlk kutuda basılı bir kart; yönetecekleri bir abonelik yok." })}
            actions={[{ link: { href: gift, label: t({ en: "Send a gift box", tr: "Hediye kutusu gönder" }) }, style: "primary" }]}
          />
        </SiteShellPage>

        <SiteShellPage id="plans" title={t({ en: "Plans — Brewcraft Box", tr: "Planlar — Brewcraft Box" })}>
          <PageIntro
            {...common}
            variant="simple"
            breadcrumb={[{ label: "Brewcraft", href: home() }, { label: t({ en: "Plans", tr: "Planlar" }) }]}
            title={t({ en: "Build your *box*", tr: "Kutunu *oluştur*" })}
            lead={t({ en: "Three choices, a price that changes as you go, and the next four shipping days. No account until you check out.", tr: "Üç seçim, siz seçtikçe değişen fiyat ve sonraki dört kargo günü. Ödeme adımına kadar hesap yok." })}
          />
          <Section theme={{ rhythm: "tight" }} className="pt-0!">
            <Container>
              <PlanBuilder locale={locale} />
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="gift" title={t({ en: "Gift a box — Brewcraft Box", tr: "Hediye kutu — Brewcraft Box" })}>
          <PageIntro
            {...common}
            variant="simple"
            breadcrumb={[{ label: "Brewcraft", href: home() }, { label: t({ en: "Gift", tr: "Hediye" }) }]}
            title={t({ en: "Gift a *subscription*", tr: "Abonelik *hediye edin*" })}
            lead={t({ en: "Paid once, delivered every four weeks. They never see a price or a renewal.", tr: "Bir kez ödenir, dört haftada bir teslim edilir. Hiçbir fiyat ya da yenileme görmezler." })}
          />
          <Section theme={{ rhythm: "tight" }} className="pt-0!">
            <Container>
              <GiftForm locale={locale} />
            </Container>
          </Section>
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Brewcraft", href: home() }}
        about={t({ en: "Specialty coffee from small Turkish roasters, by subscription. Roasted Tuesday, shipped Wednesday.", tr: "Türkiye’nin küçük kavurucularından abonelikle nitelikli kahve. Salı kavrulur, çarşamba gönderilir." })}
        columns={[
          { title: t({ en: "Coffee", tr: "Kahve" }), links: [{ href: home("this-month"), label: t({ en: "This month", tr: "Bu ay" }) }, { href: plans, label: t({ en: "Plans", tr: "Planlar" }) }, { href: gift, label: t({ en: "Gift", tr: "Hediye" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: home("faq"), label: "FAQ" }, { href: "/account", label: t({ en: "Skip or pause", tr: "Atla ya da duraklat" }) }, { href: "/shipping", label: t({ en: "Delivery", tr: "Teslimat" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE, address: t({ en: "Kuzguncuk Mh., Üsküdar, Istanbul", tr: "Kuzguncuk Mh., Üsküdar, İstanbul" }) }}
        social={[{ network: "instagram", href: "https://instagram.com/brewcraft.example" }]}
        legalLinks={[{ href: "/terms", label: t({ en: "Subscription terms", tr: "Abonelik koşulları" }) }, { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/distance-sales", label: t({ en: "Distance sales contract", tr: "Mesafeli satış sözleşmesi" }) }]}
        year={2026}
      />
    </>
  );
}
