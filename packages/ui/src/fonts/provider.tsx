"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState, useIsomorphicLayoutEffect } from "../lib/use-controllable-state";
import { applyFontPairing, clearFontPairing, fontPairings, getFontPairing, pairingFamilies, pairingVars, type FontPairing } from "./pairings";
import { loadGoogleFonts } from "./loader";

export interface FontPairingContextValue {
  pairing: FontPairing;
  setPairing: (pairing: FontPairing | string) => void;
  pairings: FontPairing[];
}

const FontPairingContext = /*#__PURE__*/ React.createContext<FontPairingContextValue | null>(null);

/** The active pairing and a setter. Outside a `FontProvider` it returns the Editorial preset and a no-op setter. */
export function useFontPairing(): FontPairingContextValue {
  return React.useContext(FontPairingContext) ?? { pairing: fontPairings[0]!, setPairing: () => {}, pairings: fontPairings };
}

export interface FontProviderProps {
  /** Controlled pairing (object or preset id). */
  pairing?: FontPairing | string;
  defaultPairing?: FontPairing | string;
  onPairingChange?: (pairing: FontPairing) => void;
  /** Presets offered to `useFontPairing().pairings` and resolvable by id. Default: the 16 built-ins. */
  pairings?: FontPairing[];
  /**
   * `"element"` (default) renders a wrapper `<div>` carrying the tokens, so only its subtree changes;
   * `"document"` applies the pairing to `<html>`.
   */
  scope?: "element" | "document";
  /** Load the families from Google Fonts. Default `true`. Turn off when you self-host. */
  load?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Applies a type pairing to its subtree (or the document) and shares it through `useFontPairing()`.
 *
 * ```tsx
 * <FontProvider defaultPairing="boutique"><SitePreview /></FontProvider>
 * ```
 */
export function FontProvider({ pairing: pairingProp, defaultPairing = "editorial", onPairingChange, pairings = fontPairings, scope = "element", load = true, className, children }: FontProviderProps) {
  const resolve = React.useCallback((p: FontPairing | string | undefined) => (typeof p === "string" ? getFontPairing(p, pairings) : p), [pairings]);
  const [pairing, setPairingState] = useControllableState<FontPairing>({
    value: resolve(pairingProp),
    defaultValue: resolve(defaultPairing) ?? pairings[0]!,
    onChange: onPairingChange,
  });
  const active = pairing ?? pairings[0]!;

  const setPairing = React.useCallback(
    (p: FontPairing | string) => {
      const next = resolve(p);
      if (next) setPairingState(next);
    },
    [resolve, setPairingState],
  );

  useIsomorphicLayoutEffect(() => {
    if (scope !== "document" || typeof document === "undefined") return;
    const el = document.documentElement;
    const prevFont = el.dataset.font;
    void applyFontPairing(el, active, { load });
    return () => {
      clearFontPairing(el);
      if (prevFont) el.dataset.font = prevFont;
    };
  }, [scope, active, load]);

  React.useEffect(() => {
    if (scope === "element" && load) void loadGoogleFonts(pairingFamilies(active));
  }, [scope, active, load]);

  const value = React.useMemo(() => ({ pairing: active, setPairing, pairings }), [active, setPairing, pairings]);

  return (
    <FontPairingContext.Provider value={value}>
      {scope === "element" ? (
        <div data-font={active.id} data-slot="font-provider" style={pairingVars(active) as React.CSSProperties} className={cn("font-sans", className)}>
          {children}
        </div>
      ) : (
        children
      )}
    </FontPairingContext.Provider>
  );
}
