"use client";

import * as React from "react";
import { useFormat } from "@vamos-ui/react";
import { usePointerDrag, useTimeScale } from "@vamos-ui/react/sortable";

const DAY_START = "2026-11-10T06:00:00Z"; // 09:00 Istanbul
const DAY_END = "2026-11-10T13:00:00Z"; // 16:00 Istanbul
const SLOT = 15; // minutes

export default function SortablePointerDrag() {
  const format = useFormat();
  const scale = useTimeScale({ start: DAY_START, end: DAY_END, scale: "hour", pxPerDay: 96 * 24, timeZone: "Europe/Istanbul" });
  const [start, setStart] = React.useState(Date.parse("2026-11-10T08:00:00Z"));
  const [preview, setPreview] = React.useState<number | null>(null);
  const duration = 90 * 60_000;
  const shown = preview ?? start;

  const toSnapped = (dx: number) => {
    const t = scale.snap(start + scale.pxToDuration(dx), SLOT);
    return Math.min(Math.max(t, scale.start), scale.end - duration);
  };
  const { bind, isDragging } = usePointerDrag({
    axis: "x",
    onMove: (s) => setPreview(toSnapped(s.delta.x)),
    onEnd: (s) => {
      setStart(toSnapped(s.delta.x));
      setPreview(null);
    },
    onCancel: () => setPreview(null),
  });

  const time = (ms: number) => format.time(new Date(ms), { timeStyle: "short", timeZone: "Europe/Istanbul" });
  const nudge = (minutes: number) => setStart((s) => Math.min(Math.max(s + minutes * 60_000, scale.start), scale.end - duration));

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative rounded-ui-lg border border-line bg-surface" style={{ width: scale.width, height: 104 }}>
        {scale.ticks("hour").map((t) => (
          <div key={t.start} className="absolute inset-y-0 border-s border-line first:border-s-0" style={{ insetInlineStart: t.x, width: t.width }}>
            <span className="tabular block whitespace-nowrap px-1.5 pt-1 text-[11px] text-fg-subtle">{time(t.start)}</span>
          </div>
        ))}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Design review"
          aria-valuemin={0}
          aria-valuemax={(scale.end - scale.start - duration) / 60_000}
          aria-valuenow={(shown - scale.start) / 60_000}
          aria-valuetext={`${time(shown)} to ${time(shown + duration)}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") nudge(SLOT);
            else if (e.key === "ArrowLeft") nudge(-SLOT);
            else return;
            e.preventDefault();
          }}
          {...bind}
          className="focus-ring absolute top-8 flex h-14 cursor-grab select-none flex-col justify-center overflow-hidden whitespace-nowrap rounded-ui-sm border-s-[3px] px-2.5 text-xs active:cursor-grabbing"
          style={{
            ...bind.style,
            insetInlineStart: scale.toPx(shown),
            width: scale.durationToPx(duration),
            borderInlineStartColor: "var(--chart-2)",
            background: "color-mix(in srgb, var(--chart-2) 16%, var(--surface))",
            boxShadow: isDragging ? "var(--popover-shadow)" : undefined,
          }}
        >
          <span className="font-medium text-fg">Design review</span>
          <span className="tabular text-fg-muted">
            {time(shown)} – {time(shown + duration)}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs text-fg-muted">Drag the event (snaps to 15 minutes, Esc cancels) or focus it and use ← →.</p>
    </div>
  );
}
