import { BookOpen, Braces, FileText, GitPullRequest, Globe, LifeBuoy, Mail, MessagesSquare } from "lucide-react";
import { BlockHeading, BlockLink, Container, Cta, Faq, Footer, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, EMAIL, faqHome, integrations, PHONE, useCases, type SiteLocale } from "./content";
import { PricingPage } from "./pricing-page";
import { QuillMark } from "./quill-mark";
import { SecurityPage } from "./security-page";
import { TypingDemo } from "./typing-demo";

const home = (anchor?: string) => sitePageHref("home", anchor);
const pricing = sitePageHref("pricing");
const security = sitePageHref("security");

const icons = { mail: Mail, docs: FileText, chat: MessagesSquare, desk: LifeBuoy, code: GitPullRequest, web: Globe, wiki: BookOpen, api: Braces } as const;

/**
 * One language version of the Quill site: navbar and footer around three pages (home with the
 * typing demo, pricing, security). Server component; the SiteShell in page.tsx picks page and
 * language, the demo is the only client island.
 */
export function AiSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<QuillMark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Demo", tr: "Demo" }), href: home("demo") },
          { label: t({ en: "Use cases", tr: "Kullanım" }), href: home("use-cases") },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: pricing },
          { label: t({ en: "Security", tr: "Güvenlik" }), href: security },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: pricing, label: t({ en: "Start free", tr: "Ücretsiz başla" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Quill — say the hard thing clearly", tr: "Quill — zor olanı açıkça söyleyin" })}>
          {/* Hero: headline on the start side, the case for it on the end side, the demo underneath. */}
          <Section anchor="top" className="overflow-hidden" theme={{ rhythm: "tight" }}>
            <Container>
              <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
                <div className="lg:col-span-7">
                  <p className="m-0 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">
                    <span className="text-accent-ink">v4.2</span>
                    <span aria-hidden className="h-3 w-px bg-line" />
                    {t({ en: "Writing assistant for teams", tr: "Ekipler için yazım asistanı" })}
                  </p>
                  {/* The draft everyone has written once: struck out, then the headline. */}
                  <p aria-hidden className="m-0 mt-9 max-w-[34ch] text-lead text-fg-subtle">
                    <s className="decoration-accent decoration-2">{t({ en: "Hi, I just wanted to quickly, maybe, possibly mention that…", tr: "Merhaba, sadece kısaca, belki, aslında şunu söylemek istemiştim ki…" })}</s>
                  </p>
                  <BlockHeading level={1} size="display-2xl" className="mt-3 max-w-[12ch]" text={t({ en: "Say the hard thing *clearly.*", tr: "Zor olanı *açıkça* söyleyin." })} />
                </div>
                <div className="flex flex-col gap-7 lg:col-span-5 lg:pb-3">
                  <p className="m-0 max-w-[42ch] text-lead text-fg-muted">
                    {t({
                      en: "Quill rewrites the email you’ve been avoiding, the incident update and the release note — in your team’s voice, with every change shown, and without keeping a word of it.",
                      tr: "Quill ertelediğiniz e-postayı, kesinti bildirimini ve sürüm notunu yeniden yazar — ekibinizin sesiyle, her değişikliği göstererek ve tek kelimesini bile saklamadan.",
                    })}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <BlockLink href={pricing} appearance="primary" size="lg" {...common}>
                      {t({ en: "Start free — 40 rewrites a month", tr: "Ücretsiz başla — ayda 40 yazım" })}
                    </BlockLink>
                    <BlockLink href={security} appearance="secondary" size="lg" {...common}>
                      {t({ en: "How we handle text", tr: "Metni nasıl işliyoruz" })}
                    </BlockLink>
                  </div>
                </div>
              </div>

              <div id="demo" className="mt-12 scroll-mt-24 lg:mt-16">
                <TypingDemo locale={locale} />
              </div>

              <dl className="m-0 mt-8 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                {[
                  [f.number(2300), t({ en: "teams writing with Quill", tr: "ekip Quill ile yazıyor" })],
                  [t({ en: "0 days", tr: "0 gün" }), t({ en: "default text retention", tr: "varsayılan metin saklama" })],
                  [f.number(7), t({ en: "languages, any direction", tr: "dil, her yönde" })],
                  [t({ en: "1.4 s", tr: "1,4 sn" }), t({ en: "median rewrite time", tr: "ortanca yazım süresi" })],
                ].map(([v, k]) => (
                  <div key={k} className="border-t border-line pt-3">
                    <dt className="sr-only">{k}</dt>
                    <dd className="m-0 font-display text-2xl tracking-[-0.03em] text-fg tabular">{v}</dd>
                    <dd className="m-0 mt-0.5 text-sm text-fg-muted">{k}</dd>
                  </div>
                ))}
              </dl>
            </Container>
          </Section>

          {/* Use cases: the sentence people actually send, before and after. */}
          <Section anchor="use-cases" headingId="ql-uses-title">
            <Container>
              <SectionHeader
                headingId="ql-uses-title"
                align="split"
                eyebrow={t({ en: "Use cases", tr: "Kullanım alanları" })}
                title={t({ en: "One sentence, *before* and after", tr: "Tek cümle, *önce* ve sonra" })}
                lead={t({ en: "Real lines from four teams in the pilot, rewritten in Plain. The number on the end is what changed in their first month.", tr: "Pilottaki dört ekipten gerçek cümleler, Sade tonda yeniden yazıldı. Sondaki sayı ilk aylarında değişen şey." })}
              />
              <ol className="m-0 mt-12 list-none border-b border-line p-0">
                {useCases.map((u, i) => (
                  <li key={t(u.team)} className="grid gap-x-8 gap-y-3 border-t border-line py-7 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_11rem] md:items-baseline">
                    <p className="m-0 flex items-baseline gap-3 font-mono text-xs tracking-[0.08em] text-fg-muted uppercase">
                      <span className="text-fg-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
                      {t(u.team)}
                    </p>
                    <p className="m-0 text-fg-subtle">
                      <span className="sr-only">{t({ en: "Before:", tr: "Önce:" })} </span>
                      <s className="decoration-accent/60 decoration-1">{t(u.before)}</s>
                    </p>
                    <p className="m-0 text-lead leading-snug text-fg">
                      <span className="sr-only">{t({ en: "After:", tr: "Sonra:" })} </span>
                      {t(u.after)}
                    </p>
                    <p className="m-0 text-sm text-accent-ink md:text-end">{t(u.stat)}</p>
                  </li>
                ))}
              </ol>
            </Container>
          </Section>

          {/* Integrations: generic, unbranded surfaces. */}
          <Section anchor="integrations" headingId="ql-int-title" theme={{ surface: "surface-2" }}>
            <Container>
              <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <SectionHeader
                    headingId="ql-int-title"
                    eyebrow={t({ en: "Where it works", tr: "Nerede çalışır" })}
                    title={t({ en: "In the box you’re *already* typing in", tr: "Zaten yazdığınız *kutunun* içinde" })}
                    lead={t({ en: "No new tab to paste into. Select text, press ⌥ Q, pick a tone.", tr: "Yapıştırmak için yeni sekme yok. Metni seçin, ⌥ Q’ya basın, bir ton seçin." })}
                  />
                </div>
                <ul className="m-0 grid list-none grid-cols-1 gap-px overflow-hidden rounded-ui-lg border border-line bg-line p-0 sm:grid-cols-2 lg:col-span-8">
                  {integrations.map((x) => {
                    const Icon = icons[x.id as keyof typeof icons];
                    return (
                      <li key={x.id} className="flex items-center gap-4 bg-surface px-5 py-5">
                        <span className="grid size-10 shrink-0 place-items-center rounded-ui border border-line text-accent-ink">
                          <Icon aria-hidden className="size-[18px]" strokeWidth={1.6} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-fg">{t(x.name)}</span>
                          <span className="block font-mono text-xs text-fg-muted">{t(x.how)}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Container>
          </Section>

          {/* Security teaser */}
          <Section anchor="privacy" headingId="ql-priv-title">
            <Container>
              <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-6">
                  <SectionHeader
                    headingId="ql-priv-title"
                    eyebrow={t({ en: "Security", tr: "Güvenlik" })}
                    title={t({ en: "We read your text *once*, then forget it", tr: "Metninizi *bir kez* okur, sonra unuturuz" })}
                    lead={t({ en: "Processed in memory in the region you choose, never used for training, gone when the rewrite comes back.", tr: "Seçtiğiniz bölgede bellekte işlenir, asla eğitimde kullanılmaz, yeniden yazım döndüğünde silinir." })}
                    actions={
                      <BlockLink href={security} appearance="link" {...common}>
                        {t({ en: "Read the security page", tr: "Güvenlik sayfasını okuyun" })}
                      </BlockLink>
                    }
                  />
                </div>
                <dl className="m-0 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-6">
                  {[
                    ["0", t({ en: "days of text kept by default", tr: "gün varsayılan metin saklama" })],
                    ["AES-256", t({ en: "at rest for style guides and history", tr: "kılavuz ve geçmiş için bekleyen veri" })],
                    ["EU · US", t({ en: "processing region, your pick", tr: "işleme bölgesi, seçim sizin" })],
                  ].map(([v, k]) => (
                    <div key={k} className="border-s-2 border-accent ps-4">
                      <dt className="sr-only">{k}</dt>
                      <dd className="m-0 font-display text-display-m text-fg">{v}</dd>
                      <dd className="m-0 mt-2 text-sm text-fg-muted">{k}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Container>
          </Section>

          <Faq
            {...common}
            anchor="faq"
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow="FAQ"
            title={t({ en: "Before you *paste* anything", tr: "Bir şey *yapıştırmadan* önce" })}
            contact={{ link: { href: `mailto:${EMAIL}`, label: t({ en: "Ask the team", tr: "Ekibe sorun" }) }, style: "link" }}
            items={faqHome.map((x) => ({ q: t(x.q), a: t(x.a) }))}
            deepLink={false}
          />

          <Cta
            {...common}
            variant="band"
            theme={{ surface: "accent" }}
            title={t({ en: "Your next hard email, *in half the words*", tr: "Bir sonraki zor e-postanız, *yarı kelimeyle*" })}
            actions={[
              { link: { href: pricing, label: t({ en: "Start free", tr: "Ücretsiz başla" }) }, style: "primary" },
              { link: { href: `mailto:${EMAIL}`, label: t({ en: "Book a 20-minute demo", tr: "20 dakikalık demo ayırtın" }) }, style: "secondary" },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="pricing" title={t({ en: "Pricing — Quill", tr: "Fiyatlar — Quill" })}>
          <PricingPage c={c} />
        </SiteShellPage>

        <SiteShellPage id="security" title={t({ en: "Security — Quill", tr: "Güvenlik — Quill" })}>
          <SecurityPage c={c} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Quill", logo: <QuillMark />, href: home() }}
        about={t({ en: "Quill Labs, a writing assistant made in Istanbul and Rotterdam.", tr: "Quill Labs; İstanbul ve Rotterdam’da geliştirilen bir yazım asistanı." })}
        columns={[
          { title: t({ en: "Product", tr: "Ürün" }), links: [{ href: home("demo"), label: t({ en: "Demo", tr: "Demo" }) }, { href: home("use-cases"), label: t({ en: "Use cases", tr: "Kullanım" }) }, { href: home("integrations"), label: t({ en: "Integrations", tr: "Entegrasyonlar" }) }, { href: pricing, label: t({ en: "Pricing", tr: "Fiyatlar" }) }] },
          { title: t({ en: "Trust", tr: "Güven" }), links: [{ href: security, label: t({ en: "Security", tr: "Güvenlik" }) }, { href: sitePageHref("security", "subprocessors"), label: t({ en: "Subprocessors", tr: "Alt işleyiciler" }) }, { href: "https://status.quill.example.com", label: t({ en: "Status", tr: "Durum" }), newTab: true }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: "/about", label: t({ en: "About", tr: "Hakkımızda" }) }, { href: "/careers", label: t({ en: "Careers", tr: "Kariyer" }) }, { href: "/press", label: t({ en: "Press", tr: "Basın" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/quill-example" }, { network: "youtube", href: "https://youtube.com/@quill.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) }, { href: "/dpa", label: "DPA" }]}
        year={2026}
      />
    </>
  );
}
