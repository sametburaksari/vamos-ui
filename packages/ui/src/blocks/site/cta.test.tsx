import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Cta, waLink } from "./cta";
import { todayIn } from "./cta-booking";

describe("Cta", () => {
  it("band: accent surface by default, one primary, contact line", async () => {
    const { container } = render(
      <main>
        <Cta
          title="Book the *long table*"
          actions={[{ link: { href: "/book", label: "Book a table" }, style: "primary" }, { link: { href: "/private", label: "Private dining" }, style: "primary" }]}
          contact={{ phone: "+902168072907", whatsapp: "+905321234567" }}
        />
      </main>,
    );
    const region = screen.getByRole("region", { name: "Book the long table" });
    expect(region).toHaveAttribute("data-surface", "accent");
    expect(screen.getByRole("link", { name: "Book a table" })).toHaveClass("vb-action-primary");
    expect(screen.getByRole("link", { name: "Private dining" })).not.toHaveClass("vb-action-primary");
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/905321234567");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("minimal: one large text link, no buttons", () => {
    render(<Cta variant="minimal" title="Have a place people should *find*?" actions={[{ link: { href: "/contact", label: "Let’s talk about your project" }, style: "primary" }]} />);
    expect(screen.getByRole("link", { name: /Let’s talk/ })).toHaveClass("vb-cta-biglink");
    expect(screen.getByRole("link", { name: /Let’s talk/ })).not.toHaveClass("vb-action-primary");
  });

  it("newsletter: labelled email field, consent described, success status", async () => {
    const { container, rerender } = render(<main><Cta variant="newsletter" title="The Thursday wine list" newsletter={{ action: "/api/newsletter", consent: "Unsubscribe in one click." }} /></main>);
    const email = screen.getByLabelText("Email address");
    expect(email).toHaveAttribute("type", "email");
    expect(email).toBeRequired();
    expect(email).toHaveAccessibleDescription("Unsubscribe in one click.");
    expect(container.querySelector("form")).toHaveAttribute("action", "/api/newsletter");
    expect(await axe(container)).toHaveNoViolations();
    rerender(<main><Cta variant="newsletter" title="The Thursday wine list" newsletter={{ status: "error" }} /></main>);
    expect(screen.getByRole("alert")).toHaveTextContent("That didn’t go through");
    rerender(<main><Cta variant="newsletter" title="The Thursday wine list" newsletter={{ status: "success" }} /></main>);
    expect(screen.getByRole("status")).toHaveTextContent("check your inbox");
  });

  it("booking: refuses a closed day and opens a prefilled WhatsApp message", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const { container } = render(
      <main>
        <Cta variant="booking" title="Reserve a table" booking={{ provider: "whatsapp", whatsapp: "+905321234567", closedDays: ["mon"], timeZone: "Europe/Istanbul", maxGuests: 6 }} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
    const date = screen.getByLabelText("Date");
    fireEvent.change(date, { target: { value: "2030-11-11" } }); // a Monday
    expect(screen.getByRole("alert")).toHaveTextContent("We’re closed on Monday");
    expect(date).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(date, { target: { value: "2030-11-14" } });
    await user.selectOptions(screen.getByLabelText("Guests"), "4");
    await user.click(screen.getByRole("button", { name: /Ask for availability/ }));
    expect(open).toHaveBeenCalledTimes(1);
    const url = String(open.mock.calls[0]![0]);
    expect(url.startsWith("https://wa.me/905321234567?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1]!)).toBe("Hi, I’d like to book for 4 guests on Thu, November 14 at 7:30 PM.");
    open.mockRestore();
  });

  it("booking embed is a facade; helpers", async () => {
    const user = userEvent.setup();
    const { container } = render(<Cta variant="booking" title="Book a consultation" booking={{ provider: "embed", url: "https://calendly.com/lena-clinic/consultation" }} />);
    expect(container.querySelector("iframe")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(container.querySelector("iframe")).toHaveAttribute("src", "https://calendly.com/lena-clinic/consultation");
    expect(waLink("+90 532 123 45 67", "Hi there")).toBe("https://wa.me/905321234567?text=Hi%20there");
    expect(todayIn("Europe/Istanbul", new Date("2026-11-10T22:30:00Z"))).toBe("2026-11-11");
  });
});
