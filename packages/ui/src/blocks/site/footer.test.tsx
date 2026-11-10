import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Footer, type FooterProps } from "./footer";
import { CONSENT_OPEN_EVENT } from "./shared/consent";
import { footerBlock } from "./registry-2";

const props: FooterProps = {
  brand: { name: "Vamos", href: "/" },
  about: "A small studio in Maltepe building websites and booking systems for restaurants, spas and clinics.",
  columns: [
    { title: "Studio", links: [{ href: "/work", label: "Work" }, { href: "/services", label: "Services" }, { href: "/journal", label: "Journal" }] },
    { title: "Products", links: [{ href: "/vtag", label: "vTag" }, { href: "/vrest", label: "vRest" }] },
    { title: "Help", links: [{ href: "/contact", label: "Contact" }, { href: "/faq", label: "FAQ" }] },
  ],
  contact: { phone: "+902168072907", email: "hello@vamos.ist", address: { line: "Piazza AVM, Office Link", district: "Cevizli", city: "Maltepe", country: "TR" } },
  social: [{ network: "instagram", href: "https://instagram.com/vamos.ist" }, { network: "linkedin", href: "https://linkedin.com/company/vamos-ist" }],
  legalLinks: [{ href: "/privacy", label: "Privacy" }, { href: "/kvkk", label: "KVKK notice" }],
  company: { legalName: "Vamos Dijital Ajans Ltd. Şti.", registry: [{ label: "Tax office", value: "Kozyatağı" }, { label: "Tax no.", value: "923 145 6780" }, { label: "MERSİS", value: "0923 1456 7800 0015" }] },
  year: 2026,
};

describe("Footer", () => {
  it("columns: footer landmark, labelled navs, named social links, company details", async () => {
    const { container } = render(<Footer {...props} />);
    expect(screen.getByRole("contentinfo", { name: "Footer" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Studio" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Legal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Instagram/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByText("© 2026 Vamos Dijital Ajans Ltd. Şti.")).toBeInTheDocument();
    expect(screen.getByText("MERSİS").nextSibling).toHaveTextContent("0923 1456 7800 0015");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Cookie settings is a button that fires the open event", async () => {
    const user = userEvent.setup();
    const seen = vi.fn();
    window.addEventListener(CONSENT_OPEN_EVENT, seen);
    render(<Footer {...props} />);
    await user.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(seen).toHaveBeenCalledOnce();
    window.removeEventListener(CONSENT_OPEN_EVENT, seen);
  });

  it("wordmark and minimal variants", async () => {
    const { container, rerender } = render(<Footer {...props} variant="wordmark" theme={{ mode: "dark" }} />);
    expect(container.querySelector(".vb-wordmark")).toHaveTextContent("Vamos");
    expect(container.querySelector(".vb-wordmark")).toHaveAttribute("aria-hidden");
    expect(await axe(container)).toHaveNoViolations();
    rerender(<Footer {...props} variant="minimal" />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(within(nav).getAllByRole("link")).toHaveLength(5);
  });

  it("newsletter uses the form island; preview validates", async () => {
    render(<Footer {...props} newsletter={{}} />);
    expect(screen.getByRole("textbox", { name: /Email address/ })).toHaveAttribute("autocomplete", "email");
    expect(screen.getByRole("button", { name: /Subscribe/ })).toBeInTheDocument();
    expect(footerBlock.schema.safeParse(footerBlock.sample()).success).toBe(true);
  });
});
