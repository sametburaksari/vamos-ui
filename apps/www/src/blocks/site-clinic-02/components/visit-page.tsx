"use client";

import * as React from "react";
import { Button, buttonVariants, Checkbox, cn, Progress } from "@vamos-ui/react";
import { Container, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowLeft, ArrowRight, Square, Volume2 } from "lucide-react";
import { fill, ink, scenes, type SceneId } from "./content";
import { StoryScene, useReducedMotion } from "./illustrations";
import { useVisit } from "./visit-provider";

const c = {
  crumbHome: { en: "Paperkite", tr: "Paperkite" },
  crumb: { en: "Your visit", tr: "Ziyaretiniz" },
  title: { en: "Your visit, as a *picture story*", tr: "Ziyaretiniz, *resimli bir hikâye*" },
  lead: { en: "Read it together on the sofa the night before. Children who know what comes next find the real thing much easier.", tr: "Bir gece önce kanepede birlikte okuyun. Sırada ne olduğunu bilen çocuklar için gerçeği çok daha kolay geçer." },
  book: { en: "Picture story: a visit to Paperkite", tr: "Resimli hikâye: Paperkite’a bir ziyaret" },
  page: { en: "Page {n} of {total}", tr: "Sayfa {n} / {total}" },
  prev: { en: "Previous page", tr: "Önceki sayfa" },
  next: { en: "Next page", tr: "Sonraki sayfa" },
  again: { en: "Read again", tr: "Baştan oku" },
  goTo: { en: "Go to page {n}: {title}", tr: "{n}. sayfaya git: {title}" },
  grownUps: { en: "For grown-ups", tr: "Büyükler için" },
  readAloud: { en: "Read aloud", tr: "Sesli oku" },
  stop: { en: "Stop reading", tr: "Okumayı durdur" },
  keys: { en: "Tip: use the ← → keys to turn pages.", tr: "İpucu: sayfaları ← → tuşlarıyla çevirin." },
  bagEyebrow: { en: "Packing list", tr: "Çanta listesi" },
  bagTitle: { en: "Into the *bag*", tr: "*Çantaya* girecekler" },
  bagLead: { en: "Tick them off as you pack. Nothing here is sent anywhere.", tr: "Hazırladıkça işaretleyin. Buradaki hiçbir şey bir yere gönderilmez." },
  packed: { en: "{n} of {total} packed", tr: "{total} şeyin {n} tanesi hazır" },
  ready: { en: "All packed. See you at the blue door!", tr: "Hepsi hazır. Mavi kapıda görüşmek üzere!" },
  bookCta: { en: "Book a visit", tr: "Randevu al" },
};

const bag = [
  { id: "id", label: { en: "Child’s ID card", tr: "Çocuğun kimlik kartı" } },
  { id: "card", label: { en: "Vaccination card", tr: "Aşı kartı" } },
  { id: "meds", label: { en: "Any medicines, or a photo of the box", tr: "Kullandığı ilaçlar ya da kutusunun fotoğrafı" } },
  { id: "ins", label: { en: "Insurance card, if you have private cover", tr: "Özel sigorta varsa sigorta kartı" } },
  { id: "toy", label: { en: "A favourite toy (Teddy gets checked first)", tr: "Sevdiği bir oyuncak (önce Ayıcık’a bakılır)" } },
  { id: "snack", label: { en: "A snack and a drink for afterwards", tr: "Sonrası için bir atıştırmalık ve içecek" } },
];

