import { Container, PageIntro, Section, Steps, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, courses, levels, programmes, type L, type SiteLocale } from "./content";
import { CourseFinder } from "./course-finder";

const entry: Record<string, L> = {
  ba: { en: "University entrance exam (YKS, quantitative-verbal score) or IB 32+; English B2.", tr: "YKS eşit ağırlık puanı ya da IB 32+; İngilizce B2." },
  ma: { en: "A bachelor’s in planning, architecture, geography or social science; portfolio or writing sample; English C1.", tr: "Planlama, mimarlık, coğrafya ya da sosyal bilimlerde lisans; portfolyo ya da yazı örneği; İngilizce C1." },
  phd: { en: "A master’s degree, a 3,000-word proposal and an interview with the research group.", tr: "Yüksek lisans derecesi, 3.000 kelimelik öneri ve araştırma grubuyla mülakat." },
};
const fee: Record<string, L> = {
  ba: { en: "No tuition for Turkish citizens · ₺96,000 a year for international students", tr: "T.C. vatandaşları için ücretsiz · uluslararası öğrenciler için yıllık 96.000 ₺" },
  ma: { en: "₺38,000 a year · 8 full scholarships", tr: "Yıllık 38.000 ₺ · 8 tam burs" },
  phd: { en: "Fully funded: tuition plus ₺42,000 a month", tr: "Tam burslu: öğrenim ücreti ve aylık 42.000 ₺" },
};

/** Programmes: the three degrees side by side, the course finder, then how to apply. */
export function ProgrammesPage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: t({ en: "Urban Studies", tr: "Kentsel Çalışmalar" }), href: sitePageHref("home") }, { label: t({ en: "Programmes", tr: "Programlar" }) }]}
        eyebrow={t({ en: "Study with us", tr: "Bizimle okuyun" })}
        title={t({ en: "Programmes and *courses*", tr: "Programlar ve *dersler*" })}
        lead={t({ en: `Three degrees and ${courses.length} courses this academic year. Every course is open as an elective to students of other departments when seats are free.`, tr: `Bu akademik yılda üç program ve ${courses.length} ders. Boş kontenjan olduğunda her ders diğer bölümlerin öğrencilerine seçmeli olarak açıktır.` })}
      />

      <Section aria-label={t({ en: "Degree programmes", tr: "Programlar" })} theme={{ rhythm: "tight" }} className="pt-0">
        <Container>
          <div className="grid gap-px overflow-hidden rounded-ui border border-line bg-line @4xl:grid-cols-3">
            {programmes.map((p) => (
              <article key={p.level} id={`prog-${p.level}`} aria-labelledby={`prog-${p.level}-t`} className="scroll-mt-28 bg-surface p-6">
                <p className="m-0 font-mono text-small text-accent-ink">{t(levels[p.level].long)}</p>
                <h2 id={`prog-${p.level}-t`} className="m-0 mt-2 font-display text-h3 leading-snug">
                  {t(p.title)}
                </h2>
                <p className="m-0 mt-2 text-small text-fg-muted">{t(p.text)}</p>
                <dl className="m-0 mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-line pt-4 text-small">
                  <dt className="text-fg-muted">{t({ en: "Length", tr: "Süre" })}</dt>
                  <dd className="m-0">
                    {t(p.years)} · {t({ en: `${p.ects} ECTS`, tr: `${p.ects} AKTS` })}
                  </dd>
                  <dt className="text-fg-muted">{t({ en: "Language", tr: "Dil" })}</dt>
                  <dd className="m-0">{t(p.language)}</dd>
                  <dt className="text-fg-muted">{t({ en: "Entry", tr: "Koşullar" })}</dt>
                  <dd className="m-0">{t(entry[p.level]!)}</dd>
                  <dt className="text-fg-muted">{t({ en: "Fees", tr: "Ücret" })}</dt>
                  <dd className="m-0">{t(fee[p.level]!)}</dd>
                  <dt className="text-fg-muted">{t({ en: "Apply by", tr: "Son başvuru" })}</dt>
                  <dd className="m-0 font-semibold">{f.date(p.deadline, "long")}</dd>
                </dl>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section anchor="finder" aria-labelledby="finder-title">
        <Container>
          <div className="mb-8 grid gap-3 @4xl:grid-cols-12">
            <div className="@4xl:col-span-6">
              <p className="m-0 text-small font-semibold tracking-[0.12em] text-accent-ink uppercase">{t({ en: "Course finder", tr: "Ders bulucu" })}</p>
              <h2 id="finder-title" className="m-0 mt-2 font-display text-display-m">
                {t({ en: "Every course, 2026–27", tr: "Tüm dersler, 2026–27" })}
              </h2>
            </div>
            <p className="m-0 max-w-[46ch] self-end text-fg-muted @4xl:col-span-5 @4xl:col-start-8">
              {t({ en: "Seat numbers update every night during registration (until 18 September and 12 February).", tr: "Kontenjanlar kayıt döneminde her gece güncellenir (18 Eylül ve 12 Şubat’a kadar)." })}
            </p>
          </div>
          <CourseFinder locale={locale} />
        </Container>
      </Section>

      <Steps
        {...common}
        variant="horizontal"
        anchor="apply"
        theme={{ surface: "accent" }}
        eyebrow={t({ en: "How to apply", tr: "Nasıl başvurulur" })}
        title={t({ en: "From application to the first studio", tr: "Başvurudan ilk stüdyoya" })}
        steps={[
          { title: t({ en: "Apply online", tr: "Çevrimiçi başvurun" }), text: t({ en: "Graduate applications open on 1 December at apply.example.com.", tr: "Lisansüstü başvurular 1 Aralık’ta apply.example.com’da açılır." }), duration: t({ en: "From 1 Dec", tr: "1 Aralık’tan" }) },
          { title: t({ en: "Send your portfolio", tr: "Portfolyonuzu gönderin" }), text: t({ en: "Up to 20 pages, or a writing sample of 2,500 words.", tr: "En fazla 20 sayfa ya da 2.500 kelimelik yazı örneği." }), duration: t({ en: "With the form", tr: "Formla birlikte" }) },
          { title: t({ en: "Interview", tr: "Mülakat" }), text: t({ en: "30 minutes with two faculty members, on campus or online.", tr: "İki öğretim üyesiyle 30 dakika, kampüste ya da çevrimiçi." }), duration: t({ en: "Within 3 weeks", tr: "3 hafta içinde" }) },
          { title: t({ en: "Decision", tr: "Sonuç" }), text: t({ en: "By e-mail, with scholarship offers in the same letter.", tr: "E-postayla; burs teklifleri aynı mektupta." }), duration: t({ en: "Mid-May", tr: "Mayıs ortası" }) },
        ]}
      />
    </>
  );
}
