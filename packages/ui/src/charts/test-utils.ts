// Test helpers for the charts subpath: give Recharts a measurable box in jsdom.
import { vi } from "vitest";

/** Makes every ResizeObserver report a fixed size, so ResponsiveContainer renders its chart. */
export function mockChartSize(width = 640, height = 260) {
  class SizedRO {
    cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element) {
      const entry = { target, contentRect: { width, height, top: 0, left: 0, bottom: height, right: width, x: 0, y: 0 }, contentBoxSize: [{ inlineSize: width, blockSize: height }], borderBoxSize: [{ inlineSize: width, blockSize: height }] };
      this.cb([entry as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  }
  const prevRO = globalThis.ResizeObserver;
  globalThis.ResizeObserver = SizedRO as unknown as typeof ResizeObserver;
  // Only chart containers report a size; text measurement spans stay 0 so ticks are not culled.
  const realRect = HTMLElement.prototype.getBoundingClientRect;
  const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains("recharts-responsive-container") || this.dataset.slot === "chart-frame") return { width, height, top: 0, left: 0, bottom: height, right: width, x: 0, y: 0, toJSON() {} } as DOMRect;
    return realRect.call(this);
  });
  const ow = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(width);
  const oh = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(height);
  const cw = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(width);
  const ch = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(height);
  return () => {
    globalThis.ResizeObserver = prevRO;
    rect.mockRestore();
    ow.mockRestore();
    oh.mockRestore();
    cw.mockRestore();
    ch.mockRestore();
  };
}
