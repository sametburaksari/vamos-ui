"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLocale } from "../lib/locale";
import { easeOutQuint, inViewport, ioSupported, motionLevel, observe } from "./core";
import { useFreshMount, useIsoLayoutEffect } from "./reveal";

export interface CountUpProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The final number. This is what the server renders and what screen readers always hear. */
  value: number;
  /** Where the count starts. Default 0. */
  from?: number;
  /** Animation length in ms. Default 1400 (subtle) / 1800 (full). */
  duration?: number;
  /** Delay after it becomes visible, in ms. */
  delay?: number;
  /** BCP 47 locale. Default: the surrounding LocaleProvider (`en-US`). */
  locale?: string;
  /**
   * Intl.NumberFormat options. Default: as many fraction digits as `value` has (max 2),
   * so `4.8` counts as 0.0 → 4.8 and `1240` as 0 → 1,240.
   */
  format?: Intl.NumberFormatOptions;
}

function decimalsOf(v: number) {
  return Math.min(2, (String(v).split(".")[1] ?? "").length);
}

/**
 * A number that counts up to its value when it scrolls into view. Tabular figures and a hidden
 * copy of the final value reserve the width, so nothing around it moves. Screen readers read the
 * final value only; reduced motion, `data-motion="off"` and server-rendered numbers already on
 * screen show the final value at once.
 *
 * ```tsx
 * <CountUp value={1240} /> reviews · <CountUp value={4.8} locale="tr-TR" />
 * ```
 */
export const CountUp = React.forwardRef<HTMLSpanElement, CountUpProps>(function CountUp(
  { value, from = 0, duration, delay = 0, locale: localeProp, format, className, ...props },
  ref,
) {
  const ctx = useLocale();
  const locale = localeProp ?? ctx?.locale ?? "en-US";
  const fmt = React.useMemo(() => {
    const d = decimalsOf(value);
    return new Intl.NumberFormat(locale, format ?? { minimumFractionDigits: d, maximumFractionDigits: d });
  }, [locale, format, value]);
  const finalText = fmt.format(value);
  const fresh = useFreshMount();
  // Fresh mounts start at `from` (they are not on screen yet); hydrated ones at the final value.
  const [display, setDisplay] = React.useState(() => (fresh ? fmt.format(from) : finalText));
  const [running, setRunning] = React.useState(fresh);
  const inner = React.useRef<HTMLSpanElement | null>(null);

  useIsoLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      setDisplay(finalText);
      setRunning(false);
    };
    const level = motionLevel(el);
    if (level === "off" || !ioSupported() || value === from) {
      finish();
      return;
    }
    // Hydrated and already on screen: animate only if the page has just loaded (nobody has
    // read the number yet); otherwise leave it alone.
    if (!fresh && inViewport(el) && performance.now() > 1500) {
      finish();
      return;
    }
    const ms = duration ?? (level === "full" ? 1800 : 1400);
    setDisplay(fmt.format(from));
    setRunning(true);
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const v = from + (value - from) * easeOutQuint(t);
        if (t >= 1) return finish();
        setDisplay(fmt.format(v));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const stop = observe(el, (entry) => {
      if (!entry.isIntersecting) return;
      stop();
      timer = setTimeout(run, delay);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, from, finalText]);

  // The widest of start and end reserves the box (generated content: not read, not selectable).
  const ghost = fmt.format(from).length > finalText.length ? fmt.format(from) : finalText;
  return (
    <span
      ref={(node) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-count-up=""
      data-ghost={ghost}
      data-running={running ? "" : undefined}
      className={cn("vm-count tabular", className)}
      {...props}
    >
      {running ? (
        <>
          <span aria-hidden="true">{display}</span>
          <span className="sr-only">{finalText}</span>
        </>
      ) : (
        <span>{finalText}</span>
      )}
    </span>
  );
});
