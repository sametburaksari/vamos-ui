import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
import { Avatar, Button, Sparkline } from "@vamos-ui/react";
import { Container, Footer, Navbar, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { categories, copyFor, EMAIL, meetups, member, type SiteLocale } from "./content";
import { CircleMark } from "./circle-mark";
import { ThreadPage } from "./thread-page";
import { TopicList } from "./topic-list";

export const communityPages = ["home", "topics", "thread"];

const home = (anchor?: string) => sitePageHref("home", anchor);
const topicsHref = (anchor?: string) => sitePageHref("topics", anchor);

const contributors = [
  { handle: "emre.ahsap", posts: 64 },
  { handle: "mira.solder", posts: 58 },
  { handle: "selma_r", posts: 41 },
  { handle: "deniz.cnc", posts: 33 },
  { handle: "aiko", posts: 29 },
];

/** A sidebar panel: small heading, hairline frame. */
function Panel({ id, title, children, action }: { id: string; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-ui border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
        <h2 id={id} className="m-0 text-[0.8125rem] font-semibold tracking-[0.02em]">
          {title}
        </h2>
        {action}
      </div>
      <div className="px-3.5 py-2">{children}</div>
    </section>
  );
}

/**
 * One language version of the forum: home (compact header with live counters, the latest
 * topics with activity, and a sidebar of categories, meetups and top contributors), all topics
 * with the category rail, and one thread with replies. Server component; the topic list and
 * thread interactions are client islands.
 */
export function CommunitySite({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const start = t({ en: "Start a topic", tr: "Konu başlat" });

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<CircleMark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Topics", tr: "Konular" }), href: topicsHref() },
          { label: t({ en: "Categories", tr: "Kategoriler" }), href: home("categories") },
          { label: t({ en: "Meetups", tr: "Buluşmalar" }), href: home("meetups") },
          { label: t({ en: "Guidelines", tr: "Kurallar" }), href: "https://forum.example.com/t/guidelines" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[
          { link: { href: "https://forum.example.com/new", label: start }, style: "primary" },
          { link: { href: "https://forum.example.com/login", label: t({ en: "Log in", tr: "Giriş" }) }, style: "secondary" },
        ]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Builders Circle — a forum for people who make things", tr: "Builders Circle — bir şeyler yapanların forumu" })}>
          {/* Compact header: what this is and the pulse right now. */}
          <section aria-labelledby="bc-title" className="@container border-b border-line bg-surface">
            <Container>
              <div className="grid gap-6 py-8 @4xl:grid-cols-[minmax(0,1fr)_auto] @4xl:items-end @4xl:py-10">
                <div>
                  <h1 id="bc-title" className="m-0 font-display text-display-m">
                    {t({ en: "Ask, answer, show the build.", tr: "Sorun, yanıtlayın, projeyi gösterin." })}
                  </h1>
                  <p className="m-0 mt-2 max-w-[60ch] text-body text-fg-muted">
                    {t({
                      en: "Builders Circle is a forum for people who make things with their hands — wood, wires, walls and metal. No ads, no algorithm: newest activity first.",
                      tr: "Builders Circle, elleriyle bir şeyler yapanların forumu — ahşap, kablo, duvar ve metal. Reklam yok, algoritma yok: en yeni hareket en üstte.",
                    })}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="primary" size="sm">
                      <a href="https://forum.example.com/new">
                        <Plus aria-hidden className="size-4" />
                        {start}
                      </a>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <a href={topicsHref()}>{t({ en: "Browse all topics", tr: "Tüm konulara göz atın" })}</a>
                    </Button>
                  </div>
                </div>
                <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 @md:grid-cols-4 @4xl:gap-x-8">
                  {[
                    { k: { en: "Members", tr: "Üye" }, v: f.number(18240) },
                    { k: { en: "Online now", tr: "Şu an çevrimiçi" }, v: f.number(312), live: true },
                    { k: { en: "Posts this week", tr: "Bu hafta ileti" }, v: f.number(1486) },
                    { k: { en: "Answered within 1 h", tr: "1 saatte yanıtlanan" }, v: f.percent(0.71) },
                  ].map((s) => (
                    <div key={s.k.en} className="border-s-2 border-line ps-3">
                      <dt className="flex items-center gap-1.5 text-[0.75rem] text-fg-muted">
                        {s.live ? <span aria-hidden className="size-1.5 rounded-full bg-success" /> : null}
                        {t(s.k)}
                      </dt>
                      <dd className="m-0 mt-0.5 text-h3 font-semibold tabular-nums">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Container>
          </section>

          <div className="@container">
            <Container>
              <div className="grid gap-8 py-8 @5xl:grid-cols-[minmax(0,1fr)_19rem]">
                <section aria-labelledby="bc-latest" className="min-w-0">
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h2 id="bc-latest" className="m-0 text-h3 font-semibold">
                      {t({ en: "Discussions", tr: "Tartışmalar" })}
                    </h2>
                    <a href={topicsHref()} className="inline-flex items-center gap-1 text-small font-medium text-accent-ink hover:underline focus-ring rounded-[2px]">
                      {t({ en: "All topics", tr: "Tüm konular" })}
                      <ArrowRight aria-hidden className="size-3.5" />
                    </a>
                  </div>
                  <TopicList locale={locale} limit={8} labelledBy="bc-latest" />
                </section>

                <aside className="flex flex-col gap-4" aria-label={t({ en: "Community", tr: "Topluluk" })}>
                  <div id="categories" className="scroll-mt-24">
                    <Panel id="bc-cats" title={t({ en: "Categories", tr: "Kategoriler" })}>
                      <ul className="m-0 list-none p-0">
                        {categories.map((c) => (
                          <li key={c.id} className="border-b border-line last:border-b-0">
                            <a href={topicsHref(`cat-${c.id}`)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-ui-sm py-2 hover:bg-hover focus-ring">
                              <span className="min-w-0">
                                <span className="flex items-center gap-2 text-small font-medium text-fg">
                                  <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: c.color }} />
                                  {t(c.title)}
                                </span>
                                <span className="mt-0.5 block truncate text-[0.75rem] text-fg-muted">{t(c.text)}</span>
                              </span>
                              <span className="flex flex-col items-end">
                                <Sparkline values={c.week} variant="area" size="xs" color="fg-subtle" label={t({ en: `Posts per day this week: ${c.week.join(", ")}`, tr: `Bu hafta günlük ileti: ${c.week.join(", ")}` })} />
                                <span className="text-[0.6875rem] text-fg-muted tabular-nums">{t({ en: `${f.compact(c.topics)} topics`, tr: `${f.compact(c.topics)} konu` })}</span>
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Panel>
                  </div>

                  <div id="meetups" className="scroll-mt-24">
                    <Panel id="bc-meet" title={t({ en: "Meetups", tr: "Buluşmalar" })}>
                      <ul className="m-0 list-none p-0">
                        {meetups.map((m) => (
                          <li key={m.date} className="flex gap-3 border-b border-line py-2.5 last:border-b-0">
                            <time dateTime={m.date} className="flex w-10 shrink-0 flex-col items-center rounded-ui-sm border border-line py-1 leading-none">
                              <span className="text-[0.625rem] font-semibold text-accent-ink uppercase">{f.date(m.date, { month: "short" })}</span>
                              <span className="mt-0.5 text-[1.0625rem] font-semibold tabular-nums">{f.date(m.date, { day: "numeric" })}</span>
                            </time>
                            <div className="min-w-0 text-small">
                              <p className="m-0 font-medium">{t(m.title)}</p>
                              <p className="m-0 text-[0.75rem] text-fg-muted">
                                {m.place} · {f.time(m.date, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} ·{" "}
                                {m.left > 0 ? t({ en: `${m.left} places left`, tr: `${m.left} yer kaldı` }) : t({ en: "full, waiting list", tr: "dolu, yedek liste" })}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p className="m-0 flex items-center gap-1.5 border-t border-line pt-2 pb-1 text-[0.75rem] text-fg-muted">
                        <CalendarDays aria-hidden className="size-3.5" />
                        {t({ en: "Free for members. Bring your own project.", tr: "Üyeler için ücretsiz. Kendi projenizi getirin." })}
                      </p>
                    </Panel>
                  </div>

                  <Panel id="bc-top" title={t({ en: "Most helpful in November", tr: "Kasım’ın en yardımseverleri" })}>
                    <ol className="m-0 list-none p-0">
                      {contributors.map((c, i) => {
                        const m = member(c.handle);
                        return (
                          <li key={c.handle} className="flex items-center gap-2.5 py-1.5">
                            <span className="w-4 text-[0.75rem] text-fg-muted tabular-nums">{i + 1}</span>
                            <Avatar name={m.name} size="xs" />
                            <span className="min-w-0 flex-1 truncate text-small">{m.name}</span>
                            <span className="text-[0.75rem] text-fg-muted tabular-nums">{t({ en: `${c.posts} answers`, tr: `${c.posts} yanıt` })}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </Panel>
                </aside>
              </div>
            </Container>
          </div>
        </SiteShellPage>

        <SiteShellPage id="topics" title={t({ en: "All topics — Builders Circle", tr: "Tüm konular — Builders Circle" })}>
          <section aria-labelledby="bc-topics" className="@container">
            <Container>
              <nav aria-label={t({ en: "Breadcrumb", tr: "Konum" })} className="pt-6 text-small text-fg-muted">
                <a href={home()} className="hover:text-fg hover:underline focus-ring rounded-[2px]">
                  Builders Circle
                </a>{" "}
                / <span aria-current="page">{t({ en: "Topics", tr: "Konular" })}</span>
              </nav>
              <div className="flex flex-wrap items-end justify-between gap-3 pt-2 pb-5">
                <h1 id="bc-topics" className="m-0 font-display text-display-m">
                  {t({ en: "All topics", tr: "Tüm konular" })}
                </h1>
                <Button asChild variant="primary" size="sm">
                  <a href="https://forum.example.com/new">
                    <Plus aria-hidden className="size-4" />
                    {start}
                  </a>
                </Button>
              </div>
              <div className="pb-12">
                <TopicList locale={locale} rail pageSize={8} labelledBy="bc-topics" />
              </div>
            </Container>
          </section>
        </SiteShellPage>

        <SiteShellPage id="thread" title={t({ en: "Workbench top: laminated beech or birch plywood? — Builders Circle", tr: "Tezgâh tablası: lamine kayın mı, huş kontrplak mı? — Builders Circle" })}>
          <ThreadPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Builders Circle", href: home() }}
        about={t({ en: "Run by members since 2019, paid for by 1,140 supporters.", tr: "2019’dan beri üyeler tarafından yürütülür, 1.140 destekçi tarafından finanse edilir." })}
        contact={{ email: EMAIL }}
        legalLinks={[
          { href: "https://forum.example.com/t/guidelines", label: t({ en: "Guidelines", tr: "Kurallar" }) },
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) },
        ]}
        year={2026}
      />
    </>
  );
}
