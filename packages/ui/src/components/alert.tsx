import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, Lightbulb, TriangleAlert, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { IconButton } from "./button";

export type AlertTone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

export const alertVariants = cva(
  [
    "vui-alert relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-start text-fg",
    // Tinted surface + hairline in the tone colour; body text stays --fg for contrast.
    "[--alert-tone:var(--tone)]",
  ],
  {
    variants: {
      tone: {
        neutral: "tone-neutral",
        info: "tone-info",
        success: "tone-success",
        warning: "tone-warning",
        danger: "tone-danger",
        accent: "tone-accent",
      },
      variant: {
        soft: "rounded-ui border border-[color-mix(in_srgb,var(--alert-tone)_22%,transparent)] bg-[color-mix(in_srgb,var(--alert-tone)_9%,transparent)]",
        outline: "rounded-ui border border-[color-mix(in_srgb,var(--alert-tone)_38%,transparent)] bg-transparent",
        /** Full width, no radius — under the top bar or above a page. */
        banner: "w-full rounded-none border-b border-[color-mix(in_srgb,var(--alert-tone)_24%,transparent)] bg-[color-mix(in_srgb,var(--alert-tone)_11%,transparent)]",
      },
      size: {
        sm: "gap-x-2.5 px-3 py-2.5 text-[13px] [&_[data-slot=alert-icon]_svg]:size-4",
        md: "gap-x-3 px-4 py-3.5 text-sm [&_[data-slot=alert-icon]_svg]:size-[18px]",
      },
    },
    compoundVariants: [
      { variant: "banner", size: "md", class: "px-5 py-2.5" },
      { variant: "banner", size: "sm", class: "px-4 py-2" },
    ],
    defaultVariants: { tone: "neutral", variant: "soft", size: "md" },
  },
);

const defaultIcons: Record<AlertTone, React.ComponentType<{ "aria-hidden"?: boolean }>> = {
  neutral: Info,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  accent: Lightbulb,
};

const alertLabels = { dismiss: "Dismiss" };

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  /** Custom icon, or `false` for none. Each tone has a default. */
  icon?: React.ReactNode | false;
  /** Buttons or links ("Restore revision", "Renew plan"). Below the text; inline at the end for banners. */
  actions?: React.ReactNode;
  /** Renders a close button. */
  onDismiss?: () => void;
  /** Accessible name of the close button. Default "Dismiss" (dictionary `alert.dismiss`). */
  dismissLabel?: string;
  /**
   * For alerts inserted at runtime: `"assertive"` → `role="alert"` (errors), `"polite"` →
   * `role="status"`. Leave unset for static messages (no role).
   */
  live?: "polite" | "assertive";
}

/**
 * A persistent inline status message in a page, card or form. Server-compatible.
 *
 * ```tsx
 * <Alert tone="warning" title="Payroll filing due in 3 days" actions={<Button size="sm">Review</Button>}>
 *   Submit the November declaration before Dec 26 to avoid a late fee.
 * </Alert>
 * ```
 *
 * Critical information must not live only in a toast — show it here too.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone, variant, size, title, icon, actions, onDismiss, dismissLabel, live, className, children, ...props },
  ref,
) {
  const t = tone ?? "neutral";
  const DefaultIcon = defaultIcons[t];
  const iconNode = icon === false ? null : (icon ?? <DefaultIcon aria-hidden />);
  const banner = variant === "banner";
  return (
    <div
      ref={ref}
      data-slot="alert"
      data-tone={t}
      data-variant={variant ?? "soft"}
      role={live === "assertive" ? "alert" : live === "polite" ? "status" : undefined}
      className={cn(alertVariants({ tone, variant, size }), !iconNode && "grid-cols-[minmax(0,1fr)_auto]", className)}
      {...props}
    >
      {iconNode ? (
        <span data-slot="alert-icon" className="flex h-[1.4em] items-center text-(--alert-tone) [&_svg]:shrink-0">
          {iconNode}
        </span>
      ) : null}
      <div className={cn("min-w-0", banner && actions && "flex flex-wrap items-center gap-x-4 gap-y-2")}>
        <div className={cn("min-w-0", banner && "flex-1")}>
          {title ? <AlertTitle>{title}</AlertTitle> : null}
          {children ? <AlertDescription className={title ? "mt-0.5" : undefined}>{children}</AlertDescription> : null}
        </div>
        {actions ? <AlertActions className={banner ? "mt-0" : undefined}>{actions}</AlertActions> : null}
      </div>
      {onDismiss ? <AlertDismiss onDismiss={onDismiss} label={dismissLabel} /> : <span aria-hidden />}
    </div>
  );
});

// Only rendered when `onDismiss` exists, i.e. inside a client tree.
function AlertDismiss({ onDismiss, label }: { onDismiss: () => void; label?: string }) {
  const t = useLabels("alert", alertLabels);
  return (
    <IconButton label={label ?? t("dismiss")} size="xs" variant="ghost" onClick={onDismiss} className="-me-1.5 -mt-0.5 text-fg-muted hover:text-fg">
      <X />
    </IconButton>
  );
}

/** Title line, in the tone colour (mixed toward --fg so it keeps 4.5:1 on tinted / glass scenes). */
export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="alert-title" className={cn("leading-[1.4] font-semibold text-[color-mix(in_srgb,var(--alert-tone)_62%,var(--fg))] [[data-tone=neutral]_&]:text-fg", className)} {...props} />;
}

/** Body text — stays in `--fg` for contrast. */
export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-description" className={cn("leading-[1.4] text-pretty text-fg [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2", className)} {...props} />;
}

/** Action row under the text. */
export function AlertActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-actions" className={cn("mt-3 flex flex-wrap items-center gap-2", className)} {...props} />;
}
