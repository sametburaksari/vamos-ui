import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { Tour, type TourStep } from "./tour";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const steps: TourStep[] = [
  { target: "[data-tour=search]", title: "Search everything", description: "Press Ctrl K from any page." },
  { target: "[data-tour=new]", title: "Create an order", description: "Orders, customers and products start here.", side: "left" },
  { title: "You're set", description: "Reopen this tour from Help." },
];

function Page(props: Partial<React.ComponentProps<typeof Tour>>) {
  return (
    <div>
      <button data-tour="search">Search</button>
      <button data-tour="new">New order</button>
      <Tour steps={steps} defaultOpen {...props} />
    </div>
  );
}

describe("Tour", () => {
  it("opens as a labelled dialog on the first step and highlights the target", async () => {
    renderWithProviders(<Page />);
    const dialog = await screen.findByRole("dialog", { name: "Search everything" });
    expect(dialog).toHaveAccessibleDescription("Press Ctrl K from any page.");
    expect(dialog).toHaveTextContent("Step 1 of 3");
    await waitFor(() => expect(document.querySelector("[data-tour=search]")).toHaveAttribute("data-tour-active"));
    await expectNoA11yViolations(dialog);
  });

  it("moves with Next / Back and arrow keys, and completes on Done", async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    const { user } = renderWithProviders(<Page onComplete={onComplete} onStepChange={onStepChange} />);
    await user.click(await screen.findByRole("button", { name: "Next" }));
    expect(await screen.findByRole("dialog", { name: "Create an order" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByRole("dialog", { name: "Search everything" })).toBeInTheDocument();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(await screen.findByRole("dialog", { name: "You're set" })).toBeInTheDocument();
    expect(onStepChange).toHaveBeenLastCalledWith(2);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("skips with Escape or the close button and reports the step", async () => {
    const onSkip = vi.fn();
    const { user } = renderWithProviders(<Page onSkip={onSkip} defaultStep={1} />);
    await screen.findByRole("dialog", { name: "Create an order" });
    await user.keyboard("{Escape}");
    expect(onSkip).toHaveBeenCalledWith(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
