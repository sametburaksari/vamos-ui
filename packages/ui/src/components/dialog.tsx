"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { Layer, useLayerDepth } from "../lib/layer";
import { usePortalContainer } from "../lib/theme-scope";
import { IconButton } from "./button";

/* ------------------------------------------------------------------ */
/* Shared layer layout: LayerHeader / LayerBody / LayerFooter           */
/* ------------------------------------------------------------------ */

type SlotComponent = React.ComponentType<React.HTMLAttributes<HTMLElement> & { asChild?: boolean; children?: React.ReactNode }>;

interface LayerParts {
  /** Element that names the layer (Radix Title → `aria-labelledby`). */
  Title: SlotComponent;
  /** Element that describes the layer (Radix Description → `aria-describedby`). */
  Description: SlotComponent;
  /** Called while a description is mounted, so the content can drop a dangling `aria-describedby`. */
  registerDescription?: () => () => void;
}

const PlainTitle: SlotComponent = ({ asChild: _a, ...props }) => <h2 {...props} />;
const PlainDescription: SlotComponent = ({ asChild: _a, ...props }) => <p {...props} />;

const LayerPartsContext = React.createContext<LayerParts>({ Title: PlainTitle, Description: PlainDescription });

/** Lets a layer (Dialog, Alert Dialog, Sheet…) plug its accessible Title/Description into the shared header. */
export function LayerPartsProvider({ value, children }: { value: LayerParts; children: React.ReactNode }) {
  return <LayerPartsContext.Provider value={value}>{children}</LayerPartsContext.Provider>;
}

function LayerDescriptionMount() {
  const { registerDescription } = React.useContext(LayerPartsContext);
  React.useLayoutEffect(() => registerDescription?.(), [registerDescription]);
  return null;
}

export interface LayerHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Required: names the layer for assistive tech. Use `srOnly` to hide it visually. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Leading icon or icon well. */
  icon?: React.ReactNode;
  /** Trailing control next to the title (a status badge, a menu). */
  action?: React.ReactNode;
  /** Keeps title and description for screen readers only. */
  srOnly?: boolean;
}

/**
 * The fixed top of a layer: title, optional description, icon and action. Shared by Dialog,
 * Alert Dialog, Sheet and Drawer (exported under each name: `DialogHeader`, `SheetHeader`…).
 */
export const LayerHeader = React.forwardRef<HTMLDivElement, LayerHeaderProps>(function LayerHeader(
  { title, description, icon, action, srOnly, className, children, ...props },
  ref,
) {
  const { Title, Description } = React.useContext(LayerPartsContext);
  const text = (
    <>
      <Title data-slot="layer-title" className={cn("font-display text-[1.3rem] leading-[1.2] text-balance text-fg", srOnly && "sr-only")}>
        {title}
      </Title>
      {description ? (
        <Description data-slot="layer-description" className={cn("mt-1 text-[13.5px] leading-relaxed text-pretty text-fg-muted", srOnly && "sr-only")}>
          {description}
        </Description>
      ) : null}
      {description ? <LayerDescriptionMount /> : null}
    </>
  );
  if (srOnly) return <>{text}{children}</>;
  return (
    <div
      ref={ref}
      data-slot="layer-header"
      className={cn("vui-layer-header flex flex-none items-start gap-3.5 px-6 pt-5 pb-4 [[data-has-close]_&]:pe-14", className)}
      {...props}
    >
      {icon ? <div className="flex flex-none items-center">{icon}</div> : null}
      <div className="min-w-0 flex-1">{text}{children}</div>
      {action ? <div className="flex flex-none items-center gap-1.5 self-center">{action}</div> : null}
    </div>
  );
});

export interface LayerBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove the default padding (full-bleed lists, media). */
  flush?: boolean;
}

/** The scrolling middle of a layer. Header and footer stay fixed; only the body scrolls. */
export const LayerBody = React.forwardRef<HTMLDivElement, LayerBodyProps>(function LayerBody({ flush, className, onScroll, ...props }, ref) {
  const [scrolled, setScrolled] = React.useState(false);
  return (
    <div
      ref={ref}
      data-slot="layer-body"
      data-scrolled={scrolled ? "" : undefined}
      onScroll={(e) => {
        onScroll?.(e);
        setScrolled(e.currentTarget.scrollTop > 0);
      }}
      className={cn("vui-layer-body content-start text-sm text-fg", !flush && "px-6 pt-5 pb-5 [[data-slot=layer-header]+&]:pt-0", className)}
      {...props}
    />
  );
});

