"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useMediaQuery } from "../lib/use-media-query";
import { toggleVariants, ToggleGroup, ToggleGroupItem } from "./toggle";

export type ColorMode = "light" | "dark" | "system";

export const modeToggleLabels = {
  label: "Color theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  darkMode: "Dark mode",
  current: "Theme: {mode}",
};
export type ModeToggleLabels = typeof modeToggleLabels;

/** The element that gets the `.dark` class, a getter for it, or `null` to leave the DOM alone. */
export type ModeToggleTarget = HTMLElement | (() => HTMLElement | null) | null;

const DARK_QUERY = "(prefers-color-scheme: dark)";
const isMode = (v: unknown): v is ColorMode => v === "light" || v === "dark" || v === "system";

const readStored = (key?: string): ColorMode | null => {
  if (!key) return null;
  try {
    const v = window.localStorage.getItem(key);
    return isMode(v) ? v : null;
  } catch {
    return null;
  }
};
const writeStored = (key: string | undefined, mode: ColorMode) => {
  if (!key) return;
  try {
    window.localStorage.setItem(key, mode);
  } catch {
    /* storage blocked (private mode) — the choice lasts for this page only */
  }
};

/**
 * An inline script for `<head>` that applies a stored choice before first paint, so a reader
 * who picked dark never sees a light flash. Pass the same `storageKey` as the toggle.
 *
 * ```tsx
 * <script dangerouslySetInnerHTML={{ __html: modeToggleScript("site:mode") }} />
 * ```
 */
export function modeToggleScript(storageKey: string, fallback: ColorMode = "system"): string {
  return `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(fallback)};if(m==="system")m=matchMedia(${JSON.stringify(DARK_QUERY)}).matches?"dark":"light";document.documentElement.classList.toggle("dark",m==="dark")}catch(e){}})()`;
}

export interface ModeToggleProps {
  /** Controlled mode. */
  value?: ColorMode;
  /** Initial mode when uncontrolled. Default: the stored choice, else whatever the target already shows. */
  defaultValue?: ColorMode;
  /** Called with the chosen mode (and the light/dark it resolves to). */
  onValueChange?: (mode: ColorMode, resolved: "light" | "dark") => void;
  /** Modes to offer, in order. Default `["light", "dark"]`; add `"system"` to follow the OS. */
  modes?: ColorMode[];
  /**
   * `"button"` (default): one icon button — a pressed/unpressed dark-mode toggle with two modes,
   * a cycling button with three. `"segmented"`: one option per mode.
   */
  variant?: "button" | "segmented";
  /** Where the `.dark` class goes. Default `document.documentElement`; `null` = only report via `onValueChange` (e.g. to drive SiteShell's `theme`). */
  target?: ModeToggleTarget;
  /** Remember the choice in localStorage under this key. */
  storageKey?: string;
  /** Show the mode's name next to the icon. Default `false` (icon only, named for screen readers). */
  showLabel?: boolean;
  size?: "xs" | "sm" | "md";
  disabled?: boolean;
  className?: string;
  labels?: Partial<ModeToggleLabels>;
}

const icons = { light: Sun, dark: Moon, system: Monitor } as const;

/**
 * Light / dark (and optionally system) switch. Toggles the kit's `.dark` class on the document
 * (or any element), can remember the choice, and follows the OS live in `"system"` mode.
 * Use `modeToggleScript` in `<head>` to avoid a flash on reload.
 *
 * ```tsx
 * <ModeToggle storageKey="site:mode" />
 * <ModeToggle variant="segmented" modes={["light", "dark", "system"]} showLabel />
 * ```
 */
export const ModeToggle = /*#__PURE__*/ React.forwardRef<HTMLButtonElement | HTMLDivElement, ModeToggleProps>(function ModeToggle(
  { value, defaultValue, onValueChange, modes = ["light", "dark"], variant = "button", target, storageKey, showLabel = false, size = "sm", disabled, className, labels },
  ref,
) {
  const t = useLabels("modeToggle", modeToggleLabels, labels);
  const systemQuery = useMediaQuery(DARK_QUERY);
  const systemDark = systemQuery ?? false;
  const [inner, setInner] = React.useState<ColorMode>(defaultValue ?? modes[0] ?? "light");
  const controlled = value !== undefined;
  const mode = controlled ? value : inner;
  const resolved: "light" | "dark" = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  const getTarget = React.useCallback((): HTMLElement | null => {
    if (target === null) return null;
    if (target === undefined) return typeof document === "undefined" ? null : document.documentElement;
    return typeof target === "function" ? target() : target;
  }, [target]);

  // Nothing is written to the target until the initial mode is known, so a class set by
  // `modeToggleScript` (or the server) is never flipped off for a frame during hydration.
  const [ready, setReady] = React.useState(controlled);

  // Uncontrolled: start from the stored choice, else from what the target already shows.
  React.useEffect(() => {
    setReady(true);
    if (controlled) return;
    const stored = readStored(storageKey);
    if (stored && modes.includes(stored)) return setInner(stored);
    if (defaultValue) return;
    const el = getTarget();
    if (el) setInner(el.classList.contains("dark") ? "dark" : modes.includes("system") ? "system" : "light");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply the resolved mode to the target.
  React.useEffect(() => {
    if (!ready || (mode === "system" && systemQuery === undefined)) return;
    const el = getTarget();
    if (!el) return;
    el.classList.toggle("dark", resolved === "dark");
    if (resolved === "dark") el.classList.remove("light");
  }, [ready, mode, resolved, systemQuery, getTarget]);

  const choose = (next: ColorMode) => {
    if (!controlled) setInner(next);
    writeStored(storageKey, next);
    onValueChange?.(next, next === "system" ? (systemDark ? "dark" : "light") : next);
  };

  if (variant === "segmented") {
    return (
      <ToggleGroup
        ref={ref as React.Ref<HTMLDivElement>}
        type="single"
        size={size}
        value={mode}
        onValueChange={(v) => isMode(v) && choose(v)}
        aria-label={t("label")}
        disabled={disabled}
        data-slot="mode-toggle"
        data-mode={mode}
        className={className}
      >
        {modes.map((m) => {
          const Icon = icons[m];
          return (
            <ToggleGroupItem key={m} value={m} label={t(m)}>
              <Icon aria-hidden="true" />
              {showLabel ? t(m) : null}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    );
  }

  const two = modes.length === 2 && modes.includes("dark");
  const Icon = icons[mode] ?? Sun;
  const next = modes[(modes.indexOf(mode) + 1) % modes.length] ?? "light";
  const onClick = () => choose(two ? (resolved === "dark" ? (modes.find((m) => m !== "dark") ?? "light") : "dark") : next);
  // Two modes: a toggle named "Dark mode" (pressed = dark). Three: a cycling button that names the current mode.
  const name = two ? t("darkMode") : t("current", { mode: t(mode) });

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={two ? resolved === "dark" : undefined}
      data-state={two ? (resolved === "dark" ? "on" : "off") : undefined}
      aria-label={showLabel ? undefined : name}
      title={showLabel ? undefined : name}
      data-slot="mode-toggle"
      data-mode={mode}
      data-resolved={resolved}
      className={cn(toggleVariants({ variant: "ghost", size, iconOnly: !showLabel }), className)}
    >
      <Icon aria-hidden="true" />
      {showLabel ? (
        <>
          <span>{two ? t("darkMode") : t(mode)}</span>
          {two ? null : <span className="sr-only">, {t("label")}</span>}
        </>
      ) : null}
    </button>
  );
});
