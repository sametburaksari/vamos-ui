"use client";

import * as React from "react";
import { Moon, Sun, Layers, Square, Rows2, Rows3 } from "lucide-react";
import { cn, IconButton } from "@vamos-ui/react";

type State = { dark: boolean; material: "glass" | "solid"; accent: string; density: "comfortable" | "compact"; font: string };
const fontsList = [
  { id: "editorial", label: "Editorial" },
  { id: "grotesk", label: "Grotesk" },
  { id: "corporate", label: "Corporate" },
  { id: "system", label: "System" },
];
const accents = [
  { id: "lime", color: "oklch(0.89 0.21 122)" },
  { id: "ocean", color: "oklch(0.64 0.17 245)" },
  { id: "ember", color: "oklch(0.7 0.19 45)" },
  { id: "rose", color: "oklch(0.66 0.21 10)" },
  { id: "graphite", color: "oklch(0.3 0.01 120)" },
];

function apply(s: State) {
  const h = document.documentElement;
  h.classList.toggle("dark", s.dark);
  h.dataset.material = s.material;
  h.dataset.accent = s.accent;
  h.dataset.density = s.density;
  h.dataset.font = s.font;
  try { localStorage.setItem("vamos-theme", JSON.stringify(s)); } catch {}
}

/** Live switcher for the theme axes (development / demo). */
export function ThemeControls() {
  const [s, setS] = React.useState<State | null>(null);
  React.useEffect(() => {
    const h = document.documentElement;
    setS({
      dark: h.classList.contains("dark"),
      material: (h.dataset.material as State["material"]) ?? "glass",
      accent: h.dataset.accent ?? "lime",
      density: (h.dataset.density as State["density"]) ?? "comfortable",
      font: h.dataset.font ?? "editorial",
    });
  }, []);
  if (!s) return <div className="h-8 w-56" />;
  const set = (p: Partial<State>) => { const n = { ...s, ...p }; setS(n); apply(n); };

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
      <select
        aria-label="Font"
        value={s.font}
        onChange={(e) => set({ font: e.target.value })}
        className="h-8 rounded-full border border-field-border bg-field ps-3 pe-2 text-[12.5px] text-fg hover:border-field-border-hover focus-ring"
      >
        {fontsList.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
      </select>
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
