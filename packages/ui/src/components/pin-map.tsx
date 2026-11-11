"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useFormat } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";

export type MapPinTone = "accent" | "neutral" | "info" | "success" | "warning" | "danger";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  /** Accessible name and callout title. */
  label: string;
  /** Callout body (address, status, ETA). */
  description?: React.ReactNode;
  tone?: MapPinTone;
  /** Size for `variant="bubble"` (visitors, orders). */
  value?: number;
  /** Live ring — vehicles en route, new visitors. Off under reduced motion. */
  pulse?: boolean;
  /** Small glyph inside the marker (pin variant), e.g. a 12px icon or initials. */
  icon?: React.ReactNode;
}

export interface PinMapBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

export interface PinMapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  pins: MapPin[];
  /** Visible area. Omit to fit every pin. Expanded to match `aspectRatio` so nothing distorts. */
  bounds?: PinMapBounds;
  /** Width ÷ height. Default `16 / 10`. */
  aspectRatio?: number;
  /** `"pin"` (default) markers, small `"dot"`s, or value-sized `"bubble"`s. */
  variant?: "pin" | "dot" | "bubble";
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedIdChange?: (id: string | null) => void;
  /** Callout for the selected pin. Default: label + description. `false` hides it. */
  callout?: false | ((pin: MapPin) => React.ReactNode);
  /** Always show labels next to markers (few pins only). */
  showLabels?: boolean;
  /** Replace the drawn sheet with your own layer (a static tile image, an SVG of districts). */
  backdrop?: React.ReactNode;
  /** Hide the coordinate ticks and scale bar. */
  bare?: boolean;
  /** Required: what the map shows ("Stores in Istanbul"). */
  "aria-label": string;
}

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360));
const toRad = (deg: number) => (deg * Math.PI) / 180;
/** Percent string with fixed precision — identical on server and client. */
const pct = (v: number) => `${(v * 100).toFixed(3)}%`;

function fitBounds(pins: MapPin[], bounds: PinMapBounds | undefined, aspect: number): PinMapBounds {
  let b = bounds;
  if (!b) {
    if (pins.length === 0) b = { north: 1, south: -1, west: -1, east: 1 };
    else {
      const lats = pins.map((p) => p.lat);
      const lngs = pins.map((p) => p.lng);
      const [n, s, w, e] = [Math.max(...lats), Math.min(...lats), Math.min(...lngs), Math.max(...lngs)];
      const padLat = Math.max((n - s) * 0.14, 0.01);
      const padLng = Math.max((e - w) * 0.1, 0.01);
      b = { north: n + padLat, south: s - padLat, west: w - padLng, east: e + padLng };
    }
  }
  // Expand the short side so the Mercator projection keeps true shapes at this aspect ratio.
  const xSpan = toRad(b.east - b.west);
  const ySpan = mercY(b.north) - mercY(b.south);
  if (xSpan / ySpan < aspect) {
    const extra = (ySpan * aspect - xSpan) / 2;
    const d = (extra * 180) / Math.PI;
    return { ...b, west: b.west - d, east: b.east + d };
  }
  const targetY = xSpan / aspect;
  const mid = (mercY(b.north) + mercY(b.south)) / 2;
  const inv = (y: number) => (Math.atan(Math.exp(y)) * 360) / Math.PI - 90;
  return { ...b, north: inv(mid + targetY / 2), south: inv(mid - targetY / 2) };
}

