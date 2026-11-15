"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";

export interface Hotspot {
  id: string;
  /** Horizontal position, 0–100 (% of the width, from the left edge of the picture). */
  x: number;
  /** Vertical position, 0–100 (% of the height, from the top). */
  y: number;
  /** Accessible name and tooltip ("Meeting room B", "Lens cap"). */
  label: string;
  /** Detail shown in the callout when selected. */
  description?: React.ReactNode;
  /** Glyph or short text inside the marker (an icon, "A"). Overrides `numbered`. */
  marker?: React.ReactNode;
  disabled?: boolean;
}

interface BaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "dir"> {
  hotspots: Hotspot[];
  /** The picture: an `<img>`, `<Image>`, inline SVG or any element. It fills the box. */
  children?: React.ReactNode;
  /** Width ÷ height of the picture (or a CSS ratio string, "4 / 3"). Omit to size from the children. */
  aspectRatio?: number | string;
  /** Show 1, 2, 3… inside the markers (pair with a numbered legend). */
  numbered?: boolean;
  /** Label next to each marker, always visible. Default: a tooltip on hover and focus. */
  showLabels?: boolean;
  /**
   * Callout beside a selected spot. Default (single only): label + description when the spot has a
   * description. `false` hides it — render your own detail panel from `value`.
   */
  callout?: false | ((spot: Hotspot) => React.ReactNode);
  /** Required: what the picture shows ("Third floor plan"). Names the group. */
  "aria-label": string;
}

