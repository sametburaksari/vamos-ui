import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Checkbox, CheckboxGroup, CheckboxGroupItem } from "./checkbox";
import { Field } from "./input";

describe("Checkbox", () => {
  it("renders a labelled checkbox and toggles with Space and click", async () => {
    const onChange = vi.fn();
    const { container } = render(<Checkbox label="Allow comments" description="Readers can reply below the post." onCheckedChange={onChange} />);
    const cb = screen.getByRole("checkbox", { name: "Allow comments" });
    expect(cb).toHaveAttribute("aria-checked", "false");
    expect(cb).toHaveAccessibleDescription("Readers can reply below the post.");
    await userEvent.tab();
    expect(cb).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(cb).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByText("Allow comments"));
    expect(cb).toHaveAttribute("aria-checked", "false");
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("supports the indeterminate state", () => {
    render(<Checkbox checked="indeterminate" aria-label="Select all rows" />);
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toHaveAttribute("aria-checked", "mixed");
  });

  it("read-only swallows changes", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Archived" readOnly defaultChecked onCheckedChange={onChange} />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveAttribute("aria-readonly", "true");
    await userEvent.click(cb);
    expect(cb).toHaveAttribute("aria-checked", "true");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("wires a surrounding Field (label, error, required)", async () => {
    const { container } = render(
      <Field label="I accept the terms of service" orientation="horizontal" error="You need to accept the terms." required>
        <Checkbox name="terms" />
      </Field>,
    );
    const cb = screen.getByRole("checkbox", { name: /I accept the terms/ });
    expect(cb).toHaveAttribute("aria-invalid", "true");
    expect(cb).toHaveAttribute("aria-required", "true");
    expect(cb).toHaveAccessibleDescription("You need to accept the terms.");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("card variant is clickable as a whole", async () => {
    render(<Checkbox variant="card" label="Invoicing" description="Quotes, invoices and payment links." />);
    await userEvent.click(screen.getByText("Quotes, invoices and payment links."));
    expect(screen.getByRole("checkbox", { name: /Invoicing/ })).toHaveAttribute("aria-checked", "true");
  });
});

describe("CheckboxGroup", () => {
  it("keeps an ordered array value and is labelled by the Field", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Field label="Notify me by">
        <CheckboxGroup
          defaultValue={["email"]}
          onValueChange={onChange}
          items={[
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS" },
            { value: "push", label: "Push notification" },
          ]}
        />
      </Field>,
    );
    expect(screen.getByRole("group", { name: "Notify me by" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: "Push notification" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "SMS" }));
    expect(onChange).toHaveBeenLastCalledWith(["email", "sms", "push"]);
    await userEvent.click(screen.getByRole("checkbox", { name: "Email" }));
    expect(onChange).toHaveBeenLastCalledWith(["sms", "push"]);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("submits every checked item under the group name", async () => {
    render(
      <form data-testid="f">
        <CheckboxGroup name="modules" aria-label="Modules" defaultValue={["crm"]}>
          <CheckboxGroupItem value="crm" label="CRM" />
          <CheckboxGroupItem value="hr" label="HR" />
        </CheckboxGroup>
      </form>,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "HR" }));
    const data = new FormData(screen.getByTestId("f") as HTMLFormElement);
    expect(data.getAll("modules")).toEqual(["crm", "hr"]);
  });
});
