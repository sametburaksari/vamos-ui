import { screen } from "@testing-library/react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function ContactCard(props: { open?: boolean }) {
  return (
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCardTrigger href="/contacts/482">Amelia Hart</HoverCardTrigger>
      <HoverCardContent size="sm">
        <p>Head of Procurement, Northwind Logistics</p>
      </HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  it("renders the trigger link and passes axe when closed", async () => {
    renderWithProviders(<ContactCard />);
    expect(screen.getByRole("link", { name: "Amelia Hart" })).toHaveAttribute("href", "/contacts/482");
    await expectNoA11yViolations();
  });

  it("opens on pointer hover", async () => {
    const { user } = renderWithProviders(<ContactCard />);
    await user.hover(screen.getByRole("link", { name: "Amelia Hart" }));
    expect(await screen.findByText("Head of Procurement, Northwind Logistics")).toBeInTheDocument();
  });

  it("controlled open content is a depth-1 layer inside the theme scope and passes axe", async () => {
    renderWithProviders(<ContactCard open />);
    const content = document.querySelector('[data-slot="hover-card-content"]')!;
    expect(content).toHaveAttribute("data-layer-depth", "1");
    expect(content.closest('[data-slot="theme-scope"]')).not.toBeNull();
    await expectNoA11yViolations();
  });
});
