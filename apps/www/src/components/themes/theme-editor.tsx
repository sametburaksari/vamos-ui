"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button, cn } from "@vamos-ui/react";
import { encodePreset, isNamedAccent, KIT_ACCENT_BASE, tryDecodePreset, type Preset } from "@/lib/theme-codec";
import { curatedPresets } from "./presets";
import { ThemeControlsPanel } from "./theme-controls-panel";
import { ThemeOutput } from "./theme-output";
import { ThemePreview } from "./theme-preview";

const START = curatedPresets[0]!.preset;
const DEFAULT_CUSTOM = "#3b4bd8";

const sameAs = (a: Preset, b: Preset) => encodePreset(a) === encodePreset(b);

function PresetChip({ name, note, preset, active, onPick }: { name: string; note: string; preset: Preset; active: boolean; onPick: () => void }) {
  const colour = isNamedAccent(preset.accent) ? KIT_ACCENT_BASE[preset.accent] : preset.accent;
  return (
    <li className="min-w-0">
      <button
        type="button"
        aria-pressed={active}
        onClick={onPick}
        className={cn(
          "group grid w-full min-w-0 grid-cols-[auto_1fr] items-center gap-x-3 rounded-ui border px-3 py-2.5 text-start transition-colors focus-ring",
          active ? "border-fg/40 bg-selected" : "border-line bg-surface hover:border-field-border-hover",
        )}
      >
        <span aria-hidden className={cn("relative grid size-8 place-items-center overflow-hidden rounded-ui-sm border border-line", preset.theme === "dark" ? "dark bg-scene" : "light bg-scene")}>
          <span className="size-3.5 rounded-full" style={{ background: colour }} />
        </span>
        <span className="grid min-w-0 leading-tight">
          <span className="truncate text-[13.5px] font-medium text-fg">{name}</span>
          <span className="truncate text-[11.5px] text-fg-subtle">{note}</span>
        </span>
      </button>
    </li>
  );
}

export function ThemeEditor() {
  const [preset, setPreset] = React.useState<Preset>(START);
  const [customColour, setCustomColour] = React.useState(DEFAULT_CUSTOM);
  const [error, setError] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  // Restore from ?p=<code> on load (static export: read the URL on the client).
  React.useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("p");
    if (code) {
      const r = tryDecodePreset(code);
      if (r.ok) {
        setPreset(r.preset);
        if (!isNamedAccent(r.preset.accent)) setCustomColour(r.preset.accent);
      } else setError(r.error);
    }
    setReady(true);
  }, []);

  // Keep the URL shareable.
  React.useEffect(() => {
    if (!ready) return;
    const u = new URL(window.location.href);
    u.searchParams.set("p", encodePreset(preset));
    window.history.replaceState(window.history.state, "", u);
  }, [preset, ready]);

  const update = (next: Partial<Preset>) => {
    setError(null);
    setPreset((p) => ({ ...p, ...next }));
  };
  const pick = (p: Preset) => {
    setError(null);
    setPreset(p);
    if (!isNamedAccent(p.accent)) setCustomColour(p.accent);
  };

  return (
    <div className="grid gap-8">
      <div className="grid gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-mono text-[11px] tracking-[0.12em] text-fg-subtle uppercase">Start from</h2>
          <Button size="xs" variant="ghost" onClick={() => pick(START)}>
            <RotateCcw /> Reset
          </Button>
        </div>
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7" aria-label="Curated presets">
          {curatedPresets.map((c) => (
            <PresetChip key={c.name} {...c} active={sameAs(c.preset, preset)} onPick={() => pick(c.preset)} />
          ))}
        </ul>
        {error ? (
          <p role="alert" className="text-[13px] text-danger">
            The shared link has an invalid preset: {error}
          </p>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[19.5rem_minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)] xl:gap-8">
        <aside aria-label="Theme controls" className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pe-1">
          <ThemeControlsPanel
            preset={preset}
            onChange={update}
            customColour={customColour}
            onCustomColour={(hex) => {
              setCustomColour(hex);
              update({ accent: hex as Preset["accent"] });
            }}
          />
        </aside>
        <div className="grid min-w-0 gap-6">
          <ThemePreview preset={preset} />
          <ThemeOutput preset={preset} />
        </div>
      </div>
    </div>
  );
}
