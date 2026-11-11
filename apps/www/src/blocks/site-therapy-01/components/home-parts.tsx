import { buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { concerns, copyFor, fill, intlOf, photos, type SiteLocale } from "./content";
import { CountUp, Stagger } from "@vamos-ui/react/motion";

const c = {
  eyebrow: { en: "Counselling & psychotherapy · Moda, Kadıköy", tr: "Psikolojik danışmanlık ve psikoterapi · Moda, Kadıköy" },
  title: { en: "A quiet room to say it *out loud*", tr: "Söylemek için *sessiz* bir oda" },
  lead: {
    en: "Three therapists, two rooms on a side street by the sea, and fifty unhurried minutes a week. Start with a free 15-minute call — no forms, no surname needed.",
    tr: "Üç terapist, deniz kenarında ara sokakta iki oda ve haftada elli acelesiz dakika. Ücretsiz 15 dakikalık bir görüşmeyle başlayın — form yok, soyadı gerekmez.",
  },
  book: { en: "Book a free 15-minute call", tr: "Ücretsiz 15 dakikalık görüşme" },
  how: { en: "How we work", tr: "Nasıl çalışıyoruz" },
  caption: { en: "Moda, 18:40 — from the window of room 2", tr: "Moda, 18:40 — 2 numaralı odanın penceresinden" },
  next: { en: "Next first-session opening", tr: "Bir sonraki ilk seans boşluğu" },
  nextWith: { en: "{day} · {time} with Ayla Uçar", tr: "{day} · {time}, Ayla Uçar ile" },
  facts: [
    { n: "50", unit: { en: "min", tr: "dk" }, label: { en: "every session, never cut short", tr: "her seans, asla kısaltılmaz" } },
    { n: "21:00", unit: { en: "", tr: "" }, label: { en: "last appointment, Monday to Thursday", tr: "son randevu, pazartesiden perşembeye" } },
    { n: "6", unit: { en: "a week", tr: "/hafta" }, label: { en: "reduced-fee places, no questions", tr: "indirimli yer, soru sormadan" } },
  ],
  bring: { en: "What people bring", tr: "İnsanların getirdikleri" },
  bringTitle: { en: "You don’t need a *reason* that sounds big enough", tr: "Yeterince *büyük* görünen bir nedene ihtiyacınız yok" },
  bringLead: {
    en: "Most first calls begin with “I’m not sure this counts”. It does. These are the things people most often come with — and plenty come with none of them.",
    tr: "İlk görüşmelerin çoğu “Bu sayılır mı bilmiyorum” diye başlar. Sayılır. İnsanların en sık getirdikleri şunlar — pek çoğu ise hiçbiriyle gelmez.",
  },
  noReviews: {
    en: "We don’t publish client testimonials. What is said in the room stays there — including the fact that someone came.",
    tr: "Danışan yorumu yayımlamıyoruz. Odada konuşulan orada kalır — birinin geldiği bilgisi de dahil.",
  },
};

/**
 * The practice moves the way the room should feel: slowly, without surprise. Signature: the
 * arched window opens like light coming up — the sea photo is uncovered from the sill upward and
 * eases out of a slight zoom — then the next opening is laid quietly on top. Long, soft eases;
 * no bounce anywhere. Reduced motion shows the finished room.
 */
const roomMotion = `
@keyframes qh-dawn { from { clip-path: inset(100% 0 0 0 round 999px 999px 0 0); } to { clip-path: inset(0 0 0 0 round 999px 999px 0 0); } }
@keyframes qh-ease { from { transform: scale(1.08); } }
@keyframes qh-line { from { transform: scaleX(0); } }
@keyframes qh-note { from { opacity: 0; } }
@media screen and (prefers-reduced-motion: no-preference) {
  .qh-window:where(:not([data-motion="off"] *)) { animation: qh-dawn 1800ms var(--ease-in-out) 200ms backwards; }
  .qh-window:where(:not([data-motion="off"] *)) img { animation: qh-ease 2600ms var(--ease-out-quint) 200ms backwards; }
  .qh-line:where(:not([data-motion="off"] *)) { transform-origin: left center; animation: qh-line 1200ms var(--ease-in-out) 300ms backwards; }
  [dir="rtl"] .qh-line { transform-origin: right center; }
  .qh-note:where(:not([data-motion="off"] *)) { animation: qh-note 1000ms linear 1700ms backwards; }
}
`;

const em = (s: string) => s.split("*").map((p, i) => (i === 1 ? <em key={i} className="text-accent-ink">{p}</em> : p));

/** Calm editorial hero: a big light serif sentence, a ledger of three facts, the sea inside an arched window. */
export function TherapyHero({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const intl = intlOf(locale);
  // A fixed opening keeps server and client output identical.
  const day = new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date("2026-11-19T12:00:00Z"));
  return (
    <Section aria-labelledby="qh-hero-title" theme={{ rhythm: "loose" }} className="overflow-hidden">
      <Container>
        <div className="grid gap-14 @4xl:grid-cols-12 @4xl:gap-10">
          <div className="flex min-w-0 flex-col @4xl:col-span-7 @4xl:pt-10">
            <style>{roomMotion}</style>
            <p className="vm-enter flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-fg-muted uppercase">
              <span aria-hidden className="qh-line h-px w-10 bg-accent" />
              {t(c.eyebrow)}
            </p>
            <h1 id="qh-hero-title" className="vm-enter [--vm-i:1] mt-8 max-w-[14ch] font-display text-display-2xl text-balance text-fg">
              {em(t(c.title))}
            </h1>
            <p className="vm-enter [--vm-i:2] mt-8 max-w-[46ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="vm-enter [--vm-i:3] mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={sitePageHref("contact")} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "vm-press rounded-full px-6")}>
                {t(c.book)}
              </a>
              <a href={sitePageHref("approach")} className="focus-ring group inline-flex items-center gap-2 rounded-sm font-medium text-fg underline decoration-line underline-offset-[6px] hover:decoration-accent">
                {t(c.how)}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180" />
              </a>
            </div>

            <dl className="vm-enter [--vm-i:4] mt-16 grid grid-cols-1 border-t border-line @md:grid-cols-3">
              {c.facts.map((f, i) => (
                <div key={i} className="flex flex-col gap-2 border-b border-line py-5 @md:border-b-0 @md:border-s @md:ps-5 @md:first:border-s-0 @md:first:ps-0">
                  <dt className="order-2 text-small text-fg-muted">{t(f.label)}</dt>
                  <dd className="order-1 flex items-baseline gap-1.5 font-display text-display-m text-fg">
                    <span className="tabular">{/^\d+$/.test(f.n) ? <CountUp value={Number(f.n)} duration={2200} /> : f.n}</span>
                    {t(f.unit) ? <span className="font-sans text-small text-fg-muted">{t(f.unit)}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative mx-auto w-full max-w-[28rem] self-start @4xl:col-span-5 @4xl:max-w-none">
            <div className="relative">
              <div className="qh-window overflow-hidden rounded-t-[999px] rounded-b-[var(--radius)] border border-line bg-surface-2 p-2.5">
                <Image
                  src={photos.sea.src}
                  width={photos.sea.width}
                  height={photos.sea.height}
                  focal={photos.sea.focal}
                  alt={t(photos.sea.alt)}
                  aspect={3 / 4}
                  priority
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  className="rounded-t-[999px] rounded-b-[calc(var(--radius)-4px)]"
                />
              </div>
              <div className="qh-note surface relative -mt-6 ms-auto me-4 flex max-w-[19rem] flex-col gap-1 rounded-[var(--radius)] p-4 shadow-sm @4xl:absolute @4xl:-start-14 @4xl:bottom-10 @4xl:m-0">
                <p className="text-xs font-medium tracking-wide text-fg-muted uppercase">{t(c.next)}</p>
                <p className="font-display text-h3 text-fg">{fill(t(c.nextWith), { day, time: "18:30" })}</p>
              </div>
            </div>
            <figcaption className="mt-3 font-mono text-xs text-fg-muted @4xl:text-end">{t(c.caption)}</figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}

/** "What people bring": a typographic index instead of icon cards, and why there are no reviews. */
export function Concerns({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  return (
    <Section anchor="bring" theme={{ surface: "surface-2" }} headingId="qh-bring-h">
      <Container>
        <SectionHeader eyebrow={t(c.bring)} title={t(c.bringTitle)} lead={t(c.bringLead)} align="split" headingId="qh-bring-h" className="mb-12" />
        <Stagger asChild effect="fade" step={110} duration={1100}>
        <ol className="grid border-t border-line @3xl:grid-cols-2 @3xl:gap-x-12">
          {concerns.map((item, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-line py-6">
              <span aria-hidden className="font-mono text-xs text-fg-subtle tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="font-display text-display-m text-fg">{t(item.name)}</span>
                <span className="text-fg-muted">{t(item.line)}</span>
              </span>
            </li>
          ))}
        </ol>
        </Stagger>
        <p className="mt-10 flex max-w-[60ch] gap-3 text-small text-fg-muted">
          <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
          {t(c.noReviews)}
        </p>
      </Container>
    </Section>
  );
}
