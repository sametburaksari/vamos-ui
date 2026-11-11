import { Badge, Card, Sparkline } from "@vamos-ui/react";
import { BlockHeading, BlockLink, Container, Faq, MediaText, PricingTable, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { CohortDates } from "./cohort-dates";
import { cohorts, copyFor, photos, PRICES, projects, totals, type SiteLocale } from "./content";
import { LessonMap } from "./lesson-map";

const enrol = sitePageHref("enrol");
const curriculum = sitePageHref("curriculum");

/** The query cell in the hero: what a week-four student writes, with its result. Plain JSX. */
function QueryCell({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const rows = [
    ["Kartal", "2", 41.6],
    ["Ümraniye", "2", 28.3],
    ["Kartal", "1", 9.4],
  ] as const;
  return (
    <figure className="flex flex-col overflow-hidden rounded-ui-lg border border-line bg-surface-2 font-mono text-[12.5px] leading-relaxed">
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] text-fg-muted">
        <span>thursday_delays.sql</span>
        <span className="text-accent-ink">{t({ en: "Week 4 · Lab", tr: "4. hafta · Uygulama" })}</span>
      </figcaption>
      <div className="grid grid-cols-[3.25rem_1fr] gap-x-3 px-4 py-4">
        <span className="text-fg-muted">In [12]</span>
        <pre className="whitespace-pre-wrap break-words text-fg">
          <span className="text-accent-ink">SELECT</span> depot, shift,{"\n"}
          {"  "}
          <span className="text-accent-ink">ROUND</span>(<span className="text-accent-ink">AVG</span>(minutes_late), 1) <span className="text-accent-ink">AS</span> late{"\n"}
          <span className="text-accent-ink">FROM</span> deliveries{"\n"}
          <span className="text-accent-ink">WHERE</span> weekday = <span className="text-fg-muted">&apos;Thu&apos;</span>{"\n"}
          <span className="text-accent-ink">GROUP BY</span> 1, 2 <span className="text-accent-ink">ORDER BY</span> late <span className="text-accent-ink">DESC</span>;
        </pre>
      </div>
      <div className="grid grid-cols-[3.25rem_1fr] gap-x-3 border-t border-line px-4 py-4">
        <span className="text-fg-muted">Out</span>
        <table className="w-full max-w-[20rem] text-start tabular">
          <thead className="text-fg-muted">
            <tr>
              <th className="pb-1 text-start font-normal">depot</th>
              <th className="pb-1 text-start font-normal">shift</th>
              <th className="pb-1 text-end font-normal">late</th>
            </tr>
          </thead>
          <tbody className="text-fg">
            {rows.map(([depot, shift, late], i) => (
              <tr key={i} className={i === 0 ? "text-accent-ink" : undefined}>
                <td>{depot}</td>
                <td>{shift}</td>
                <td className="text-end">{f.number(late, { minimumFractionDigits: 1 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 border-t border-line px-4 py-3 text-fg-muted">
        <Sparkline values={projects[0]!.series} variant="bars" size="sm" color="currentColor" className="text-accent-ink" label={t({ en: "Late deliveries per week, last 12 weeks", tr: "Son 12 haftada haftalık geciken teslimatlar" })} />
        <span className="text-[11px] leading-snug">{t({ en: "One depot, one shift. That is the whole finding.", tr: "Tek depo, tek vardiya. Bulgunun tamamı bu." })}</span>
      </div>
    </figure>
  );
}

/**
 * The course home: outcome-first hero in ink, who it is for, the lesson map, student projects,
 * the instructor, cohort dates, pricing and FAQ.
 */
export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, img, labels, money, currency } = copyFor(locale);
  const common = { locale: intl, labels };
  const next = cohorts[0]!;
  const left = next.seats - next.taken;

  return (
    <>
      {/* Hero: ink section regardless of the page theme. */}
      <Section theme={{ mode: "dark", surface: "scene" }} headingId="hero-title" className="border-b border-line">
        <Container className="grid gap-x-(--gutter) gap-y-12 @5xl:grid-cols-12 @5xl:items-center">
          <div className="flex flex-col gap-7 @5xl:col-span-7">
            <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">
              Atlas Academy <span className="text-accent-ink">/</span> {t({ en: "Data analysis, part-time", tr: "Veri analizi, yarı zamanlı" })}
            </p>
            <BlockHeading id="hero-title" level={1} size="display-xl" text={t({ en: "Answer real business questions with *data*, in twelve weeks.", tr: "Gerçek iş sorularını on iki haftada *veriyle* yanıtlayın." })} className="max-w-[16ch]" />
            <p className="max-w-[46ch] text-lead text-fg-muted text-pretty">
              {t({
                en: "SQL, spreadsheets, pandas and honest statistics, taught through one messy dataset a week. You finish with a capstone you can show in an interview.",
                tr: "SQL, tablolar, pandas ve dürüst istatistik; her hafta dağınık bir veri setiyle. Bir mülakatta gösterebileceğiniz bir bitirme projesiyle bitirirsiniz.",
              })}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <BlockLink href={enrol} appearance="primary" {...common}>
                {t({ en: "Hold a seat in the winter cohort", tr: "Kış döneminde yer ayırın" })}
              </BlockLink>
              <BlockLink href={curriculum} appearance="secondary" {...common}>
                {t({ en: "See all 33 lessons", tr: "33 dersin tamamını görün" })}
              </BlockLink>
            </div>
            <dl className="grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { k: t({ en: "Starts", tr: "Başlangıç" }), v: f.date(next.start, { day: "numeric", month: "short" }) },
                { k: t({ en: "Seats left", tr: "Kalan yer" }), v: `${left} / ${next.seats}` },
                { k: t({ en: "Per week", tr: "Haftalık" }), v: t({ en: "6 h", tr: "6 sa" }) },
              ].map((row) => (
                <div key={row.k} className="flex flex-col gap-1">
                  <dt className="font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">{row.k}</dt>
                  <dd className="font-display text-[1.75rem] leading-none tabular text-fg">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="@5xl:col-span-5">
            <QueryCell locale={locale} />
          </div>
        </Container>
      </Section>

      {/* Who it is for */}
      <Section headingId="fit-title">
        <Container className="flex flex-col gap-12">
          <SectionHeader {...common} headingId="fit-title" eyebrow={t({ en: "Who it’s for", tr: "Kimler için" })} title={t({ en: "For people who already have the *questions*", tr: "*Soruları* zaten olanlar için" })} lead={t({ en: "Most of our students work next to data, not in it: operations, support, marketing, public services.", tr: "Öğrencilerimizin çoğu verinin içinde değil yanında çalışıyor: operasyon, destek, pazarlama, kamu hizmetleri." })} />
          <div className="grid gap-x-(--gutter) gap-y-10 @3xl:grid-cols-2">
            {[
              {
                title: t({ en: "It’s for you if", tr: "Sizin içinse" }),
                tone: "yes" as const,
                items: [
                  t({ en: "you export spreadsheets every week and wish they answered themselves", tr: "her hafta tablo dışa aktarıyor ve kendiliğinden yanıt vermelerini diliyorsanız" }),
                  t({ en: "your team asks “is this working?” and nobody can say", tr: "ekibiniz “bu işe yarıyor mu?” diye soruyor ve kimse yanıt veremiyorsa" }),
                  t({ en: "you can give six focused hours a week for twelve weeks", tr: "on iki hafta boyunca haftada altı odaklı saat ayırabiliyorsanız" }),
                ],
              },
              {
                title: t({ en: "It’s not for you if", tr: "Sizin için değilse" }),
                tone: "no" as const,
                items: [
                  t({ en: "you want machine learning or AI engineering; we stop at statistics", tr: "makine öğrenmesi ya da yapay zekâ mühendisliği istiyorsanız; biz istatistikte duruyoruz" }),
                  t({ en: "you already write window functions for fun", tr: "pencere fonksiyonlarını zaten eğlence için yazıyorsanız" }),
                  t({ en: "you need a certificate more than a portfolio", tr: "portfolyodan çok sertifikaya ihtiyacınız varsa" }),
                ],
              },
            ].map((col) => (
              <div key={col.tone} className="flex flex-col">
                <h3 className="border-b-2 border-fg pb-3 font-display text-h3">{col.title}</h3>
                <ul className="flex flex-col">
                  {col.items.map((item, i) => (
                    <li key={i} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-4 text-body text-fg">
                      <span aria-hidden className={`font-mono text-small ${col.tone === "yes" ? "text-accent-ink" : "text-fg-muted"}`}>
                        {col.tone === "yes" ? "+" : "−"}
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-pretty">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Signature: the lesson map */}
      <Section anchor="map" headingId="map-title" theme={{ surface: "surface-2" }}>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            {...common}
            headingId="map-title"
            align="split"
            eyebrow={t({ en: "The curriculum, as a map", tr: "Haritada müfredat" })}
            title={t({ en: "Pick your pace, then *drag* through the weeks", tr: "Hızınızı seçin, haftalar boyunca *ilerleyin*" })}
            lead={t({ en: `${totals.modules} modules, ${totals.lessons} lessons, ${totals.labs} labs. Every segment is one lesson, sized by its length.`, tr: `${totals.modules} modül, ${totals.lessons} ders, ${totals.labs} uygulama. Her parça bir derstir ve uzunluğuyla orantılıdır.` })}
            actions={
              <BlockLink href={curriculum} appearance="link" {...common}>
                {t({ en: "Lesson-by-lesson curriculum", tr: "Ders ders müfredat" })}
              </BlockLink>
            }
          />
          <LessonMap locale={locale} idPrefix="home-map" />
        </Container>
      </Section>

      {/* Student projects */}
      <Section headingId="projects-title">
        <Container className="flex flex-col gap-12">
          <SectionHeader {...common} headingId="projects-title" eyebrow={t({ en: "Capstones from the autumn cohort", tr: "Sonbahar döneminden bitirme projeleri" })} title={t({ en: "Real data, one *clear* answer", tr: "Gerçek veri, tek *net* yanıt" })} />
          <ul className="grid gap-(--gutter) @3xl:grid-cols-3">
            {projects.map((p, i) => (
              <li key={i}>
                <Card className="flex h-full flex-col gap-5 p-6">
                  <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">
                    <span>{t({ en: `${p.rows} rows`, tr: `${p.rows} satır` })}</span>
                    <Badge tone="outline" shape="square">
                      {p.tools}
                    </Badge>
                  </div>
                  <h3 className="font-display text-h3 text-balance">{t(p.title)}</h3>
                  <Sparkline values={p.series} variant="area" width="100%" height={56} color="currentColor" className="text-accent-ink" label={t({ en: "Weekly trend in the project’s data", tr: "Proje verisindeki haftalık eğilim" })} />
                  <p className="text-small text-fg text-pretty">{t(p.finding)}</p>
                  <p className="mt-auto border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted">{t(p.who)}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <MediaText
        {...common}
        variant="side"
        mediaSide="start"
        aspect="4:5"
        theme={{ surface: "surface-2" }}
        media={img(photos.instructor)}
        eyebrow={t({ en: "Your instructor", tr: "Eğitmeniniz" })}
        title={t({ en: "Nora Aksoy has answered *these* questions for a living", tr: "Nora Aksoy *bu* soruları yıllarca iş olarak yanıtladı" })}
        body={t({
          en: "Eleven years as an analyst, the last five leading analytics at a regional courier with 1,400 drivers. She teaches every live session herself and reads every capstone.",
          tr: "On bir yıl analist, son beşi 1.400 sürücülü bölgesel bir kurye firmasında analitik yöneticisi olarak. Her canlı dersi kendisi veriyor ve her bitirme projesini okuyor.",
        })}
        bullets={[
          t({ en: "312 students across 9 cohorts since 2023", tr: "2023’ten bu yana 9 dönemde 312 öğrenci" }),
          t({ en: "Median reply to questions: 3 hours", tr: "Sorulara ortanca yanıt: 3 saat" }),
          t({ en: "Two mentors per cohort, one per 12 students", tr: "Her dönemde iki mentor, 12 öğrenciye bir" }),
        ]}
        cta={{ link: { href: enrol, label: t({ en: "Meet the team", tr: "Ekiple tanışın" }) }, style: "secondary" }}
      />

      {/* Cohort dates */}
      <Section anchor="dates" headingId="dates-title">
        <Container className="flex flex-col gap-12">
          <SectionHeader {...common} headingId="dates-title" eyebrow={t({ en: "Cohort dates", tr: "Dönem tarihleri" })} title={t({ en: "Three starts in *2027*", tr: "*2027*’de üç başlangıç" })} lead={t({ en: "Twelve weeks each, with live sessions on Tuesday evenings and Saturday mornings.", tr: "Her biri on iki hafta; canlı dersler salı akşamları ve cumartesi sabahları." })} />
          <CohortDates locale={locale} />
        </Container>
      </Section>

      <PricingTable
        {...common}
        anchor="pricing"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Pricing", tr: "Fiyatlar" })}
        title={t({ en: "One price, *everything* included", tr: "Tek fiyat, *her şey* dahil" })}
        lead={t({ en: "No subscription and no upsell. Full refund until the end of week two.", tr: "Abonelik yok, ek satış yok. İkinci haftanın sonuna kadar tam iade." })}
        taxNote={t({ en: "Prices include VAT", tr: "Fiyatlara KDV dahildir" })}
        plans={[
          {
            name: t({ en: "Self-paced", tr: "Kendi hızında" }),
            description: t({ en: "All lessons and labs, at your own speed.", tr: "Tüm dersler ve uygulamalar, kendi hızınızda." }),
            price: { once: money(PRICES.selfPaced) },
            features: [{ text: t({ en: "33 lessons and 8 labs", tr: "33 ders ve 8 uygulama" }) }, { text: t({ en: "Datasets and solutions", tr: "Veri setleri ve çözümler" }) }, { text: t({ en: "Access for 2 years", tr: "2 yıl erişim" }) }, { text: t({ en: "Mentor reviews", tr: "Mentor değerlendirmeleri" }), included: false }],
            cta: { link: { href: enrol, label: t({ en: "Start self-paced", tr: "Kendi hızında başla" }) }, style: "secondary" },
          },
          {
            name: t({ en: "Cohort", tr: "Dönem" }),
            description: t({ en: "Twelve weeks with the group, live.", tr: "On iki hafta, grupla, canlı." }),
            price: { once: money(PRICES.cohort) },
            highlight: t({ en: "Most chosen", tr: "En çok tercih edilen" }),
            features: [{ text: t({ en: "Everything in self-paced", tr: "Kendi hızında paketindeki her şey" }) }, { text: t({ en: "24 live sessions with Nora", tr: "Nora ile 24 canlı ders" }) }, { text: t({ en: "Two mentor reviews", tr: "İki mentor değerlendirmesi" }) }, { text: t({ en: "Capstone feedback and a reference", tr: "Bitirme geri bildirimi ve referans" }) }],
            cta: { link: { href: enrol, label: t({ en: "Hold a seat", tr: "Yer ayırın" }) }, style: "primary" },
          },
          {
            name: t({ en: "Teams", tr: "Ekipler" }),
            description: t({ en: "Five or more people from one employer.", tr: "Aynı işverenden beş veya daha fazla kişi." }),
            custom: t({ en: "From 5 seats", tr: "5 kişiden başlayarak" }),
            features: [{ text: t({ en: "A private cohort on your data", tr: "Kendi verinizle özel dönem" }) }, { text: t({ en: "Invoice and e-invoice", tr: "Fatura ve e-fatura" }) }, { text: t({ en: "Progress report for managers", tr: "Yöneticiler için ilerleme raporu" }) }],
            cta: { link: { href: "/contact?topic=teams", label: t({ en: "Ask about teams", tr: "Ekipler için sorun" }) }, style: "secondary" },
          },
        ]}
        footnote={t({ en: `Or pay in three interest-free monthly instalments of ${f.currency(PRICES.instalment[currency as "USD" | "TRY"])}.`, tr: `Ya da ${f.currency(PRICES.instalment[currency as "USD" | "TRY"])} tutarında üç faizsiz aylık taksitle ödeyin.` })}
      />

      <Faq
        {...common}
        anchor="faq"
        variant="split"
        eyebrow={t({ en: "FAQ", tr: "SSS" })}
        title={t({ en: "Before you *apply*", tr: "Başvurmadan *önce*" })}
        deepLink={false}
        items={[
          { q: t({ en: "Do I need to know how to code?", tr: "Kod bilmem gerekiyor mu?" }), a: t({ en: "No. Week one starts in a spreadsheet; SQL starts in week three and Python in week seven. You need to be comfortable with percentages.", tr: "Hayır. İlk hafta tabloyla başlar; SQL üçüncü, Python yedinci haftada başlar. Yüzdelerle rahat olmanız yeterli." }) },
          { q: t({ en: "What if I miss a live session?", tr: "Bir canlı dersi kaçırırsam?" }), a: t({ en: "Every session is recorded and posted within two hours. Labs have a seven-day window, so one busy week will not set you back.", tr: "Her oturum kaydedilir ve iki saat içinde yayınlanır. Uygulamaların yedi günlük süresi vardır; yoğun bir hafta sizi geride bırakmaz." }) },
          { q: t({ en: "Which tools do you use?", tr: "Hangi araçları kullanıyorsunuz?" }), a: t({ en: "Google Sheets, PostgreSQL in the browser and Python notebooks. Everything runs online; a laptop from the last six years is enough.", tr: "Google Sheets, tarayıcıda PostgreSQL ve Python defterleri. Her şey çevrim içi çalışır; son altı yılın bir dizüstü bilgisayarı yeterlidir." }) },
          { q: t({ en: "Is there a certificate?", tr: "Sertifika var mı?" }), a: t({ en: "Yes, with your capstone linked from it. Employers have told us the capstone is the part they read.", tr: "Evet, bitirme projeniz bağlantılı olarak. İşverenler bize asıl okudukları kısmın bitirme projesi olduğunu söylüyor." }) },
          { q: t({ en: "Can my employer pay?", tr: "İşverenim ödeyebilir mi?" }), a: t({ en: "Yes. We issue an invoice to your company after your call; for five or more people, see the Teams plan.", tr: "Evet. Görüşmeden sonra şirketinize fatura keseriz; beş veya daha fazla kişi için Ekipler paketine bakın." }) },
        ]}
      />
    </>
  );
}
