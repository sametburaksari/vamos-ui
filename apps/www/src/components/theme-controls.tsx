"use client";

import * as React from "react";
import { Moon, Sun, Layers, Square, Rows2, Rows3, ChevronDown } from "lucide-react";
import { cn, IconButton, Button, Popover, PopoverTrigger, PopoverContent, PopoverHeader, Tabs, TabsList, TabsTrigger, TabsContent, Label } from "@vamos-ui/react";
import {
  FontPairingPicker,
  FontPicker,
  applyFontPairing,
  clearFontPairing,
  createFontPairing,
  fontPairings,
  fontStack,
  getFontPairing,
  parseFontPairing,
  serializeFontPairing,
  type FontPairing,
  type StoredFontPairing,
} from "@vamos-ui/react/fonts";

type State = {
  dark: boolean;
  material: "glass" | "solid";
  accent: string;
  density: "comfortable" | "compact";
  /** Pairing id (kept for older saved states and the data-font attribute). */
  font: string;
  /** The resolved pairing, so the boot script can load its Google fonts before paint. */
  fontPairing?: StoredFontPairing;
};

const accents = [
  { id: "lime", color: "oklch(0.89 0.21 122)" },
  { id: "ocean", color: "oklch(0.64 0.17 245)" },
  { id: "ember", color: "oklch(0.7 0.19 45)" },
  { id: "rose", color: "oklch(0.66 0.21 10)" },
  { id: "graphite", color: "oklch(0.3 0.01 120)" },
];

function applyPairing(h: HTMLElement, p: FontPairing) {
  if (p.css) {
    // The four built-in presets live in styles.css (and use the next/font files): only the attribute changes.
    clearFontPairing(h);
    h.dataset.font = p.id;
  } else {
    void applyFontPairing(h, p);
  }
}

function apply(s: State) {
  const h = document.documentElement;
  h.classList.toggle("dark", s.dark);
  h.dataset.material = s.material;
  h.dataset.accent = s.accent;
  h.dataset.density = s.density;
  const p = parseFontPairing(s.fontPairing) ?? getFontPairing(s.font) ?? fontPairings[0]!;
  applyPairing(h, p);
  try { localStorage.setItem("vamos-theme", JSON.stringify(s)); } catch {}
}

function readStored(): StoredFontPairing | undefined {
  try {
    return JSON.parse(localStorage.getItem("vamos-theme") || "{}").fontPairing;
  } catch {
    return undefined;
  }
}

/** Live switcher for the theme axes (development / demo). */
export function ThemeControls() {
  const [s, setS] = React.useState<State | null>(null);
  React.useEffect(() => {
    const h = document.documentElement;
    const stored = readStored();
    const font = h.dataset.font ?? "editorial";
    setS({
      dark: h.classList.contains("dark"),
      material: (h.dataset.material as State["material"]) ?? "glass",
      accent: h.dataset.accent ?? "lime",
      density: (h.dataset.density as State["density"]) ?? "comfortable",
      font,
      fontPairing: stored?.id === font ? stored : undefined,
    });
  }, []);
  if (!s) return <div className="h-8 w-56" />;
  const set = (p: Partial<State>) => { const n = { ...s, ...p }; setS(n); apply(n); };
  const pairing = parseFontPairing(s.fontPairing) ?? getFontPairing(s.font) ?? fontPairings[0]!;
  const setPairing = (p: FontPairing) => set({ font: p.id, fontPairing: serializeFontPairing(p) });

  return (
    <div className="flex items-center gap-1">
      <div className="me-1 flex items-center gap-1 rounded-full border border-field-border bg-field p-1" role="radiogroup" aria-label="Accent colour">
        {accents.map((a) => (
          <button
            key={a.id}
            role="radio"
            aria-checked={s.accent === a.id}
            aria-label={a.id}
            onClick={() => set({ accent: a.id })}
            className={cn("size-4 rounded-full ring-offset-2 ring-offset-[var(--field)] transition focus-ring", s.accent === a.id && "ring-2 ring-fg/60")}
            style={{ background: a.color }}
          />
        ))}
      </div>
      <TypeControl pairing={pairing} onPairingChange={setPairing} />
      <IconButton size="sm" label={s.density === "compact" ? "Comfortable density" : "Compact density"} onClick={() => set({ density: s.density === "compact" ? "comfortable" : "compact" })}>
        {s.density === "compact" ? <Rows2 /> : <Rows3 />}
      </IconButton>
      <IconButton size="sm" label={s.material === "glass" ? "Switch to solid" : "Switch to glass"} onClick={() => set({ material: s.material === "glass" ? "solid" : "glass" })}>
        {s.material === "glass" ? <Layers /> : <Square />}
      </IconButton>
      <IconButton size="sm" label={s.dark ? "Light theme" : "Dark theme"} onClick={() => set({ dark: !s.dark })}>
        {s.dark ? <Sun /> : <Moon />}
      </IconButton>
    </div>
  );
}

