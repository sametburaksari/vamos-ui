import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Button, Field, Input } from "../src";

describe("foundations smoke", () => {
  it("renders a labelled field without a11y violations", async () => {
    const { container } = render(
      <Field label="Title" hint="Keep it short">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
  it("button loading sets aria-busy and disables", () => {
    render(<Button loading>Save</Button>);
    const b = screen.getByRole("button", { name: "Save" });
    expect(b).toHaveAttribute("aria-busy", "true");
    expect(b).toBeDisabled();
  });
});
