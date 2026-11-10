import * as React from "react";

/**
 * A fuller accessible name for a control whose visible text is a short summary (a calendar event
 * showing "9:00 Standup" that screen readers should hear as "Standup, Monday, 9:00 to 9:15").
 *
 * Use it instead of an `aria-label` that differs from the visible text, which fails WCAG 2.5.3
 * label-in-name (axe `label-content-name-mismatch`). The name is read from a visually hidden span;
 * the visible content is hidden from assistive tech so it isn't read twice. Never wrap focusable
 * content in it (that content would be `aria-hidden`).
 *
 * ```tsx
 * <button><SrName name={describe(event)}>{time} {title}</SrName></button>
 * ```
 */
export function SrName({ name, children }: { name: string; children?: React.ReactNode }) {
  return (
    <>
      <span className="sr-only">{name}</span>
      <span aria-hidden className="contents">
        {children}
      </span>
    </>
  );
}