const toneFill: Record<MapPinTone, string> = {
  accent: "bg-accent text-accent-fg",
  neutral: "bg-fg-muted text-scene",
  info: "bg-info text-scene",
  success: "bg-success text-scene",
  warning: "bg-warning text-scene",
  danger: "bg-danger text-scene",
};
const toneVar: Record<MapPinTone, string> = {
  accent: "var(--accent)",
  neutral: "var(--fg-muted)",
  info: "var(--info)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

/** A tidy step for ticks: 0.01, 0.02, 0.05, 0.1 … */
function niceStep(span: number, target: number) {
  const raw = span / target;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * pow;
}

/**
 * Markers on a projected sheet — stores, field jobs, vehicles, live visitors — without a tile
 * provider. Pins are positioned in Web Mercator inside `bounds`; pass a `backdrop` to lay them
 * over your own static map. Selection is controlled or not; arrow keys move to the nearest pin
 * in that direction, Enter selects, Escape clears.
 *
 * ```tsx
 * <PinMap aria-label="Stores" pins={stores.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.name }))}
 *   selectedId={selected} onSelectedIdChange={setSelected} />
 * ```
 */
export const PinMap = React.forwardRef<HTMLDivElement, PinMapProps>(function PinMap(
  { pins, bounds, aspectRatio = 16 / 10, variant = "pin", selectedId: selectedProp, defaultSelectedId = null, onSelectedIdChange, callout, showLabels, backdrop, bare, className, style, children, ...props },
  ref,
) {
  const f = useFormat();
  const [selectedId, setSelectedId] = useControllableState<string | null>({ value: selectedProp, defaultValue: defaultSelectedId, onChange: onSelectedIdChange, name: "PinMap" });
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const pinRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const calloutId = React.useId();

  const b = React.useMemo(() => fitBounds(pins, bounds, aspectRatio), [pins, bounds, aspectRatio]);
  const yTop = mercY(b.north);
  const ySpan = yTop - mercY(b.south);
  const project = React.useCallback((lat: number, lng: number) => ({ x: (lng - b.west) / (b.east - b.west), y: (yTop - mercY(lat)) / ySpan }), [b, yTop, ySpan]);
  const placed = React.useMemo(() => pins.map((p) => ({ pin: p, ...project(p.lat, p.lng) })), [pins, project]);
  const maxValue = Math.max(1, ...pins.map((p) => p.value ?? 0));

  const tabStop = focusId && pins.some((p) => p.id === focusId) ? focusId : selectedId && pins.some((p) => p.id === selectedId) ? selectedId : pins[0]?.id;

  const moveFocus = (id: string | undefined) => {
    if (!id) return;
    setFocusId(id);
    pinRefs.current.get(id)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, from: (typeof placed)[number]) => {
    const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
    if (dir) {
      e.preventDefault();
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl" && dir[0] !== 0;
      const [dx, dy] = rtl ? [-dir[0]!, dir[1]!] : (dir as [number, number]);
      let best: (typeof placed)[number] | undefined;
      let bestScore = Infinity;
      for (const p of placed) {
        if (p.pin.id === from.pin.id) continue;
        const vx = (p.x - from.x) * aspectRatio;
        const vy = p.y - from.y;
        const along = vx * dx + vy * dy;
        if (along <= 0.0001) continue;
        const across = Math.abs(vx * dy - vy * dx);
        const score = along + across * 2;
        if (score < bestScore) {
          bestScore = score;
          best = p;
        }
      }
      moveFocus(best?.pin.id);
    } else if (e.key === "Home") {
      e.preventDefault();
      moveFocus(pins[0]?.id);
    } else if (e.key === "End") {
      e.preventDefault();
      moveFocus(pins.at(-1)?.id);
    } else if (e.key === "Escape" && selectedId) {
      e.preventDefault();
      setSelectedId(null);
    }
  };

  // Ticks and scale bar.
  const latStep = niceStep(b.north - b.south, 4);
  const lngStep = niceStep(b.east - b.west, 6);
  const latTicks: number[] = [];
  for (let v = Math.ceil(b.south / latStep) * latStep; v <= b.north; v += latStep) latTicks.push(Number(v.toFixed(6)));
  const lngTicks: number[] = [];
  for (let v = Math.ceil(b.west / lngStep) * lngStep; v <= b.east; v += lngStep) lngTicks.push(Number(v.toFixed(6)));
  const decimals = Math.max(0, -Math.floor(Math.log10(Math.min(latStep, lngStep))));
  const widthKm = (b.east - b.west) * 111.32 * Math.cos(toRad((b.north + b.south) / 2));
  const scaleKm = niceStep(widthKm, 5);
  const scaleShare = scaleKm / widthKm;
  const scaleLabel = scaleKm >= 1 ? f.number(scaleKm, { style: "unit", unit: "kilometer", unitDisplay: "short" }) : f.number(Math.round(scaleKm * 1000), { style: "unit", unit: "meter", unitDisplay: "short" });

  const selected = placed.find((p) => p.pin.id === selectedId);
  const renderCallout = callout === false ? null : (callout ?? ((p: MapPin) => (
    <>
      <p className="text-[13px] font-medium text-fg">{p.label}</p>
      {p.description ? <div className="mt-0.5 text-xs text-fg-muted">{p.description}</div> : null}
    </>
  )));

  return (
    <div
      ref={ref}
      role="group"
      data-slot="pin-map"
      className={cn("relative isolate w-full overflow-hidden rounded-ui border border-line bg-surface-2 select-none", className)}
      style={{ aspectRatio: String(aspectRatio), ...style }}
      {...props}
    >
      {/* Sheet */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {backdrop ?? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_oklch,var(--fg)_14%,transparent)_0.8px,transparent_1px)] bg-[length:14px_14px] opacity-70" />
            <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {latTicks.map((v) => {
                const y = project(v, b.west).y * 100;
                return <line key={`la${v}`} x1="0" x2="100" y1={y} y2={y} vectorEffect="non-scaling-stroke" stroke="var(--line)" strokeWidth="1" />;
              })}
              {lngTicks.map((v) => {
                const x = project(b.north, v).x * 100;
                return <line key={`lo${v}`} y1="0" y2="100" x1={x} x2={x} vectorEffect="non-scaling-stroke" stroke="var(--line)" strokeWidth="1" />;
              })}
            </svg>
          </>
        )}
      </div>

      {!bare ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 font-mono text-[9.5px] text-fg-subtle tabular">
          {latTicks.map((v) => (
            <span key={`tl${v}`} className="absolute start-1.5 -translate-y-full pb-0.5" style={{ top: pct(project(v, b.west).y) }}>
              {Math.abs(v).toFixed(decimals)}°{v >= 0 ? "N" : "S"}
            </span>
          ))}
          {lngTicks.slice(1).map((v) => (
            <span key={`tg${v}`} className="absolute top-1.5 ps-1" style={{ left: pct(project(b.north, v).x) }}>
              {Math.abs(v).toFixed(decimals)}°{v >= 0 ? "E" : "W"}
            </span>
          ))}
          <span className="absolute inset-x-3 bottom-2.5 flex flex-col items-end gap-1">
            <span>{scaleLabel}</span>
            <span className="block h-1 border-x border-b border-fg-subtle" style={{ width: pct(scaleShare) }} />
          </span>
        </div>
      ) : null}

      {/* Markers */}
      <div className="absolute inset-0">
        {placed.map(({ pin, x, y }) => {
          const tone = pin.tone ?? "accent";
          const isSelected = pin.id === selectedId;
          const size = variant === "bubble" ? Math.round(10 + Math.sqrt((pin.value ?? 0) / maxValue) * 34) : variant === "dot" ? 10 : 22;
          return (
            <button
              key={pin.id}
              ref={(el) => {
                if (el) pinRefs.current.set(pin.id, el);
                else pinRefs.current.delete(pin.id);
              }}
              type="button"
              data-slot="pin-map-pin"
              data-selected={isSelected || undefined}
              aria-pressed={isSelected}
              aria-label={pin.label}
              aria-describedby={isSelected && renderCallout ? calloutId : undefined}
              tabIndex={pin.id === tabStop ? 0 : -1}
              onFocus={() => setFocusId(pin.id)}
              onClick={() => setSelectedId(isSelected ? null : pin.id)}
              onKeyDown={(e) => onKeyDown(e, { pin, x, y })}
              className={cn(
                "group/pin absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-2)]",
                isSelected ? "z-20" : "z-10 hover:z-20 focus-visible:z-20",
              )}
              style={{ left: pct(x), top: pct(y), width: Math.max(size, 24), height: Math.max(size, 24) }}
            >
              {pin.pulse ? (
                <span aria-hidden="true" className="absolute rounded-full opacity-60 motion-safe:animate-ping" style={{ width: Math.min(size, 22), height: Math.min(size, 22), background: toneVar[tone] }} />
              ) : null}
              {variant === "bubble" ? (
                <span
                  aria-hidden="true"
                  className="rounded-full border transition-transform duration-200 group-hover/pin:scale-105 motion-reduce:transition-none"
                  style={{
                    width: size,
                    height: size,
                    background: `color-mix(in oklch, ${toneVar[tone]} ${isSelected ? 55 : 30}%, transparent)`,
                    borderColor: toneVar[tone],
                  }}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative grid place-items-center rounded-full ring-2 ring-[var(--surface-solid)] shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-200 group-hover/pin:scale-110 motion-reduce:transition-none [&_svg]:size-3",
                    toneFill[tone],
                    isSelected && "scale-125 ring-[var(--fg)]",
                  )}
                  style={{ width: variant === "dot" ? 9 : 18, height: variant === "dot" ? 9 : 18 }}
                >
                  {variant === "pin" ? pin.icon : null}
                </span>
              )}
              {showLabels ? (
                <span aria-hidden="true" className="pointer-events-none absolute start-full ms-0.5 rounded-ui-sm bg-[color-mix(in_oklch,var(--surface-solid)_82%,transparent)] px-1 text-[11px] font-medium whitespace-nowrap text-fg">
                  {pin.label}
                </span>
              ) : null}
            </button>
          );
        })}

        {selected && renderCallout ? (
          <div
            id={calloutId}
            data-slot="pin-map-callout"
            className={cn(
              "surface-popover ui-pop pointer-events-none absolute z-30 w-max max-w-56 -translate-x-1/2 rounded-ui px-3 py-2",
              selected.y < 0.35 ? "mt-4" : "-translate-y-full -mt-4",
            )}
            style={{ left: `clamp(7rem, ${pct(selected.x)}, calc(100% - 7rem))`, top: pct(selected.y) }}
          >
            {renderCallout(selected.pin)}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
});
