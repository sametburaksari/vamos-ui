"use client";

import * as React from "react";
import { Button, Image, LocaleProvider, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, Toaster, toast } from "@vamos-ui/react";
import { sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { X } from "lucide-react";
import { currencyOf, fill, money, NEXT_DROP, productById, ui, type L, type SiteLocale, type Size, type UiKey } from "./content";

export interface BagLine {
  productId: string;
  size: Size;
}

interface DropContextValue {
  locale: SiteLocale;
  t: (value: L) => string;
  s: (key: UiKey, vars?: Record<string, string | number>) => string;
  fmt: (value: number | string) => string;
  lines: BagLine[];
  subtotal: number;
  add: (productId: string, size: Size) => void;
  remove: (line: BagLine) => void;
  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;
  /** Product the detail page shows. */
  selected: string;
  select: (productId: string) => void;
  /** Drop-07 piece ids with a reminder on. */
  reminders: string[];
  toggleReminder: (id: string, name: string) => void;
}

const DropContext = React.createContext<DropContextValue | null>(null);
/** Current time, ticking once a second after hydration; `null` on the server and first paint. */
const ClockContext = React.createContext<number | null>(null);

export function useDrop() {
  const ctx = React.useContext(DropContext);
  if (!ctx) throw new Error("useDrop must be used inside <DropProvider>.");
  return ctx;
}

/** `now` (ms) and whether the next drop has opened. Kept apart so the ticking clock only re-renders the countdown parts. */
export function useDropClock() {
  const now = React.useContext(ClockContext);
  const target = Date.parse(NEXT_DROP.opens);
  return { now, target, live: now !== null && now >= target, remaining: now === null ? null : Math.max(0, target - now) };
}

const same = (a: BagLine, b: BagLine) => a.productId === b.productId && a.size === b.size;

/**
 * Bag, reminders, selected product and the drop clock for the whole site. Lives inside
 * SiteShell but outside the locale switch, so changing language keeps the bag. Any
 * `a[href="#bag"]` inside (the navbar's bag link) opens the bag drawer.
 */
export function DropProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [lines, setLines] = React.useState<BagLine[]>([{ productId: "peace-tee", size: "L" }]);
  const [bagOpen, setBagOpen] = React.useState(false);
  const [selected, setSelected] = React.useState("ferry-hoodie");
  const [reminders, setReminders] = React.useState<string[]>([]);
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const value = React.useMemo<DropContextValue>(() => {
    const t = (v: L) => v[locale];
    const s = (key: UiKey, vars?: Record<string, string | number>) => fill(ui[key][locale], vars ?? {});
    const cur = currencyOf(locale);
    return {
      locale,
      t,
      s,
      fmt: (v) => money(v, locale),
      lines,
      subtotal: lines.reduce((sum, l) => sum + Number(productById(l.productId).price[cur]), 0),
      add: (productId, size) => {
        const p = productById(productId);
        if (lines.some((l) => same(l, { productId, size }))) {
          toast.warning(s("limitHit"), { description: `${t(p.name)} · ${size}` });
          return;
        }
        setLines((prev) => [...prev, { productId, size }]);
        toast.success(s("added"), { description: `${t(p.name)} · ${size}`, action: { label: s("cart"), onClick: () => setBagOpen(true) } });
      },
      remove: (line) => setLines((prev) => prev.filter((l) => !same(l, line))),
      bagOpen,
      setBagOpen,
      selected,
      select: setSelected,
      reminders,
      toggleReminder: (id, name) => {
        const on = !reminders.includes(id);
        setReminders((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
        if (on) toast.success(s("reminding"), { description: `${name} — ${s("reminderSet")}` });
        else toast(s("reminderOff"), { description: name });
      },
    };
  }, [locale, lines, bagOpen, selected, reminders]);

  const onClickCapture = (e: React.MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href="#bag"]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll<HTMLElement>("[popover]").forEach((p) => {
      try {
        p.hidePopover();
      } catch {
        /* not open */
      }
    });
    setBagOpen(true);
  };

  return (
    <DropContext.Provider value={value}>
      <ClockContext.Provider value={now}>
        <div className="contents" onClickCapture={onClickCapture}>
          {children}
        </div>
      </ClockContext.Provider>
      <LocaleProvider locale={locale === "tr" ? "tr-TR" : "en-US"} messages={locale === "tr" ? tr : undefined}>
        <BagSheet onShop={() => navigate({ page: "archive" })} />
        <Toaster />
      </LocaleProvider>
    </DropContext.Provider>
  );
}

/** Navbar label: "Bag 02". A client island inside the server Navbar. */
export function BagLabel() {
  const { s, lines } = useDrop();
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.12em]">
      {s("cart")}
      <span className="tabular inline-flex h-5 min-w-7 items-center justify-center bg-accent px-1 text-accent-fg">{String(lines.length).padStart(2, "0")}</span>
    </span>
  );
}

function BagSheet({ onShop }: { onShop: () => void }) {
  const { s, t, fmt, lines, subtotal, bagOpen, setBagOpen, remove, locale } = useDrop();
  const cur = currencyOf(locale);
  return (
    <Sheet open={bagOpen} onOpenChange={setBagOpen}>
      <SheetContent side="end" size="md">
        <SheetHeader title={`${s("bagTitle")} (${lines.length})`} description={s("limit")} />
        <SheetBody>
          {lines.length === 0 ? (
            <div className="flex flex-col items-start gap-4 py-8">
              <p className="text-fg-muted">{s("bagEmpty")}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setBagOpen(false);
                  onShop();
                }}
              >
                {s("view")} Drop 06
              </Button>
            </div>
          ) : (
            <ul aria-label={s("bagTitle")} className="divide-y divide-line border-y border-line">
              {lines.map((l) => {
                const p = productById(l.productId);
                const ph = p.photos[0]!;
                const name = `${t(p.name)} · ${l.size}`;
                return (
                  <li key={`${l.productId}:${l.size}`} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-3 py-3">
                    <Image src={ph.src} width={ph.width} height={ph.height} alt={t(ph.alt)} aspect="4/5" sizes="64px" />
                    <div className="min-w-0">
                      <p className="font-display text-[0.95rem] uppercase leading-tight text-fg">{t(p.name)}</p>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">
                        {p.code} · {t(p.colour)} · {l.size}
                      </p>
                      <p className="tabular mt-2 text-small text-fg">{fmt(p.price[cur])}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => remove(l)} aria-label={s("removeItem", { name })}>
                      <X aria-hidden />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </SheetBody>
        {lines.length > 0 ? (
          <SheetFooter className="flex-col items-stretch gap-3">
            <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-small">
              <dt className="text-fg-muted">{s("subtotal")}</dt>
              <dd className="tabular text-end font-medium text-fg">{fmt(subtotal)}</dd>
              <dt className="text-fg-muted">{s("shipping")}</dt>
              <dd className="text-end text-fg-muted">{s("shippingNote")}</dd>
            </dl>
            <Button variant="primary" size="lg" block onClick={() => toast(s("checkoutDone"))} className="uppercase tracking-[0.08em]">
              {s("checkout")} — {fmt(subtotal)}
            </Button>
            <a href={sitePageHref("archive")} onClick={() => setBagOpen(false)} className="self-center rounded-[2px] text-small text-fg-muted underline-offset-4 hover:underline focus-ring">
              {t({ en: "Keep browsing the archive", tr: "Arşive göz atmaya devam et" })}
            </a>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
