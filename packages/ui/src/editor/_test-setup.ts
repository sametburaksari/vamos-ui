// jsdom gaps ProseMirror needs (layout APIs). Imported by the editor tests only.
const rect = () => ({ x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, toJSON() {} }) as DOMRect;
if (typeof Range !== "undefined") {
  Range.prototype.getBoundingClientRect ??= rect;
  Range.prototype.getClientRects ??= () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
}
if (typeof document !== "undefined") {
  document.elementFromPoint ??= () => null;
  (document as unknown as { caretRangeFromPoint?: unknown }).caretRangeFromPoint ??= () => null;
}
if (typeof window !== "undefined") {
  window.requestAnimationFrame ??= ((cb: FrameRequestCallback) => setTimeout(() => cb(0), 0)) as unknown as typeof requestAnimationFrame;
}
if (typeof DOMRect === "undefined") {
  (globalThis as { DOMRect?: unknown }).DOMRect = class {
    constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}
    get top() { return this.y; }
    get left() { return this.x; }
    get bottom() { return this.y + this.height; }
    get right() { return this.x + this.width; }
    toJSON() { return {}; }
  };
}
export {};