export interface LayerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `"end"` (default) groups the buttons at the end; `"between"` pushes the first child to the start. */
  align?: "end" | "between" | "stretch";
}

/** The fixed bottom of a layer: actions, primary last. Stacks (primary on top) inside a mobile sheet. */
export const LayerFooter = React.forwardRef<HTMLDivElement, LayerFooterProps>(function LayerFooter({ align = "end", className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="layer-footer"
      className={cn(
        "vui-layer-footer flex flex-none flex-wrap items-center gap-2 border-t border-line px-6 py-3.5",
        align === "end" && "justify-end",
        align === "between" && "justify-end [&>:first-child]:me-auto",
        align === "stretch" && "[&>*]:flex-1",
        className,
      )}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Dialog root (close guard)                                            */
/* ------------------------------------------------------------------ */

type Guard = () => boolean | Promise<boolean>;

interface DialogRootContextValue {
  open: boolean;
  /** Request a state change; closing runs the content's `onBeforeClose` guard first. */
  requestOpenChange: (open: boolean) => void;
  setGuard: (guard: Guard | undefined) => void;
  modal: boolean;
}

const DialogRootContext = React.createContext<DialogRootContextValue | null>(null);

/** Read the nearest Dialog/Sheet/Drawer root — e.g. to close it from custom code (`requestOpenChange(false)`). */
export function useDialogRoot(): DialogRootContextValue {
  const ctx = React.useContext(DialogRootContext);
  if (!ctx) throw new Error("useDialogRoot must be used inside <Dialog>, <Sheet> or <Drawer>.");
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `false` keeps the page behind interactive (no overlay, no focus trap). Default `true`. */
  modal?: boolean;
  children?: React.ReactNode;
}

/**
 * A focused task that keeps the user in context (modal by default).
 *
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild><Button>New contact</Button></DialogTrigger>
 *   <DialogContent size="md">
 *     <DialogHeader title="New contact" description="Add a contact manually." />
 *     <DialogBody>…</DialogBody>
 *     <DialogFooter>
 *       <DialogClose asChild><Button>Cancel</Button></DialogClose>
 *       <Button variant="primary">Save</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export function Dialog({ open: openProp, defaultOpen = false, onOpenChange, modal = true, children }: DialogProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange, name: "Dialog" });
  const guardRef = React.useRef<Guard | undefined>(undefined);
  const pending = React.useRef(false);

  const requestOpenChange = React.useCallback(
    (next: boolean) => {
      if (next || !guardRef.current) return setOpen(next);
      if (pending.current) return;
      const result = guardRef.current();
      if (result === true) return setOpen(false);
      if (result === false) return;
      pending.current = true;
      Promise.resolve(result)
        .then((ok) => ok && setOpen(false))
        .catch(() => {})
        .finally(() => (pending.current = false));
    },
    [setOpen],
  );
  const setGuard = React.useCallback((g: Guard | undefined) => (guardRef.current = g), []);
  const ctx = React.useMemo(() => ({ open, requestOpenChange, setGuard, modal }), [open, requestOpenChange, setGuard, modal]);

  return (
    <DialogRootContext.Provider value={ctx}>
      <DialogPrimitive.Root open={open} onOpenChange={requestOpenChange} modal={modal}>
        {children}
      </DialogPrimitive.Root>
    </DialogRootContext.Provider>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

/** The dimmed backdrop. `DialogContent` renders its own; export for custom layers. */
export const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & { blurred?: boolean }>(
  function DialogOverlay({ className, blurred = true, ...props }, ref) {
    return (
      <DialogPrimitive.Overlay
        ref={ref}
        data-slot="dialog-overlay"
        data-overlay-blurred={blurred ? "" : undefined}
        className={cn("vui-overlay ui-fade", className)}
        {...props}
      />
    );
  },
);

const dialogLabels = { close: "Close" };

/** Shared plumbing for every Radix Dialog-based panel (Dialog, Sheet, Drawer). */
export interface LayerContentBaseProps {
  /** `false` → overlay click and Esc do not close (an unsaved form, a running import). Close buttons still work. */
  dismissible?: boolean;
  /** Runs on every close attempt (Esc, overlay, close button, `DialogClose`). Return/resolve `false` to stay open. */
  onBeforeClose?: () => boolean | Promise<boolean>;
  /** Hide the built-in × button. */
  hideClose?: boolean;
  /** Portal target. Defaults to the nearest `PortalContainer` / `ThemeScope`, else `document.body`. */
  container?: HTMLElement | null;
  /** Override the built-in strings (`close`). */
  labels?: Partial<typeof dialogLabels>;
}

export interface LayerContentShellProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, LayerContentBaseProps {
  /** Class of the overlay element. */
  overlayClassName?: string;
}

/**
 * Internal: portal + overlay + layer depth + close guard + × button around a Radix Dialog.Content.
 * Exported so other layers (Sheet, Drawer, Notification panel) share one implementation.
 */
export const LayerContentShell = React.forwardRef<HTMLDivElement, LayerContentShellProps>(function LayerContentShell(
  {
    dismissible = true,
    onBeforeClose,
    hideClose,
    container,
    labels,
    overlayClassName,
    className,
    children,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onOpenAutoFocus,
    ...props
  },
  ref,
) {
  const root = React.useContext(DialogRootContext);
  const t = useLabels("dialog", dialogLabels, labels);
  const scope = usePortalContainer();
  const depth = useLayerDepth() + 1;
  const modal = root?.modal ?? true;
  const guard = useLatest(onBeforeClose);

  // Register the guard with the root while mounted.
  React.useEffect(() => {
    if (!root) return;
    root.setGuard(onBeforeClose ? () => guard.current!() : undefined);
    return () => root.setGuard(undefined);
  }, [root, Boolean(onBeforeClose)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drop aria-describedby when no description is mounted (no dangling reference, no Radix warning).
  const [descriptions, setDescriptions] = React.useState(0);
  const parts = React.useMemo<LayerParts>(
    () => ({
      Title: DialogPrimitive.Title as unknown as SlotComponent,
      Description: DialogPrimitive.Description as unknown as SlotComponent,
      registerDescription: () => {
        setDescriptions((n) => n + 1);
        return () => setDescriptions((n) => n - 1);
      },
    }),
    [],
  );

  const described = descriptions > 0 || "aria-describedby" in props;

  return (
    <DialogPrimitive.Portal container={container ?? scope}>
      {modal ? <DialogOverlay blurred={depth === 1} className={overlayClassName} /> : null}
      <Layer asChild>
        <DialogPrimitive.Content
          ref={ref}
          data-has-close={hideClose ? undefined : ""}
          aria-modal={modal}
          {...(described ? {} : { "aria-describedby": undefined })}
          className={cn("vui-layer-panel surface-popover", className)}
          onEscapeKeyDown={(e) => {
            onEscapeKeyDown?.(e);
            if (!dismissible) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            onPointerDownOutside?.(e);
            if (!dismissible) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            onInteractOutside?.(e);
            // A non-modal panel (record preview) stays open while the page behind is used.
            if (!modal) e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            onOpenAutoFocus?.(e);
            if (e.defaultPrevented) return;
            const target = (e.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>("[data-autofocus]");
            if (target) {
              e.preventDefault();
              target.focus();
            }
          }}
          {...props}
        >
          <LayerPartsProvider value={parts}>{children}</LayerPartsProvider>
          {hideClose ? null : (
            <DialogPrimitive.Close asChild>
              <IconButton label={t("close")} size="sm" variant="ghost" data-slot="layer-close" className="absolute end-3 top-3 text-fg-muted hover:text-fg">
                <X />
              </IconButton>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </Layer>
    </DialogPrimitive.Portal>
  );
});

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

export interface DialogContentProps extends LayerContentShellProps {
  /** 400 / 520 / 680 / 880 px, or the viewport minus a 12px gutter. Default `"md"`. */
  size?: DialogSize;
  /**
   * Behaviour below 640px (CSS only, no component swap): `"sheet"` (default) anchors to the bottom
   * and stacks the footer; `"center"` stays a centred card; `"fullscreen"` fills the screen (long forms).
   */
  mobile?: "sheet" | "center" | "fullscreen";
}

/**
 * The dialog panel. Renders its own portal and overlay, traps focus, closes on Esc, returns
 * focus to the trigger. Initial focus goes to `[data-autofocus]` if present, else the first field.
 */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { size = "md", mobile = "sheet", className, ...props },
  ref,
) {
  return (
    <LayerContentShell
      ref={ref}
      data-slot="dialog-content"
      data-size={size}
      data-mobile={mobile}
      className={cn("vui-dialog ui-dialog", className)}
      {...props}
    />
  );
});

/** `LayerHeader` for dialogs. */
export const DialogHeader = LayerHeader;
/** `LayerBody` for dialogs. */
export const DialogBody = LayerBody;
/** `LayerFooter` for dialogs. */
export const DialogFooter = LayerFooter;
