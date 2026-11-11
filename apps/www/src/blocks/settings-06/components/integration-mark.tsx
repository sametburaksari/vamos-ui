import { cn } from "@vamos-ui/react";

/** Typographic monogram standing in for a provider logo (no third-party marks). */
export function IntegrationMark({ mark, size = "md", muted, className }: { mark: string; size?: "sm" | "md" | "lg"; muted?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center rounded-ui border border-line bg-surface-2 font-display leading-none tracking-[-0.02em] text-fg",
        "after:absolute after:inset-x-1.5 after:bottom-1 after:h-px after:bg-line",
        size === "sm" && "size-8 text-[13px]",
        size === "md" && "size-11 text-[17px]",
        size === "lg" && "size-14 text-[22px]",
        muted && "text-fg-subtle",
        className,
      )}
    >
      {mark}
    </span>
  );
}
