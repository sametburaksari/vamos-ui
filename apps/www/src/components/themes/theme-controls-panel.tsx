"use client";

import * as React from "react";
import { ColorPicker, RadioGroup, cn } from "@vamos-ui/react";
import { KIT_ACCENT_BASE, isNamedAccent, PRESET_AXES, type Preset, type PresetAccentName, type PresetFont } from "@/lib/theme-codec";
import { AccentPalette } from "./accent-palette";

const fonts: Record<PresetFont, { label: string; faces: string }> = {
  editorial: { label: "Editorial", faces: "Instrument Serif · Onest" },
  grotesk: { label: "Grotesk", faces: "Bricolage · Hanken" },
  corporate: { label: "Corporate", faces: "IBM Plex Sans" },
  system: { label: "System", faces: "Platform UI font" },
};

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

function Row({ label, id, children, hint }: { label: string; id: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="grid gap-2 border-t border-line py-4 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span id={id} className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">
          {label}
        </span>
        {hint ? <span className="font-mono text-[11px] text-fg-muted">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** Visually hidden native radio + a styled tile; arrow keys move between tiles natively. */
function Tile({ name, value, checked, onSelect, children, className, label }: { name: string; value: string; checked: boolean; onSelect: () => void; children: React.ReactNode; className?: string; label: string }) {
  return (
    <label className={cn("relative block cursor-pointer", className)}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} aria-label={label} className="peer sr-only" />
      <span
        className={cn(
          "flex h-full items-center gap-2.5 rounded-ui border px-3 py-2.5 text-[13px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
          checked ? "border-fg/40 bg-selected text-fg" : "border-line bg-surface text-fg-muted hover:border-field-border-hover hover:text-fg",
        )}
      >
        {children}
      </span>
    </label>
  );
}

export function ThemeControlsPanel({ preset, onChange, customColour, onCustomColour }: { preset: Preset; onChange: (next: Partial<Preset>) => void; customColour: string; onCustomColour: (hex: string) => void }) {
  const id = React.useId();
  const custom = !isNamedAccent(preset.accent);
  const segmented = <K extends "theme" | "material" | "density" | "radius">(axis: K, label: string) => (
    <Row label={label} id={`${id}-${axis}`}>
      <RadioGroup
        variant="segmented"
        size="sm"
        aria-labelledby={`${id}-${axis}`}
        value={preset[axis]}
        onValueChange={(v) => onChange({ [axis]: v } as Partial<Preset>)}
        items={(PRESET_AXES[axis] as readonly string[]).map((v) => ({ value: v, label: cap(v) }))}
        data-axis={axis}
      />
    </Row>
  );

  return (
    <div className="grid">
      {segmented("theme", "Theme")}
      {segmented("material", "Material")}

      <Row label="Accent" id={`${id}-accent`} hint={custom ? preset.accent : undefined}>
        <div className="grid grid-cols-3 gap-1.5" data-axis="accent">
          {PRESET_AXES.accent.map((a: PresetAccentName) => (
            <Tile key={a} name={`${id}-accent`} value={a} label={cap(a)} checked={preset.accent === a} onSelect={() => onChange({ accent: a })}>
              <span aria-hidden className="size-3.5 shrink-0 rounded-full ring-1 ring-fg/15" style={{ background: KIT_ACCENT_BASE[a] }} />
              {cap(a)}
            </Tile>
          ))}
          <Tile name={`${id}-accent`} value="custom" label="Custom colour" checked={custom} onSelect={() => onChange({ accent: customColour as Preset["accent"] })}>
            <span aria-hidden className="size-3.5 shrink-0 rounded-full ring-1 ring-fg/15" style={{ background: customColour }} />
            Custom
          </Tile>
        </div>
        {custom ? (
          <div className="mt-2 grid gap-3">
            <div className="flex items-center gap-3">
              <ColorPicker
                value={preset.accent}
                onValueChange={(hex) => {
                  const h = hex.slice(0, 7).toLowerCase();
                  if (/^#[0-9a-f]{6}$/.test(h)) onCustomColour(h);
                }}
                eyeDropper={false}
                aria-label="Custom accent colour"
                size="sm"
              />
              <span className="text-[12.5px] leading-snug text-fg-muted">The CLI turns this one colour into four accent variables with readable contrast.</span>
            </div>
            <AccentPalette colour={preset.accent} />
          </div>
        ) : null}
      </Row>

      {segmented("density", "Density")}

      <Row label="Font pairing" id={`${id}-font`}>
        <div className="grid grid-cols-2 gap-1.5" data-axis="font">
          {PRESET_AXES.font.map((f) => (
            <Tile key={f} name={`${id}-font`} value={f} label={fonts[f].label} checked={preset.font === f} onSelect={() => onChange({ font: f })}>
              <span data-font={f} aria-hidden className="font-display text-[22px] leading-none text-fg">
                Ag
              </span>
              <span className="grid min-w-0 leading-tight">
                <span className="text-fg">{fonts[f].label}</span>
                <span className="truncate text-[11px] text-fg-subtle">{fonts[f].faces}</span>
              </span>
            </Tile>
          ))}
        </div>
      </Row>

      {segmented("radius", "Corners")}
    </div>
  );
}
