/**
 * Theme tokens added for the style families: font blocks (generated from fonts/pairings.ts),
 * scenes, the second accent, category colours and control corners. jsdom does not compute custom
 * properties, so this reads the rules from styles.css and measures contrast with lib/color.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { contrastRatio } from "../src/lib/color";
import { fontPairings, pairingCss } from "../src/fonts/pairings";
import { Button } from "../src/components/button";
import { Input } from "../src/components/input";
import { controlVariants } from "../src/lib/variants";
import { themeAttributes } from "../src/lib/theme-scope";

const raw = readFileSync(path.join(__dirname, "../src/styles.css"), "utf8");
const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
const norm = (sel: string) => sel.replace(/\s+/g, " ").trim();

/** Declarations of the rule whose selector list is exactly `selector` (whitespace-insensitive). */
function rule(selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (norm(m[1]!) !== norm(selector)) continue;
    for (const d of m[2]!.split(";")) {
      const i = d.indexOf(":");
      if (i > 0) decls[d.slice(0, i).trim()] = d.slice(i + 1).trim();
    }
  }
  return decls;
}

const LIGHT = { ...rule(":root, .light") };
const DARK = { ...rule(".dark") };
const SCENES = {
  neutral: { light: LIGHT, dark: DARK },
  paper: { light: rule('[data-scene="paper"], [data-scene="paper"] .light'), dark: rule('.dark[data-scene="paper"], .dark [data-scene="paper"], [data-scene="paper"] .dark') },
  warm: { light: rule('[data-scene="warm"], [data-scene="warm"] .light'), dark: rule('.dark[data-scene="warm"], .dark [data-scene="warm"], [data-scene="warm"] .dark') },
  ink: { light: rule('[data-scene="ink"], [data-scene="ink"] .light'), dark: rule('.dark[data-scene="ink"], .dark [data-scene="ink"], [data-scene="ink"] .dark') },
};
/** A scene's value for a token, falling back to the theme's default. */
const val = (scene: keyof typeof SCENES, mode: "light" | "dark", token: string) => SCENES[scene][mode][token] ?? (mode === "light" ? LIGHT : { ...LIGHT, ...DARK })[token]!;
const BACKDROPS = ["--scene", "--surface", "--surface-2"];

describe("font blocks", () => {
  it("styles.css has every pairing's block exactly as pairingCss() writes it", () => {
    for (const p of fontPairings) {
      const block = pairingCss(p, p.id === "editorial" ? `:root,\n[data-font="editorial"]` : undefined);
      expect(raw, p.id).toContain(block);
    }
  });

  it("display headings read case and its tracking companion", () => {
    const fd = rule(".font-display");
    expect(fd["text-transform"]).toBe("var(--display-case, none)");
    expect(fd["letter-spacing"]).toBe("calc(var(--display-tracking) + var(--display-case-tracking, 0em))");
    expect(rule('[data-font="tabloid"]')["--display-case"]).toBe("uppercase");
    expect(css).toMatch(/@utility font-accent \{[^}]*font-family: var\(--font-accent, var\(--font-heading\)\)/);
  });
});

