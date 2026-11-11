import { Container, Cta, Section, sitePageHref, Team, Testimonials } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";
import { ColourBlock } from "./colour-block";
import { ColourStage } from "./colour-stage";
import { copyFor, projectById, projects, services, type SiteLocale } from "./content";
import { ProjectIndex } from "./project-index";

const eyebrow = "font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted";

/** Home: colour stage, services in oversized type, the work index, colour-block numbers, team, quotes, CTA. */
export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const f = createFormatter(intl, { currency: locale === "tr" ? "TRY" : "USD" });
  const from = (s: (typeof services)[number]) => (locale === "tr" ? f.currency(s.fromTry, "TRY", { maximumFractionDigits: 0 }) : f.currency(s.fromUsd, "USD", { maximumFractionDigits: 0 }));

  const figures = [
    { value: "64", label: { en: "identities shipped", tr: "teslim edilen kimlik" }, colour: projectById("orbit").colour, span: "sm:col-span-2 lg:col-span-3 lg:row-span-2" },
    { value: "11", label: { en: "years in Karaköy", tr: "yıl Karaköy’de" }, colour: projectById("sarnic").colour, span: "lg:col-span-2" },
    { value: "9", label: { en: "people, no account managers", tr: "kişi, müşteri temsilcisi yok" }, colour: projectById("pazar").colour, span: "lg:col-span-1" },
    { value: "83%", label: { en: "of clients come back for a second project", tr: "müşteri ikinci proje için dönüyor" }, colour: projectById("mira").colour, span: "lg:col-span-2" },
    { value: "1", label: { en: "colour per brand, on purpose", tr: "marka başına bilinçli olarak tek renk" }, colour: projectById("defne").colour, span: "lg:col-span-1" },
  ];

  return (
    <>
      <ColourStage />

      {/* Services in oversized type */}
      <Section anchor="services" headingId="tt-services-title">
        <Container size="wide">
          <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <p className={eyebrow}>{t({ en: "What we make", tr: "Ne yapıyoruz" })}</p>
              <h2 id="tt-services-title" className="mt-3 max-w-[14ch] font-display text-display-m text-balance">
                {t({ en: "Six things, done properly", tr: "Altı iş, doğru düzgün" })}
              </h2>
              <p className="mt-4 max-w-[36ch] text-[15px] text-fg-muted">
                {t({ en: "Most projects combine two or three. Prices are where we start; a fixed quote follows a one-hour call.", tr: "Çoğu proje iki üçünü birleştirir. Fiyatlar başlangıç noktamız; bir saatlik görüşmeden sonra sabit teklif gelir." })}
              </p>
            </div>
            <dl className="[container-type:inline-size]">
              {services.map((s) => (
                <div key={s.id} className="grid gap-x-6 gap-y-1 border-b border-line py-4 first:pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] sm:items-end">
                  <dt className="font-display text-[clamp(2.25rem,9cqi,5.5rem)] leading-[0.9] tracking-[-0.05em]">{t(s.name)}</dt>
                  <dd className="text-[13px] text-fg-muted sm:pb-2">
                    {t(s.text)}
                    <span className="mt-1 block font-mono text-[11px] text-fg">
                      {t({ en: "from", tr: "başlangıç" })} {from(s)} · {s.weeks} {t({ en: "weeks", tr: "hafta" })}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      {/* Work index */}
      <Section anchor="work" headingId="tt-work-title" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 id="tt-work-title" className="font-display text-display-l">
              {t({ en: "Work", tr: "İşler" })}
              <sup className="ms-2 align-super font-mono text-[0.25em] tracking-normal text-fg-muted">{String(projects.length).padStart(2, "0")}</sup>
            </h2>
            <p className="max-w-[40ch] text-sm text-fg-muted">{t({ en: "Six recent projects. Hover to see each client’s colour; open one for the full case.", tr: "Altı yeni proje. Her müşterinin rengini görmek için üzerine gelin; tüm vaka için birini açın." })}</p>
          </div>
          <ProjectIndex />
        </Container>
      </Section>

      {/* Numbers as colour blocks */}
      <Section anchor="studio" headingId="tt-studio-title">
        <Container size="wide">
          <h2 id="tt-studio-title" className={eyebrow}>
            {t({ en: "The studio in five numbers", tr: "Beş sayıda stüdyo" })}
          </h2>
          <ul className="mt-6 grid auto-rows-[minmax(10rem,auto)] gap-2 sm:grid-cols-2 lg:grid-cols-6">
            {figures.map((x) => (
              <ColourBlock as="li" key={x.value + x.label.en} colour={x.colour} className={`flex flex-col justify-between rounded-ui p-5 ${x.span}`}>
                <span className="font-display text-[clamp(3.5rem,8vw,9rem)] leading-[0.85] tracking-[-0.06em]">{x.value}</span>
                <span className="mt-4 max-w-[22ch] text-[14px] font-medium">{t(x.label)}</span>
              </ColourBlock>
            ))}
          </ul>
        </Container>
      </Section>

      <Team
        {...common}
        anchor="people"
        variant="list"
        eyebrow={t({ en: "People", tr: "Ekip" })}
        title={t({ en: "The nine who answer your *e-mails*", tr: "E-postalarınızı *yanıtlayan* dokuz kişi" })}
        members={[
          { name: "Nil Karataş", role: t({ en: "Founder, creative director", tr: "Kurucu, kreatif direktör" }), specialty: t({ en: "Identity · Naming", tr: "Kimlik · İsim" }) },
          { name: "Ozan Erdem", role: t({ en: "Partner, strategy", tr: "Ortak, strateji" }), specialty: t({ en: "Positioning · Workshops", tr: "Konumlandırma · Atölyeler" }) },
          { name: "Duru Şahin", role: t({ en: "Type designer", tr: "Yazı karakteri tasarımcısı" }), specialty: t({ en: "Custom type · Lettering", tr: "Özel yazı · Harf çizimi" }) },
          { name: "Kerem Polat", role: t({ en: "Packaging lead", tr: "Ambalaj lideri" }), specialty: t({ en: "Structures · Print production", tr: "Yapı · Baskı üretimi" }) },
          { name: "Asya Güneş", role: t({ en: "Motion designer", tr: "Hareket tasarımcısı" }), specialty: t({ en: "Idents · Systems", tr: "Jenerik · Sistemler" }) },
          { name: "Bora Tunç", role: t({ en: "Developer", tr: "Geliştirici" }), specialty: t({ en: "Websites · Brand tools", tr: "Web siteleri · Marka araçları" }) },
          { name: "Ece Yıldırım", role: t({ en: "Designer", tr: "Tasarımcı" }), specialty: t({ en: "Identity · Signage", tr: "Kimlik · Yönlendirme" }) },
          { name: "Mert Aksoy", role: t({ en: "Writer", tr: "Metin yazarı" }), specialty: t({ en: "Naming · Tone of voice", tr: "İsim · Marka dili" }) },
          { name: "Leyla Demirci", role: t({ en: "Studio manager", tr: "Stüdyo yöneticisi" }), specialty: t({ en: "Schedules · Quotes · Coffee", tr: "Takvim · Teklif · Kahve" }) },
        ]}
      />

      <Testimonials
        {...common}
        variant="carousel"
        eyebrow={t({ en: "Clients", tr: "Müşteriler" })}
        title={t({ en: "What they say a year *later*", tr: "Bir yıl *sonra* ne diyorlar" })}
        items={projects.slice(0, 4).map((p) => ({ quote: t(p.quote.text), author: p.quote.author, role: t(p.quote.role) }))}
      />

      <Cta
        {...common}
        variant="minimal"
        title={t({ en: "Got a brand nobody can *point* at?", tr: "Kimsenin *gösteremediği* bir markanız mı var?" })}
        actions={[{ link: { href: sitePageHref("contact"), label: t({ en: "Start a project", tr: "Proje başlatın" }) }, style: "primary" }]}
        fineprint={t({ en: "We take on four projects at a time. Next opening: January 2027.", tr: "Aynı anda dört proje alıyoruz. Sonraki boşluk: Ocak 2027." })}
      />
    </>
  );
}
