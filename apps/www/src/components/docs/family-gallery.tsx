"use client";

import * as React from "react";
import { Avatar, Button, Input, ThemeScope, cn } from "@vamos-ui/react";
import { getFontPairing, loadGoogleFonts, pairingFamilies } from "@vamos-ui/react/fonts";
import { accent2Source, decodePreset, generateAccent, isNamedAccent, PRESET_FAMILIES, type PresetFamily } from "@/lib/theme-codec";

/** The scope a family renders in: its preset axes, plus inline accent variables for a custom colour (what brand.css would hold). */
function familyScope(family: PresetFamily) {
  const preset = decodePreset(family.code);
  const style: Record<string, string> = {};
  let accent: string = preset.accent;
  if (!isNamedAccent(preset.accent)) {
    accent = "brand";
    const p = generateAccent(preset.accent);
    const dark = preset.theme === "dark" && p.dark;
    style["--accent-base"] = dark ? p.dark!.base : p.base;
    style["--accent-fg"] = dark ? p.dark!.fg : p.fg;
    style["--accent-ink-light"] = p.inkLight;
    style["--accent-ink-dark"] = p.inkDark;
    const second = generateAccent(accent2Source({ accent: preset.accent, accent2: family.accent2 }));
    style["--accent-2-base"] = second.base;
    style["--accent-2-ink-light"] = second.inkLight;
    style["--accent-2-ink-dark"] = second.inkDark;
  }
  return { preset, accent, style: style as React.CSSProperties };
}

const COPY = {
  en: {
    section: "Culture",
    date: "Thu 14 Nov",
    title: (
      <>
        The night market that <em>never</em> closed
      </>
    ),
    deck: "Forty stalls, one generator and a city that learned to eat late. Notes from the third winter.",
    by: "Deniz Arı",
    time: "6 min read",
    read: "Read the story",
    save: "Save",
    email: "Your email",
    join: "Subscribe",
    sign: "the night desk",
    sections: ["World", "Food", "Sport"],
  },
  ar: {
    section: "ثقافة",
    date: "الخميس ١٤ نوفمبر",
    title: <>السوق الليلي الذي لم يُغلق أبدًا</>,
    deck: "أربعون كشكًا ومولّد واحد ومدينة تعلّمت أن تتعشّى متأخرة. ملاحظات من الشتاء الثالث.",
    by: "دنيز آري",
    time: "٦ دقائق قراءة",
    read: "اقرأ القصة",
    save: "حفظ",
    email: "بريدك الإلكتروني",
    join: "اشترك",
    sign: "مكتب الليل",
    sections: ["العالم", "طعام", "رياضة"],
  },
} as const;

