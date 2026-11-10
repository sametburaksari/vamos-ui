import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ContactDock } from "./contact-dock";
import { contactDockBlock } from "./registry-2";

const hours = { timeZone: "Europe/Istanbul", weekly: { tue: [{ open: "12:00", close: "23:00" }] } };

describe("ContactDock", () => {
  it("both: WhatsApp fab with a prefilled wa.me link and a mobile action bar", async () => {
    const { container } = render(
      <main>
        <ContactDock contained whatsapp="+902168072907" message="Hi, I’d like to book a table for Friday." phone="+902168072907" directionsHref="https://maps.app.goo.gl/meyhane" bookingHref="/reservations" />
      </main>,
    );
    const fab = screen.getAllByRole("link", { name: /Message us on WhatsApp, opens in a new tab/ })[0]!;
    expect(fab).toHaveAttribute("href", "https://wa.me/902168072907?text=Hi%2C%20I%E2%80%99d%20like%20to%20book%20a%20table%20for%20Friday.");
    expect(fab).toHaveAttribute("data-track", "whatsapp");
    const bar = screen.getByRole("navigation", { name: "Quick contact" });
    const actions = within(bar).getAllByRole("link");
    expect(actions.map((a) => a.getAttribute("data-track"))).toEqual(["call", "whatsapp", "directions", "booking"]);
    expect(actions[0]).toHaveAttribute("href", "tel:+902168072907");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("fab only, start side, Telegram provider", () => {
    render(<ContactDock variant="fab" provider="telegram" telegram="@meyhanecevizli" position="start" contained />);
    expect(screen.getByRole("link", { name: /Telegram/ })).toHaveAttribute("href", "https://t.me/meyhanecevizli");
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.querySelector("[data-contact-dock]")).toHaveAttribute("data-position", "start");
  });

  it("off hours: label while closed, hidden in hide mode", async () => {
    const { rerender } = render(<ContactDock variant="fab" whatsapp="+902168072907" hours={hours} offHours="label" now="2026-11-10T08:00:00+03:00" contained />);
    expect(await screen.findByText(/We’re closed now/)).toBeInTheDocument();
    rerender(<ContactDock variant="fab" whatsapp="+902168072907" hours={hours} offHours="hide" now="2026-11-10T08:00:00+03:00" contained />);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector("[data-contact-dock]")).toHaveAttribute("hidden");
  });

  it("bar needs at least two configured actions; preview validates", () => {
    const { container } = render(<ContactDock variant="bar" phone="+902168072907" contained />);
    expect(container.querySelector("nav")).toBeNull();
    expect(contactDockBlock.schema.safeParse(contactDockBlock.sample()).success).toBe(true);
  });
});
