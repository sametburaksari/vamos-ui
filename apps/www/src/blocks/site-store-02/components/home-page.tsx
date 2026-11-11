"use client";

import { Image } from "@vamos-ui/react";
import { Container, Faq, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowUpRight } from "lucide-react";
import { copyFor, LIVE_DROP, lookbook, NEXT_DROP, nextDropItems, products } from "./content";
import { CalendarLink, DropCountdown, DropDate, NotifyForm } from "./countdown";
import { LockedTile, ProductTile } from "./drop-card";
import { useDrop, useDropClock } from "./drop-provider";
import { Stagger, Ticker } from "@vamos-ui/react/motion";

const pad = (n: number) => String(n).padStart(2, "0");

/** A thin running strip of drop facts (the kit Ticker: pauses on hover, focus and its control; static for reduced motion). */
function FactStrip() {
  const { t } = useDrop();
  const facts = [
    `Drop ${pad(NEXT_DROP.no)} — ${t(NEXT_DROP.name)}`,
    t({ en: "4 pieces", tr: "4 parça" }),
    t({ en: "Runs of 20 to 140", tr: "20 ile 140 adetlik seriler" }),
    t({ en: "One per size per customer", tr: "Kişi başı her bedenden bir" }),
    t({ en: "Pick-up in Yeldeğirmeni", tr: "Yeldeğirmeni’nden teslim" }),
    t({ en: "No restocks", tr: "Yeniden üretim yok" }),
  ];
  return (
    <div className="nb-facts border-b border-line py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
      <Ticker as="ul" duration={38} gap="2rem" fade={false} aria-label={t({ en: "Drop facts", tr: "Drop bilgileri" })} pauseLabel={t({ en: "Pause animation", tr: "Animasyonu durdur" })}>
        {facts.map((f) => (
          <li key={f} className="flex items-center gap-8 whitespace-nowrap">
            <span>{f}</span>
            <span aria-hidden className="size-1.5 bg-accent" />
          </li>
        ))}
      </Ticker>
      <style>{dropMotion}</style>
    </div>
  );
}

/**
 * Night Shift moves loud: full motion level, hard cuts and fast wipes, no softness. The
 * headline is cut in line by line; the countdown digits flip like a departures board as they
 * change; lookbook frames wipe up like a print. Everything stops for reduced motion.
 */
const dropMotion = `
@keyframes nb-flip { from { transform: translate3d(0, -0.35em, 0) rotateX(70deg); opacity: 0; } }
/* Static strip (reduced motion): a fixed-column grid, so a late web font cannot re-wrap it. */
@media (prefers-reduced-motion: reduce) {
  .nb-facts .vm-marquee .vm-marquee-group { display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); row-gap: 0.5rem; justify-items: start; }
}
@media screen and (prefers-reduced-motion: no-preference) {
  [data-countdown] .nb-flip:where(:not([data-motion="off"] *)) { display: inline-block; transform-origin: 50% 0; animation: nb-flip 260ms var(--ease-out-expo); }
}
`;

/** A section head in the house style: index number, caps title, a ruled line, a link. */
function Head({ no, id, title, aside }: { no: string; id: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-px grid grid-cols-[auto_minmax(0,1fr)] items-end gap-x-4 gap-y-2 border-b border-fg pb-3 @3xl:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">{no}</span>
      <h2 id={id} className="font-display text-display-m uppercase leading-[0.9]">
        {title}
      </h2>
      {aside ? <div className="col-span-2 @3xl:col-span-1">{aside}</div> : null}
    </div>
  );
}

