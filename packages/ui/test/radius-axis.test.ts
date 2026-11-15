/**
 * Corners axis (data-radius) in styles.css: --radius = --radius-base (density) × --radius-scale
 * (data-radius). jsdom does not compute calc() or custom properties, so this reads the rules
 * from the stylesheet and checks them the way the browser cascade would combine them.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(path.join(__dirname, "../src/styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Declarations of the top-level rule whose selector is exactly `selector` (merged if repeated). */
function rule(selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (const m of css.matchAll(re)) {
    if (m[1]!.trim() !== selector) continue;
    for (const d of m[2]!.split(";")) {
      const i = d.indexOf(":");
      if (i > 0) decls[d.slice(0, i).trim()] = d.slice(i + 1).trim();
    }
  }
  return decls;
}

const FORMULA = "calc(var(--radius-base) * var(--radius-scale))";
const SPACIOUS = '[data-density="spacious"]:not([data-slot="table"], [data-slot="data-table"])';
const SELECTORS = [":root", '[data-density="compact"]', SPACIOUS, '[data-radius="default"]', '[data-radius="sharp"]', '[data-radius="round"]', '[data-radius="none"]', '[data-radius="pill"]'];
const RADII = ["default", "sharp", "round", "none", "pill"];

/** --radius in px for a stack of selectors applied outer → inner (each element inherits from its parent). */
function radiusFor(stack: string[]): number {
  let base = NaN;
  let scale = NaN;
  for (const sel of [":root", ...stack]) {
    const r = rule(sel);
    if (r["--radius-base"]) base = parseFloat(r["--radius-base"]);
    if (r["--radius-scale"]) scale = parseFloat(r["--radius-scale"]);
  }
  return Math.round(base * scale);
}

describe("data-radius axis (styles.css)", () => {
  it("every rule that changes the base or the scale redeclares --radius, so subtrees recompute", () => {
    for (const sel of SELECTORS) {
      const r = rule(sel);
      expect(r["--radius-base"] ?? r["--radius-scale"], sel).toBeDefined();
      expect(r["--radius"], sel).toBe(FORMULA);
    }
  });

  it("keeps the documented sizes for every density", () => {
    expect(radiusFor([])).toBe(14);
    expect(radiusFor(['[data-density="compact"]'])).toBe(10);
    expect(radiusFor(['[data-radius="sharp"]'])).toBe(6);
    expect(radiusFor(['[data-radius="sharp"]', '[data-density="compact"]'])).toBe(4);
    expect(radiusFor(['[data-radius="round"]'])).toBe(20);
    expect(radiusFor(['[data-density="compact"]', '[data-radius="round"]'])).toBe(14);
    expect(radiusFor(['[data-radius="sharp"]', '[data-radius="default"]'])).toBe(14);
    expect(radiusFor(['[data-radius="none"]'])).toBe(0);
    expect(radiusFor(['[data-radius="none"]', '[data-density="compact"]'])).toBe(0);
    expect(radiusFor(['[data-radius="pill"]'])).toBe(14);
    expect(radiusFor([SPACIOUS])).toBe(16);
    expect(radiusFor([SPACIOUS, '[data-radius="round"]'])).toBe(22);
  });

  it("pill rounds controls only; every other value hands controls back to --radius", () => {
    expect(rule('[data-radius="pill"]')["--control-radius"]).toBe("9999px");
    for (const r of RADII.filter((x) => x !== "pill")) expect(rule(`[data-radius="${r}"]`)["--control-radius"], r).toBe("initial");
  });

  it("none also squares the large radius (cards, dialogs); others reset the step", () => {
    expect(rule('[data-radius="none"]')["--radius-step"]).toBe("0px");
    for (const r of RADII.filter((x) => x !== "none")) expect(rule(`[data-radius="${r}"]`)["--radius-step"], r).toBe("initial");
  });

  it("spacious is a page density, but stays row-only on tables", () => {
    expect(rule(SPACIOUS)["--control-h"]).toBe("2.75rem");
    expect(rule('[data-density="spacious"]')).toEqual({ "--row-h": "3.75rem", "--cell-px": "1.25rem" });
  });

  it("is independent of accent and material (no radius in those rules)", () => {
    const accentOrMaterial = [...css.matchAll(/([^{}]*\[data-(?:accent|material)=[^{}]*)\{([^{}]*)\}/g)];
    expect(accentOrMaterial.length).toBeGreaterThan(0);
    for (const m of accentOrMaterial) expect(m[2], m[1]!.trim()).not.toMatch(/--radius(-base|-scale)?\s*:/);
  });

  it("maps rounded-ui utilities onto --radius and never goes below 0", () => {
    expect(css).toContain("--radius-ui: var(--radius);");
    expect(css).toContain("--radius-ui-sm: max(0px, calc(var(--radius) - 4px));");
    expect(css).toContain("--radius-ui-lg: calc(var(--radius) + var(--radius-step, 6px));");
    expect(css).toContain("--radius-control: var(--control-radius, var(--radius));");
    expect(css).toContain("--radius-control-sm: var(--control-radius, max(0px, calc(var(--radius) - 4px)));");
  });
});
