import { screen } from "@testing-library/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("Collapsible", () => {
  it("is a disclosure button wired to its region and passes axe", async () => {
    renderWithProviders(
      <Collapsible>
        <CollapsibleTrigger meta="4 fields">Advanced settings</CollapsibleTrigger>
        <CollapsibleContent>Webhook secret and retry policy.</CollapsibleContent>
      </Collapsible>,
    );
    const btn = screen.getByRole("button", { name: /Advanced settings/ });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAccessibleName(/Advanced settings\s*,\s*4 fields/);
    expect(screen.queryByText("Webhook secret and retry policy.")).toBeNull();
    await expectNoA11yViolations();
  });

  it("toggles with click, Enter and Space", async () => {
    const { user } = renderWithProviders(
      <Collapsible>
        <CollapsibleTrigger>Shipping details</CollapsibleTrigger>
        <CollapsibleContent>Courier: Northline Express</CollapsibleContent>
      </Collapsible>,
    );
    const btn = screen.getByRole("button", { name: "Shipping details" });
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    const region = screen.getByText("Courier: Northline Express");
    expect(btn).toHaveAttribute("aria-controls", region.closest("[data-slot=collapsible-content]")!.id);
    btn.focus();
    await user.keyboard("{Enter}");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await user.keyboard(" ");
    expect(btn).toHaveAttribute("aria-expanded", "true");
    await expectNoA11yViolations();
  });

  it("supports controlled state and asChild triggers", async () => {
    const onOpenChange = vi.fn();
    const { user } = renderWithProviders(
      <Collapsible open onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <button type="button">Hide notes</button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">Call back after 3 pm.</CollapsibleContent>
      </Collapsible>,
    );
    const content = screen.getByText("Call back after 3 pm.");
    expect(content).toHaveClass("ui-collapse");
    expect(content).toHaveAttribute("data-state", "open");
    await user.click(screen.getByRole("button", { name: "Hide notes" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disabled triggers do not toggle", async () => {
    const { user } = renderWithProviders(
      <Collapsible disabled>
        <CollapsibleTrigger>Locked section</CollapsibleTrigger>
        <CollapsibleContent>Secret</CollapsibleContent>
      </Collapsible>,
    );
    const btn = screen.getByRole("button", { name: "Locked section" });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });
});
