"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { initials as toInitials } from "../lib/text";

const avatarLabels = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
  withStatus: "{name} ({status})",
  overflow: "+{count}",
  more: "{count, plural, one {# more person} other {# more people}}",
};
export type AvatarLabels = typeof avatarLabels;

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "away" | "busy" | "offline";

export const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center align-middle font-medium leading-none tracking-[0.01em]",
  {
    variants: {
      size: {
        xs: "size-5 text-[8.5px]",
        sm: "size-6 text-[10px]",
        md: "size-8 text-xs",
        lg: "size-10 text-sm",
        xl: "size-14 text-[19px]",
      },
      shape: {
        circle: "rounded-full",
        /** Organisation / workspace logos. */
        square: "rounded-[28%]",
      },
    },
    defaultVariants: { size: "md", shape: "circle" },
  },
);

const dotSize: Record<AvatarSize, string> = {
  xs: "size-1.5 ring-1",
  sm: "size-[7px] ring-[1.5px]",
  md: "size-2 ring-2",
  lg: "size-2.5 ring-2",
  xl: "size-3.5 ring-[3px]",
};
const statusColor: Record<AvatarStatus, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-danger",
  offline: "bg-fg-subtle",
};

/** Deterministic 1–6 from a string (stable across renders and servers). */
function hueIndex(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 6) + 1;
}

/** Soft background + ink text for an initials avatar, from the chart palette. */
export function avatarColor(seed: string): React.CSSProperties {
  const c = `var(--chart-${hueIndex(seed)})`;
  return {
    backgroundColor: `color-mix(in oklch, ${c} 20%, var(--surface-solid))`,
    color: `color-mix(in oklch, ${c} 60%, var(--fg))`,
  };
}

interface AvatarGroupContextValue {
  size?: AvatarSize;
  shape?: "circle" | "square";
}
const AvatarGroupContext = React.createContext<AvatarGroupContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Composite parts                                                     */
/* ------------------------------------------------------------------ */

export interface AvatarRootProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
  shape?: "circle" | "square";
}

/** Root of the composite API: `<AvatarRoot><AvatarImage/><AvatarFallback/></AvatarRoot>`. */
export const AvatarRoot = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarRootProps>(function AvatarRoot(
  { size, shape, className, ...props },
  ref,
) {
  const group = React.useContext(AvatarGroupContext);
  const s = size ?? group?.size ?? "md";
  const sh = shape ?? group?.shape ?? "circle";
  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      data-size={s}
      data-shape={sh}
      className={cn(avatarVariants({ size: s, shape: sh }), group && "ring-2 ring-(--avatar-ring)", className)}
      {...props}
    />
  );
});

/** The photo. Pass `asChild` to render a framework image (Next `<Image>`). */
export const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(
  function AvatarImage({ className, ...props }, ref) {
    return <AvatarPrimitive.Image ref={ref} data-slot="avatar-image" className={cn("size-full rounded-[inherit] object-cover", className)} {...props} />;
  },
);

/** Shown while the image loads (after `delayMs`), when it fails, or when there is none. */
export const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(
  function AvatarFallback({ className, ...props }, ref) {
    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        data-slot="avatar-fallback"
        className={cn("flex size-full items-center justify-center rounded-[inherit] bg-selected text-fg-muted [&_svg]:size-[55%]", className)}
        {...props}
      />
    );
  },
);

/* ------------------------------------------------------------------ */
/* Avatar (shorthand)                                                  */
/* ------------------------------------------------------------------ */

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Photo URL. Missing, `null` or failing → initials. */
  src?: string | null;
  /** Person or organisation name: initials, fallback colour and the accessible name. */
  name: string;
  /** 20 / 24 / 32 / 40 / 56 px. Default `"md"`. */
  size?: AvatarSize;
  /** `"square"` for organisation logos. */
  shape?: "circle" | "square";
  /** Presence dot (announced with the name). */
  status?: AvatarStatus;
  /** Override the announced status text ("In a meeting"). */
  statusLabel?: string;
  /** Override the computed initials (1–2 letters) or pass an icon. */
  fallback?: React.ReactNode;
  /** ms before the fallback shows while an image loads (avoids flashing). Default 300. */
  delayMs?: number;
  /** Use the same neutral colour for every fallback instead of the per-name hue. */
  neutral?: boolean;
  labels?: Partial<AvatarLabels>;
}

