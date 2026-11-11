import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import * as React from "react";
import { BlockLink } from "./block-link";
import type { VamosLinkProps } from "../lib/provider";

const RouterLink = React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function RouterLink(p, ref) {
  return <a ref={ref} {...p} data-router="" />;
});

describe("BlockLink", () => {
  it("routes internal links through the adapter and keeps external ones native", async () => {
    const { container } = render(
      <p>
        <BlockLink href="/reservations" components={{ Link: RouterLink }}>Book a table</BlockLink>{" "}
        <BlockLink href="https://maps.app.goo.gl/kiyi" components={{ Link: RouterLink }} newTab>Directions</BlockLink>{" "}
        <BlockLink href="tel:+902160000000" components={{ Link: RouterLink }}>0216 000 00 00</BlockLink>
      </p>,
    );
    expect(screen.getByRole("link", { name: "Book a table" })).toHaveAttribute("data-router");
    const ext = screen.getByRole("link", { name: "Directions (opens in a new tab)" });
    expect(ext).not.toHaveAttribute("data-router");
    expect(ext).toHaveAttribute("target", "_blank");
    expect(ext).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "0216 000 00 00" })).not.toHaveAttribute("data-router");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("never renders unsafe hrefs as links", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<BlockLink href="javascript:alert(1)">Click</BlockLink>);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Click")).toHaveAttribute("data-unsafe-href");
    warn.mockRestore();
  });

  it("styles calls to action and is keyboard reachable", async () => {
    render(<BlockLink href="/menu" appearance="primary">See the menu</BlockLink>);
    const link = screen.getByRole("link", { name: "See the menu" });
    expect(link).toHaveClass("bg-accent", "vb-action-primary");
    await userEvent.tab();
    expect(link).toHaveFocus();
  });
});
