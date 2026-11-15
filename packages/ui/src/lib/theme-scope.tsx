"use client";

import * as React from "react";
import * as Direction from "radix-ui/direction";
import * as Slot from "radix-ui/slot";
import { cn } from "./cn";
import { useComposedRefs } from "./compose-refs";

/** The seven theme axes (plus direction) that can be set on any subtree. */
export interface ThemeAxes {
  /** `"light"` | `"dark"` → class. */
  theme?: "light" | "dark";
  /** → `data-material`. */
  material?: "glass" | "solid";
  /** → `data-accent` (lime, ocean, ember, rose, graphite or your own). */
  accent?: string;
  /** → `data-density`. */
  density?: "comfortable" | "compact" | "spacious";
  /** → `data-font`: one of the 24 pairings in `@vamos-ui/react/fonts` (editorial, newsroom, tabloid, naskh …) or your own. */
  font?: string;
  /**
   * → `data-radius` (corners). `"default"` leaves the attribute out. Scales `--radius`, so every
   * `rounded-ui*` surface follows; `rounded-full` pills, avatars and switches stay round.
   * `"none"` is square everywhere; `"pill"` keeps cards at the default and makes controls pills.
   */
  radius?: "default" | "sharp" | "round" | "none" | "pill";
  /** → `data-scene`: backdrop and neutral tint. `"neutral"` (default) leaves the attribute out. */
  scene?: "neutral" | "paper" | "warm" | "ink";
  /** → `dir` + Radix DirectionProvider. */
  dir?: "ltr" | "rtl";
  /** → `data-glass-quality="low"` disables blur for low-power devices. */
  glassQuality?: "high" | "low";
}

/**
 * The class/attributes that apply theme axes to an element — usable in server components:
 *
 * ```tsx
 * <section {...themeAttributes({ theme: "dark", accent: "ember" })}>…</section>
 * ```
 */
export function themeAttributes(axes: ThemeAxes): { className?: string } & Record<`data-${string}` | "dir", string | undefined> {
  return {
    className: axes.theme,
    "data-material": axes.material,
    "data-accent": axes.accent,
    "data-density": axes.density,
    "data-font": axes.font,
    "data-radius": axes.radius && axes.radius !== "default" ? axes.radius : undefined,
    "data-scene": axes.scene && axes.scene !== "neutral" ? axes.scene : undefined,
    "data-glass-quality": axes.glassQuality === "low" ? "low" : undefined,
    dir: axes.dir,
  };
}

const PortalContainerContext = /*#__PURE__*/ React.createContext<HTMLElement | null>(null);

/**
 * The element overlays should portal into, or `undefined` for `document.body`.
 * Pass it to every Radix `Portal`: `<Popover.Portal container={usePortalContainer()}>`.
 */
export function usePortalContainer(): HTMLElement | undefined {
  return React.useContext(PortalContainerContext) ?? undefined;
}

/** Makes `container` the portal target for every kit overlay below it. */
export function PortalContainer({ container, children }: { container: HTMLElement | null; children: React.ReactNode }) {
  return <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>;
}

export interface ThemeScopeProps extends ThemeAxes, Omit<React.HTMLAttributes<HTMLDivElement>, "dir"> {
  /** Merge onto the single child instead of rendering a `<div>`. */
  asChild?: boolean;
  /** Overlays opened inside portal into this scope so they keep its theme. Default `true`. */
  portal?: boolean;
}

/**
 * Applies theme axes to a subtree and keeps overlays inside it. Without it, Radix portals to
 * `body` and a popover inside a dark preview opens in the light page theme.
 *
 * ```tsx
 * <ThemeScope theme="dark" material="glass" accent="ocean" className="rounded-ui-lg p-6">
 *   <Select … />   // its listbox portals into the scope → dark + glass + ocean
 * </ThemeScope>
 * ```
 *
 * The scope element must not use `transform`, `filter`, `backdrop-filter` or `contain`, because
 * those turn it into the containing block for the fixed-position overlays inside it.
 */
export const ThemeScope = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { theme, material, accent, density, font, radius, scene, dir, glassQuality, asChild, portal = true, className, children, ...props },
  ref,
) {
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const composed = useComposedRefs<HTMLDivElement>(ref, setNode);
  const { className: themeClass, ...attrs } = themeAttributes({ theme, material, accent, density, font, radius, scene, dir, glassQuality });
  const Comp = asChild ? Slot.Root : "div";
  let content = (
    <Comp ref={composed} data-slot="theme-scope" className={cn(themeClass, className)} {...attrs} {...props}>
      {children}
    </Comp>
  );
  if (dir) content = <Direction.Provider dir={dir}>{content}</Direction.Provider>;
  return portal ? <PortalContainer container={node}>{content}</PortalContainer> : content;
});