describe("scenes", () => {
  it.each(Object.keys(SCENES) as (keyof typeof SCENES)[])("%s: text tokens reach 4.5:1 on its backdrops, light and dark", (scene) => {
    for (const mode of ["light", "dark"] as const) {
      for (const text of ["--fg", "--fg-muted", "--fg-subtle"]) {
        for (const bg of BACKDROPS) {
          const ratio = contrastRatio(val(scene, mode, text), val(scene, mode, bg))!;
          expect(ratio, `${scene} ${mode} ${text} on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("comes before Material, so glass keeps its translucent surfaces", () => {
    expect(raw.indexOf('[data-scene="paper"]')).toBeLessThan(raw.indexOf('[data-material="glass"],\n[data-material="glass"] .light {'));
  });

  it("themeAttributes writes data-scene and leaves the neutral default out", () => {
    expect(themeAttributes({ scene: "paper", radius: "none" })).toMatchObject({ "data-scene": "paper", "data-radius": "none" });
    expect(themeAttributes({ scene: "neutral" })["data-scene"]).toBeUndefined();
  });
});

describe("category colours", () => {
  const N = [1, 2, 3, 4, 5, 6];
  it("white text on every fill reaches 4.5:1", () => {
    for (const n of N) expect(contrastRatio(LIGHT["--cat-fg"]!, LIGHT[`--cat-${n}`]!), `cat-${n}`).toBeGreaterThanOrEqual(4.5);
  });

  it("text-cat-N inks reach 4.5:1 on every scene's backdrops", () => {
    for (const n of N) {
      expect(LIGHT[`--cat-${n}-ink`]).toBe(`var(--cat-${n})`);
      for (const scene of Object.keys(SCENES) as (keyof typeof SCENES)[]) {
        for (const bg of BACKDROPS) {
          expect(contrastRatio(LIGHT[`--cat-${n}`]!, val(scene, "light", bg))!, `cat-${n} ${scene} light ${bg}`).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(DARK[`--cat-${n}-ink`]!, val(scene, "dark", bg))!, `cat-${n} ${scene} dark ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("maps text-cat-N to the ink and bg-cat-N to the fill", () => {
    expect(css).toContain("--text-color-cat-1: var(--cat-1-ink);");
    expect(css).toContain("--color-cat-1: var(--cat-1);");
  });
});

describe("second accent", () => {
  const accents = { lime: rule(':root:not([data-accent]), [data-accent="lime"]'), ocean: rule('[data-accent="ocean"]'), ember: rule('[data-accent="ember"]'), rose: rule('[data-accent="rose"]'), graphite: rule('[data-accent="graphite"]') };

  it.each(Object.keys(accents) as (keyof typeof accents)[])("%s: accent-2 inks reach 4.5:1 on every scene", (name) => {
    const a = accents[name];
    expect(a["--accent-2-base"]).toBeDefined();
    for (const scene of Object.keys(SCENES) as (keyof typeof SCENES)[]) {
      for (const bg of BACKDROPS) {
        expect(contrastRatio(a["--accent-2-ink-light"]!, val(scene, "light", bg))!, `${name} ${scene} light ${bg}`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(a["--accent-2-ink-dark"]!, val(scene, "dark", bg))!, `${name} ${scene} dark ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("derives accent-2 and the gradient on every accent root, falling back to the accent", () => {
    const derived = rule(":root, .light, .dark, [data-accent]");
    expect(derived["--accent-2"]).toBe("var(--accent-2-base, var(--accent-base))");
    expect(derived["--accent-gradient"]).toBe("linear-gradient(120deg, var(--accent-base), var(--accent-2-base, var(--accent-base)))");
    expect(rule(".dark, .dark[data-accent], .dark [data-accent]")["--accent-2-ink"]).toBe("var(--accent-2-ink-dark, var(--accent-ink-dark))");
  });
});

describe("control corners", () => {
  it("buttons and field boxes use rounded-control; multi-line boxes keep card corners", () => {
    const { getByRole } = render(
      <>
        <Button>Save</Button>
        <Button size="sm">Small</Button>
        <Input aria-label="Name" />
      </>,
    );
    expect(getByRole("button", { name: "Save" }).className).toContain("rounded-control");
    expect(getByRole("button", { name: "Small" }).className).toContain("rounded-control-sm");
    expect(controlVariants()).toContain("rounded-control");
    expect(controlVariants({ multiline: true })).toContain("[--control-radius:initial]");
  });

  it("a pill Button still wins over the control radius", () => {
    const { getByRole } = render(<Button pill>Go</Button>);
    expect(getByRole("button", { name: "Go" }).className).toContain("rounded-full!");
  });
});
