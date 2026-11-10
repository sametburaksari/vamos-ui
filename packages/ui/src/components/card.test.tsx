import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Card, CardAction, CardBody, CardDescription, CardFooter, CardHeader, CardTitle, Inset } from "./card";

describe("Card", () => {
  it("renders the prop-based header with the chosen heading level", async () => {
    const { container } = render(
      <Card>
        <CardHeader eyebrow="Q4 · Sales" title="Open deals" description="Pipeline value by stage" titleAs="h2" action={<button>View all</button>} divider />
        <CardBody>
          <Inset>$184,200</Inset>
        </CardBody>
        <CardFooter>Updated 5 minutes ago</CardFooter>
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Open deals" })).toBeInTheDocument();
    expect(screen.getByText("Q4 · Sales")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute("data-variant", "surface");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("composes parts and labels a section", async () => {
    const { container } = render(
      <Card as="section" aria-labelledby="who-out">
        <div className="flex">
          <CardTitle id="who-out">Who's out today</CardTitle>
          <CardAction>
            <button>Calendar</button>
          </CardAction>
        </div>
        <CardDescription>3 people on leave</CardDescription>
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Who's out today" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("loading sets aria-busy and the body shows a skeleton", () => {
    const { container } = render(
      <Card loading>
        <CardBody loading>Content</CardBody>
      </Card>,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Content")).toBeNull();
    expect(container.querySelector('[data-slot="skeleton-text"]')).not.toBeNull();
  });

  it("asChild + interactive makes the whole card a link; variants and selected", async () => {
    const { container } = render(
      <>
        <Card asChild interactive variant="outline">
          <a href="/crm/contacts/42">Ayşe Kaya</a>
        </Card>
        <Card variant="inset" selected data-testid="sel" />
      </>,
    );
    const link = screen.getByRole("link", { name: "Ayşe Kaya" });
    expect(link).toHaveAttribute("data-variant", "outline");
    expect(screen.getByTestId("sel")).toHaveAttribute("data-selected");
    expect(await axe(container)).toHaveNoViolations();
  });
});