export interface ImageHotspotsSingleProps extends BaseProps {
  /** One spot at a time (default) — a radio group: arrow keys move and select. */
  type?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface ImageHotspotsMultipleProps extends BaseProps {
  /** Any number of spots — toggle buttons: arrow keys move, Space / Enter toggles. */
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ImageHotspotsProps = ImageHotspotsSingleProps | ImageHotspotsMultipleProps;

const clamp = (n: number) => Math.min(100, Math.max(0, n));
const pct = (n: number) => `${clamp(n).toFixed(3)}%`;

/** The nearest enabled spot in a direction (screen space), for arrow keys. */
function nearest(spots: Hotspot[], from: Hotspot, dx: number, dy: number, ratio: number) {
  let best: Hotspot | undefined;
  let bestScore = Infinity;
  for (const s of spots) {
    if (s.id === from.id || s.disabled) continue;
    const vx = ((s.x - from.x) / 100) * ratio;
    const vy = (s.y - from.y) / 100;
    const along = vx * dx + vy * dy;
    if (along <= 0.0001) continue;
    const score = along + Math.abs(vx * dy - vy * dx) * 2;
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

/**
 * A picture with labelled, selectable spots — rooms on a floor plan, parts of a product,
 * buildings on a campus map. Every spot is a real button positioned in % of the picture.
 * `type="single"` behaves as a radio group, `type="multiple"` as toggle buttons; both keep one
 * tab stop and move focus with the arrow keys to the nearest spot in that direction.
 *
 * ```tsx
 * <ImageHotspots aria-label="Third floor" aspectRatio={16 / 10} hotspots={rooms} value={room} onValueChange={setRoom}>
 *   <img src="/plans/floor-3.svg" alt="" />
 * </ImageHotspots>
 * ```
 */
export const ImageHotspots = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ImageHotspotsProps>(function ImageHotspots(props, ref) {
  const { hotspots, children, aspectRatio, numbered, showLabels, callout, type = "single", value: valueProp, defaultValue, onValueChange, className, style, ...rest } = props;
  const multiple = type === "multiple";
  const [value, setValue] = useControllableState<string[]>({
    value: valueProp === undefined ? undefined : multiple ? (valueProp as string[]) : valueProp == null ? [] : [valueProp as string],
    defaultValue: () => (defaultValue == null ? [] : multiple ? (defaultValue as string[]) : [defaultValue as string]),
    onChange: (next) => (multiple ? (onValueChange as ((v: string[]) => void) | undefined)?.(next) : (onValueChange as ((v: string | null) => void) | undefined)?.(next[0] ?? null)),
    name: "ImageHotspots",
  });
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const refs = React.useRef(new Map<string, HTMLButtonElement>());
  const calloutId = React.useId();
  const ratio = typeof aspectRatio === "number" ? aspectRatio : 1;

  const enabled = hotspots.filter((s) => !s.disabled);
  const has = (id: string | null | undefined) => id != null && enabled.some((s) => s.id === id);
  const tabStop = has(focusId) ? focusId : has(value[0]) ? value[0] : enabled[0]?.id;

  const select = (id: string) => {
    if (multiple) setValue(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    else if (value[0] !== id) setValue([id]);
  };

  const move = (id: string | undefined) => {
    if (!id) return;
    setFocusId(id);
    refs.current.get(id)?.focus();
    if (!multiple) select(id);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, from: Hotspot) => {
    const dir = ({ ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] } as Record<string, [number, number]>)[e.key];
    if (dir) {
      e.preventDefault();
      // The picture does not mirror in RTL, but "next" on the horizontal axis does.
      const rtl = dir[0] !== 0 && getComputedStyle(e.currentTarget).direction === "rtl";
      move(nearest(hotspots, from, rtl ? -dir[0] : dir[0], dir[1], ratio)?.id);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(enabled[0]?.id);
    } else if (e.key === "End") {
      e.preventDefault();
      move(enabled.at(-1)?.id);
    } else if (e.key === "Escape" && value.length) {
      e.preventDefault();
      setValue([]);
    }
  };

  const selectedSpot = !multiple ? hotspots.find((s) => s.id === value[0]) : undefined;
  const renderCallout =
    callout === false
      ? null
      : (callout ??
        (multiple
          ? null
          : (s: Hotspot) =>
              s.description ? (
                <>
                  <p className="text-[13px] font-medium text-fg">{s.label}</p>
                  <div className="mt-0.5 text-xs text-fg-muted">{s.description}</div>
                </>
              ) : null));
  const calloutContent = selectedSpot && renderCallout ? renderCallout(selectedSpot) : null;

  return (
    <div
      ref={ref}
      role={multiple ? "group" : "radiogroup"}
      data-slot="image-hotspots"
      data-type={type}
      className={cn("relative isolate w-full select-none [&>img]:block [&>img]:size-full [&>img]:object-contain [&>svg]:block [&>svg]:size-full", className)}
      style={{ aspectRatio: aspectRatio == null ? undefined : String(aspectRatio), ...style }}
      {...rest}
    >
      {children}
      <div data-slot="image-hotspots-layer" className="absolute inset-0">
        {hotspots.map((s, i) => {
          const on = value.includes(s.id);
          const content = s.marker ?? (numbered ? i + 1 : null);
          return (
            <button
              key={s.id}
              ref={(el) => {
                if (el) refs.current.set(s.id, el);
                else refs.current.delete(s.id);
              }}
              type="button"
              role={multiple ? undefined : "radio"}
              aria-checked={multiple ? undefined : on}
              aria-pressed={multiple ? on : undefined}
              aria-label={s.label}
              aria-describedby={on && calloutContent ? calloutId : undefined}
              disabled={s.disabled}
              tabIndex={s.id === tabStop ? 0 : -1}
              data-slot="image-hotspot"
              data-state={on ? "on" : "off"}
              onFocus={() => setFocusId(s.id)}
              onClick={() => select(s.id)}
              onKeyDown={(e) => onKeyDown(e, s)}
              // Picture coordinates are physical: the image never mirrors.
              style={{ left: pct(s.x), top: pct(s.y) }}
              className={cn(
                "group/spot absolute grid size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
                on ? "z-20" : "z-10 hover:z-20 focus-visible:z-20",
              )}
            >
              {on ? <span aria-hidden="true" className="absolute size-8 rounded-full border border-accent opacity-50 motion-safe:animate-ping" /> : null}
              <span
                aria-hidden="true"
                className={cn(
                  "relative grid place-items-center rounded-full border-2 text-[11px] leading-none font-semibold tabular shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-[transform,background-color,color] duration-200 motion-reduce:transition-none [&_svg]:size-3",
                  content != null ? "size-6" : "size-4",
                  on ? "scale-110 border-accent bg-accent text-accent-fg" : "border-accent bg-surface text-fg group-hover/spot:scale-110",
                )}
              >
                {content}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute start-full ms-1 rounded-ui-sm bg-[color-mix(in_oklch,var(--surface-solid)_88%,transparent)] px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-fg shadow-[0_1px_2px_rgb(0_0_0/0.15)]",
                  showLabels ? "" : "opacity-0 transition-opacity duration-150 group-hover/spot:opacity-100 group-focus-visible/spot:opacity-100 motion-reduce:transition-none",
                )}
              >
                {s.label}
              </span>
            </button>
          );
        })}
        {selectedSpot && calloutContent ? (
          <div
            id={calloutId}
            data-slot="image-hotspots-callout"
            className={cn("surface-popover ui-pop pointer-events-none absolute z-30 w-max max-w-56 -translate-x-1/2 rounded-ui px-3 py-2", selectedSpot.y < 35 ? "mt-5" : "-mt-5 -translate-y-full")}
            style={{ left: `clamp(7rem, ${pct(selectedSpot.x)}, calc(100% - 7rem))`, top: pct(selectedSpot.y) }}
          >
            {calloutContent}
          </div>
        ) : null}
      </div>
    </div>
  );
});
