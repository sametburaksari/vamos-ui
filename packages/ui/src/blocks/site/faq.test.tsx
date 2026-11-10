import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Faq, faqJsonLd } from "./faq";

const items = [
  { q: "Is there parking?", a: "Yes — the Piazza garage, level −2. Three hours free with your receipt." },
  { q: "Can I cancel a booking?", a: "Free until 24 hours before." },
  { q: "Çocuklar için menü var mı?", a: "Evet, 12 yaş altı için yarım porsiyon." },
];

describe("Faq", () => {
  it("split: native details with an exclusive name, question headings, contact link", async () => {
    const { container } = render(<main><Faq id="faq" title="Before you *book*" items={items} contact={{ link: { href: "https://wa.me/905321234567", label: "Message us", newTab: true }, style: "link" }} /></main>);
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(3);
    details.forEach((d) => expect(d).toHaveAttribute("name", "faq-faq"));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getByText("Can’t find your question?")).toBeInTheDocument();
    expect(container.querySelector("script")?.innerHTML).toContain("location.hash");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("summary toggles the answer; ids are locale-aware slugs", async () => {
    const user = userEvent.setup();
    const { container } = render(<Faq items={items} locale="tr" exclusive={false} openFirst />);
    const [first, second, third] = Array.from(container.querySelectorAll("details"));
    expect(first).toHaveAttribute("open");
    expect(second).not.toHaveAttribute("name");
    await user.click(screen.getByText("Can I cancel a booking?"));
    expect(second).toHaveAttribute("open");
    expect(third).toHaveAttribute("id", "faq-cocuklar-icin-menu-var-mi");
  });

  it("columns: always-open definition list; FAQPage JSON-LD", async () => {
    const { container } = render(<main><Faq variant="columns" title="Questions" items={items} /></main>);
    expect(container.querySelector("details")).toBeNull();
    expect(container.querySelectorAll("dt")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
    const ld = faqJsonLd(items);
    expect(ld["@type"]).toBe("FAQPage");
    expect((ld.mainEntity as unknown[])[0]).toMatchObject({ "@type": "Question", name: "Is there parking?", acceptedAnswer: { "@type": "Answer", text: items[0]!.a } });
  });
});
