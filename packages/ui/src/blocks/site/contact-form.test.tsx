import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ContactForm } from "./contact-form";
import { contactFormBlock, contactFormSchema } from "./registry-2";
import type { ContactFieldConfig, SiteFormState } from "./shared/site-form";

const fields: ContactFieldConfig[] = [
  { name: "name", required: true },
  { name: "email", required: true },
  { name: "budget", options: ["Under $5k", "$5k–15k", "$15k+"] },
  { name: "message", required: true },
];

describe("ContactForm", () => {
  it("split: contact details and an accessible form with autocomplete tokens", async () => {
    const { container } = render(<main><ContactForm title="Tell us about the *project*" fields={fields} info={{ phone: "+902160000000", email: "hello@vamos.ist", address: { line: "Rıhtım Caddesi 14", district: "Rasimpaşa", city: "Kadıköy", country: "TR" } }} privacyLink={{ href: "/privacy" }} privacyCheckbox /></main>);
    expect(screen.getByRole("link", { name: "+90 216 000 00 00" })).toHaveAttribute("href", "tel:+902160000000");
    expect(screen.getByRole("textbox", { name: /Full name/ })).toHaveAttribute("autocomplete", "name");
    expect(screen.getByRole("textbox", { name: /Email/ })).toHaveAttribute("type", "email");
    expect(screen.getByRole("combobox", { name: /Budget/ })).toBeInTheDocument();
    const privacy = screen.getByRole("checkbox", { name: /privacy notice/ });
    expect(privacy).not.toBeChecked();
    expect(privacy).toBeRequired();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("invalid submit: error summary (role=alert) linking to fields, focus moves there, values kept", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (): Promise<SiteFormState> => ({ status: "success" }));
    const { container } = render(<main><ContactForm variant="stacked" fields={fields} action={action} privacyLink={{ href: "/privacy" }} privacyCheckbox /></main>);
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "ayse@");
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Fix 4 fields to send the form");
    expect(alert).toHaveFocus();
    expect(screen.getByRole("link", { name: "Enter an email address like name@company.com." })).toHaveAttribute("href", expect.stringMatching(/-email$/));
    expect(screen.getByRole("textbox", { name: /Email/ })).toHaveValue("ayse@");
    expect(screen.getByRole("textbox", { name: /Email/ })).toHaveAttribute("aria-invalid", "true");
    expect(action).not.toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("valid submit calls the action and replaces the form with the focused success message", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (_p: SiteFormState, d: FormData): Promise<SiteFormState> => {
      expect(d.get("name")).toBe("Ayşe Demir");
      return { status: "success" };
    });
    render(<ContactForm variant="minimal" action={action} successMessage="Thanks Ayşe — we’ll call you today." />);
    await user.type(screen.getByRole("textbox", { name: /Full name/ }), "Ayşe Demir");
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "ayse@kidwell.com.tr");
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "Two clinics, one booking page.");
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    const done = await screen.findByRole("status");
    expect(done).toHaveTextContent("Thanks Ayşe");
    await waitFor(() => expect(done).toHaveFocus());
    expect(action).toHaveBeenCalledOnce();
  });

  it("server error shows the fallback phone; honeypot is hidden from people", async () => {
    const { container } = render(<ContactForm info={{ phone: "+902160000000" }} showInfo={false} initialState={{ status: "error", message: "Webhook timed out" }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn’t send your message.");
    expect(screen.getByRole("link", { name: "+90 216 000 00 00" })).toBeInTheDocument();
    const hp = container.querySelector('input[name="website"]')!;
    expect(hp.closest("[aria-hidden]")).toBeTruthy();
    expect(hp).toHaveAttribute("tabindex", "-1");
  });

  it("zod schema helper and registry preview", () => {
    const s = contactFormSchema(fields, { privacyCheckbox: true });
    expect(s.safeParse({ name: "Ayşe", email: "ayse@kidwell.com.tr", message: "Hi", privacy: "on" }).success).toBe(true);
    expect(s.safeParse({ name: "", email: "x", message: "Hi" }).success).toBe(false);
    expect(contactFormBlock.schema.safeParse(contactFormBlock.sample()).success).toBe(true);
  });
});
