import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field, Input } from "../components/input";
import { MultiStepForm, MultiStepFormFooter, MultiStepFormReview, MultiStepFormStep, MultiStepFormStepper, type StepDef } from "./multi-step-form";

function Wizard({ onComplete = vi.fn(), company = false }: { onComplete?: () => Promise<void> | void; company?: boolean }) {
  const [name, setName] = React.useState("");
  const [nameError, setNameError] = React.useState<string>();
  const steps: StepDef<{ company: boolean }>[] = [
    {
      id: "identity",
      title: "Identity",
      validate: () => {
        const err = name.trim() ? undefined : "Enter the employee's full name.";
        setNameError(err);
        return err ?? true;
      },
    },
    { id: "tax", title: "Tax details", when: (c) => c.company },
    { id: "review", title: "Review" },
  ];
  return (
    <MultiStepForm steps={steps} context={{ company }} onComplete={onComplete}>
      <MultiStepFormStepper />
      <MultiStepFormStep id="identity">
        <Field label="Full name" error={nameError}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </MultiStepFormStep>
      <MultiStepFormStep id="tax">
        <Field label="Tax number">
          <Input />
        </Field>
      </MultiStepFormStep>
      <MultiStepFormStep id="review">
        <MultiStepFormReview sections={[{ step: "identity", items: [{ label: "Full name", value: name }] }]} />
      </MultiStepFormStep>
      <MultiStepFormFooter />
    </MultiStepForm>
  );
}

describe("MultiStepForm", () => {
  it("renders the first step with an announced heading and has no a11y violations", async () => {
    const { container } = render(<Wizard />);
    expect(screen.getByRole("heading", { level: 2, name: /Step 1 of 2: Identity/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("blocks Next on validation errors, shows the summary and focuses the invalid field", async () => {
    const user = userEvent.setup();
    render(<Wizard />);
    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByText("Enter the employee's full name.", { selector: "[data-slot=alert] *" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText(/Full name/)).toHaveFocus());
  });

  it("Enter in a field goes to the next step, focuses its heading, and Back keeps values", async () => {
    const user = userEvent.setup();
    render(<Wizard />);
    await user.type(screen.getByLabelText(/Full name/), "Ayşe Yılmaz{Enter}");
    const heading = await screen.findByRole("heading", { level: 2, name: /Step 2 of 2: Review/ });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByText("Ayşe Yılmaz")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Back/ }));
    expect(screen.getByLabelText(/Full name/)).toHaveValue("Ayşe Yılmaz");
  });

  it("shows conditional steps only when `when` passes", () => {
    render(<Wizard company />);
    expect(screen.getByRole("heading", { level: 2, name: /Step 1 of 3/ })).toBeInTheDocument();
  });

  it("submits on the last step and shows a failure without leaving it", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn().mockRejectedValueOnce(new Error("Payroll service unavailable")).mockResolvedValueOnce(undefined);
    render(<Wizard onComplete={onComplete} />);
    await user.type(screen.getByLabelText(/Full name/), "Deniz Aydın");
    await user.click(screen.getByRole("button", { name: /Next/ }));
    await user.click(await screen.findByRole("button", { name: /Submit/ }));
    expect(await screen.findByText("Payroll service unavailable")).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: /Edit Identity/ }));
    expect(screen.getByRole("heading", { level: 2, name: /Identity/ })).toBeInTheDocument();
  });
});
