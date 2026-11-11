import { BlockHeading, BlockImage, Container, Faq, Footer, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, EMAIL, faq, photos, proofs, WAITING, type SiteLocale } from "./content";
import { Countdown } from "./countdown";
import { LoamMark } from "./loam-mark";
import { ReferralPanel } from "./referral-panel";
import { SignupForm } from "./signup-form";
import { CountUp, Stagger } from "@vamos-ui/react/motion";

const home = (anchor?: string) => sitePageHref("home", anchor);

/** Soft wash over the photo: the scene colour thickens towards the bottom, so text always sits on calm ground. */
const wash = "bg-[linear-gradient(180deg,color-mix(in_oklch,var(--scene)_58%,transparent)_0%,color-mix(in_oklch,var(--scene)_80%,transparent)_42%,var(--scene)_100%)]";

/**
 * One language version of the Loam waitlist: a single page (promise, form, countdown, proof
 * points, FAQ) and the "you're on the list" state with the referral position counter.
 * Server component; the SiteShell in
 * page.tsx picks page and language, the interactive parts are client islands.
 */
export function WaitlistSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };

  return (
    <>
      <Navbar
        {...common}
        variant="minimal"
        wordmark={<LoamMark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Why Loam", tr: "Neden Loam" }), href: home("why") },
          { label: t({ en: "Questions", tr: "Sorular" }), href: home("faq") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("join"), label: t({ en: "Join the list", tr: "Listeye katıl" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Loam — plan the garden your soil can grow", tr: "Loam — toprağınızın yetiştirebileceği bahçeyi planlayın" })}>
          {/* Promise + form over a soft photo */}
          <section className="relative isolate overflow-hidden" aria-labelledby="loam-hero-title">
            <BlockImage
              src={photos.seedlings.src}
              width={photos.seedlings.width}
              height={photos.seedlings.height}
              decorative
              priority
              sizes="100vw"
              className="lm-grow absolute inset-0 -z-20 size-full overflow-hidden"
              imgClassName="size-full object-cover"
            />
            <div aria-hidden className={`absolute inset-0 -z-10 ${wash}`} />
            <style>{loamMotion}</style>
            <Container>
              <div className="grid min-h-[calc(100svh-4.5rem)] items-end gap-10 pt-24 pb-14 lg:grid-cols-12 lg:gap-12 lg:pb-20">
                <div className="lg:col-span-7">
                  <p className="vm-enter m-0 font-mono text-[11px] font-medium tracking-[0.14em] text-fg uppercase">
                    {t({ en: "Garden planner · iPhone, Android, web · spring 2027", tr: "Bahçe planlayıcı · iPhone, Android, web · 2027 baharı" })}
                  </p>
                  <BlockHeading id="loam-hero-title" level={1} size="display-2xl" className="vm-enter vm-enter-title [--vm-i:1] mt-6 max-w-[13ch]" text={t({ en: "Plan the garden your *soil* can actually grow.", tr: "*Toprağınızın* gerçekten yetiştirebileceği bahçeyi planlayın." })} />
                  <p className="vm-enter [--vm-i:2] m-0 mt-7 max-w-[46ch] text-lead text-fg-muted">
                    {t({
                      en: "Draw your plot, tell Loam where the sun falls, and get a sowing calendar for your street — not for a seed packet printed somewhere else.",
                      tr: "Parselinizi çizin, güneşin nereye düştüğünü söyleyin; Loam size başka bir yerde basılmış tohum paketine göre değil, sokağınıza göre bir ekim takvimi çıkarsın.",
                    })}
                  </p>
                </div>

                <div id="join" className="vm-enter [--vm-i:3] surface scroll-mt-24 rounded-ui-lg p-5 sm:p-7 lg:col-span-5">
                  <p className="m-0 flex items-baseline justify-between gap-4">
                    <span className="font-display text-2xl text-fg">{t({ en: "Get in early", tr: "Erken katılın" })}</span>
                    <span className="font-mono text-xs text-fg-muted tabular">
                      <CountUp value={WAITING} locale={intl} duration={1800} /> {t({ en: "waiting", tr: "kişi bekliyor" })}
                    </span>
                  </p>
                  <div className="mt-5">
                    <SignupForm locale={locale} />
                  </div>
                  <div className="mt-6 border-t border-line pt-5">
                    <p className="m-0 mb-3 text-sm text-fg-muted">
                      {t({ en: "First 1,000 get in on", tr: "İlk 1.000 kişi giriyor:" })} <span className="font-medium text-fg">{f.date("2027-03-01", "long")}</span>
                    </p>
                    <Countdown locale={locale} />
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Three proof points */}
          <Section anchor="why" headingId="loam-why-title">
            <Container>
              <SectionHeader
                headingId="loam-why-title"
                align="split"
                eyebrow={t({ en: "Why wait for this one", tr: "Neden bunu bekleyesiniz" })}
                title={t({ en: "Three things we can *already* show", tr: "Şimdiden *gösterebildiğimiz* üç şey" })}
              />
              <Stagger asChild step={110}>
              <ol className="m-0 mt-12 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-8">
                {proofs.map((p, i) => (
                  <li key={t(p.title)} className="flex flex-col gap-3 border-t border-line pt-6">
                    <span className="font-mono text-[11px] text-fg-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
                    <p className="m-0 font-display text-display-xl leading-none text-accent-ink">
                      <ProofValue text={t(p.value)} locale={intl} />
                    </p>
                    <h3 className="m-0 text-lg font-semibold text-fg">{t(p.title)}</h3>
                    <p className="m-0 text-fg-muted">{t(p.text)}</p>
                  </li>
                ))}
              </ol>
              </Stagger>
            </Container>
          </Section>

          <Faq
            {...common}
            anchor="faq"
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Before you *sign up*", tr: "*Katılmadan* önce" })}
            contact={{ link: { href: `mailto:${EMAIL}`, label: t({ en: "Write to the founders", tr: "Kuruculara yazın" }) }, style: "link" }}
            items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))}
            deepLink={false}
          />
        </SiteShellPage>

        <SiteShellPage id="joined" title={t({ en: "You’re on the list — Loam", tr: "Listedesiniz — Loam" })}>
          <section className="relative isolate overflow-hidden" aria-labelledby="loam-joined-title">
            <BlockImage
              src={photos.soil.src}
              width={photos.soil.width}
              height={photos.soil.height}
              decorative
              sizes="100vw"
              className="absolute inset-x-0 top-0 -z-20 h-[34rem] w-full"
              imgClassName="size-full object-cover"
            />
            <div aria-hidden className={`absolute inset-x-0 top-0 -z-10 h-[34rem] ${wash}`} />
            <Container>
              <div className="pt-20 pb-16 sm:pt-28">
                <p className="vm-enter m-0 font-mono text-[11px] font-medium tracking-[0.14em] text-fg uppercase">{t({ en: "Spot saved", tr: "Yeriniz ayrıldı" })}</p>
                <BlockHeading id="loam-joined-title" level={1} size="display-xl" className="vm-enter vm-enter-title [--vm-i:1] mt-4 max-w-[14ch]" text={t({ en: "You’re on the *list.*", tr: "*Listedesiniz.*" })} />
                <p className="m-0 mt-5 max-w-[50ch] text-lead text-fg-muted">
                  {t({ en: "We’ll email you when it’s your turn. Until then, here is where you stand — and how to get in sooner.", tr: "Sıranız geldiğinde e-posta göndereceğiz. O zamana kadar nerede durduğunuz ve nasıl daha erken girebileceğiniz burada." })}
                </p>
                <div className="vm-enter [--vm-i:3] mt-12">
                  <ReferralPanel locale={locale} />
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-end">
                  <ol className="m-0 grid list-none gap-6 p-0 sm:grid-cols-3">
                    {[
                      [t({ en: "Today", tr: "Bugün" }), t({ en: "A confirmation email with your link.", tr: "Bağlantınızı içeren bir onay e-postası." })],
                      [f.date("2027-02-15", "long"), t({ en: "Beta testers get the planner on the web.", tr: "Beta kullanıcıları web planlayıcıya erişir." })],
                      [f.date("2027-03-01", "long"), t({ en: "The first 1,000 get the apps.", tr: "İlk 1.000 kişi uygulamaları alır." })],
                    ].map(([when, what]) => (
                      <li key={when} className="border-s-2 border-accent ps-4">
                        <p className="m-0 font-mono text-xs text-fg-muted">{when}</p>
                        <p className="m-0 mt-1 text-fg">{what}</p>
                      </li>
                    ))}
                  </ol>
                  <Countdown locale={locale} />
                </div>
              </div>
            </Container>
          </section>
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Loam", logo: <LoamMark />, href: home() }}
        contact={{ email: EMAIL }}
        social={[{ network: "instagram", href: "https://instagram.com/loam.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/help", label: t({ en: "Help centre", tr: "Yardım merkezi" }) }]}
        year={2026}
      />
    </>
  );
}

/** A proof value: its leading number counts up, any unit ("4 min") stays put. */
function ProofValue({ text, locale }: { text: string; locale: string }) {
  const m = /^(\d+)(.*)$/.exec(text);
  if (!m) return <>{text}</>;
  return (
    <>
      <CountUp value={Number(m[1])} locale={locale} duration={1600} />
      {m[2]}
    </>
  );
}

/**
 * Loam moves like things that grow: unhurried, upward. The seedling photo settles out of a slow
 * zoom as the page opens; the headline is cut in; numbers count up; and the countdown's digits
 * rise into place as they change, like shoots. Nothing loops except the ticking clock itself.
 */
const loamMotion = `
@keyframes lm-grow { from { transform: scale(1.12) translate3d(0, 2%, 0); } }
@keyframes lm-shoot { from { opacity: 0; transform: translate3d(0, 0.45em, 0); } }
@media screen and (prefers-reduced-motion: no-preference) {
  .lm-grow:where(:not([data-motion="off"] *)) img { animation: lm-grow 2600ms var(--ease-out-quint) backwards; }
  .lm-shoot:where(:not([data-motion="off"] *)) { display: inline-block; animation: lm-shoot 320ms var(--ease-out-quint); }
}
`;