/** The same front-page fragment in every family: only the theme attributes differ. */
function Sample({ lang, label }: { lang: "en" | "ar"; label: string }) {
  const t = COPY[lang];
  return (
    <div className="grid gap-4 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
        <span className="font-display text-[length:calc(20px*var(--display-scale))] leading-none text-fg">{label}</span>
        <span className="text-[11.5px] text-fg-subtle tabular">{t.date}</span>
      </div>

      <div className="grid gap-4 @md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* A duotone "photo" from the family's own colours, with the section chip on it. */}
        <div
          aria-hidden
          className="relative aspect-[4/3] overflow-hidden rounded-ui border border-line"
          style={{
            background:
              "radial-gradient(70% 60% at 25% 30%, color-mix(in oklch, var(--accent) 70%, transparent), transparent 70%), radial-gradient(60% 70% at 85% 80%, color-mix(in oklch, var(--accent-2) 65%, transparent), transparent 72%), linear-gradient(160deg, var(--surface-2), color-mix(in oklch, var(--fg) 22%, var(--surface-2)))",
          }}
        >
          <span className="absolute start-2.5 top-2.5 rounded-control-sm bg-cat-4 px-2 py-0.5 text-[11px] font-semibold text-cat-fg">{t.section}</span>
          <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        <div className="grid content-start gap-2.5">
          <span className="text-[11.5px] font-semibold tracking-[0.08em] text-cat-4 uppercase">{t.section}</span>
          <h3 className="font-display text-display-m text-fg">{t.title}</h3>
          <p className="text-small text-fg-muted">{t.deck}</p>
          <div className="flex items-center gap-2 text-[12.5px] text-fg-muted">
            <Avatar name={t.by} size="xs" />
            <span>
              {t.by} · {t.time}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="primary" size="sm">
              {t.read}
            </Button>
            <Button size="sm">{t.save}</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-line pt-3 @md:grid-cols-[minmax(0,1fr)_auto] @md:items-center">
        <div className="flex min-w-0 gap-2">
          <Input aria-label={t.email} placeholder={t.email} size="sm" />
          <Button variant="primary" size="sm" className="bg-accent-gradient">
            {t.join}
          </Button>
        </div>
        <div className="flex items-center gap-3 text-[12.5px]">
          <span className="text-cat-1">{t.sections[0]}</span>
          <span className="text-cat-3">{t.sections[1]}</span>
          <span className="text-cat-2">{t.sections[2]}</span>
          <span className="font-accent text-[19px] leading-none text-accent-ink">{t.sign}</span>
        </div>
      </div>
    </div>
  );
}

function FamilyTile({ family }: { family: PresetFamily }) {
  const { preset, accent, style } = familyScope(family);
  const pairing = getFontPairing(preset.font);
  const glass = preset.material === "glass";
  return (
    <figure className="grid min-w-0 gap-2" data-family={family.id}>
      <figcaption className="grid gap-0.5">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="text-[14px] font-medium text-fg">{family.label}</span>
          <code className="font-mono text-[11.5px] text-fg-subtle">{family.code}</code>
        </span>
        <span className="text-[12.5px] leading-snug text-fg-muted">
          {pairing ? `${pairing.label} type · ` : ""}
          <code className="font-mono text-[11.5px]">--family {family.id}</code>
        </span>
      </figcaption>
      <div data-material={preset.material} className="min-w-0 rounded-ui-lg">
        <ThemeScope
          theme={preset.theme}
          accent={accent}
          density={preset.density}
          font={preset.font}
          radius={preset.radius}
          scene={preset.scene}
          dir={family.dir}
          lang={family.dir === "rtl" ? "ar" : undefined}
          style={style}
          className={cn("@container relative isolate overflow-hidden rounded-ui-lg border border-line bg-scene font-sans text-fg")}
        >
          {glass ? (
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-1/4 -z-10 opacity-45 blur-3xl"
              style={{ background: "radial-gradient(40% 40% at 20% 20%, var(--accent), transparent 70%), radial-gradient(45% 45% at 85% 75%, var(--accent-2), transparent 70%)" }}
            />
          ) : null}
          <div aria-hidden className="h-1 bg-accent-gradient" />
          <div className={glass ? "surface m-3 rounded-ui" : undefined}>
            <Sample lang={family.dir === "rtl" ? "ar" : "en"} label={family.label} />
          </div>
        </ThemeScope>
      </div>
    </figure>
  );
}

/**
 * Every style family on the same sample content. Each tile is one preset code applied to a
 * subtree; pairings the docs layout does not load are fetched from Google Fonts on mount.
 */
export function FamilyGallery() {
  React.useEffect(() => {
    for (const f of PRESET_FAMILIES) {
      const pairing = getFontPairing(decodePreset(f.code).font);
      if (pairing && !pairing.css) void loadGoogleFonts(pairingFamilies(pairing));
    }
  }, []);
  return (
    <div className="grid gap-x-5 gap-y-8 lg:grid-cols-2" data-testid="family-gallery">
      {PRESET_FAMILIES.map((f) => (
        <FamilyTile key={f.id} family={f} />
      ))}
    </div>
  );
}
