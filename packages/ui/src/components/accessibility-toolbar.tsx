"use client";

import * as React from "react";
import { RotateCcw, Type } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useControllableState, useIsomorphicLayoutEffect } from "../lib/use-controllable-state";
import { Button } from "./button";
import { Switch } from "./switch";
import { ToggleGroup, ToggleGroupItem } from "./toggle";

export const accessibilityToolbarLabels = {
  region: "Accessibility settings",
  title: "Display settings",
  textSize: "Text size",
  sizeDefault: "Standard text",
  sizeLarge: "Large text",
  sizeLarger: "Larger text",
  highContrast: "High contrast",
  readableFont: "Readable font",
  underlineLinks: "Underline links",
  reduceMotion: "Reduce motion",
  reset: "Reset",
};
export type AccessibilityToolbarLabels = typeof accessibilityToolbarLabels;

export type AccessibilityTextSize = "default" | "large" | "larger";

export interface AccessibilityPreferences {
  textSize: AccessibilityTextSize;
  highContrast: boolean;
  readableFont: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
}

export type AccessibilityFeature = "textSize" | "highContrast" | "readableFont" | "underlineLinks" | "reduceMotion";

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  textSize: "default",
  highContrast: false,
  readableFont: false,
  underlineLinks: false,
  reduceMotion: false,
};

type TargetInput = HTMLElement | React.RefObject<HTMLElement | null> | (() => HTMLElement | null) | null | undefined;

const resolveTarget = (t: TargetInput): HTMLElement | null =>
  typeof document === "undefined" ? null : t == null ? document.documentElement : typeof t === "function" ? t() : "current" in t ? t.current : t;

/*
 * Token remaps only — no colours of its own. High contrast turns every muted grey into full
 * text colour and every hairline into a visible rule, in light and dark and with any accent.
 * The doubled attribute out-ranks the theme class on the same element.
 */
const CSS = `[data-a11y-contrast="high"][data-a11y-contrast]{--fg-muted:var(--fg);--fg-subtle:var(--fg);--line:color-mix(in oklch,var(--fg) 55%,transparent);--surface-border:color-mix(in oklch,var(--fg) 70%,transparent);--field-border:var(--fg);--field-border-hover:var(--fg);--surface-2:var(--surface);--scene:var(--surface);--surface-shadow:none}
[data-a11y-contrast="high"] :focus-visible{outline:3px solid var(--fg);outline-offset:2px}
[data-a11y-underline] a{text-decoration-line:underline;text-decoration-thickness:0.08em;text-underline-offset:0.2em}
[data-a11y-font]{font-family:var(--font-sans)}`;

/**
 * Applies preferences to `target` (default: `<html>`) and restores what was there on cleanup.
 * Text size always scales the root font size, because the kit's type scale is in `rem`.
 * Use it directly when the controls live elsewhere (a settings page) but the page must follow.
 */
export function useAccessibilityPreferences(prefs: AccessibilityPreferences, { target, textScale = [1.15, 1.3], readableFontPreset = "system" }: { target?: TargetInput; textScale?: [number, number]; readableFontPreset?: string } = {}) {
  const [large, larger] = textScale;
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const factor = prefs.textSize === "large" ? large : prefs.textSize === "larger" ? larger : 1;
    if (factor === 1) return;
    const prev = root.style.fontSize;
    root.style.fontSize = `${factor * 100}%`;
    return () => {
      root.style.fontSize = prev;
    };
  }, [prefs.textSize, large, larger]);

  useIsomorphicLayoutEffect(() => {
    const el = resolveTarget(target);
    if (!el) return;
    const restore: (() => void)[] = [];
    const setAttr = (name: string, value: string) => {
      const prev = el.getAttribute(name);
      el.setAttribute(name, value);
      restore.push(() => (prev == null ? el.removeAttribute(name) : el.setAttribute(name, prev)));
    };
    if (prefs.highContrast) setAttr("data-a11y-contrast", "high");
    if (prefs.underlineLinks) setAttr("data-a11y-underline", "");
    if (prefs.readableFont) {
      setAttr("data-a11y-font", "");
      setAttr("data-font", readableFontPreset);
    }
    if (prefs.reduceMotion) setAttr("data-motion", "off");
    return () => restore.reverse().forEach((r) => r());
  }, [target, prefs.highContrast, prefs.underlineLinks, prefs.readableFont, prefs.reduceMotion, readableFontPreset]);
}

export interface AccessibilityToolbarProps extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "defaultValue"> {
  value?: AccessibilityPreferences;
  defaultValue?: Partial<AccessibilityPreferences>;
  onValueChange?: (value: AccessibilityPreferences) => void;
  /** Which controls to show, in order. Default: all five. */
  features?: AccessibilityFeature[];
  /** Element the settings apply to: an element, a ref or a getter. Default `<html>`. */
  target?: TargetInput;
  /** Root font-size factors for large / larger. Default `[1.15, 1.3]`. */
  textScale?: [number, number];
  /** `data-font` preset used by "Readable font". Default `"system"`. */
  readableFontPreset?: string;
  /** Remember the choice on this device (localStorage), restored after mount. */
  storageKey?: string;
  /** `"bar"` (default): one wrapping row for the top of a page. `"stacked"`: a column for a popover or sheet. */
  layout?: "bar" | "stacked";
  /** Hide the title. */
  hideTitle?: boolean;
  /** Extra content at the end — e.g. a link to the accessibility statement. */
  children?: React.ReactNode;
  labels?: Partial<AccessibilityToolbarLabels>;
}