export function HomePage() {
  const { t, locale } = useDrop();
  const { live } = useDropClock();
  const { intl, labels } = copyFor(locale);
  const hero = nextDropItems[1]!;
  const liveDrop = products.filter((p) => p.drop === LIVE_DROP.no);

  return (
    <>
      <FactStrip />

      {/* Hero: the countdown is the headline. */}
      <Section anchor="drop" aria-labelledby="nb-h1" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <div className="grid border border-line @4xl:grid-cols-12">
            <div className="flex flex-col gap-6 p-4 @3xl:p-6 @4xl:col-span-7 @4xl:border-e @4xl:border-line">
              <p className="vm-enter flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
                <span className="text-accent-ink">{live ? t({ en: "Live now", tr: "Şimdi açık" }) : t({ en: "Next drop", tr: "Sıradaki drop" })}</span>
                <span>
                  <DropDate />
                </span>
                <span>{t({ en: "Istanbul time", tr: "TSİ" })}</span>
              </p>
              <h1 id="nb-h1" tabIndex={-1} className="font-display text-[clamp(3.6rem,1rem+12cqi,11.5rem)] font-[800] uppercase leading-[0.8] tracking-[-0.045em] outline-none">
                <span className="vm-enter [--vm-i:1] block font-mono text-[0.22em] font-medium tracking-[-0.02em] text-fg-muted">Drop {pad(NEXT_DROP.no)}</span>
                <span className="vm-enter vm-enter-title [--vm-i:2] block">{t({ en: "Night", tr: "Gece" })}</span>
                <span className="vm-enter vm-enter-title [--vm-i:3] block text-accent-ink">{t({ en: "Shift", tr: "Vardiyası" })}</span>
              </h1>
              <DropCountdown className="vm-enter [--vm-i:4]" />
              <p className="vm-enter [--vm-i:5] max-w-[52ch] text-pretty text-fg-muted">
                {t({
                  en: "Four pieces cut for the last ferry home: a moto jacket in a run of twenty, a hoodie, a knit and a hi-vis track set. Online and at the shop at the same second. When they’re gone, they’re gone.",
                  tr: "Eve son vapurla dönenler için dört parça: yirmi adetlik bir moto ceket, bir kapüşonlu, bir triko ve bir yüksek görünürlük eşofman takımı. Online ve dükkânda aynı saniyede. Bitince bitti.",
                })}
              </p>
              <div className="vm-enter [--vm-i:6] grid gap-3 @3xl:grid-cols-[minmax(0,1fr)_auto] @3xl:items-end">
                {live ? null : <NotifyForm />}
                <CalendarLink />
              </div>
            </div>
            <figure className="vm-enter vm-enter-media [--vm-i:2] relative overflow-hidden border-t border-line @4xl:col-span-5 @4xl:min-h-[36rem] @4xl:border-t-0">
              <Image
                src={hero.photo.src}
                width={hero.photo.width}
                height={hero.photo.height}
                focal={hero.photo.focal}
                alt={t(hero.photo.alt)}
                aspect="4/5"
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="@4xl:absolute! @4xl:inset-0 @4xl:h-full"
                imgClassName="@4xl:h-full"
              />
              <figcaption className="absolute inset-x-0 bottom-0 grid grid-cols-2 border-t border-line bg-scene font-mono text-[10px] uppercase tracking-[0.14em] text-fg">
                <span className="border-e border-line px-2.5 py-2">{hero.code}</span>
                <span className="px-2.5 py-2">
                  {t(hero.name)} · {t({ en: "run of", tr: "seri" })} {hero.run}
                </span>
              </figcaption>
            </figure>
          </div>
        </Container>
      </Section>

      {/* Drop 07 preview: priced, locked. */}
      <Section anchor="preview" aria-labelledby="nb-preview" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <Head
            no={`/ ${pad(NEXT_DROP.no)}`}
            id="nb-preview"
            title={t({ en: "What drops Saturday", tr: "Cumartesi çıkanlar" })}
            aside={<p className="max-w-[36ch] text-small text-fg-muted">{t({ en: "Set a reminder per piece. We text 10 minutes before — never after.", tr: "Her parça için ayrı hatırlatma kurun. 10 dakika önce SMS atarız — asla sonra değil." })}</p>}
          />
          <Stagger asChild step={70}>
          <div className="grid grid-cols-2 gap-px border border-line bg-line @4xl:grid-cols-4">
            {nextDropItems.map((item) => (
              <LockedTile key={item.id} item={item} />
            ))}
          </div>
          </Stagger>
        </Container>
      </Section>

      {/* Drop 06, still live: the dense grid. */}
      <Section anchor="live" aria-labelledby="nb-live" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <Head
            no={`/ ${pad(LIVE_DROP.no)}`}
            id="nb-live"
            title={t({ en: `Still live — ${LIVE_DROP.name.en}`, tr: `Hâlâ açık — ${LIVE_DROP.name.tr}` })}
            aside={
              <a href={sitePageHref("archive")} className="vm-nudge inline-flex items-center gap-1.5 rounded-[2px] font-mono text-[11px] uppercase tracking-[0.14em] text-fg hover:text-accent-ink focus-ring">
                {t({ en: "Full archive", tr: "Tüm arşiv" })}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            }
          />
          <Stagger asChild effect="fade" step={50}>
          <div className="grid grid-cols-2 gap-px border border-line bg-line @3xl:grid-cols-3 @6xl:grid-cols-6">
            {liveDrop.map((p, i) => (
              <ProductTile key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
          </Stagger>
        </Container>
      </Section>

      {/* Lookbook strip. */}
      <Section anchor="lookbook" aria-labelledby="nb-look" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <Head no="/ LB" id="nb-look" title={t({ en: "Shot on the Kadıköy pier", tr: "Kadıköy iskelesinde çekildi" })} />
          <Stagger asChild effect="clip" step={90}>
          <ul className="grid grid-cols-2 gap-px border border-line bg-line @4xl:grid-cols-4">
            {lookbook.map((ph, i) => (
              <li key={ph.src} className="bg-scene">
                <figure>
                  <Image src={ph.src} width={ph.width} height={ph.height} focal={ph.focal} alt={t(ph.alt)} aspect="4/5" sizes="(min-width: 1024px) 25vw, 50vw" />
                  <figcaption className="flex gap-3 p-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
                    <span className="text-fg">{pad(i + 1)}</span>
                    {t(ph.caption)}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
          </Stagger>
        </Container>
      </Section>

      {/* How drops work: three rules, then the FAQ. */}
      <Section anchor="rules" aria-labelledby="nb-rules" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <Head no="/ ?" id="nb-rules" title={t({ en: "How a drop works", tr: "Drop nasıl işler" })} />
          <Stagger asChild step={90}>
          <ol className="grid border-x border-b border-line @3xl:grid-cols-3">
            {[
              {
                k: "19:50",
                title: t({ en: "Ten-minute warning", tr: "On dakika kala" }),
                body: t({ en: "Reminders go out by SMS or e-mail. The product pages are already up, sizes greyed out.", tr: "Hatırlatmalar SMS ya da e-postayla gider. Ürün sayfaları açıktır, bedenler gri." }),
              },
              {
                k: "20:00",
                title: t({ en: "Same second, both doors", tr: "Aynı saniye, iki kapı" }),
                body: t({ en: "Online and the Yeldeğirmeni shop open together. One per size per customer, checked by card and address.", tr: "Online ve Yeldeğirmeni dükkânı birlikte açılır. Kişi başı her bedenden bir; kart ve adresle kontrol edilir." }),
              },
              {
                k: "+15′",
                title: t({ en: "Bag holds for 15 minutes", tr: "Çanta 15 dakika tutulur" }),
                body: t({ en: "Unpaid bags go back into stock at 20:15. No bots, no queues, no restocks — ever.", tr: "Ödenmeyen çantalar 20:15’te stoğa döner. Bot yok, sıra yok, yeniden üretim yok — hiçbir zaman." }),
              },
            ].map((r, i) => (
              <li key={r.k} className={`flex flex-col gap-3 p-4 @3xl:p-5 ${i > 0 ? "border-t border-line @3xl:border-s @3xl:border-t-0" : ""}`}>
                <span className="tabular font-mono text-[2.25rem] font-medium leading-none tracking-[-0.04em] text-fg">{r.k}</span>
                <h3 className="font-display text-h3 uppercase">{r.title}</h3>
                <p className="text-small text-fg-muted">{r.body}</p>
              </li>
            ))}
          </ol>
          </Stagger>
        </Container>
      </Section>

      <Faq
        locale={intl}
        labels={labels}
        variant="split"
        anchor="faq"
        theme={{ rhythm: "tight" }}
        eyebrow={t({ en: "Questions", tr: "Sorular" })}
        title={t({ en: "Before you set an alarm", tr: "Alarm kurmadan önce" })}
        items={[
          {
            q: t({ en: "Will Drop 07 be restocked?", tr: "Drop 07 yeniden üretilecek mi?" }),
            a: t({ en: "No. Every run is cut once, and the number on the tag is the number that exists. Sold-out pieces stay in the archive as a record.", tr: "Hayır. Her seri bir kez kesilir; etiketteki sayı, var olan sayıdır. Tükenen parçalar kayıt olarak arşivde kalır." }),
          },
          {
            q: t({ en: "How fast do you ship?", tr: "Ne kadar hızlı gönderiyorsunuz?" }),
            a: t({ en: "Orders placed on drop night leave on Monday. Türkiye 1–2 working days (free over ₺3,000), Europe 4–6 ($18), rest of the world 6–10 ($28). Pick-up from the shop is free from Sunday 12:00.", tr: "Drop gecesi verilen siparişler pazartesi çıkar. Türkiye 1–2 iş günü (3.000 ₺ üzeri ücretsiz), Avrupa 4–6 (18 $), dünyanın geri kalanı 6–10 iş günü (28 $). Dükkândan teslim pazar 12:00’den itibaren ücretsiz." }),
          },
          {
            q: t({ en: "Can I return a drop piece?", tr: "Drop parçasını iade edebilir miyim?" }),
            a: t({ en: "Yes, within 14 days, unworn with the numbered tag on. Returned pieces are re-listed in the archive the following Friday at 12:00.", tr: "Evet, 14 gün içinde, giyilmemiş ve numaralı etiketi üzerindeyken. İade edilen parçalar sonraki cuma 12:00’de arşive yeniden eklenir." }),
          },
          {
            q: t({ en: "Why one per size?", tr: "Neden her bedenden bir?" }),
            a: t({ en: "So the jacket in a run of twenty ends up on twenty people, not on a resale site. Orders over the limit are cancelled and refunded the same night.", tr: "Yirmi adetlik ceket bir ikinci el sitesinde değil, yirmi kişinin üzerinde olsun diye. Sınırı aşan siparişler aynı gece iptal edilip iade edilir." }),
          },
        ]}
      />
    </>
  );
}
