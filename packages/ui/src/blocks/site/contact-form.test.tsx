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
    const { container } = render(<main><ContactForm title="Tell us about the *project*" fields={fields} info={{ phone: "+902160000000", email: "merhaba@ornek.com.tr", address: { line: "Rıhtım Caddesi 14", district: "Rasimpaşa", city: "Kadıköy", country: "TR" } }} privacyLink={{ href: "/privacy" }} privacyCheckbox /></main>);
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
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "ayse@ornek.com.tr");
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "Two clinics, one booking page.");
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    const done = await screen.findByRole("status");
    expect(done).toHaveTextContent("Thanks Ayşe");
    await waitFor(() => expect(done).toHaveFocus());
    expect(action).toHaveBeenCalledOnce();
  });

  it("URL action (PHP on static hosting): native POST before hydration, JSON fetch after; success fires the lead event", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = init.body as FormData;
      expect(body.get("_form")).toBeTruthy();
      expect((init.headers as Record<string, string>).Accept).toBe("application/json");
      return new Response(JSON.stringify({ status: "success" }), { headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const lead = vi.fn();
    window.addEventListener("vb:lead", lead);
    render(<ContactForm variant="minimal" action="/contact.php" />);
    await user.type(screen.getByRole("textbox", { name: /Full name/ }), "Ayşe Demir");
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "ayse@example.com");
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "Hello there.");
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    await screen.findByRole("status");
    expect(fetchMock).toHaveBeenCalledWith("/contact.php", expect.objectContaining({ method: "POST" }));
    expect(lead).toHaveBeenCalledOnce();
    window.removeEventListener("vb:lead", lead);
    vi.unstubAllGlobals();
  });

  it("posts to the edge function at /api/contact and reads its { ok, status } answer", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true, status: "success" }), { headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm variant="stacked" action="/api/contact" />);
    await user.type(screen.getByRole("textbox", { name: /Full name/ }), "Deniz Arslan");
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "deniz@example.com");
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "Annual accounts, please.");
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    await screen.findByRole("status");
    expect(fetchMock).toHaveBeenCalledWith("/api/contact", expect.objectContaining({ method: "POST" }));
    vi.unstubAllGlobals();
  });

  it("Turnstile: nothing loads without a site key; with one the script loads once and the widget renders in the form", async () => {
    const script = () => document.head.querySelectorAll('script[src^="https://challenges.cloudflare.com/turnstile/"]');
    const { unmount } = render(<ContactForm variant="stacked" action="/api/contact" />);
    expect(script()).toHaveLength(0);
    expect(document.querySelector("[data-turnstile]")).toBeNull();
    unmount();

    const renderWidget = vi.fn((el: HTMLElement, _opts: Record<string, unknown>) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "cf-turnstile-response";
      input.value = "token-1";
      el.appendChild(input);
      return "w1";
    });
    const remove = vi.fn();
    render(
      <>
        <ContactForm id="a" variant="stacked" action="/api/contact" turnstileSiteKey="0x4AAA-test" />
        <ContactForm id="b" variant="minimal" action="/api/contact" turnstileSiteKey="0x4AAA-test" />
      </>,
    );
    await waitFor(() => expect(script()).toHaveLength(1));
    expect(script()[0]).toHaveAttribute("src", "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit");
    (window as unknown as { turnstile: unknown }).turnstile = { render: renderWidget, remove };
    script()[0]!.dispatchEvent(new Event("load"));
    await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(2));
    expect(renderWidget.mock.calls[0]![1]).toMatchObject({ sitekey: "0x4AAA-test", theme: "auto" });
    const form = document.querySelector("form")!;
    expect(new FormData(form).get("cf-turnstile-response")).toBe("token-1");
    delete (window as unknown as { turnstile?: unknown }).turnstile;
  });

  it("URL action: server-side field errors come back into the form", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ status: "invalid", errors: { email: "This address bounced." } }))));
    render(<ContactForm variant="minimal" action="/contact.php" />);
    await user.type(screen.getByRole("textbox", { name: /Full name/ }), "Ayşe Demir");
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "ayse@example.com");
    await user.type(screen.getByRole("textbox", { name: /Message/ }), "Hello there.");
    await user.click(screen.getByRole("button", { name: /Send message/ }));
    expect(await screen.findByRole("link", { name: "This address bounced." })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Full name/ })).toHaveValue("Ayşe Demir");
    vi.unstubAllGlobals();
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
    expect(s.safeParse({ name: "Ayşe", email: "ayse@ornek.com.tr", message: "Hi", privacy: "on" }).success).toBe(true);
    expect(s.safeParse({ name: "", email: "x", message: "Hi" }).success).toBe(false);
    expect(contactFormBlock.schema.safeParse(contactFormBlock.sample()).success).toBe(true);
  });
  it("posts the privacy notice version in a hidden field", () => {
    const { container } = render(<ContactForm fields={fields} privacyLink={{ href: "/kvkk", version: "2026-11-01" }} privacyCheckbox />);
    expect(container.querySelector('input[type="hidden"][name="_notice"]')).toHaveValue("2026-11-01");
  });
});
