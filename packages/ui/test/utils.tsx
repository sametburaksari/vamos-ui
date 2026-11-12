/**
 * Shared test helpers for @vamos-ui/react. See docs/testing/PLAN.md.
 *
 *   import { renderWithProviders, expectNoA11yViolations, keys } from "../../test/utils";
 *
 * Providers are looked up on the package root at runtime, so this file compiles
 * before ThemeScope / VamosProvider exist and starts wrapping with them as soon
 * as the foundations group exports them.
 */
import * as React from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { expect } from "vitest";
import * as UI from "../src";

type AnyProvider = React.ComponentType<any>;
const pick = (name: string): AnyProvider | undefined => {
  const c = (UI as Record<string, unknown>)[name];
  return typeof c === "function" || (typeof c === "object" && c !== null) ? (c as AnyProvider) : undefined;
};

export type ThemeAxes = {
  dark?: boolean;
  material?: "glass" | "solid";
  accent?: string;
  density?: "comfortable" | "compact";
  font?: string;
  radius?: "default" | "sharp" | "round";
};

export interface ProviderOptions extends Omit<RenderOptions, "wrapper"> {
  /** BCP 47 tag, default "en-US". Use "tr-TR" to exercise İ/ı folding and 1.234,56 formatting. */
  locale?: string;
  /** Partial dictionary override, deep-merged by LocaleProvider (X1). */
  messages?: Record<string, unknown>;
  timeZone?: string;
  currency?: string;
  dir?: "ltr" | "rtl";
  /** Theme axes applied to the ThemeScope wrapper (or a plain data-attribute div until it exists). */
  theme?: ThemeAxes;
  /** Extra wrapper, innermost. */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

function themeAttrs(t: ThemeAxes = {}) {
  return {
    className: t.dark ? "dark" : undefined,
    "data-material": t.material ?? "solid",
    "data-accent": t.accent ?? "lime",
    "data-density": t.density ?? "comfortable",
    "data-font": t.font ?? "editorial",
    "data-radius": t.radius && t.radius !== "default" ? t.radius : undefined,
  };
}

/**
 * render() wrapped in LocaleProvider → (VamosProvider) → ThemeScope when those are exported.
 * Returns Testing Library's result plus a `user` (userEvent.setup()) bound to this render.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  { locale = "en-US", messages, timeZone, currency, dir = "ltr", theme, wrapper: Inner, ...options }: ProviderOptions = {},
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const LocaleProvider = pick("LocaleProvider");
  const VamosProvider = pick("VamosProvider");
  const ThemeScope = pick("ThemeScope");

  function Wrapper({ children }: { children: React.ReactNode }) {
    let tree: React.ReactNode = Inner ? <Inner>{children}</Inner> : children;
    tree = ThemeScope ? (
      <ThemeScope {...theme}>{tree}</ThemeScope>
    ) : (
      <div {...themeAttrs(theme)} dir={dir}>
        {tree}
      </div>
    );
    if (VamosProvider) tree = <VamosProvider>{tree}</VamosProvider>;
    if (LocaleProvider) {
      const props: Record<string, unknown> = { locale, dir };
      if (messages) props.messages = messages;
      if (timeZone) props.timeZone = timeZone;
      if (currency) props.currency = currency;
      tree = <LocaleProvider {...props}>{tree}</LocaleProvider>;
    }
    return <>{tree}</>;
  }

  const user = userEvent.setup();
  return { user, ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** Runs axe on a container (default document.body, so portalled layers are included). */
export async function expectNoA11yViolations(
  container: Element = document.body,
  rules: Record<string, { enabled: boolean }> = {},
) {
  // jsdom has no layout/colour: contrast is checked in Playwright, not here.
  const results = await axe(container as HTMLElement, { rules: { "color-contrast": { enabled: false }, region: { enabled: false }, ...rules } });
  expect(results).toHaveNoViolations();
}

/** userEvent key strings, so tests read like the WAI-ARIA keyboard tables. */
export const keys = {
  tab: "{Tab}",
  shiftTab: "{Shift>}{Tab}{/Shift}",
  enter: "{Enter}",
  space: " ",
  escape: "{Escape}",
  up: "{ArrowUp}",
  down: "{ArrowDown}",
  left: "{ArrowLeft}",
  right: "{ArrowRight}",
  home: "{Home}",
  end: "{End}",
  pageUp: "{PageUp}",
  pageDown: "{PageDown}",
  backspace: "{Backspace}",
  delete: "{Delete}",
} as const;

type User = ReturnType<typeof userEvent.setup>;

/** Press a key `times` times. */
export async function press(user: User, key: string, times = 1) {
  for (let i = 0; i < times; i++) await user.keyboard(key);
}

/** Tab through the document and return the focus order (accessible name or tag). */
export async function tabOrder(user: User, steps: number): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < steps; i++) {
    await user.tab();
    const el = document.activeElement as HTMLElement | null;
    out.push(el ? el.getAttribute("aria-label") || el.textContent?.trim() || el.tagName.toLowerCase() : "none");
  }
  return out;
}

/** Assert roving tabindex: exactly one item in the group has tabIndex 0 and it is the focused one. */
export function expectRovingFocus(items: HTMLElement[]) {
  const tabbable = items.filter((el) => el.tabIndex === 0);
  expect(tabbable).toHaveLength(1);
  expect(document.activeElement).toBe(tabbable[0]);
}

/** Assert focus returned to the trigger after a layer closes. */
export function expectFocusReturned(trigger: HTMLElement) {
  expect(document.activeElement).toBe(trigger);
}

/** Assert the focused element shows the kit's focus style hook. */
export function expectFocusRing(el: HTMLElement) {
  expect(el.className).toMatch(/focus-ring|focus-visible/);
}