const ALL: AccessibilityFeature[] = ["textSize", "highContrast", "readableFont", "underlineLinks", "reduceMotion"];
const SIZES: AccessibilityTextSize[] = ["default", "large", "larger"];
const sizeKey = { default: "sizeDefault", large: "sizeLarge", larger: "sizeLarger" } as const;
/** The chosen size must be unmistakable: full-strength ink, not a tint. */
const PRESSED = "data-[state=on]:bg-fg data-[state=on]:text-scene data-[state=on]:hover:bg-fg";

const same = (a: AccessibilityPreferences, b: AccessibilityPreferences) => (Object.keys(b) as (keyof AccessibilityPreferences)[]).every((k) => a[k] === b[k]);

/**
 * Reader-controlled display settings: text size, high contrast, a readable font, underlined
 * links and reduced motion. Everything works by remapping the kit's own tokens and axes on one
 * element (`data-font`, `data-motion`, `--fg-muted`, `--line` …), so every component follows in
 * light and dark without knowing about it. A labelled region; switches and a size toggle group.
 *
 * ```tsx
 * <AccessibilityToolbar storageKey="display-settings">
 *   <a href="/accessibility">Accessibility statement</a>
 * </AccessibilityToolbar>
 * ```
 */
export const AccessibilityToolbar = /*#__PURE__*/ React.forwardRef<HTMLElement, AccessibilityToolbarProps>(function AccessibilityToolbar(
  { value: valueProp, defaultValue, onValueChange, features = ALL, target, textScale, readableFontPreset, storageKey, layout = "bar", hideTitle, children, labels, className, ...props },
  ref,
) {
  const t = useLabels("accessibilityToolbar", accessibilityToolbarLabels, labels);
  const id = React.useId();
  const [value, setValue] = useControllableState<AccessibilityPreferences>({
    value: valueProp,
    defaultValue: () => ({ ...defaultAccessibilityPreferences, ...defaultValue }),
    onChange: onValueChange,
    name: "AccessibilityToolbar",
  });

  // Saved choice: read after mount so the server HTML and the first client render match.
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as Partial<AccessibilityPreferences> | null;
      if (saved && typeof saved === "object") setValue((v) => ({ ...v, ...saved }));
    } catch {
      /* storage blocked or invalid: keep the defaults */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const set = (patch: Partial<AccessibilityPreferences>) =>
    setValue((v) => {
      const next = { ...v, ...patch };
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* not persisted, still applied */
        }
      }
      return next;
    });

  useAccessibilityPreferences(value, { target, textScale, readableFontPreset });

  const changed = !same(value, defaultAccessibilityPreferences);
  const stacked = layout === "stacked";
  const switches: Record<Exclude<AccessibilityFeature, "textSize">, string> = {
    highContrast: t("highContrast"),
    readableFont: t("readableFont"),
    underlineLinks: t("underlineLinks"),
    reduceMotion: t("reduceMotion"),
  };

  return (
    <section
      ref={ref}
      aria-label={t("region")}
      data-slot="accessibility-toolbar"
      data-layout={layout}
      className={cn(stacked ? "grid gap-4" : "flex flex-wrap items-center gap-x-6 gap-y-3", className)}
      {...props}
    >
      <style>{CSS}</style>
      {hideTitle ? null : (
        <p className="m-0 flex items-center gap-2 text-small font-semibold text-fg">
          <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-fg text-scene">
            <Type className="size-3.5" />
          </span>
          {t("title")}
        </p>
      )}
      {features.map((feature) =>
        feature === "textSize" ? (
          <div key={feature} className={cn("flex items-center gap-2.5", stacked && "justify-between")}>
            <span id={`${id}-size`} className="text-small text-fg">
              {t("textSize")}
            </span>
            <ToggleGroup variant="outline" size="sm" aria-labelledby={`${id}-size`} value={value.textSize} onValueChange={(v) => set({ textSize: v as AccessibilityTextSize })}>
              {SIZES.map((s, i) => (
                <ToggleGroupItem key={s} value={s} aria-label={t(sizeKey[s])} title={t(sizeKey[s])} className={cn("min-w-9 font-semibold", PRESSED)}>
                  <span aria-hidden="true" style={{ fontSize: `${0.8 + i * 0.18}rem` }}>
                    A
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ) : (
          <Switch
            key={feature}
            size="sm"
            checked={value[feature]}
            onCheckedChange={(on) => set({ [feature]: on })}
            label={switches[feature]}
            labelPosition={stacked ? "start" : "end"}
            data-feature={feature}
          />
        ),
      )}
      <div className={cn("flex flex-wrap items-center gap-4", !stacked && "ms-auto")}>
        <Button variant="ghost" size="sm" disabled={!changed} onClick={() => set(defaultAccessibilityPreferences)}>
          <RotateCcw aria-hidden="true" />
          {t("reset")}
        </Button>
        {children}
      </div>
    </section>
  );
});
