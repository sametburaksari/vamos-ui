import { BlockImage, Container, Cta, Faq, FeatureGrid, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, lawyers, PHONE, practices, type Practice, type SiteLocale } from "./content";

export const practicePage = (id: string) => `practice-${id}`;

/**
 * A practice area: breadcrumb intro with the practice's numeral, the scope as a numbered list,
 * recent matters (anonymised), the partner who runs it, FAQ, the other practices, a CTA band.
 */
export function PracticePage({ practice, locale }: { practice: Practice; locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const head = lawyers.find((l) => l.id === practice.head)!;
  const others = practices.filter((p) => p.id !== practice.id);

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[
          { label: "Ardent & Vale", href: sitePageHref("home") },
          { label: t({ en: "Practice areas", tr: "Çalışma alanları" }), href: sitePageHref("home", "practice") },
          { label: t(practice.title) },
        ]}
        eyebrow={t({ en: `Practice ${practice.no}`, tr: `Çalışma alanı ${practice.no}` })}
        title={t(practice.title)}
        lead={t(practice.lead)}
        meta={[
          { label: t({ en: "Led by", tr: "Sorumlu" }), value: head.name },
          { label: t({ en: "Team", tr: "Ekip" }), value: t({ en: `${practice.facts.team} lawyers · ${practice.facts.languages}`, tr: `${practice.facts.team} avukat · ${practice.facts.languages}` }) },
          { label: t({ en: "Typical timeline", tr: "Olağan süre" }), value: t(practice.facts.typical) },
        ]}
      />

      <FeatureGrid
        {...common}
        variant="list"
        numbered
        eyebrow={t({ en: "Scope", tr: "Kapsam" })}
        title={t({ en: "What we *do*", tr: "Neler *yapıyoruz*" })}
        items={practice.scope.map((s) => ({ title: t(s.title), text: t(s.text) }))}
      />

      <Section theme={{ surface: "surface" }} aria-labelledby={`lv-matters-${practice.id}`}>
        <Container className="grid gap-10 @4xl:grid-cols-12">
          <div className="@4xl:col-span-7">
            <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-accent-ink">{t({ en: "Recent matters", tr: "Son dosyalar" })}</p>
            <h2 id={`lv-matters-${practice.id}`} className="mt-3 font-display text-display-m">
              {t({ en: "Work we can talk about", tr: "Anlatabildiğimiz işler" })}
            </h2>
            <ol className="mt-8 flex flex-col">
              {practice.matters.map((m) => (
                <li key={m.text.en} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-5 gap-y-1 border-t border-line py-5">
                  <span className="font-mono text-small tabular-nums text-fg-muted">{m.year}</span>
                  <span className="text-pretty">{t(m.text)}</span>
                  {m.value ? <span className="col-start-2 font-display text-h3 text-accent-ink">{t(m.value)}</span> : null}
                </li>
              ))}
            </ol>
            <p className="mt-2 text-[0.8125rem] text-fg-muted">
              {t({ en: "Client names are shared only with their consent.", tr: "Müvekkil adları yalnızca onayları ile paylaşılır." })}
            </p>
          </div>
          <aside aria-label={t({ en: "Partner in charge", tr: "Sorumlu ortak" })} className="@4xl:col-span-4 @4xl:col-start-9">
            {head.photo ? <BlockImage {...head.photo} alt={head.name} aspect="4:5" className="rounded-[2px]" sizes="(min-width: 64rem) 22rem, 100vw" /> : null}
            <p className="mt-4 font-display text-[1.5rem] leading-tight">{head.name}</p>
            <p className="text-small text-fg-muted">{t(head.role)}</p>
            <p className="mt-2 text-[0.8125rem] text-fg-muted">{t(head.admissions)}</p>
            <a href={`tel:${PHONE}`} className="mt-4 inline-flex text-small font-medium text-accent-ink underline underline-offset-[0.3em] focus-ring rounded-[2px]">
              +90 216 000 00 00
            </a>
          </aside>
        </Container>
      </Section>

      <Faq
        {...common}
        variant="split"
        eyebrow={t({ en: "Questions", tr: "Sorular" })}
        title={t({ en: "Before you *call*", tr: "Aramadan *önce*" })}
        items={practice.faq.map((f, i) => ({ id: `${practice.id}-q${i + 1}`, q: t(f.q), a: t(f.a) }))}
        deepLink={false}
      />

      <Section theme={{ rhythm: "tight" }} aria-labelledby={`lv-others-${practice.id}`}>
        <Container>
          <h2 id={`lv-others-${practice.id}`} className="mb-4 font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">
            {t({ en: "Other practice areas", tr: "Diğer çalışma alanları" })}
          </h2>
          <ul className="grid gap-x-8 @2xl:grid-cols-2 @4xl:grid-cols-3">
            {others.map((p) => (
              <li key={p.id} className="border-t border-line">
                <a href={sitePageHref(practicePage(p.id))} className="group flex items-baseline gap-4 rounded-[2px] py-3 focus-ring">
                  <span className="font-display text-[1.75rem] leading-none text-accent-ink tabular-nums">{p.no}</span>
                  <span className="group-hover:underline underline-offset-4">{t(p.title)}</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Cta
        {...common}
        variant="band"
        theme={{ surface: "accent" }}
        title={t({ en: "Discuss a matter with *" + head.name.split(" ")[0] + "*", tr: "Dosyanızı *" + head.name.split(" ")[0] + "* ile konuşun" })}
        lead={t({ en: "A first call of up to 30 minutes, without charge, after a conflict check.", tr: "Çıkar çatışması kontrolünden sonra 30 dakikaya kadar ücretsiz ilk görüşme." })}
        actions={[{ link: { href: sitePageHref("home", "contact"), label: t({ en: "Arrange a consultation", tr: "Görüşme talep edin" }) }, style: "primary" }]}
        contact={{ phone: PHONE }}
      />
    </>
  );
}
