"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { Layer, useLayerDepth } from "../lib/layer";
import { usePortalContainer } from "../lib/theme-scope";
import { Button, type ButtonProps } from "./button";
import { Field, Input } from "./input";
import { Alert } from "./alert";
import { LayerBody, LayerFooter, LayerHeader, LayerPartsProvider, type LayerHeaderProps } from "./dialog";

type Tone = "default" | "danger";

interface AlertDialogContextValue {
  tone: Tone;
  actionRef: React.RefObject<HTMLButtonElement | null>;
}
const AlertDialogContentContext = React.createContext<AlertDialogContextValue>({ tone: "default", actionRef: { current: null } });

/**
 * Confirms an irreversible or high-stakes action. `role="alertdialog"`; the overlay never closes it.
 *
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger asChild><Button variant="danger-ghost">Delete post</Button></AlertDialogTrigger>
 *   <AlertDialogContent tone="danger">
 *     <AlertDialogHeader title="Delete this post permanently?" description="It can't be restored from the trash." />
 *     <AlertDialogFooter>
 *       <AlertDialogCancel />
 *       <AlertDialogAction onClick={remove}>Delete post</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 * ```
 *
 * For a one-line `await confirm({...})` use `useConfirm()` under a `ConfirmProvider`.
 */
export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  /** `"danger"` → warning icon, danger action, initial focus on Cancel. `"default"` focuses the action. */
  tone?: Tone;
  /** Lock Esc (e.g. while the action runs). */
  dismissible?: boolean;
  /** Portal target. Defaults to the nearest `PortalContainer` / `ThemeScope`. */
  container?: HTMLElement | null;
}

/** Fixed 420px panel. Below 640px it anchors to the bottom and stacks the buttons, action on top. */
export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(function AlertDialogContent(
  { tone = "default", dismissible = true, container, className, children, onEscapeKeyDown, onOpenAutoFocus, onCloseAutoFocus, ...props },
  ref,
) {
  const scope = usePortalContainer();
  const depth = useLayerDepth() + 1;
  const actionRef = React.useRef<HTMLButtonElement | null>(null);
  const returnTo = React.useRef<HTMLElement | null>(null);
  const [descriptions, setDescriptions] = React.useState(0);
  const parts = React.useMemo(
    () => ({
      Title: AlertDialogPrimitive.Title as never,
      Description: AlertDialogPrimitive.Description as never,
      registerDescription: () => {
        setDescriptions((n) => n + 1);
        return () => setDescriptions((n) => n - 1);
      },
    }),
    [],
  );
  const ctx = React.useMemo(() => ({ tone, actionRef }), [tone]);
  const described = descriptions > 0 || "aria-describedby" in props;

  return (
    <AlertDialogPrimitive.Portal container={container ?? scope}>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" data-overlay-blurred={depth === 1 ? "" : undefined} className="vui-overlay ui-fade" />
      <Layer asChild>
        <AlertDialogPrimitive.Content
          ref={ref}
          data-slot="alert-dialog-content"
          data-mobile="sheet"
          data-tone={tone}
          {...(described ? {} : { "aria-describedby": undefined })}
          className={cn("vui-layer-panel vui-dialog ui-dialog surface-popover [--dialog-w:26.25rem]", className)}
          onEscapeKeyDown={(e) => {
            onEscapeKeyDown?.(e);
            if (!dismissible) e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            // Fires before focus moves in: remember the opener. Radix returns focus only to an
            // AlertDialog.Trigger, so a controlled confirm (useConfirm, ConfirmDialog) lost focus.
            returnTo.current = document.activeElement as HTMLElement | null;
            onOpenAutoFocus?.(e);
            if (e.defaultPrevented) return;
            // Radix focuses Cancel. For a non-destructive confirm the action is the safe default.
            if (tone === "default" && actionRef.current) {
              e.preventDefault();
              actionRef.current.focus();
            }
          }}
          onCloseAutoFocus={(e) => {
            onCloseAutoFocus?.(e);
            if (e.defaultPrevented) return;
            const el = returnTo.current;
            if (el && el.isConnected && el !== document.body) {
              e.preventDefault();
              el.focus();
            }
          }}
          {...props}
        >
          <AlertDialogContentContext.Provider value={ctx}>
            <LayerPartsProvider value={parts}>{children}</LayerPartsProvider>
          </AlertDialogContentContext.Provider>
        </AlertDialogPrimitive.Content>
      </Layer>
    </AlertDialogPrimitive.Portal>
  );
});

/** Icon well in the danger tone. */
export function AlertDialogIcon({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 items-center justify-center rounded-ui tone-danger bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger [&_svg]:size-5",
        className,
      )}
    >
      {children ?? <TriangleAlert />}
    </span>
  );
}

export interface AlertDialogHeaderProps extends LayerHeaderProps {}

/** `LayerHeader` that adds the warning icon well when the content is `tone="danger"` (pass `icon={null}` to drop it). */
export const AlertDialogHeader = React.forwardRef<HTMLDivElement, AlertDialogHeaderProps>(function AlertDialogHeader({ icon, className, ...props }, ref) {
  const { tone } = React.useContext(AlertDialogContentContext);
  const resolvedIcon = icon === undefined ? (tone === "danger" ? <AlertDialogIcon /> : undefined) : icon;
  return <LayerHeader ref={ref} icon={resolvedIcon} className={cn("pt-6", className)} {...props} />;
});

export const AlertDialogBody = LayerBody;

/** Footer without the hairline; buttons at the end, stacked on mobile. */
export const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof LayerFooter>>(function AlertDialogFooter(
  { className, ...props },
  ref,
) {
  return <LayerFooter ref={ref} className={cn("border-t-0 pt-1 pb-5", className)} {...props} />;
});

