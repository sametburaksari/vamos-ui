"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useContainerWidth } from "../lib/use-container-width";
import { BEZEL } from "./_device-bezels";
import { deviceFrameSize, deviceViewports, type DeviceKind } from "./device-frame-size";

// Server-safe: the sizes live in their own module so server components can call deviceFrameSize().
export { deviceFrameSize, deviceViewports, type DeviceKind } from "./device-frame-size";

export interface DeviceFrameProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Default `"phone"`. */
  device?: DeviceKind;
  /**
   * Simulated screen width in CSS px. The content is laid out at this width (so its own
   * breakpoints and `@container` queries behave as on the device) and the frame is scaled to fit.
   */
  viewportWidth?: number;
  /** Simulated screen height in CSS px. */
  viewportHeight?: number;
  /** Largest scale (`1` = never enlarge). Default `1`. */
  maxScale?: number;
  /** Address shown in the desktop browser bar. */
  url?: string;
  /** Text at the start of the phone status bar (a time such as "09:41"). Omit to hide the bar. */
  statusBar?: React.ReactNode;
  /**
   * `false` (default): the screen is a picture: content is inert and hidden from assistive
   * technology, and `label` (if any) names it as an image. `true`: the content is live and the
   * screen scrolls inside (a real preview of a page).
   */
  interactive?: boolean;
  /** Accessible description of what the screen shows. Without it a non-interactive frame is decorative. */
  label?: string;
  /** Classes for the screen (the element at viewport size). */
  screenClassName?: string;
  children?: React.ReactNode;
}

/**
 * A phone, tablet or desktop browser drawn from tokens (no device artwork), with a screen that
 * renders its content at the device's real width and scales the whole frame down to fit the
 * container. Use it for app screenshots made of live components, template previews and
 * feature mockups; pair it with `DeviceScreens` to swap screens with tabs or scroll.
 *
 * ```tsx
 * <DeviceFrame device="phone" statusBar="09:41" label="Today screen: three tasks due">
 *   <TodayScreen />
 * </DeviceFrame>
 * <DeviceFrame device="desktop" url="example.com/pricing" interactive><PricingPage /></DeviceFrame>
 * ```
 */
export const DeviceFrame = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DeviceFrameProps>(function DeviceFrame(
  { device = "phone", viewportWidth, viewportHeight, maxScale = 1, url, statusBar, interactive = false, label, screenClassName, className, style, children, ...props },
  ref,
) {
  const viewport = { width: viewportWidth ?? deviceViewports[device].width, height: viewportHeight ?? deviceViewports[device].height };
  const size = deviceFrameSize(device, viewport);
  const bezel = BEZEL[device];
  const { ref: measure, width } = useContainerWidth<HTMLDivElement>();
  // Until measured (server render, no ResizeObserver) the frame shows at scale 1, clipped by the box.
  const scale = width ? Math.min(maxScale, width / size.width) : 1;
  const a11y = interactive ? { role: "group" as const, "aria-label": label } : label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };

  const screen = (
    <div
      data-slot="device-screen"
      inert={interactive ? undefined : true}
      className={cn("@container relative flex flex-col bg-scene text-fg", interactive ? "overflow-auto overscroll-contain" : "overflow-hidden", screenClassName)}
      style={{ width: viewport.width, height: viewport.height }}
    >
      {statusBar != null && device !== "desktop" ? (
        <div aria-hidden="true" className="flex shrink-0 items-center justify-between px-7 pt-3.5 pb-1.5 text-[13px] font-semibold text-fg tabular">
          <span>{statusBar}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-[2px] bg-fg" />
            <span className="h-3 w-6 rounded-[3px] border border-fg-muted p-[1.5px]">
              <span className="block h-full w-3/4 rounded-[1px] bg-fg" />
            </span>
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );

  return (
    <div
      ref={(node) => {
        measure(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="device-frame"
      data-device={device}
      className={cn("relative mx-auto w-full overflow-hidden", className)}
      style={{ maxWidth: size.width * maxScale, aspectRatio: `${size.width} / ${size.height}`, ...style }}
      {...a11y}
      {...props}
    >
      <div
        aria-hidden={interactive || !label ? undefined : true}
        className="absolute start-0 top-0 origin-top-left rtl:origin-top-right"
        style={{ width: size.width, height: size.height, transform: scale === 1 ? undefined : `scale(${scale})` }}
      >
        {device === "desktop" ? (
          <div className="flex size-full flex-col overflow-hidden rounded-ui-lg border border-line bg-surface-2 shadow-[var(--surface-shadow)]">
            <div aria-hidden="true" className="flex shrink-0 items-center gap-3 border-b border-line px-4" style={{ height: bezel.bar }}>
              <span className="flex gap-1.5">
                <span className="size-3 rounded-full bg-line" />
                <span className="size-3 rounded-full bg-line" />
                <span className="size-3 rounded-full bg-line" />
              </span>
              {url ? <span className="mx-auto min-w-0 max-w-[60%] truncate rounded-full bg-surface px-4 py-1 text-[13px] text-fg-muted">{url}</span> : null}
            </div>
            {screen}
          </div>
        ) : (
          <div
            className={cn("relative size-full border border-line bg-surface-2 shadow-[var(--surface-shadow)]", device === "phone" ? "rounded-[3.25rem]" : "rounded-[2.5rem]")}
            style={{ padding: bezel.pad }}
          >
            <div className={cn("relative overflow-hidden", device === "phone" ? "rounded-[2.6rem]" : "rounded-[1.6rem]")}>
              {screen}
              {device === "phone" ? <span aria-hidden="true" className="pointer-events-none absolute start-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-fg rtl:translate-x-1/2" /> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export interface DeviceScreen {
  id: string;
  content: React.ReactNode;
}

export interface DeviceScreensProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  screens: DeviceScreen[];
  /** Id of the screen to show (from tabs, a scroll position, a step…). */
  active: string;
  /** `"fade"` (default) cross-fades, `"slide"` also moves up / down by order. Reduced motion: instant. */
  transition?: "fade" | "slide" | "none";
}

/**
 * Stacks several screens inside a DeviceFrame and shows the `active` one. Every screen stays
 * mounted (no layout jump, no refetch); hidden ones are inert.
 *
 * ```tsx
 * <DeviceFrame label={current.title}><DeviceScreens active={tab} screens={features.map((f) => ({ id: f.id, content: f.screen }))} /></DeviceFrame>
 * ```
 */
export const DeviceScreens = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DeviceScreensProps>(function DeviceScreens(
  { screens, active, transition = "fade", className, ...props },
  ref,
) {
  const index = Math.max(0, screens.findIndex((s) => s.id === active));
  return (
    <div ref={ref} data-slot="device-screens" data-active={screens[index]?.id} className={cn("relative min-h-0 flex-1", className)} {...props}>
      {screens.map((s, i) => {
        const on = i === index;
        return (
          <div
            key={s.id}
            data-screen={s.id}
            data-state={on ? "active" : "inactive"}
            inert={on ? undefined : true}
            aria-hidden={on ? undefined : true}
            className={cn(
              "absolute inset-0 flex flex-col",
              transition !== "none" && "transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
              on ? "opacity-100" : "pointer-events-none opacity-0",
              transition === "slide" && (on ? "translate-y-0" : i < index ? "-translate-y-6" : "translate-y-6"),
            )}
          >
            {s.content}
          </div>
        );
      })}
    </div>
  );
});
