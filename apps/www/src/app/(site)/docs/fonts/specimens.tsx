"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn, controlVariants, matchText } from "@vamos-ui/react";
import {
  FontPairingPicker,
  FONT_PREVIEW_TEXT,
  fontCategories,
  fontGroups,
  fontGroupOf,
  fontStack,
  getFontPairing,
  googleFonts,
  isVariableFont,
  loadFontPreviews,
  loadGoogleFonts,
  type FontCategory,
  type GoogleFont,
} from "@vamos-ui/react/fonts";

const WATERFALL = "Ağaç işçiliği, şık İzmir çayı";

/** The whole catalog with live specimens, grouped by category. Expanding a row loads the full family. */
export function FontCatalog() {
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState<FontCategory | "all">("all");
  const [open, setOpen] = React.useState<string | null>(null);

  React.useEffect(() => {
    void loadFontPreviews(googleFonts.map((f) => f.family));
  }, []);

  const visible = googleFonts.filter((f) => (cat === "all" || f.category === cat) && (!query || matchText(`${f.family} ${fontGroupOf(f).label} ${f.use}`, query, "en")));

  return (
    <div className="not-prose grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className={cn(controlVariants({ size: "sm" }), "w-full max-w-64")}>
          <Search aria-hidden className="text-fg-subtle" />
          <span className="sr-only">Filter fonts</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter: grotesk, menu, code…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-subtle" />
        </label>
        <div role="group" aria-label="Category" className="flex flex-wrap gap-1">
          {[{ id: "all" as const, label: "All" }, ...fontCategories].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn("h-7 rounded-full border px-3 text-[12px] font-medium transition-colors focus-ring", cat === c.id ? "border-transparent bg-fg text-scene" : "border-line text-fg-muted hover:text-fg")}
            >
              {c.label}
              <span className="ms-1.5 tabular-nums opacity-60">{c.id === "all" ? googleFonts.length : googleFonts.filter((f) => f.category === c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? <p className="py-8 text-center text-[13px]">No family matches “{query}”.</p> : null}

      {fontGroups.map((g) => {
        const items = visible.filter((f) => fontGroupOf(f).id === g.id);
        if (!items.length) return null;
        return (
          <section key={g.id} aria-labelledby={`grp-${g.id}`} className="grid gap-0">
            <h3 id={`grp-${g.id}`} className="flex items-baseline justify-between border-b border-line pb-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
              <span>{g.label}</span>
              <span className="tabular-nums">{items.length}</span>
            </h3>
            {items.map((f) => (
              <Specimen key={f.id} font={f} open={open === f.id} onToggle={() => setOpen(open === f.id ? null : f.id)} />
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Specimen({ font, open, onToggle }: { font: GoogleFont; open: boolean; onToggle: () => void }) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (open && !ready) void loadGoogleFonts([font.family]).then(() => setReady(true));
  }, [open, ready, font.family]);
  const face = { fontFamily: fontStack(font.family) };
  const panel = `spec-${font.id}`;
  const axes = font.axes.map((a) => `${a.tag} ${a.min}–${a.max}`).join(" · ");

  return (
    <div className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={onToggle}
        className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-3.5 text-start focus-ring sm:grid-cols-[13rem_minmax(0,1fr)_auto]"
      >
        <span className="truncate text-[22px] leading-tight text-fg" style={face}>{font.family}</span>
        <span className="col-span-2 row-start-2 truncate text-[15px] text-fg-muted sm:col-span-1 sm:row-start-auto" style={face} aria-hidden>
          {FONT_PREVIEW_TEXT}
        </span>
        <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">
          {isVariableFont(font) ? "var" : `${font.weights.length}w`}
          {font.italics ? " · ital" : ""}
          <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </span>
      </button>
      {open ? (
        <div id={panel} className="ui-collapse grid gap-4 pb-5">
          <p className="text-[13px] text-fg-muted">{font.use}</p>
          <div className="grid gap-1.5 overflow-hidden" aria-busy={!ready}>
            {font.weights.map((w) => (
              <div key={w} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-3">
                <span className="font-mono text-[11px] tabular-nums text-fg-subtle">{w}</span>
                <span className="truncate text-[24px] leading-tight text-fg" style={{ ...face, fontWeight: w }}>{WATERFALL}</span>
              </div>
            ))}
            {font.italics ? (
              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-3">
                <span className="font-mono text-[11px] text-fg-subtle">ital</span>
                <span className="truncate text-[24px] italic leading-tight text-fg" style={face}>{WATERFALL}</span>
              </div>
            ) : null}
          </div>
          <dl className="grid gap-x-6 gap-y-1 text-[12px] sm:grid-cols-3">
            <div><dt className="text-fg-subtle">Axes</dt><dd className="font-mono text-fg">{axes || "static"}</dd></div>
            <div><dt className="text-fg-subtle">Subsets</dt><dd className="text-fg">{font.subsets.join(", ")}</dd></div>
            <div><dt className="text-fg-subtle">Import</dt><dd className="font-mono text-fg">{`"${font.family}"`}</dd></div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}

/** The 16 pairings as specimen cards, plus a live headline set in the chosen one. */
export function PairingGallery() {
  const [id, setId] = React.useState<string | null>("editorial");
  const p = getFontPairing(id ?? "editorial")!;
  React.useEffect(() => {
    void loadGoogleFonts([p.heading, p.body].filter((f) => !f.includes(",")));
  }, [p]);
  return (
    <div className="not-prose grid gap-4">
      <div className="rounded-ui border border-line bg-surface-2 px-5 py-6" aria-live="polite">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{p.label} · {p.heading.split(",")[0]} / {p.body.split(",")[0]}</div>
        <div
          className="mt-2 text-[length:calc(40px*var(--s))] leading-[1.02] text-fg"
          style={{ fontFamily: fontStack(p.heading), fontWeight: p.display.weight, letterSpacing: p.display.tracking, ["--s" as string]: p.display.scale }}
        >
          Quarterly report, <em style={{ fontStyle: p.display.em }}>rewritten</em> for humans
        </div>
        <p className="mt-2 max-w-prose text-[14.5px] text-fg-muted" style={{ fontFamily: fontStack(p.body) }}>
          {p.description} Çalışma takvimi, izin talepleri ve bordro özetleri aynı yerde.
        </p>
      </div>
      <FontPairingPicker value={id} onValueChange={setId} />
    </div>
  );
}