const confirmLabels = { cancel: "Cancel", confirm: "Confirm", typeToConfirm: "Type {text} to confirm", error: "That didn't work. Try again." };

export interface AlertDialogCancelProps extends ButtonProps {
  labels?: Partial<typeof confirmLabels>;
}

/** Closes without acting. Receives initial focus in a danger dialog. Default label "Cancel". */
export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(function AlertDialogCancel(
  { children, labels, variant = "secondary", ...props },
  ref,
) {
  const t = useLabels("confirm", confirmLabels, labels);
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button ref={ref} variant={variant} {...props}>
        {children ?? t("cancel")}
      </Button>
    </AlertDialogPrimitive.Cancel>
  );
});

export interface AlertDialogActionProps extends ButtonProps {
  /** Keep the dialog open after click (you close it when async work finishes). */
  keepOpen?: boolean;
  labels?: Partial<typeof confirmLabels>;
}

/** Runs the action and closes. `variant` follows the content tone (`danger` or `primary`). */
export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(function AlertDialogAction(
  { children, labels, variant, keepOpen, onClick, ...props },
  ref,
) {
  const { tone, actionRef } = React.useContext(AlertDialogContentContext);
  const t = useLabels("confirm", confirmLabels, labels);
  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      actionRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, actionRef],
  );
  const button = (
    <Button ref={setRefs} variant={variant ?? (tone === "danger" ? "danger" : "primary")} onClick={onClick} data-slot="alert-dialog-action" {...props}>
      {children ?? t("confirm")}
    </Button>
  );
  return keepOpen ? button : <AlertDialogPrimitive.Action asChild>{button}</AlertDialogPrimitive.Action>;
});

/* ------------------------------------------------------------------ */
/* ConfirmDialog + useConfirm                                           */
/* ------------------------------------------------------------------ */

export interface ConfirmOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: Tone;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Text the user must type before confirming (e.g. the record name). Compared case-insensitively for the current locale. */
  requireText?: string;
  /** Async work: the button shows loading; if it throws, the dialog stays open and shows the error. */
  onConfirm?: () => Promise<void> | void;
}

export interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  /** Called once with the outcome; the dialog closes itself. */
  onResult: (confirmed: boolean) => void;
  labels?: Partial<typeof confirmLabels>;
}

const SPLIT = "\u2063";

/** A ready-made confirmation (controlled). `useConfirm()` renders one of these for you. */
export function ConfirmDialog({ open, onResult, title, description, tone = "default", confirmLabel, cancelLabel, requireText, onConfirm, labels }: ConfirmDialogProps) {
  const t = useLabels("confirm", confirmLabels, labels);
  const { locale } = useLocale();
  const [typed, setTyped] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<React.ReactNode>(null);
  const inputId = React.useId();

  React.useEffect(() => {
    if (open) {
      setTyped("");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  // Split the translated prompt around {text} so the required text can be styled as code.
  const promptParts = t("typeToConfirm", { text: SPLIT }).split(SPLIT);
  const matches = !requireText || typed.trim().toLocaleLowerCase(locale) === requireText.trim().toLocaleLowerCase(locale);

  const run = async () => {
    if (!matches || busy) return;
    if (!onConfirm) return onResult(true);
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setBusy(false);
      onResult(true);
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error && e.message ? e.message : t("error"));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !busy && onResult(false)}>
      <AlertDialogContent tone={tone} dismissible={!busy}>
        <AlertDialogHeader title={title} description={description} />
        {requireText || error ? (
          <AlertDialogBody className="grid gap-3 pb-3">
            {error ? (
              <Alert tone="danger" size="sm" live="assertive">
                {error}
              </Alert>
            ) : null}
            {requireText ? (
              <Field
                id={inputId}
                label={
                  <>
                    {promptParts[0]}
                    <code className="rounded-ui-sm bg-selected px-1.5 py-0.5 font-mono text-[12.5px] text-fg">{requireText}</code>
                    {promptParts[1]}
                  </>
                }
              >
                <Input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={busy}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void run();
                    }
                  }}
                />
              </Field>
            ) : null}
          </AlertDialogBody>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel ?? t("cancel")}</AlertDialogCancel>
          <AlertDialogAction keepOpen disabled={!matches} loading={busy} onClick={() => void run()}>
            {confirmLabel ?? t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = React.createContext<ConfirmFn | null>(null);

/**
 * Provides `useConfirm()` to its subtree and renders the one shared confirmation dialog.
 * App shell includes it; mount it yourself at the app root otherwise.
 */
export function ConfirmProvider({ children, labels }: { children: React.ReactNode; labels?: Partial<typeof confirmLabels> }) {
  const [state, setState] = React.useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const [open, setOpen] = React.useState(false);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const confirm = React.useCallback<ConfirmFn>((options) => {
    // A second confirm while one is open resolves the first as cancelled.
    stateRef.current?.resolve(false);
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
      setOpen(true);
    });
  }, []);

  const onResult = React.useCallback((ok: boolean) => {
    stateRef.current?.resolve(ok);
    stateRef.current = null;
    setOpen(false);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state ? <ConfirmDialog {...state.options} open={open} onResult={onResult} labels={labels} /> : null}
    </ConfirmContext.Provider>
  );
}

/**
 * Imperative confirmation: `if (await confirm({ title: "Delete 3 posts?", tone: "danger" })) …`.
 * Resolves `true` on confirm, `false` on cancel / Esc. Needs a `ConfirmProvider` above.
 */
export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm() needs a <ConfirmProvider> above it (AppShell includes one).");
  return ctx;
}
