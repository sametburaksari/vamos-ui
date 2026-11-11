"use client";

import * as React from "react";
import { Button, cn, Field, NumberInput, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { amounts, copyFor, splitGift, type GiftLine, type SiteLocale } from "./content";
import { giftAmount, setGift, useGift } from "./gift-store";

const MIN = 50;
const MAX_SPINES = 180;

/** Deterministic spine look for book n: height and tone repeat without looking regular. */
const spineHeight = (n: number) => 58 + ((n * 37) % 43);
const spineTone = (n: number) => ["bg-fg", "bg-accent", "bg-fg-muted", "bg-fg", "bg-fg-subtle", "bg-fg-muted", "bg-accent"][(n * 5) % 7];
const spineWidth = (n: number) => ["w-[5px]", "w-[7px]", "w-1", "w-[6px]"][(n * 3) % 4];

/**
 * The signature of the Open Shelf site: pick an amount (one-off or monthly, presets or your
 * own) and the slip beside it itemises what it buys — shelves, boxes of books, story hours,
 * first cards — while the books appear on a shelf drawn underneath. Shared state, so a choice
 * made on the home page is waiting on the donate page.
 */
export function GiftBuilder({ locale, variant = "home", headingId }: { locale: SiteLocale; variant?: "home" | "donate"; headingId?: string }) {
  const { t, lira } = copyFor(locale);
  const gift = useGift();
  const monthly = gift.frequency === "monthly";
  const presets = monthly ? amounts.monthly : amounts.once;
  const amount = giftAmount(gift);
  const tooSmall = gift.preset === "other" && amount > 0 && amount < MIN;
  const valid = amount >= MIN;
  const split = splitGift(valid ? amount : 0);
  const year = splitGift(valid && monthly ? amount * 12 : 0);
  const otherRef = React.useRef<HTMLInputElement>(null);

  const changeFrequency = (v: string) => {
    if (v !== "once" && v !== "monthly") return;
    const list = v === "monthly" ? amounts.monthly : amounts.once;
    const keep = gift.preset === "other" || list.includes(Number(gift.preset));
    setGift({ frequency: v, preset: keep ? gift.preset : String(list[1]) });
  };

  const summary = valid
    ? t({
        en: `${lira(amount)}${monthly ? " a month" : ""} buys ${describe(split.lines, "en")}.`,
        tr: `${lira(amount)}${monthly ? " aylık bağış" : ""} ile ${describe(split.lines, "tr")} alınır.`,
      })
    : t({ en: `Choose an amount of at least ${lira(MIN)}.`, tr: `En az ${lira(MIN)} tutarında bir bağış seçin.` });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      {/* Controls */}
      <div className="flex flex-col gap-6">
        <div>
          <p id={`${headingId ?? "gift"}-freq`} className="m-0 mb-2 font-mono text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">
            {t({ en: "How often", tr: "Ne sıklıkla" })}
          </p>
          <ToggleGroup type="single" value={gift.frequency} onValueChange={changeFrequency} aria-labelledby={`${headingId ?? "gift"}-freq`} block>
            <ToggleGroupItem value="once">{t({ en: "One-off", tr: "Tek seferlik" })}</ToggleGroupItem>
            <ToggleGroupItem value="monthly">{t({ en: "Monthly", tr: "Aylık" })}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <p id={`${headingId ?? "gift"}-amount`} className="m-0 mb-2 font-mono text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">
            {t({ en: "Amount", tr: "Tutar" })}
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            size="lg"
            value={gift.preset}
            onValueChange={(v) => {
              if (!v) return;
              setGift({ preset: v });
              if (v === "other") requestAnimationFrame(() => otherRef.current?.focus());
            }}
            aria-labelledby={`${headingId ?? "gift"}-amount`}
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {presets.map((p) => (
              <ToggleGroupItem key={p} value={String(p)} className="w-full font-display text-xl tabular-nums data-[state=on]:border-accent data-[state=on]:bg-accent data-[state=on]:text-accent-fg">
                {lira(p)}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem value="other" className="w-full data-[state=on]:border-accent data-[state=on]:bg-accent data-[state=on]:text-accent-fg">
              {t({ en: "Other", tr: "Diğer" })}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {gift.preset === "other" ? (
          <Field
            label={monthly ? t({ en: "Your monthly amount", tr: "Aylık tutarınız" }) : t({ en: "Your amount", tr: "Tutarınız" })}
            hint={t({ en: `${lira(MIN)} or more. Whole lira.`, tr: `${lira(MIN)} veya üzeri. Tam lira.` })}
            error={tooSmall ? t({ en: `The smallest gift we can process is ${lira(MIN)}.`, tr: `İşleyebildiğimiz en küçük bağış ${lira(MIN)}.` }) : undefined}
          >
            <NumberInput
              ref={otherRef}
              value={gift.other}
              onValueChange={(v) => setGift({ other: v })}
              min={0}
              max={1_000_000}
              step={50}
              precision={0}
              stepper
              size="lg"
              leading={<span className="font-mono text-sm text-fg-muted">₺</span>}
              validateOn="change"
              inputClassName="font-display text-xl tabular-nums"
            />
          </Field>
        ) : null}

        <p className="m-0 text-small text-fg-muted">
          {monthly
            ? t({ en: "Monthly gifts let us promise a shelf keeper a full year. Change or stop any time from the link in your receipt.", tr: "Aylık bağışlar, bir raf sorumlusuna tam bir yıl söz verebilmemizi sağlar. Makbuzunuzdaki bağlantıdan dilediğiniz zaman değiştirin ya da durdurun." })
            : t({ en: "Every lira goes to the Winter Reading Drive unless you tell us otherwise.", tr: "Aksini belirtmediğiniz sürece her lira Kış Okuma Kampanyası’na gider." })}
        </p>

        {variant === "home" ? (
          <Button asChild variant="primary" size="lg" className="self-start">
            <a href={sitePageHref("donate")}>
              {valid
                ? t({ en: `Give ${lira(amount)}${monthly ? " a month" : ""}`, tr: `${lira(amount)}${monthly ? " aylık" : ""} bağışla` })
                : t({ en: "Continue to donate", tr: "Bağışa devam et" })}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </a>
          </Button>
        ) : null}
      </div>

      {/* The slip: what the gift buys */}
      <figure className="m-0 flex min-w-0 flex-col border border-fg bg-surface">
        <figcaption className="flex items-baseline justify-between gap-4 border-b border-fg px-4 py-3 sm:px-6">
          <span className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase">{t({ en: "What it buys", tr: "Neye dönüşür" })}</span>
          <span className="font-mono text-[11px] text-fg-muted tabular-nums">{monthly ? t({ en: "per month", tr: "her ay" }) : t({ en: "once", tr: "bir kez" })}</span>
        </figcaption>

        <p className="sr-only" aria-live="polite">
          {summary}
        </p>

        <div className="relative px-4 pt-5 pb-2 sm:px-6">
          <p aria-hidden className="m-0 font-display text-display-l leading-none tabular-nums">
            {valid ? lira(amount) : "—"}
          </p>
          {/* Date-due stamp */}
          <span
            aria-hidden
            className="absolute end-4 top-5 hidden rotate-[-8deg] border-2 border-accent-ink px-2 py-1 font-mono text-[10px] leading-tight font-semibold tracking-[0.12em] text-accent-ink uppercase sm:block"
          >
            {t({ en: "Winter drive", tr: "Kış kampanyası" })}
            <br />
            {t({ en: "Thank you", tr: "Teşekkürler" })}
          </span>
        </div>

        <ol className="m-0 list-none p-0 px-4 sm:px-6" aria-label={t({ en: "Items", tr: "Kalemler" })}>
          {split.lines.length === 0 ? (
            <li className="border-t border-dashed border-line py-3 text-small text-fg-muted">{summary}</li>
          ) : (
            split.lines.map((l) => (
              <li key={l.item.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-3 border-t border-dashed border-line py-3">
                <span className="font-display text-2xl leading-none tabular-nums">{l.count}</span>
                <span className="min-w-0">
                  <span className="block font-medium">{t(l.count === 1 ? l.item.one : l.item.many)}</span>
                  <span className="block text-small text-fg-muted">{t(l.item.detail)}</span>
                </span>
                <span className="font-mono text-xs text-fg-muted tabular-nums">{lira(l.count * l.item.price)}</span>
              </li>
            ))
          )}
          {valid && split.rest > 0 ? (
            <li className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-3 border-t border-dashed border-line py-3 text-fg-muted">
              <span aria-hidden className="font-display text-2xl leading-none">+</span>
              <span className="text-small">{t({ en: "towards the next child’s first card", tr: "bir sonraki çocuğun ilk kartına" })}</span>
              <span className="font-mono text-xs tabular-nums">{lira(split.rest)}</span>
            </li>
          ) : null}
        </ol>

        {/* The shelf */}
        <div className="mt-auto px-4 pt-6 sm:px-6">
          <div aria-hidden className="flex h-20 items-end gap-[2px] overflow-hidden border-b-[5px] border-fg" data-testid="gift-shelf">
            {Array.from({ length: Math.min(split.books, MAX_SPINES) }, (_, n) => (
              <span
                key={n}
                className={cn("block shrink-0 origin-bottom rounded-t-[1px] transition-transform duration-300 starting:scale-y-0 motion-reduce:transition-none", spineTone(n), spineWidth(n))}
                style={{ height: `${spineHeight(n)}%` }}
              />
            ))}
          </div>
          <p className="m-0 flex justify-between gap-4 py-3 font-mono text-[11px] text-fg-muted tabular-nums">
            <span data-testid="gift-books">
              {split.books > 0
                ? t({ en: `${fmt(split.books, locale)} ${split.books === 1 ? "book" : "books"} on a shelf`, tr: `rafta ${fmt(split.books, locale)} kitap` })
                : t({ en: "No books yet — story hours don’t fill shelves", tr: "Henüz kitap yok — masal saatleri raf doldurmaz" })}
            </span>
            {split.books > MAX_SPINES ? <span>{t({ en: `+${fmt(split.books - MAX_SPINES, locale)} not drawn`, tr: `+${fmt(split.books - MAX_SPINES, locale)} çizilmedi` })}</span> : null}
          </p>
        </div>

        {monthly && valid ? (
          <p className="m-0 border-t border-fg bg-surface-2 px-4 py-3 text-small sm:px-6">
            <span className="font-semibold">{t({ en: `In a year: ${lira(amount * 12)}`, tr: `Bir yılda: ${lira(amount * 12)}` })}</span>
            <span className="text-fg-muted"> — {describe(year.lines, locale)}</span>
          </p>
        ) : null}
      </figure>
    </div>
  );
}

const fmt = (n: number, locale: SiteLocale) => new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB").format(n);

/** "1 box of picture books and 2 first library cards" / "1 koli resimli kitap ve 2 ilk kütüphane kartı". */
export function describe(lines: GiftLine[], locale: SiteLocale): string {
  const { t, f } = copyFor(locale);
  if (lines.length === 0) return t({ en: "a share of the next card", tr: "bir sonraki kartın bir kısmı" });
  return f.list(lines.map((l) => `${fmt(l.count, locale)} ${t(l.count === 1 ? l.item.one : l.item.many)}`));
}
