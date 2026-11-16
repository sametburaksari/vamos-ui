import { BEZEL } from "./_device-bezels";

export type DeviceKind = "phone" | "tablet" | "desktop";

/** Simulated screen size (CSS px) per device. */
export const deviceViewports: Record<DeviceKind, { width: number; height: number }> = {
  phone: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1280, height: 800 },
};

/** Width × height (px) of the whole frame at scale 1. */
export function deviceFrameSize(device: DeviceKind, viewport: { width: number; height: number } = deviceViewports[device]) {
  const b = BEZEL[device];
  return { width: viewport.width + b.pad * 2 + (device === "desktop" ? 2 : 0), height: viewport.height + b.pad * 2 + b.bar + (device === "desktop" ? 2 : 0) };
}
