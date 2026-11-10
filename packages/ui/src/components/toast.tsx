"use client";

import * as React from "react";
import { Toaster as Sonner, toast as sonner, type ExternalToast } from "sonner";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useMediaQuery } from "../lib/use-media-query";
import { buttonVariants } from "./button";
import { Spinner } from "./spinner";

export type ToastTone = "neutral" | "success" | "warning" | "danger" | "info" | "loading";

export interface ToastOptions {
  description?: React.ReactNode;
  /** One follow-up action ("Undo", "View"). A toast with an action stays at least 6 s. */
  action?: { label: React.ReactNode; onClick: () => void };
  /** A secondary, dismissing button. */
  cancel?: { label: React.ReactNode; onClick?: () => void };
  /** ms. Default: neutral/success/info 4 s, warning 6 s, danger 8 s, loading until updated. `Infinity` keeps it. */
  duration?: number;
  /** Same id → the toast updates in place (loading → success). */
  id?: string;
  /** Announce assertively (`role="alert"`). Danger toasts always are. */
  important?: boolean;
  /** Show a × button on this toast. */
  closeButton?: boolean;
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

const DURATION: Record<ToastTone, number> = { neutral: 4000, success: 4000, info: 4000, warning: 6000, danger: 8000, loading: Infinity };

const ENGINE: Record<ToastTone, (title: React.ReactNode, data?: ExternalToast) => string | number> = {
  neutral: sonner,
  success: sonner.success,
  info: sonner.info,
  warning: sonner.warning,
  danger: sonner.error,
  loading: sonner.loading,
};

let seq = 0;

function show(tone: ToastTone, title: React.ReactNode, o: ToastOptions = {}): string {
  const assertive = tone === "danger" || o.important;
  const duration = o.duration ?? (o.action && tone !== "loading" ? Math.max(6000, DURATION[tone]) : DURATION[tone]);
  // Own string ids, so the id we return is exactly the one that updates the toast later.
  const id = o.id ?? `toast-${++seq}`;
  ENGINE[tone](assertive ? <span role="alert">{title}</span> : title, {
    id,
    description: o.description,
    duration,
    closeButton: o.closeButton,
    action: o.action ? { label: o.action.label, onClick: () => o.action!.onClick() } : undefined,
    cancel: o.cancel ? { label: o.cancel.label, onClick: () => o.cancel!.onClick?.() } : undefined,
    onDismiss: o.onDismiss ? () => o.onDismiss!() : undefined,
    onAutoClose: o.onAutoClose ? () => o.onAutoClose!() : undefined,
  });
  return id;
}

type ToastFn = (title: React.ReactNode, options?: ToastOptions) => string;

export interface ToastPromiseMessages<T> {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((error: unknown) => React.ReactNode);
  description?: React.ReactNode;
  id?: string;
}

export interface ToastApi extends ToastFn {
  success: ToastFn;
  warning: ToastFn;
  danger: ToastFn;
  info: ToastFn;
  loading: ToastFn;
  /** loading → success / danger in one toast. Returns the original promise. */
  promise<T>(promise: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>): Promise<T>;
  /** Dismiss one toast, or all of them. */
  dismiss(id?: string): void;
}

/**
 * Report the result of an action without interrupting. Import it from the kit only — never
 * from the engine underneath — so it can be swapped later.
 *
 * ```ts
 * toast.success("Post published", { action: { label: "View", onClick: open } });
 * toast("Contact moved to trash", { action: { label: "Undo", onClick: restore } });
 * const id = toast.loading("Preparing export…");
 * toast.success("Export ready", { id });
 * ```
 *
 * Needs one `<Toaster />` in the tree (App shell includes it).
 */
export const toast: ToastApi = Object.assign((title: React.ReactNode, o?: ToastOptions) => show("neutral", title, o), {
  success: (title: React.ReactNode, o?: ToastOptions) => show("success", title, o),
  warning: (title: React.ReactNode, o?: ToastOptions) => show("warning", title, o),
  danger: (title: React.ReactNode, o?: ToastOptions) => show("danger", title, o),
  info: (title: React.ReactNode, o?: ToastOptions) => show("info", title, o),
  loading: (title: React.ReactNode, o?: ToastOptions) => show("loading", title, o),
  promise<T>(promise: Promise<T> | (() => Promise<T>), m: ToastPromiseMessages<T>): Promise<T> {
    const p = typeof promise === "function" ? promise() : promise;
    const id = show("loading", m.loading, { id: m.id, description: m.description });
    p.then(
      (data) => show("success", typeof m.success === "function" ? (m.success as (d: T) => React.ReactNode)(data) : m.success, { id }),
      (err) => show("danger", typeof m.error === "function" ? (m.error as (e: unknown) => React.ReactNode)(err) : m.error, { id }),
    );
    return p;
  },
  dismiss(id?: string) {
    sonner.dismiss(id);
  },
});

/* ------------------------------------------------------------------ */
/* Toaster                                                              */
/* ------------------------------------------------------------------ */

export type ToasterPosition = "bottom-end" | "bottom-start" | "bottom-center" | "top-end" | "top-start" | "top-center";

const toasterLabels = { region: "Notifications", close: "Close" };

export interface ToasterProps {
  /** Logical position — `end` is the right edge in LTR and the left in RTL. Default `"bottom-end"`. */
  position?: ToasterPosition;
  /** Position below 640px, so toasts don't collide with the keyboard or bottom bars. Default `"top-center"`. */
  mobilePosition?: ToasterPosition;
  /** Visible toasts before they stack. Default 3. */
  max?: number;
  /** Always show the stack expanded. */
  expand?: boolean;
  /** × button on every toast. */
  closeButton?: boolean;
  /** Keyboard shortcut that focuses the region. Default Alt+T. */
  hotkey?: string[];
  /** Distance from the viewport edge. Default 24px (16px on mobile). */
  offset?: number | string;
  className?: string;
  labels?: Partial<typeof toasterLabels>;
}

// Only the first mounted <Toaster/> renders, so a second one (a page plus the app shell) never doubles toasts.
const mounted: symbol[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function useIsPrimary(): boolean {
  const [id] = React.useState(() => Symbol("toaster"));
  React.useEffect(() => {
    mounted.push(id);
    emit();
    return () => {
      mounted.splice(mounted.indexOf(id), 1);
      emit();
    };
  }, [id]);
  return React.useSyncExternalStore(subscribe, () => mounted[0] === id, () => false);
}

function physical(pos: ToasterPosition, dir: "ltr" | "rtl") {
  const [y, x] = pos.split("-") as ["top" | "bottom", "start" | "end" | "center"];
  const side = x === "center" ? "center" : (x === "end") === (dir === "ltr") ? "right" : "left";
  return `${y}-${side}` as const;
}

const toneClass = {
  default: "tone-neutral",
  success: "tone-success",
  info: "tone-info",
  warning: "tone-warning",
  error: "tone-danger",
  loading: "tone-accent",
};

/**
 * Where toasts appear. Mount once near the app root (App shell already does). Styled with
 * tokens: popover surface, a thin edge in the status colour, the front toast alone blurs.
 */
export function Toaster({ position = "bottom-end", mobilePosition = "top-center", max = 3, expand, closeButton, hotkey, offset, className, labels }: ToasterProps) {
  const primary = useIsPrimary();
  const { dir } = useLocale();
  const t = useLabels("toast", toasterLabels, labels);
  const mobile = useMediaQuery("(max-width: 639px)");
  if (!primary) return null;

  return (
    <Sonner
      position={physical(mobile ? mobilePosition : position, dir)}
      dir={dir}
      visibleToasts={max}
      expand={expand}
      closeButton={closeButton}
      hotkey={hotkey}
      offset={offset}
      gap={10}
      containerAriaLabel={t("region")}
      className={cn("vui-toaster", className)}
      icons={{
        success: <CircleCheck aria-hidden />,
        info: <Info aria-hidden />,
        warning: <TriangleAlert aria-hidden />,
        error: <CircleAlert aria-hidden />,
        loading: <Spinner size="sm" />,
        close: <X aria-hidden className="size-3.5" />,
      }}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: t("close"),
        classNames: {
          toast: cn(
            "vui-toast surface-popover relative flex w-full items-start gap-3 overflow-hidden rounded-ui py-3 ps-4 pe-3 text-sm text-fg [&:has([data-close-button])]:pe-9",
            // thin status edge (never the accent colour)
            "before:absolute before:inset-y-2.5 before:start-0 before:w-[3px] before:rounded-e-full before:bg-(--tone)",
          ),
          default: toneClass.default,
          success: toneClass.success,
          info: toneClass.info,
          warning: toneClass.warning,
          error: toneClass.error,
          loading: cn(toneClass.loading, "before:bg-transparent"),
          icon: "relative mt-px flex size-[1.15rem] flex-none items-center justify-center text-(--tone)",
          content: "flex min-w-0 flex-1 flex-col gap-0.5 py-px",
          title: "leading-[1.35] font-medium text-pretty",
          description: "text-[13px] leading-[1.4] text-pretty text-fg-muted",
          actionButton: cn(buttonVariants({ variant: "secondary", size: "xs" }), "self-center"),
          cancelButton: cn(buttonVariants({ variant: "ghost", size: "xs" }), "self-center text-fg-muted"),
          closeButton: cn(
            buttonVariants({ variant: "ghost", size: "icon-xs" }),
            "absolute end-1.5 top-1.5 size-6! text-fg-subtle hover:text-fg",
          ),
        },
      }}
    />
  );
}
