import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

function Faq(props: { type?: "single" | "multiple" }) {
  const items = (
    <>
      <AccordionItem value="refunds">
        <AccordionTrigger>How do refunds work?</AccordionTrigger>
        <AccordionContent>Refunds go back to the original card.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="seats">
        <AccordionTrigger meta="3 selected">Can I add seats later?</AccordionTrigger>
        <AccordionContent>Yes, seats are prorated.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="legacy" disabled>
        <AccordionTrigger>Legacy plans</AccordionTrigger>
        <AccordionContent>Archived.</AccordionContent>
      </AccordionItem>
    </>
  );
  return props.type === "multiple" ? <Accordion type="multiple">{items}</Accordion> : <Accordion type="single" collapsible>{items}</Accordion>;
}

describe("Accordion", () => {
  it("renders headings with buttons and no a11y violations", async () => {
    const { container } = render(<Faq />);
    const btn = screen.getByRole("button", { name: "How do refunds work?" });
    expect(btn.closest("h3")).not.toBeNull();
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("single: opens one at a time and can collapse", async () => {
    render(<Faq />);
    const a = screen.getByRole("button", { name: "How do refunds work?" });
    const b = screen.getByRole("button", { name: /Can I add seats later/ });
    await userEvent.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Refunds go back to the original card.")).toBeVisible();
    await userEvent.click(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(b);
    expect(b).toHaveAttribute("aria-expanded", "false");
  });

  it("multiple: keeps several open", async () => {
    render(<Faq type="multiple" />);
    const a = screen.getByRole("button", { name: "How do refunds work?" });
    const b = screen.getByRole("button", { name: /Can I add seats later/ });
    await userEvent.click(a);
    await userEvent.click(b);
    expect(a).toHaveAttribute("aria-expanded", "true");
    expect(b).toHaveAttribute("aria-expanded", "true");
  });

  it("arrow keys move between headers", async () => {
    render(<Faq />);
    screen.getByRole("button", { name: "How do refunds work?" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /Can I add seats later/ })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("button", { name: "How do refunds work?" })).toHaveFocus();
  });

  it("meta is part of the name; actions sit outside the toggle; headingLevel", () => {
    render(
      <Accordion type="multiple" headingLevel={2} variant="card">
        <AccordionItem value="seo">
          <AccordionTrigger meta="2 issues" actions={<button type="button">Reset</button>}>
            SEO
          </AccordionTrigger>
          <AccordionContent>Fields</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const toggle = screen.getByRole("button", { name: /^SEO ?, ?2 issues$/ });
    expect(toggle.closest("h2")).not.toBeNull();
    expect(toggle).not.toContainElement(screen.getByRole("button", { name: "Reset" }));
  });
});
