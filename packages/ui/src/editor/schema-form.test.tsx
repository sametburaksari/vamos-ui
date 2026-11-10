import "./_test-setup";
import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { f } from "../blocks/schema/fields";
import { SchemaForm } from "./schema-form";

const schema = z.object({
  eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
  title: f.heading({ max: 90 }),
  layout: f.select(["split", "stacked"]),
  showPrices: f.toggle({ label: "Show prices" }),
  plans: f.list(f.group({ name: f.text(), price: f.text() }), { min: 1, max: 4, itemLabel: "Plan {n}" }),
});

function Harness({ onChange, errors }: { onChange?: (v: Record<string, unknown>) => void; errors?: { path: PropertyKey[]; message: string }[] }) {
  const [value, setValue] = React.useState<Record<string, unknown>>({
    title: { en: "Simple *pricing*", tr: "Basit *fiyatlar*" },
    layout: "split",
    showPrices: true,
    plans: [{ name: "Starter", price: "$29" }],
  });
  return (
    <SchemaForm
      schema={schema}
      value={value}
      locale="en"
      errors={errors}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe("SchemaForm", () => {
  it("renders widgets from f.* metadata", () => {
    render(<Harness />);
    expect(screen.getByRole("textbox", { name: /Title/ })).toHaveValue("Simple *pricing*");
    expect(screen.getByRole("radio", { name: "Split" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch", { name: "Show prices" })).toBeChecked();
    expect(screen.getByRole("heading", { name: /Plans/ })).toBeInTheDocument();
  });

  it("edits the active locale of localized fields", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: /Title/ }), { target: { value: "Fair *pricing*" } });
    expect(onChange.mock.calls.at(-1)![0].title).toEqual({ en: "Fair *pricing*", tr: "Basit *fiyatlar*" });
  });

  it("adds, moves and removes list items with buttons", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Add plan" }));
    expect(onChange.mock.calls.at(-1)![0].plans).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Move Starter down" }));
    expect(onChange.mock.calls.at(-1)![0].plans[1]).toEqual({ name: "Starter", price: "$29" });
    fireEvent.click(screen.getByRole("button", { name: "Remove Starter" }));
    expect(onChange.mock.calls.at(-1)![0].plans).toHaveLength(1);
  });

  it("shows validation errors on the field", () => {
    render(<Harness errors={[{ path: ["title"], message: "Use at most one *emphasis* per heading." }]} />);
    const input = screen.getByRole("textbox", { name: /Title/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/at most one/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Harness />);
    fireEvent.click(within(container).getByRole("button", { name: "Starter" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
