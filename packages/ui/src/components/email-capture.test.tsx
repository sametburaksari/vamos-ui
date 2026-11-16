import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { EmailCapture } from "./email-capture";
import { tr } from "../locales/tr";
import { validateContactForm } from "../blocks/site/shared/site-form";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("EmailCapture", () => {
  it("is a labelled email field with a submit button and a privacy line", async () => {
    const { container } = renderWithProviders(<EmailCapture hint="One email a month." privacyLink={{ href: "/privacy" }} />);
    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAccessibleDescription("One email a month.");
    expect(screen.getByRole("button", { name: "Subscribe" })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("link", { name: "privacy notice" })).toHaveAttribute("href", "/privacy");
    expect(container.querySelector('input[name="website"]')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("validates on submit, ties the error to the input and focuses it", async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<EmailCapture onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    const input = await screen.findByRole("textbox", { name: "Email address" });
    await waitFor(() => expect(input).toHaveAccessibleDescription("Enter your email address."), { timeout: 10_000 });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveFocus();
    await user.type(input, "not-an-email");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveAccessibleDescription("Enter an email address like name@example.com."), { timeout: 10_000 });
    expect(screen.getByRole("textbox")).toHaveValue("not-an-email");
    expect(onSubmit).not.toHaveBeenCalled();
  }, 30_000);

  it("calls onSubmit and replaces the form with a focused status", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(<EmailCapture onSubmit={onSubmit} successMessage="You're on the list." />);
    await user.type(screen.getByRole("textbox"), "  reader@example.com ");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("You're on the list.");
    expect(status).toHaveFocus();
    expect(onSubmit).toHaveBeenCalledWith("reader@example.com", expect.any(FormData));
  });

  it("shows the error state when the handler rejects", async () => {
    const { user } = renderWithProviders(<EmailCapture onSubmit={() => Promise.reject(new Error("List unavailable"))} />);
    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't sign you up. Try again in a moment.List unavailable");
    expect(screen.getByRole("textbox")).toHaveValue("reader@example.com");
  });

  it("requires the privacy checkbox and posts the ContactForm fields to a server action", async () => {
    const action = vi.fn(async (_prev: unknown, data: FormData) => {
      const v = validateContactForm([{ name: "email", required: true }], data, { privacyCheckbox: true, spamMinMs: 0 });
      return v.state;
    });
    const { user, container } = renderWithProviders(<EmailCapture layout="stacked" action={action} privacyCheckbox privacyLink={{ href: "/kvkk", version: "2026-01" }} />);
    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    const box = await screen.findByRole("checkbox", { name: "I have read the privacy notice." });
    await waitFor(() => expect(box).toHaveAccessibleDescription("Please confirm you have read the privacy notice."));
    expect(action).not.toHaveBeenCalled();
    await user.click(box);
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks — check your inbox to confirm.");
    const data = action.mock.calls[0]![1];
    expect(data.get("privacy")).toBe("on");
    expect(data.get("_notice")).toBe("2026-01");
    expect(data.get("_form")).toBeTruthy();
    expect(container.querySelector('[data-slot="email-capture"]')).toHaveAttribute("data-state", "success");
  });

  it("posts to a URL as a plain form before hydration and fetches JSON after", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ status: "invalid", errors: { email: "Already subscribed." } })));
    const { user } = renderWithProviders(<EmailCapture action="/api/subscribe" />);
    await user.type(screen.getByRole("textbox"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));
    await waitFor(() => expect(screen.getByRole("textbox")).toHaveAccessibleDescription("Already subscribed."));
    expect(fetchMock).toHaveBeenCalledWith("/api/subscribe", expect.objectContaining({ method: "POST", headers: { Accept: "application/json" } }));
    fetchMock.mockRestore();
  });

  it("speaks Turkish with the KVKK link wording", () => {
    renderWithProviders(<EmailCapture privacyLink={{ href: "/kvkk" }} />, { locale: "tr-TR", messages: tr });
    expect(screen.getByRole("textbox", { name: "E-posta adresi" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abone ol" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "KVKK aydınlatma" })).toBeInTheDocument();
  });
});
