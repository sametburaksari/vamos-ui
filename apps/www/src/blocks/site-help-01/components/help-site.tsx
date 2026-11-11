import { ArrowRight, Mail, MessageSquare, Users } from "lucide-react";
import { BlockHeading, Container, Footer, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { articleById, articlesIn, categories, copyFor, EMAIL, PHONE, popularIds, type SiteLocale } from "./content";
import { ArticlePage } from "./article-page";
import { CategoryIcon } from "./category-icon";
import { CategoryPage } from "./category-page";
import { ArticleLink, CategoryLink } from "./help-links";
import { HelpSearch } from "./help-search";
import { LoamHelpMark } from "./loam-help-mark";
import { Stagger } from "@vamos-ui/react/motion";

const home = (anchor?: string) => sitePageHref("home", anchor);

/** A planner grid behind the hero, fading out at the bottom (tokens only). */
const plannerGrid =
  "bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(180deg,black_0%,black_45%,transparent_100%)]";

/**
 * One language version of the Loam help centre: home (big instant search, categories,
 * popular articles, contact), a category page and an article page. Server component; the SiteShell in
 * page.tsx picks page and language, the interactive parts are client islands.
 */
export function HelpSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };
  const popular = popularIds.map((id) => articleById(id)!);

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<LoamHelpMark label={t({ en: "Help", tr: "Yardım" })} />}
        homeHref={home()}
        items={[
          { label: t({ en: "Topics", tr: "Konular" }), href: home("topics") },
          { label: t({ en: "Popular", tr: "Popüler" }), href: home("popular") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: home("contact") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: "https://app.loam.example.com", label: t({ en: "Open Loam", tr: "Loam’u aç" }) }, style: "secondary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Loam Help Centre", tr: "Loam Yardım Merkezi" })}>
          <section aria-labelledby="help-hero-title" className="relative z-10 border-b border-line bg-surface-2">
            <div aria-hidden className={`help-grid absolute inset-0 -z-10 opacity-70 ${plannerGrid}`} />
            <style>{helpMotion}</style>
            <Container size="content">
              <div className="max-w-3xl pt-16 pb-14 sm:pt-24 sm:pb-20">
                <p className="vm-enter m-0 font-mono text-xs tracking-[0.1em] text-fg-muted uppercase">{t({ en: "Loam Help Centre", tr: "Loam Yardım Merkezi" })}</p>
                <BlockHeading id="help-hero-title" level={1} size="display-l" className="vm-enter [--vm-i:1] mt-4" text={t({ en: "What’s growing *wrong?*", tr: "Ters giden *ne?*" })} />
                <p className="vm-enter [--vm-i:2] m-0 mt-4 max-w-[48ch] text-lead text-fg-muted">
                  {t({ en: "Answers for 15 questions people ask us most — start typing and they appear as you go.", tr: "En sık sorulan 15 sorunun yanıtı — yazmaya başlayın, yazdıkça görünsünler." })}
                </p>
                <div className="vm-enter [--vm-i:3] relative z-20 mt-8">
                  <HelpSearch locale={locale} />
                </div>
              </div>
            </Container>
          </section>

          <Section anchor="topics" headingId="help-topics-title">
            <Container size="content">
              <SectionHeader headingId="help-topics-title" eyebrow={t({ en: "Browse", tr: "Göz atın" })} title={t({ en: "Six topics, *every* answer", tr: "Altı konu, *tüm* yanıtlar" })} />
              <Stagger asChild step={60}>
              <ul className="m-0 mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => {
                  const n = articlesIn(cat.id).length;
                  return (
                    <li key={cat.id}>
                      <CategoryLink id={cat.id} className="vm-lift vm-press surface focus-ring group flex h-full flex-col gap-4 rounded-ui-lg p-6 transition-[border-color] hover:border-field-border-hover">
                        <span className="grid size-11 place-items-center rounded-ui bg-accent-soft text-accent-ink motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-(--ease-spring) group-hover:-rotate-6 group-hover:scale-105">
                          <CategoryIcon id={cat.id} className="size-5" />
                        </span>
                        <span className="flex flex-col gap-1.5">
                          <span className="text-lg font-semibold text-fg">{t(cat.title)}</span>
                          <span className="text-sm text-fg-muted">{t(cat.text)}</span>
                        </span>
                        <span className="mt-auto flex items-center justify-between pt-2 text-sm text-fg-muted">
                          {f.number(n)} {t({ en: n === 1 ? "article" : "articles", tr: "makale" })}
                          <ArrowRight aria-hidden className="size-4 text-accent-ink transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                        </span>
                      </CategoryLink>
                    </li>
                  );
                })}
              </ul>
              </Stagger>
            </Container>
          </Section>

          <Section anchor="popular" headingId="help-pop-title" theme={{ surface: "surface-2" }}>
            <Container size="content">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                <SectionHeader
                  headingId="help-pop-title"
                  eyebrow={t({ en: "Most read this month", tr: "Bu ay en çok okunanlar" })}
                  title={t({ en: "Usually, it’s *one* of these", tr: "Genellikle bunlardan *biri*" })}
                  lead={t({ en: "Spring questions arrive in November: frost dates, rotation and sharing a plot top the list.", tr: "Bahar soruları Kasım’da gelir: don tarihleri, münavebe ve parsel paylaşımı listenin başında." })}
                />
                <Stagger asChild effect="fade" step={50}>
                <ol className="m-0 list-none p-0">
                  {popular.map((a, i) => (
                    <li key={a.id} className="border-t border-line last:border-b">
                      <ArticleLink id={a.id} className="focus-ring group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-ui-sm py-4">
                        <span className="font-display text-2xl text-accent-ink tabular motion-safe:transition-transform motion-safe:duration-200 group-hover:-translate-y-0.5">{i + 1}</span>
                        <span className="flex flex-col gap-0.5">
                          <span className="font-semibold text-fg group-hover:text-accent-ink">{t(a.title)}</span>
                          <span className="text-sm text-fg-muted">{t(a.summary)}</span>
                        </span>
                        <span className="hidden text-sm text-fg-subtle sm:inline tabular">{f.compact(a.helpful * 31)} {t({ en: "reads", tr: "okuma" })}</span>
                      </ArticleLink>
                    </li>
                  ))}
                </ol>
                </Stagger>
              </div>
            </Container>
          </Section>

          <Section anchor="contact" headingId="help-contact-title">
            <Container size="content">
              <SectionHeader
                headingId="help-contact-title"
                align="split"
                eyebrow={t({ en: "Contact support", tr: "Destek’e ulaşın" })}
                title={t({ en: "Talk to a *gardener*, not a bot", tr: "Bir bot ile değil, bir *bahçıvanla* konuşun" })}
                lead={t({ en: "Five people on our support team, all of them growing something. Mon–Fri 09:00–18:00, Sat 10:00–14:00 (Istanbul).", tr: "Destek ekibimizde beş kişi var ve hepsi bir şeyler yetiştiriyor. Pzt–Cum 09.00–18.00, Cmt 10.00–14.00 (İstanbul)." })}
              />
              <Stagger asChild effect="fade" step={70}>
              <ul className="m-0 mt-10 grid list-none gap-px overflow-hidden rounded-ui-lg border border-line bg-line p-0 md:grid-cols-3">
                {[
                  {
                    icon: MessageSquare,
                    title: t({ en: "Chat in the app", tr: "Uygulamada sohbet" }),
                    text: t({ en: "Settings → Help → Chat. Median first reply last month: 12 minutes.", tr: "Ayarlar → Yardım → Sohbet. Geçen ay ortanca ilk yanıt: 12 dakika." }),
                    action: { href: "https://app.loam.example.com/help/chat", label: t({ en: "Open chat", tr: "Sohbeti aç" }) },
                  },
                  {
                    icon: Mail,
                    title: t({ en: "Email", tr: "E-posta" }),
                    text: t({ en: "For billing or data requests. We reply within one working day.", tr: "Ödeme ya da veri talepleri için. Bir iş günü içinde yanıtlıyoruz." }),
                    action: { href: `mailto:${EMAIL}`, label: EMAIL },
                  },
                  {
                    icon: Users,
                    title: t({ en: "Community", tr: "Topluluk" }),
                    text: t({ en: "6,200 gardeners swapping plans, seeds and frost stories.", tr: "Plan, tohum ve don hikâyesi paylaşan 6.200 bahçıvan." }),
                    action: { href: "https://community.loam.example.com", label: t({ en: "Visit the forum", tr: "Foruma git" }) },
                  },
                ].map((ch) => (
                  <li key={ch.title} className="flex flex-col gap-3 bg-surface p-6">
                    <ch.icon aria-hidden className="size-5 text-accent-ink" strokeWidth={1.7} />
                    <h3 className="m-0 text-base font-semibold text-fg">{ch.title}</h3>
                    <p className="m-0 text-sm text-fg-muted">{ch.text}</p>
                    <a href={ch.action.href} className="focus-ring mt-auto inline-flex w-fit items-center gap-1.5 rounded-ui-sm pt-2 text-sm font-medium break-all text-accent-ink hover:underline">
                      {ch.action.label}
                    </a>
                  </li>
                ))}
              </ul>
              </Stagger>
              <p className="m-0 mt-6 flex items-center gap-2 text-sm text-fg-muted">
                <span aria-hidden className="help-live size-2 rounded-full bg-success" />
                {t({ en: "All Loam services running normally · checked 11 Nov 2026, 09:40", tr: "Tüm Loam hizmetleri normal çalışıyor · kontrol: 11 Kas 2026, 09.40" })}
              </p>
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="category" title={t({ en: "Topics — Loam Help Centre", tr: "Konular — Loam Yardım Merkezi" })}>
          <CategoryPage locale={locale} />
        </SiteShellPage>

        <SiteShellPage id="article" title={t({ en: "Article — Loam Help Centre", tr: "Makale — Loam Yardım Merkezi" })}>
          <ArticlePage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: `Loam ${t({ en: "Help", tr: "Yardım" })}`, logo: <LoamHelpMark label={t({ en: "Help", tr: "Yardım" })} />, href: home() }}
        about={t({ en: "Loam Garden Software, Tohum Sok. 00, Kadıköy, Istanbul.", tr: "Loam Bahçe Yazılımı, Tohum Sok. 00, Kadıköy, İstanbul." })}
        columns={[
          { title: t({ en: "Help", tr: "Yardım" }), links: categories.slice(0, 4).map((x) => ({ href: `?topic=${x.id}`, label: t(x.title) })) },
          { title: t({ en: "Loam", tr: "Loam" }), links: [{ href: "https://loam.example.com", label: t({ en: "Website", tr: "Web sitesi" }) }, { href: "https://app.loam.example.com", label: t({ en: "Web planner", tr: "Web planlayıcı" }) }, { href: "https://community.loam.example.com", label: t({ en: "Community", tr: "Topluluk" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) }]}
        year={2026}
      />
    </>
  );
}

/**
 * Loam Help moves like a good answer: quick and out of the way. The planner grid behind the
 * hero is drawn down the page once on arrival; the search results drop open under the field;
 * the "all services running" dot breathes as a live indicator. Everything else is a short fade.
 */
const helpMotion = `
@keyframes help-grid { from { mask-position: 0 100%; } to { mask-position: 0 0; } }
@keyframes help-panel { from { opacity: 0; transform: translate3d(0, -6px, 0); } }
@keyframes help-live { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--success) 50%, transparent); } 70% { box-shadow: 0 0 0 6px transparent; } }
@media screen and (prefers-reduced-motion: no-preference) {
  .help-grid:where(:not([data-motion="off"] *)) {
    mask-image: linear-gradient(to bottom, #000 45%, transparent 55%);
    mask-size: 100% 220%;
    mask-position: 0 0;
    animation: help-grid 1400ms var(--ease-in-out) 100ms backwards;
  }
  .help-panel:not([hidden]):where(:not([data-motion="off"] *)) { animation: help-panel 180ms var(--ease-out-quint); }
  .help-live:where(:not([data-motion="off"] *)) { animation: help-live 2600ms var(--ease-in-out) infinite; }
}
`;
