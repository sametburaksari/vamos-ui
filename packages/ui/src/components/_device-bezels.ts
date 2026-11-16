// Internal (not part of the public index): shared by device-frame.tsx and device-frame-size.ts.
type Device = "phone" | "tablet" | "desktop";

/** Bezel per device: padding around the screen and the extra height of a browser bar. */
export const BEZEL: Record<Device, { pad: number; bar: number }> = {
  phone: { pad: 12, bar: 0 },
  tablet: { pad: 18, bar: 0 },
  desktop: { pad: 0, bar: 40 },
};
