import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("Alert", () => {
  it("renders a static message without a live role and passes axe", async () => {
    const { container } = render(
      <Alert tone="warning" title="Payroll filing due in 3 days">
        Submit the November declaration before Dec 26.
      </Alert>,
    );
    const alert = container.querySelector("[data-slot=alert]")!;
    expect(alert).not.toHaveAttribute("role");
    expect(alert).toHaveAttribute("data-tone", "warning");
    expect(alert).toHaveClass("tone-warning");
    expect(alert.querySelector("[data-slot=alert-icon] svg")).toBeInTheDocument();
    expect(screen.getByText("Payroll filing due in 3 days")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("maps live to role=alert / role=status", () => {
    const { rerender } = render(<Alert live="assertive" tone="danger">Couldn&apos;t publish</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't publish");
    rerender(<Alert live="polite">Draft saved</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Draft saved");
  });

  it("dismiss button has a localized name and calls onDismiss", async () => {
    const onDismiss = vi.fn();
    const { user } = renderWithProviders(<Alert onDismiss={onDismiss}>Your trial ends on Nov 30.</Alert>, { messages: { alert: { dismiss: "Kapat" } } });
    await user.click(screen.getByRole("button", { name: "Kapat" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("supports icon={false}, actions, banner and composition", async () => {
    const { container } = render(
      <>
        <Alert icon={false} variant="banner" tone="accent" actions={<Button size="xs">Renew plan</Button>}>
          Your Growth plan renews on Dec 1.
        </Alert>
        <Alert tone="info" icon={false}>
          <AlertTitle>Revision available</AlertTitle>
          <AlertDescription>An autosave from 10:42 is newer than this version.</AlertDescription>
          <AlertActions>
            <Button size="xs">Restore</Button>
          </AlertActions>
        </Alert>
      </>,
    );
    const banner = container.querySelectorAll("[data-slot=alert]")[0]!;
    expect(banner).toHaveAttribute("data-variant", "banner");
    expect(banner.querySelector("[data-slot=alert-icon]")).toBeNull();
    expect(screen.getByRole("button", { name: "Renew plan" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
