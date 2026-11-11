import { Check, Fingerprint, X } from "lucide-react";
import { cn } from "@vamos-ui/react";

export type Ceremony = "idle" | "waiting" | "verifying" | "done" | "cancelled";

/**
 * The visual for a WebAuthn ceremony: concentric rings around a fingerprint that ripple while
 * the browser waits for the authenticator, spin while the server verifies, and settle on a check.
 * Decorative only — pair it with a live text status.
 */
export function PasskeySensor({ state, size = "lg" }: { state: Ceremony; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <div aria-hidden className={cn("relative grid shrink-0 place-items-center", lg ? "size-44" : "size-28")}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "absolute rounded-full border transition-[border-color,opacity] duration-500",
            state === "waiting" ? "border-accent-ink/40 motion-safe:animate-ping" : "border-line",
            state === "done" && "border-accent-ink/30",
          )}
          style={{
            inset: `${i * (lg ? 18 : 12)}px`,
            animationDuration: state === "waiting" ? `${2.4 + i * 0.4}s` : undefined,
            animationDelay: state === "waiting" ? `${i * 0.35}s` : undefined,
            opacity: state === "waiting" ? 0.9 - i * 0.15 : 1,
          }}
        />
      ))}
      <span
        className={cn(
          "relative grid place-items-center rounded-full border transition-[background-color,color,border-color,transform] duration-300",
          lg ? "size-[4.75rem] [&_svg]:size-9" : "size-14 [&_svg]:size-7",
          state === "done"
            ? "border-transparent bg-accent text-accent-fg motion-safe:scale-105"
            : state === "cancelled"
              ? "border-line bg-surface-2 text-fg-subtle"
              : state === "idle"
                ? "border-line bg-surface text-fg-muted"
                : "border-accent-ink/40 bg-accent-soft text-accent-ink",
        )}
      >
        {state === "done" ? <Check /> : state === "cancelled" ? <X /> : <Fingerprint strokeWidth={1.5} />}
        {state === "verifying" ? <span className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-accent-ink motion-safe:animate-spin" /> : null}
      </span>
    </div>
  );
}