/** Signature, part two: the picture-story book with page turns, keyboard and read-aloud. */
function PictureBook() {
  const { t, locale } = useVisit();
  const [index, setIndex] = React.useState(0);
  const [speaking, setSpeaking] = React.useState(false);
  const [canSpeak, setCanSpeak] = React.useState(false);
  const pageRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const total = scenes.length;
  const scene = scenes[index]!;
  const titleId = React.useId();

  React.useEffect(() => setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window), []);
  React.useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const go = (next: number) => {
    const n = Math.max(0, Math.min(total - 1, next));
    if (n === index) return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    const dir = n > index ? 1 : -1;
    setIndex(n);
    if (!reduced)
      pageRef.current?.animate(
        [
          { opacity: 0, transform: `perspective(1200px) rotateY(${dir * -14}deg) translateX(${dir * 24}px)` },
          { opacity: 1, transform: "perspective(1200px) rotateY(0) translateX(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
  };

  const speak = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(`${t(scene.title)}. ${t(scene.story)}`);
    u.lang = locale === "tr" ? "tr-TR" : "en-GB";
    u.rate = 0.92;
    u.onend = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t(c.book)}
      onKeyDown={(e) => {
        if (e.target instanceof HTMLInputElement) return;
        if (e.key === "ArrowRight") go(index + 1);
        else if (e.key === "ArrowLeft") go(index - 1);
      }}
      className="rounded-[calc(var(--radius)*2.6)] border-2 border-fg p-3 @3xl:p-5"
      style={{ background: ink.sand }}
    >
      <div
        ref={pageRef}
        role="group"
        aria-roledescription="slide"
        aria-labelledby={titleId}
        className="grid gap-6 rounded-[calc(var(--radius)*2)] border-2 border-fg bg-surface p-5 @3xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @3xl:items-center @3xl:gap-10 @3xl:p-8"
      >
        <StoryScene id={scene.id as SceneId} className="w-full" />
        <div className="flex flex-col gap-4" aria-live="polite">
          <p className="text-small font-semibold text-fg-muted tabular-nums">{fill(t(c.page), { n: index + 1, total })}</p>
          <h2 id={titleId} className="font-display text-display-m font-bold leading-[1.02] text-fg">
            {t(scene.title)}
          </h2>
          <p className="text-[1.25rem] leading-relaxed text-fg">{t(scene.story)}</p>
          <aside className="rounded-ui-lg border border-dashed border-line px-4 py-3 text-small text-fg-muted">
            <span className="font-semibold text-fg">{t(c.grownUps)}: </span>
            {t(scene.grownUps)}
          </aside>
          {canSpeak ? (
            <Button variant="ghost" className="self-start rounded-full" onClick={speak} aria-pressed={speaking}>
              {speaking ? <Square aria-hidden /> : <Volume2 aria-hidden />}
              {speaking ? t(c.stop) : t(c.readAloud)}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-1">
        <Button variant="secondary" size="lg" className="rounded-full border-2 border-fg" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t(c.prev)}>
          <ArrowLeft aria-hidden />
        </Button>
        <ol className="flex items-center gap-2" aria-label={t(c.book)}>
          {scenes.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={fill(t(c.goTo), { n: i + 1, title: t(s.title) })}
                className={cn("block h-3.5 rounded-full border-2 border-fg transition-all duration-300 focus-ring", i === index ? "w-9 bg-accent" : i < index ? "w-3.5 bg-fg" : "w-3.5 bg-surface")}
              />
            </li>
          ))}
        </ol>
        {index < total - 1 ? (
          <Button variant="primary" size="lg" className="rounded-full" onClick={() => go(index + 1)} aria-label={t(c.next)}>
            <ArrowRight aria-hidden />
          </Button>
        ) : (
          <Button variant="primary" size="lg" className="rounded-full" onClick={() => go(0)}>
            {t(c.again)}
          </Button>
        )}
      </div>
      <p className="mt-3 hidden px-1 text-small text-fg @3xl:block">{t(c.keys)}</p>
    </section>
  );
}

function PackingList() {
  const { t, start } = useVisit();
  const [done, setDone] = React.useState<string[]>([]);
  const n = done.length;
  return (
    <Section aria-labelledby="pk-bag-title" theme={{ surface: "surface-2" }}>
      <Container>
        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <SectionHeader headingId="pk-bag-title" eyebrow={t(c.bagEyebrow)} title={t(c.bagTitle)} lead={t(c.bagLead)} />
          <div className="flex flex-col gap-5 rounded-[calc(var(--radius)*1.8)] border-2 border-fg bg-surface p-6">
            <ul className="grid gap-3 @2xl:grid-cols-2">
              {bag.map((b) => (
                <li key={b.id} className="rounded-ui border border-line px-3 py-2.5">
                  <Checkbox
                    id={`pk-bag-${b.id}`}
                    checked={done.includes(b.id)}
                    onCheckedChange={(v) => setDone((d) => (v === true ? [...d, b.id] : d.filter((x) => x !== b.id)))}
                    label={t(b.label)}
                  />
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              <Progress value={(n / bag.length) * 100} aria-label={fill(t(c.packed), { n, total: bag.length })} />
              <p className="text-small font-medium text-fg" aria-live="polite">
                {n === bag.length ? t(c.ready) : fill(t(c.packed), { n, total: bag.length })}
              </p>
            </div>
            {n === bag.length ? (
              <Button variant="primary" className="self-start rounded-full" onClick={() => start()}>
                {t(c.bookCta)}
                <ArrowRight aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function VisitPage() {
  const { t, locale } = useVisit();
  return (
    <>
      <PageIntro
        locale={locale === "tr" ? "tr-TR" : "en-GB"}
        variant="simple"
        breadcrumb={[{ label: t(c.crumbHome), href: sitePageHref("home") }, { label: t(c.crumb) }]}
        title={t(c.title)}
        lead={t(c.lead)}
      />
      <Section aria-label={t(c.book)} className="!pt-0">
        <Container>
          <PictureBook />
          <p className="mt-6 text-center">
            <a href={sitePageHref("book")} className={cn(buttonVariants({ variant: "link" }))}>
              {t(c.bookCta)} →
            </a>
          </p>
        </Container>
      </Section>
      <PackingList />
    </>
  );
}

/** A still page of the book for the home teaser. */
export function StoryPreview() {
  return (
    <div className="rounded-[calc(var(--radius)*2)] border-2 border-fg bg-surface p-3">
      <StoryScene id="scale" className="w-full" />
    </div>
  );
}