/**
 * A person or organisation: contact lists, assignees, comment threads, the top-bar user menu.
 * Image with an initials fallback (locale-correct: "ilker şahin" → "İŞ" in Turkish), a colour
 * picked from the name, and an optional status dot.
 *
 * ```tsx
 * <Avatar name="Ada Lovelace" src="/people/ada.jpg" status="online" />
 * <Avatar name="Northwind Traders" shape="square" size="lg" />
 * ```
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, size, shape, status, statusLabel, fallback, delayMs = 300, neutral, labels, className, style, ...props },
  ref,
) {
  const t = useLabels("avatar", avatarLabels, labels);
  const { locale } = useLocale();
  const group = React.useContext(AvatarGroupContext);
  const s = size ?? group?.size ?? "md";
  const statusText = status ? (statusLabel ?? t(status)) : undefined;
  const accessible = statusText ? t("withStatus", { name, status: statusText }) : name;
  const letters = fallback ?? (toInitials(name, locale, s === "xs" ? 1 : 2) || "?");

  return (
    <AvatarRoot ref={ref} size={s} shape={shape} className={className} style={style} {...props}>
      {src ? <AvatarImage src={src} alt={accessible} /> : null}
      <AvatarFallback
        delayMs={src ? delayMs : undefined}
        role="img"
        aria-label={accessible}
        style={neutral ? undefined : avatarColor(name)}
      >
        <span aria-hidden>{letters}</span>
      </AvatarFallback>
      {status ? (
        <span
          aria-hidden
          data-slot="avatar-status"
          data-status={status}
          className={cn(
            "absolute end-0 bottom-0 rounded-full ring-(--avatar-ring)",
            shape === "square" && "-end-0.5 -bottom-0.5",
            dotSize[s],
            statusColor[status],
          )}
        />
      ) : null}
    </AvatarRoot>
  );
});

/* ------------------------------------------------------------------ */
/* AvatarGroup                                                         */
/* ------------------------------------------------------------------ */

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatars shown before the "+N" chip. Default 4. */
  max?: number;
  /** Total number of people when the list you pass is already truncated (server-side). */
  total?: number;
  size?: AvatarSize;
  shape?: "circle" | "square";
  /** Makes "+N" a button (open the full list in a popover or dialog). */
  onOverflowClick?: () => void;
  /** Overlap between avatars. Default `"md"`. */
  spacing?: "sm" | "md" | "lg";
  labels?: Partial<AvatarLabels>;
}

const overlap: Record<AvatarSize, Record<"sm" | "md" | "lg", string>> = {
  xs: { sm: "-ms-0.5", md: "-ms-1", lg: "-ms-1.5" },
  sm: { sm: "-ms-1", md: "-ms-1.5", lg: "-ms-2" },
  md: { sm: "-ms-1", md: "-ms-2", lg: "-ms-3" },
  lg: { sm: "-ms-1.5", md: "-ms-2.5", lg: "-ms-4" },
  xl: { sm: "-ms-2", md: "-ms-3.5", lg: "-ms-5" },
};

/**
 * Stacked avatars with a "+N" overflow ("3 more people" for screen readers): assignees,
 * attendees, a team on a deal.
 *
 * ```tsx
 * <AvatarGroup max={3} aria-label="Assignees">
 *   {team.map((p) => <Avatar key={p.id} name={p.name} src={p.photo} />)}
 * </AvatarGroup>
 * ```
 */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { max = 4, total, size = "md", shape = "circle", onOverflowClick, spacing = "md", labels, className, children, ...props },
  ref,
) {
  const t = useLabels("avatar", avatarLabels, labels);
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const shown = items.slice(0, Math.max(0, max));
  const extra = Math.max(0, (total ?? items.length) - shown.length);
  const ctx = React.useMemo(() => ({ size, shape }), [size, shape]);
  const step = overlap[size][spacing];
  const chipClass = cn(
    avatarVariants({ size, shape }),
    "relative ring-2 ring-(--avatar-ring) bg-surface-2 font-mono tabular text-fg-muted",
    step,
  );

  return (
    <div ref={ref} role="group" data-slot="avatar-group" className={cn("flex items-center", className)} {...props}>
      <AvatarGroupContext.Provider value={ctx}>
        {shown.map((child, i) => (
          <span key={child.key ?? i} className={cn("relative inline-flex rounded-full", i > 0 && step)}>
            {child}
          </span>
        ))}
      </AvatarGroupContext.Provider>
      {extra > 0 ? (
        onOverflowClick ? (
          <button
            type="button"
            data-slot="avatar-overflow"
            onClick={onOverflowClick}
            aria-label={t("more", { count: extra })}
            className={cn(chipClass, "cursor-pointer transition-colors hover:bg-hover hover:text-fg focus-ring")}
          >
            <span aria-hidden>{t("overflow", { count: extra })}</span>
          </button>
        ) : (
          <span data-slot="avatar-overflow" role="img" aria-label={t("more", { count: extra })} className={chipClass}>
            <span aria-hidden>{t("overflow", { count: extra })}</span>
          </span>
        )
      ) : null}
    </div>
  );
});
