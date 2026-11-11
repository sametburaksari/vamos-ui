import { act, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ContactDock } from "./contact-dock";
import { contactDockBlock } from "./registry-2";

const hours = { timeZone: "Europe/Istanbul", weekly: { tue: [{ open: "12:00", close: "23:00" }] } };

describe("ContactDock", () => {
  it("both: WhatsApp fab with a prefilled wa.me link and a mobile action bar", async () => {
    const { container } = render(
      <main>
        <ContactDock contained whatsapp="+902160000000" message="Hi, I’d like to book a table for Friday." phone="+902160000000" directionsHref="https://maps.app.goo.gl/meyhane" bookingHref="/reservations" />
      </main>,
    );
    const fab = screen.getAllByRole("link", { name: /Message us on WhatsApp, opens in a new tab/ })[0]!;
    expect(fab).toHaveAttribute("href", "https://wa.me/902160000000?text=Hi%2C%20I%E2%80%99d%20like%20to%20book%20a%20table%20for%20Friday.");
    expect(fab).toHaveAttribute("data-track", "whatsapp");
    const bar = screen.getByRole("navigation", { name: "Quick contact" });
    const actions = within(bar).getAllByRole("link");
    expect(actions.map((a) => a.getAttribute("data-track"))).toEqual(["call", "whatsapp", "directions", "booking"]);
    expect(actions[0]).toHaveAttribute("href", "tel:+902160000000");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("fab only, start side, Telegram provider", () => {
    render(<ContactDock variant="fab" provider="telegram" telegram="@meyhanecevizli" position="start" contained />);
    expect(screen.getByRole("link", { name: /Telegram/ })).toHaveAttribute("href", "https://t.me/meyhanecevizli");
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.querySelector("[data-contact-dock]")).toHaveAttribute("data-position", "start");
  });

  it("off hours: label while closed, hidden in hide mode", async () => {
    const { rerender } = render(<ContactDock variant="fab" whatsapp="+902160000000" hours={hours} offHours="label" now="2026-11-10T08:00:00+03:00" contained />);
    expect(await screen.findByText(/We’re closed now/)).toBeInTheDocument();
    rerender(<ContactDock variant="fab" whatsapp="+902160000000" hours={hours} offHours="hide" now="2026-11-10T08:00:00+03:00" contained />);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector("[data-contact-dock]")).toHaveAttribute("hidden");
  });

  it("bar needs at least two configured actions; preview validates", () => {
    const { container } = render(<ContactDock variant="bar" phone="+902160000000" contained />);
    expect(container.querySelector("nav")).toBeNull();
    expect(contactDockBlock.schema.safeParse(contactDockBlock.sample()).success).toBe(true);
  });

  describe("never covers a CTA", () => {
    const rect = (top: number, left: number, height: number, width: number) => ({ top, left, bottom: top + height, right: left + width, height, width, x: left, y: top, toJSON: () => ({}) }) as DOMRect;
    const frame = () => act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });

    it("hides the fab while a booking form is under it, keeps it otherwise", async () => {
      Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
      render(
        <>
          <form className="vb-booking" data-testid="booking" />
          <ContactDock variant="fab" whatsapp="+902160000000" />
        </>,
      );
      const dock = document.querySelector<HTMLElement>("[data-contact-dock]")!;
      const fab = dock.querySelector<HTMLElement>(".vb-dock-fab")!;
      const booking = screen.getByTestId("booking");
      vi.spyOn(fab, "getBoundingClientRect").mockReturnValue(rect(732, 1300, 52, 52));
      const spy = vi.spyOn(booking, "getBoundingClientRect").mockReturnValue(rect(600, 900, 300, 500));
      window.dispatchEvent(new Event("scroll"));
      await frame();
      expect(dock).toHaveAttribute("data-avoiding");

      spy.mockReturnValue(rect(100, 900, 300, 500));
      window.dispatchEvent(new Event("scroll"));
      await frame();
      expect(dock).not.toHaveAttribute("data-avoiding");
    });

    it("lifts above a bar pinned to the bottom; CTA rows test their links only", async () => {
      Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
      render(
        <>
          <div data-dock-avoid="" data-testid="bar" style={{ position: "fixed" }} />
          <div data-dock-avoid="items" data-testid="row">
            <a href="/book">Book</a>
          </div>
          <ContactDock variant="fab" whatsapp="+902160000000" />
        </>,
      );
      const dock = document.querySelector<HTMLElement>("[data-contact-dock]")!;
      vi.spyOn(dock.querySelector<HTMLElement>(".vb-dock-fab")!, "getBoundingClientRect").mockReturnValue(rect(732, 1300, 52, 52));
      vi.spyOn(screen.getByTestId("bar"), "getBoundingClientRect").mockReturnValue(rect(728, 0, 72, 1400));
      // The row spans the fab's corner, its only link does not.
      vi.spyOn(screen.getByTestId("row"), "getBoundingClientRect").mockReturnValue(rect(700, 0, 60, 1400));
      vi.spyOn(screen.getByRole("link", { name: "Book" }), "getBoundingClientRect").mockReturnValue(rect(710, 40, 44, 120));
      window.dispatchEvent(new Event("scroll"));
      await frame();
      expect(dock.style.getPropertyValue("--vb-dock-lift")).toBe("72px");
      expect(dock).not.toHaveAttribute("data-avoiding");
    });
  });
});