/** Header type switcher: curated pairings, or any heading/body/code mix from the catalog. */
function TypeControl({ pairing, onPairingChange }: { pairing: FontPairing; onPairingChange: (p: FontPairing) => void }) {
  const isPreset = fontPairings.some((p) => p.id === pairing.id);
  const [tab, setTab] = React.useState(isPreset ? "pairings" : "custom");
  const [draft, setDraft] = React.useState({ heading: pairing.heading, body: pairing.body, mono: pairing.mono });
  React.useEffect(() => setDraft({ heading: pairing.heading, body: pairing.body, mono: pairing.mono }), [pairing]);
  const custom = (d: typeof draft) => {
    setDraft(d);
    onPairingChange(createFontPairing({ ...d, label: "Custom" }));
  };
  // Raw CSS stacks (System) can't be shown in a catalog picker.
  const pick = (v: string) => (v.includes(",") ? null : v);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-full border border-field-border bg-field ps-2.5 pe-2 text-[12.5px] text-fg hover:border-field-border-hover focus-ring"
        >
          <span aria-hidden className="text-[15px] leading-none" style={{ fontFamily: fontStack(pairing.heading), fontWeight: pairing.display.weight }}>Aa</span>
          {/* Name comes from the content (sr-only prefix), never a differing aria-label (axe label-content-name-mismatch). */}
          <span><span className="sr-only">Font: </span>{pairing.label}</span>
          <ChevronDown aria-hidden className="size-3.5 text-fg-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent size="lg" align="end" className="w-[23rem]">
        <PopoverHeader title="Typography" description="Sixteen curated pairings, or mix any of the 59 Google Fonts families." />
        <Tabs value={tab} onValueChange={setTab} className="gap-3">
          <TabsList variant="segmented" fill>
            <TabsTrigger value="pairings">Pairings</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          <TabsContent value="pairings" className="-mx-1 max-h-[22rem] overflow-y-auto px-1">
            <FontPairingPicker layout="list" value={isPreset ? pairing.id : null} onValueChange={(_, p) => onPairingChange(p)} />
          </TabsContent>
          <TabsContent value="custom" className="grid gap-3">
            {([
              ["heading", "Headings", undefined],
              ["body", "Body & UI", ["sans", "serif", "rounded", "condensed"] as const],
              ["mono", "Code & numbers", ["mono"] as const],
            ] as const).map(([key, label, cats]) => (
              <div key={key} className="grid gap-1.5">
                <Label htmlFor={`type-${key}`}>{label}</Label>
                <FontPicker
                  id={`type-${key}`}
                  size="sm"
                  value={pick(draft[key])}
                  categories={cats ? [...cats] : undefined}
                  onValueChange={(fam) => custom({ ...draft, [key]: fam })}
                />
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-[12px] text-fg-muted">
              <span className="truncate">Saved in this browser.</span>
              <Button size="sm" variant="ghost" onClick={() => { setTab("pairings"); onPairingChange(fontPairings[0]!); }}>
                Reset to Editorial
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
