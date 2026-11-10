import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { contrastRatio, formatColor, parseColor, rgbaToOklch, toHex } from "../lib/color";
import { ColorPicker, ColorPickerPanel, ColorSwatchPicker } from "./color-picker";
import { Field } from "./input";

const labelColors = [
  { value: "#2f6fd6", name: "Blue" },
  { value: "#1a9c8c", name: "Teal" },
  { value: "#d9822b", name: "Orange" },
  { value: "#c94f7c", name: "Rose" },
];

describe("ColorPicker", () => {
  it("trigger is labelled by the Field, shows the value and opens a named dialog", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Field label="Brand color">
        <ColorPicker defaultValue="#C6F432" />
      </Field>,
    );
    const trigger = screen.getByRole("button", { name: "Brand color" });
    expect(trigger).toHaveAccessibleDescription("#c6f432");
    await user.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Pick a color" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Saturation and brightness" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Hue" })).toBeInTheDocument();
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });

  it("accepts typed hex, rgb() and oklch() values and rejects junk", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker variant="inline" aria-label="Accent" defaultValue="#000000" onValueChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Color value" });
    await user.clear(input);
    await user.type(input, "2f6fd6");
    expect(onChange).toHaveBeenLastCalledWith("#2f6fd6");
    await user.clear(input);
    await user.type(input, "rgb(255 0 0){Enter}");
    expect(onChange).toHaveBeenLastCalledWith("#ff0000");
    await user.clear(input);
    await user.type(input, "nope");
    fireEvent.blur(input);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a hex, rgb() or oklch() color");
    // format switch
    await user.click(screen.getByRole("radio", { name: "OKLCH" }));
    expect(input).toHaveValue(formatColor("#ff0000", "oklch"));
  });

  it("swatches are a radio group with named colours", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Field label="Label color">
        <ColorSwatchPicker swatches={labelColors} defaultValue="#2f6fd6" onValueChange={onChange} />
      </Field>,
    );
    const group = screen.getByRole("radiogroup", { name: "Label color" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Blue, #2f6fd6" })).toHaveAttribute("aria-checked", "true");
    await user.tab();
    expect(screen.getByRole("radio", { name: "Blue, #2f6fd6" })).toHaveFocus();
    // hold the key: Radix selects on the focus that an arrow key causes
    await user.keyboard("{ArrowRight>}");
    expect(screen.getByRole("radio", { name: "Teal, #1a9c8c" })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith("#1a9c8c");
    await user.keyboard("{/ArrowRight}");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a WCAG contrast hint and submits the hex value", () => {
    const { container } = render(
      <form aria-label="Theme">
        <ColorPickerPanel value="#2f6fd6" onValueChange={() => {}} contrastAgainst="#ffffff" />
        <ColorPicker name="accent" aria-label="Accent" defaultValue="#d9822b" />
      </form>,
    );
    expect(container.querySelector("[data-slot=color-contrast]")).toHaveTextContent(/4\.\d:1/);
    expect(container.querySelector("[data-slot=color-contrast]")).toHaveTextContent("AA");
    expect(new FormData(container.querySelector("form")!).get("accent")).toBe("#d9822b");
  });

  it("read-only does not open", async () => {
    const user = userEvent.setup();
    render(<ColorPicker aria-label="Accent" readOnly defaultValue="#d9822b" />);
    await user.click(screen.getByRole("button", { name: "Accent" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("lib/color", () => {
  it("parses and converts", () => {
    expect(parseColor("#abc")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(toHex("rgba(255, 0, 0, 0.5)")).toBe("#ff000080");
    expect(toHex("oklch(100% 0 0)")).toBe("#ffffff");
    expect(toHex("oklch(0 0 0)")).toBe("#000000");
    const o = rgbaToOklch(parseColor("#ff0000")!);
    expect(o.l).toBeCloseTo(0.628, 2);
    expect(o.h).toBeCloseTo(29.2, 0);
    expect(toHex(formatColor("#2f6fd6", "oklch"))).toBe("#2f6fd6");
    expect(parseColor("hello")).toBeNull();
  });
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });
});
