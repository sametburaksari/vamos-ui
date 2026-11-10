import * as React from "react";
import { screen } from "@testing-library/react";
import { EmptyState, EmptyStateActions, EmptyStateIcon, EmptyStateTitle } from "./empty-state";
import { Button } from "./button";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("EmptyState", () => {
  it("renders title, description and actions with an h3 and passes axe", async () => {
    const { container } = renderWithProviders(
      <EmptyState title="No posts yet" description="Write your first post, or import from WordPress." actions={<Button variant="primary">Write a post</Button>} />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "No posts yet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Write a post" })).toBeInTheDocument();
    const root = container.querySelector("[data-slot=empty-state]")!;
    expect(root).toHaveAttribute("data-kind", "first-use");
    expect(root.querySelector("[data-slot=empty-state-icon]")).toHaveClass("bg-accent-soft");
    await expectNoA11yViolations(container);
  });

  it("no-results is a status and uses the dictionary default title", () => {
    renderWithProviders(<EmptyState kind="no-results" size="sm" />, { messages: { empty: { noResults: "Filtrelere uyan sonuç yok" } } });
    expect(screen.getByRole("status")).toHaveTextContent("Filtrelere uyan sonuç yok");
  });

  it("sets the heading level, frame, size and custom icon / illustration", () => {
    const { container, rerender } = renderWithProviders(<EmptyState kind="forbidden" as="h2" size="lg" framed title="You don't have access to Payroll" icon={<svg data-testid="custom" />} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("font-display");
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(container.querySelector("[data-slot=empty-state]")).toHaveClass("border-dashed");
    rerender(<EmptyState title="Nobody is on leave today" kind="done" illustration={<img alt="" src="data:," />} />);
    expect(container.querySelector("[data-slot=empty-state-icon]")).toBeNull();
    expect(container.querySelector("[data-slot=empty-state-illustration]")).toBeInTheDocument();
  });

  it("composes from parts", async () => {
    const { container } = renderWithProviders(
      <div className="flex flex-col items-center">
        <EmptyStateIcon>
          <svg />
        </EmptyStateIcon>
        <EmptyStateTitle as="p">Inbox zero</EmptyStateTitle>
        <EmptyStateActions>
          <Button size="sm">Refresh</Button>
        </EmptyStateActions>
      </div>,
    );
    expect(screen.getByText("Inbox zero").tagName).toBe("P");
    await expectNoA11yViolations(container);
  });
});
