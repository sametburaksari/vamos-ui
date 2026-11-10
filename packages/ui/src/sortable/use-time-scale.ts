"use client";

import * as React from "react";
import { createTimeScale, toEpoch, type TimeScale, type TimeScaleOptions } from "../scheduler/core/time-scale";

/**
 * Memoized `createTimeScale` for Agenda, Resource calendar and Gantt. Recomputed only when a
 * primitive option changes (dates are compared by instant).
 *
 * ```tsx
 * const scale = useTimeScale({ start: "2026-11-01", end: "2026-12-01", scale: "day", timeZone, locale });
 * <div style={{ width: scale.width }}>{scale.ticks("day").map((t) => <div key={t.start} style={{ insetInlineStart: t.x, width: t.width }} />)}</div>
 * ```
 */
export function useTimeScale(options: TimeScaleOptions): TimeScale {
  const tz = options.timeZone ?? "UTC";
  const start = toEpoch(options.start, tz);
  const end = toEpoch(options.end, tz);
  const { scale, pxPerDay, locale, workCalendar } = options;
  return React.useMemo(
    () => createTimeScale({ start, end, scale, pxPerDay, timeZone: tz, locale, workCalendar }),
    [start, end, scale, pxPerDay, tz, locale, workCalendar],
  );
}
