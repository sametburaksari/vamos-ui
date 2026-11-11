import { BlogList, ContactForm, Container, Footer, Hero, Navbar, Section, SiteShellPage, Steps, Team, sitePageHref } from "@vamos-ui/react/blocks";
import { TextReveal } from "@vamos-ui/react/motion";
import { copyFor, EMAIL, insights, lawyers, office, PHONE, photos, practices, type SiteLocale } from "./content";
import { PracticeIndex } from "./practice-index";
import { PracticePage, practicePage } from "./practice-page";
import { TeamPage } from "./team-page";

export const lawPages = ["home", ...practices.map((p) => practicePage(p.id)), "team"];

const home = (anchor?: string) => sitePageHref("home", anchor);
const team = sitePageHref("team");

/**
 * One language version of the law-firm site: navbar with a practice submenu, then home (sober
 * split hero, the numbered practice index, approach, partners, insights, contact with office
 * hours), one page per practice area and the team page; footer with the legal notices.
 */
export function LawSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const consult = t({ en: "Arrange a consultation", tr: "Görüşme talep edin" });
  const partners = lawyers.filter((l) => l.partner);

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Ardent & Vale"
        homeHref={home()}
        items={[
          {
            label: t({ en: "Practice areas", tr: "Çalışma alanları" }),
            href: home("practice"),
            children: practices.map((p) => ({ label: `${p.no} ${t(p.title)}`, href: sitePageHref(practicePage(p.id)), description: t(p.short) })),
          },
          { label: t({ en: "Team", tr: "Ekip" }), href: team },
          { label: t({ en: "Insights", tr: "Yazılar" }), href: home("insights") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: home("contact") },
        ]}
        phone={PHONE}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("contact"), label: consult }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Ardent & Vale — business law, Istanbul", tr: "Ardent & Vale — ticaret hukuku, İstanbul" })}>
          <Hero
            {...common}
            variant="split-media"
            anchor="top"
            eyebrow={t({ en: "Business law · Levent, Istanbul · since 2011", tr: "Ticaret hukuku · Levent, İstanbul · 2011’den beri" })}
            title={t({ en: "Clear advice for *consequential* decisions", tr: "*Sonuç doğuran* kararlar için açık tavsiye" })}
            lead={t({
              en: "A business law firm of 24 lawyers. We act for companies, founders and families on transactions, disputes and the rules in between — with one partner answering for every matter.",
              tr: "24 avukatlık bir ticaret hukuku bürosu. Şirketleri, kurucuları ve aileleri işlemlerde, uyuşmazlıklarda ve aradaki kurallarda temsil ediyoruz — her dosyadan bir ortak sorumlu.",
            })}
            actions={[
              { link: { href: home("contact"), label: consult }, style: "primary" },
              { link: { href: home("practice"), label: t({ en: "Practice areas", tr: "Çalışma alanları" }) }, style: "secondary" },
            ]}
            media={{ ...photos.library, alt: t(photos.library.alt) }}
            caption={t({ en: "Library, 14th floor", tr: "Kütüphane, 14. kat" })}
            meta={[
              { label: t({ en: "Founded", tr: "Kuruluş" }), value: "2011" },
              { label: t({ en: "Lawyers", tr: "Avukat" }), value: "24" },
              { label: t({ en: "Languages", tr: "Dil" }), value: "TR · EN · DE" },
            ]}
          />

          <Section anchor="practice" aria-labelledby="lv-practice">
            <Container>
              <div className="mb-10 grid gap-4 @4xl:grid-cols-12">
                <div className="@4xl:col-span-6">
                  <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-accent-ink">{t({ en: "Practice areas", tr: "Çalışma alanları" })}</p>
                  <TextReveal as="h2" id="lv-practice" className="mt-3 font-display text-display-l">
                    {t({ en: "Six practices, one firm", tr: "Altı alan, tek büro" })}
                  </TextReveal>
                </div>
                <p className="max-w-[48ch] self-end text-fg-muted @4xl:col-span-5 @4xl:col-start-8">
                  {t({ en: "Each practice is run by a named partner. Larger matters draw on two or three of them; you still have one person to call.", tr: "Her alanı adı belli bir ortak yönetir. Büyük dosyalar iki üç alanı birden kapsar; yine de arayacağınız tek bir kişi vardır." })}
                </p>
              </div>
              <PracticeIndex
                label={t({ en: "Practice areas", tr: "Çalışma alanları" })}
                mattersLabel={t({ en: "Recent matters", tr: "Son dosyalar" })}
                moreLabel={t({ en: "More on {title}", tr: "{title} hakkında daha fazlası" })}
                items={practices.map((p) => {
                  const head = lawyers.find((l) => l.id === p.head)!;
                  return {
                    id: p.id,
                    no: p.no,
                    title: t(p.title),
                    short: t(p.short),
                    href: sitePageHref(practicePage(p.id)),
                    lead: t(p.lead),
                    head: { name: head.name, role: t(head.role), photo: head.photo?.src.replace(/w=\d+&h=\d+/, "w=112&h=140") },
                    matters: p.matters.map((m) => ({ year: m.year, text: t(m.text), value: m.value ? t(m.value) : undefined })),
                    facts: [
                      { label: t({ en: "Team", tr: "Ekip" }), value: String(p.facts.team) },
                      { label: t({ en: "Languages", tr: "Dil" }), value: p.facts.languages },
                    ],
                  };
                })}
              />
            </Container>
          </Section>

          <Steps
            {...common}
            variant="horizontal"
            anchor="approach"
            theme={{ surface: "accent" }}
            eyebrow={t({ en: "How we work", tr: "Nasıl çalışırız" })}
            title={t({ en: "No surprises, *in writing*", tr: "Sürpriz yok, *yazılı olarak*" })}
            steps={[
              { title: t({ en: "A first call", tr: "İlk görüşme" }), text: t({ en: "Up to 30 minutes with a partner, free of charge, after a conflict check.", tr: "Çıkar çatışması kontrolünden sonra bir ortakla 30 dakikaya kadar ücretsiz." }), duration: t({ en: "Day 1", tr: "1. gün" }) },
              { title: t({ en: "An engagement letter", tr: "Vekâlet sözleşmesi" }), text: t({ en: "Scope, team and a fixed fee or a cap — before any work is billed.", tr: "Kapsam, ekip ve sabit ücret ya da üst sınır — hiçbir iş faturalanmadan önce." }), duration: t({ en: "Within 3 days", tr: "3 gün içinde" }) },
              { title: t({ en: "Weekly status", tr: "Haftalık durum" }), text: t({ en: "Every Friday: what happened, what is next, what it has cost so far.", tr: "Her cuma: ne oldu, sırada ne var, şimdiye kadar maliyet ne." }), duration: t({ en: "Every Friday", tr: "Her cuma" }) },
              { title: t({ en: "A close-out note", tr: "Kapanış notu" }), text: t({ en: "Two pages on what was agreed, deadlines that remain and documents to keep.", tr: "Neyin kararlaştırıldığı, kalan süreler ve saklanacak belgeler üzerine iki sayfa." }), duration: t({ en: "At closing", tr: "Kapanışta" }) },
            ]}
          />

          <Team
            {...common}
            variant="portrait"
            anchor="partners"
            eyebrow={t({ en: "Partners", tr: "Ortaklar" })}
            title={t({ en: "Who answers for *your* matter", tr: "Dosyanızdan *kim* sorumlu" })}
            lead={t({ en: "Bar admissions listed under each name.", tr: "Baro kayıtları her ismin altında yer alır." })}
            members={partners.map((l) => ({ name: l.name, role: t(l.role), specialty: t(l.admissions), photo: l.photo ? { ...l.photo, alt: l.name } : undefined }))}
          />
          <Container className="-mt-6 pb-4">
            <a href={team} className="inline-flex items-center gap-2 text-small font-medium text-accent-ink underline underline-offset-[0.3em] focus-ring rounded-[2px]">
              {t({ en: "The whole team, with bar admissions", tr: "Tüm ekip ve baro kayıtları" })} <span aria-hidden>→</span>
            </a>
          </Container>

          <BlogList
            {...common}
            variant="list"
            anchor="insights"
            theme={{ surface: "surface" }}
            eyebrow={t({ en: "Insights", tr: "Yazılar" })}
            title={t({ en: "Notes on the *law as it changes*", tr: "*Değişen hukuka* dair notlar" })}
            allLink={{ href: "https://example.com/insights", label: t({ en: "All insights", tr: "Tüm yazılar" }) }}
            posts={insights.map((p) => ({ href: p.href, title: t(p.title), excerpt: t(p.excerpt), publishedAt: p.date, readingMinutes: p.minutes, category: { label: t(p.category) } }))}
          />

          <ContactForm
            {...common}
            variant="split"
            anchor="contact"
            eyebrow={t({ en: "Contact", tr: "İletişim" })}
            title={t({ en: "Tell us *briefly* what happened", tr: "Ne olduğunu bize *kısaca* anlatın" })}
            lead={t({ en: "Please do not send confidential documents before we confirm there is no conflict of interest. A partner replies within one working day.", tr: "Çıkar çatışması olmadığını teyit etmeden önce lütfen gizli belge göndermeyin. Bir ortak bir iş günü içinde yanıt verir." })}
            fields={[
              { name: "name", required: true },
              { name: "company", label: t({ en: "Company", tr: "Şirket" }) },
              { name: "email", required: true },
              { name: "phone" },
              {
                name: "subject",
                required: true,
                label: t({ en: "Practice area", tr: "Çalışma alanı" }),
                options: [...practices.map((p) => t(p.title)), t({ en: "Not sure yet", tr: "Henüz emin değilim" })],
              },
              { name: "message", required: true, label: t({ en: "What happened, and by when you need to act", tr: "Ne oldu ve ne zamana kadar harekete geçmeniz gerekiyor" }), max: 1500 },
            ]}
            submitLabel={t({ en: "Send to a partner", tr: "Bir ortağa gönderin" })}
            successMessage={t({ en: "Thank you. We will run a conflict check and a partner will call you within one working day.", tr: "Teşekkürler. Çıkar çatışması kontrolü yapacağız; bir ortak bir iş günü içinde sizi arayacak." })}
            privacyLink={{ href: "/kvkk", label: t({ en: "Privacy notice (KVKK)", tr: "KVKK aydınlatma metni" }) }}
            privacyCheckbox
            info={{ address: t(office.address), phone: PHONE, email: EMAIL, hours: t(office.hours) }}
          />
        </SiteShellPage>

        {practices.map((p) => (
          <SiteShellPage key={p.id} id={practicePage(p.id)} title={`${t(p.title)} — Ardent & Vale`}>
            <PracticePage practice={p} locale={locale} />
          </SiteShellPage>
        ))}

        <SiteShellPage id="team" title={t({ en: "Team — Ardent & Vale", tr: "Ekip — Ardent & Vale" })}>
          <TeamPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Ardent & Vale", href: home() }}
        about={t({ en: "Business law, Istanbul. This website is for general information and is not legal advice.", tr: "Ticaret hukuku, İstanbul. Bu web sitesi genel bilgi amaçlıdır, hukuki tavsiye niteliği taşımaz." })}
        columns={[
          { title: t({ en: "Practice areas", tr: "Çalışma alanları" }), links: practices.map((p) => ({ href: sitePageHref(practicePage(p.id)), label: t(p.title) })) },
          { title: t({ en: "Firm", tr: "Büro" }), links: [{ href: team, label: t({ en: "Team", tr: "Ekip" }) }, { href: home("insights"), label: t({ en: "Insights", tr: "Yazılar" }) }, { href: home("contact"), label: t({ en: "Contact", tr: "İletişim" }) }] },
        ]}
        contact={{ address: t(office.address), phone: PHONE, email: EMAIL }}
        social={[{ network: "linkedin", href: "https://www.linkedin.com/company/example" }]}
        legalLinks={[
          { href: "/legal-notice", label: t({ en: "Legal notice", tr: "Yasal uyarı" }) },
          { href: "/kvkk", label: t({ en: "Privacy (KVKK)", tr: "KVKK" }) },
          { href: "/complaints", label: t({ en: "Complaints procedure", tr: "Şikâyet usulü" }) },
        ]}
        company={{
          legalName: t({ en: "Ardent & Vale Law Partnership (Avukatlık Ortaklığı)", tr: "Ardent & Vale Avukatlık Ortaklığı" }),
          registry: [
            { label: t({ en: "Istanbul Bar registry no.", tr: "İstanbul Barosu sicil no." }), value: "000" },
            { label: t({ en: "Tax office / no.", tr: "Vergi dairesi / no." }), value: "Zincirlikuyu · 000 000 0000" },
          ],
        }}
        year={2026}
      />
    </>
  );
}
