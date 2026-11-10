import * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { ImageCropper, formatAspectRatio } from "./image-cropper";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const src = "https://cdn.example.com/team-offsite.jpg";

// jsdom has no layout or image decoding: give the stage and the image real sizes.
const rect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function () {
    return { x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 400, width: 600, height: 400, toJSON() {} } as DOMRect;
  };
  Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", { configurable: true, get: () => 1200 });
  Object.defineProperty(HTMLImageElement.prototype, "naturalHeight", { configurable: true, get: () => 800 });
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = rect;
  delete (HTMLImageElement.prototype as unknown as Record<string, unknown>).naturalWidth;
  delete (HTMLImageElement.prototype as unknown as Record<string, unknown>).naturalHeight;
});

function loaded(container: HTMLElement) {
  fireEvent.load(container.querySelector("img")!);
}

describe("formatAspectRatio", () => {
  it("names common ratios and uses the locale decimal", () => {
    expect(formatAspectRatio(16 / 9)).toBe("16:9");
    expect(formatAspectRatio(1)).toBe("1:1");
    expect(formatAspectRatio(1.91)).toBe("1.91:1");
    expect(formatAspectRatio(1.91, "tr-TR")).toBe("1,91:1");
  });
});

describe("ImageCropper", () => {
  it("renders a focusable crop area and a labelled toolbar; passes axe", async () => {
    const { container } = renderWithProviders(<ImageCropper src={src} defaultAspect={1.91} onChange={() => {}} />);
    loaded(container);
    const area = screen.getByRole("application", { name: "Crop area" });
    expect(area).toHaveAttribute("tabindex", "0");
    expect(area).toHaveAccessibleDescription(/arrow keys/);
    expect(screen.getByRole("toolbar", { name: "Crop tools" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Social/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("slider", { name: "Zoom" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("moves the crop with the arrow keys and reports a non-destructive rect", async () => {
    const onChange = vi.fn();
    const { container, user } = renderWithProviders(<ImageCropper src={src} defaultAspect={1} onChange={onChange} />);
    loaded(container);
    screen.getByRole("application", { name: "Crop area" }).focus();
    await user.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const [rect, preset] = onChange.mock.calls.at(-1)!;
    expect(rect).toEqual(expect.objectContaining({ x: expect.any(Number), y: expect.any(Number), width: expect.any(Number), height: expect.any(Number) }));
    expect(rect.width).toBe(rect.height);
    expect(preset).toEqual(expect.objectContaining({ name: "square" }));
  });

  it("switches aspect presets", async () => {
    const onAspectChange = vi.fn();
    const { user } = renderWithProviders(<ImageCropper src={src} defaultAspect={1.91} onAspectChange={onAspectChange} />);
    await user.click(screen.getByRole("button", { name: /Square/ }));
    expect(onAspectChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole("button", { name: /Square/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("zooms with the buttons and toggles flips", async () => {
    const { user } = renderWithProviders(<ImageCropper src={src} />);
    const slider = screen.getByRole("slider", { name: "Zoom" });
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(slider).toHaveAttribute("aria-valuenow", "1.25");
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeEnabled();
    const flip = screen.getByRole("button", { name: "Flip horizontally" });
    await user.click(flip);
    expect(flip).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Reset crop" }));
    expect(screen.getByRole("slider", { name: "Zoom" })).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: "Flip horizontally" })).toHaveAttribute("aria-pressed", "false");
  });

  it("round avatar mode locks the ratio and hides other presets", () => {
    renderWithProviders(<ImageCropper src={src} shape="round" transform={false} />);
    expect(screen.queryByRole("group", { name: "Aspect ratio" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Rotate left" })).toBeNull();
  });
});
