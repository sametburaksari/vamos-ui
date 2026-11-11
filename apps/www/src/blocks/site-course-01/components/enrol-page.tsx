import { BlockImage, Container, PageIntro, Section, SectionHeader, Steps, Team, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, photos, type SiteLocale } from "./content";
import { EnrolForm } from "./enrol-form";

/** Instructor + enrol: Nora's story, the mentors, how enrolment works, and the enrol form. */
export function EnrolPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, img, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <>
      <PageIntro
        {...common}
        variant="simple"
        breadcrumb={[{ label: "Atlas Academy", href: sitePageHref("home") }, { label: t({ en: "Instructor & enrol", tr: "Eğitmen ve kayıt" }) }]}
        eyebrow={t({ en: "Instructor & enrol", tr: "Eğitmen ve kayıt" })}
        title={t({ en: "Learn from someone who still *does* the work", tr: "İşi hâlâ *yapan* birinden öğrenin" })}
      />

      <Section headingId="nora-title" theme={{ rhythm: "tight" }}>
        <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-start">
          <BlockImage {...img(photos.instructor)} aspect="4:5" sizes="(min-width: 64rem) 30vw, 100vw" className="rounded-ui @4xl:col-span-4" />
          <div className="flex flex-col gap-6 @4xl:col-span-7 @4xl:col-start-6">
            <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-accent-ink">{t({ en: "Lead instructor", tr: "Baş eğitmen" })}</p>
            <h2 id="nora-title" className="font-display text-display-m">
              Nora Aksoy
            </h2>
            <div className="flex flex-col gap-4 text-lead text-fg-muted text-pretty">
              <p>
                {t({
                  en: "Nora started as a dispatcher at a regional courier and learned SQL to find out why Thursdays went wrong. Eleven years later she ran a team of six analysts there and had a rule: no dashboard without a decision attached to it.",
                  tr: "Nora bölgesel bir kurye firmasında sevk sorumlusu olarak başladı ve perşembelerin neden kötü gittiğini anlamak için SQL öğrendi. On bir yıl sonra orada altı analistlik bir ekibi yönetiyordu ve bir kuralı vardı: arkasında bir karar olmayan panel yok.",
                })}
              </p>
              <p>
                {t({
                  en: "She designed this course around the questions her own team was hired to answer, and she still teaches every live session.",
                  tr: "Bu kursu kendi ekibinin yanıtlamak için işe alındığı sorular üzerine kurdu ve hâlâ her canlı dersi kendisi veriyor.",
                })}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 @2xl:grid-cols-4">
              {[
                { k: t({ en: "In analytics", tr: "Analitikte" }), v: t({ en: "11 years", tr: "11 yıl" }) },
                { k: t({ en: "Students", tr: "Öğrenci" }), v: "312" },
                { k: t({ en: "Finish rate", tr: "Bitirme oranı" }), v: "87%" },
                { k: t({ en: "Capstones read", tr: "Okunan proje" }), v: "271" },
              ].map((row) => (
                <div key={row.k} className="flex flex-col gap-1">
                  <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{row.k}</dt>
                  <dd className="font-display text-[1.75rem] leading-none tabular text-fg">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      <Team
        {...common}
        variant="list"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Mentors", tr: "Mentorlar" })}
        title={t({ en: "Two mentors per *cohort*", tr: "Her dönemde iki *mentor*" })}
        members={[
          { name: "Emre Sayın", role: t({ en: "Mentor, SQL and pipelines", tr: "Mentor, SQL ve veri akışları" }), specialty: t({ en: "Seven years in retail analytics · reviews modules 3–5", tr: "Perakende analitiğinde yedi yıl · 3–5. modülleri değerlendirir" }), photo: img(photos.emre) },
          { name: "Ama Boateng", role: t({ en: "Mentor, statistics and charts", tr: "Mentor, istatistik ve grafikler" }), specialty: t({ en: "Former public-health statistician · reviews modules 6–8", tr: "Eski halk sağlığı istatistikçisi · 6–8. modülleri değerlendirir" }), photo: img(photos.ama) },
        ]}
      />

      <Steps
        {...common}
        variant="horizontal"
        eyebrow={t({ en: "How enrolment works", tr: "Kayıt nasıl işler" })}
        title={t({ en: "From this form to *week one*", tr: "Bu formdan *ilk haftaya*" })}
        steps={[
          { title: t({ en: "Hold a seat", tr: "Yer ayırın" }), text: t({ en: "The form below holds it for 48 hours. Nothing is charged.", tr: "Aşağıdaki form 48 saat boyunca yerinizi tutar. Ücret alınmaz." }), duration: t({ en: "2 min", tr: "2 dk" }) },
          { title: t({ en: "A call with Nora", tr: "Nora ile görüşme" }), text: t({ en: "We check the course fits what you want to answer.", tr: "Kursun yanıtlamak istedikleriniz için uygun olduğunu kontrol ederiz." }), duration: t({ en: "20 min", tr: "20 dk" }) },
          { title: t({ en: "Pay or invoice", tr: "Ödeme ya da fatura" }), text: t({ en: "Card, bank transfer or an invoice to your employer.", tr: "Kart, havale ya da işvereninize fatura." }), duration: t({ en: "1 day", tr: "1 gün" }) },
          { title: t({ en: "Setup week", tr: "Hazırlık haftası" }), text: t({ en: "Tools, a practice dataset and your cohort’s chat.", tr: "Araçlar, bir alıştırma veri seti ve döneminizin sohbet grubu." }), duration: t({ en: "Week 0", tr: "0. hafta" }) },
        ]}
      />

      <Section anchor="enrol" headingId="enrol-form-title" theme={{ surface: "surface-2" }}>
        <Container className="grid gap-x-(--gutter) gap-y-10 @5xl:grid-cols-12">
          <div className="@5xl:col-span-4">
            <SectionHeader {...common} headingId="enrol-form-title" eyebrow={t({ en: "Enrol", tr: "Kayıt" })} title={t({ en: "Hold your *seat*", tr: "Yerinizi *ayırın*" })} lead={t({ en: "Questions first? Call +90 216 000 00 00 on weekdays, 10:00–18:00.", tr: "Önce sorularınız mı var? Hafta içi 10:00–18:00 arası +90 216 000 00 00’ı arayın." })} />
          </div>
          <div className="@5xl:col-span-8">
            <EnrolForm locale={locale} />
          </div>
        </Container>
      </Section>
    </>
  );
}
