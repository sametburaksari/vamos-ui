import { cn } from "@vamos-ui/react";

export type Outcome = "W" | "D" | "L";

/**
 * Form guide: one square per game, oldest first. Win = club colour, draw = outline, loss = ink.
 * The letter is visible and each square has a spoken name, so colour is never the only signal.
 */
export function FormGuide({ form, labels, size = "md", className }: { form: Outcome[]; labels: Record<Outcome, string>; size?: "sm" | "md"; className?: string }) {
  return (
    <span role="list" className={cn("inline-flex gap-[3px]", className)}>
      {form.map((o, i) => (
        <span
          key={i}
          role="listitem"
          aria-label={labels[o]}
          data-form={o}
          className={cn(
            "inline-grid place-items-center rounded-[3px] font-mono font-bold leading-none",
            size === "sm" ? "size-[18px] text-[10px]" : "size-6 text-[11px]",
            o === "W" && "bg-accent text-accent-fg",
            o === "D" && "border border-fg-muted bg-surface text-fg",
            o === "L" && "bg-fg text-scene",
          )}
        >
          <span aria-hidden>{labels[o].charAt(0)}</span>
        </span>
      ))}
    </span>
  );
}
