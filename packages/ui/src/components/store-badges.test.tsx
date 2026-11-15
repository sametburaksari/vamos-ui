import * as React from "react";
import { screen, within } from "@testing-library/react";
import { StoreBadges } from "./store-badges";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const IOS = "https://apps.example.com/app/ios";
const ANDROID = "https://apps.example.com/app/android";

describe("StoreBadges", () => {
  it("renders a named list of plain store links", async () => {
    const { container } = renderWithProviders(<StoreBadges appStore={IOS} googlePlay={ANDROID} />);
    const list = screen.getByRole("list", { name: "Get the app" });
    const links = within(list).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Download on the App Store", "Get it on Google Play"]);
    expect(links[0]).toHaveAttribute("href", IOS);
    expect(screen.getByRole("link", { name: "Get it on Google Play" })).toHaveAttribute("data-store", "google-play");
    expect(container.querySelector("img, image")).toBeNull();
    await expectNoA11yViolations(container);
  });

  it("adds a QR code for desktop, from a URL or the first store", async () => {
    const { container, rerender } = renderWithProviders(<StoreBadges appStore={IOS} qr="https://example.com/get" />);
    const qr = container.querySelector('[data-slot="store-badges-qr"]')!;
    expect(qr).toHaveClass("hidden", "lg:flex");
    expect(within(qr as HTMLElement).getByLabelText("QR code to open the app download page on your phone")).toBeInTheDocument();
    rerender(<StoreBadges googlePlay={ANDROID} qr={false} />);
    expect(container.querySelector('[data-slot="store-badges-qr"]')).toBeNull();
    rerender(<StoreBadges googlePlay={ANDROID} qr />);
    expect(container.querySelector('[data-slot="store-badges-qr"]')).not.toBeNull();
    await expectNoA11yViolations(container);
  });

  it("takes extra stores and localized labels", () => {
    renderWithProviders(
      <StoreBadges googlePlay={ANDROID} stores={[{ href: "https://store.example.com/app", lead: "Available on", name: "Example Store" }]} />,
      { messages: { storeBadges: { label: "Uygulamayı edinin", googlePlayLead: "Şuradan edinin" } } },
    );
    expect(screen.getByRole("list", { name: "Uygulamayı edinin" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Şuradan edinin Google Play" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Available on Example Store" })).toHaveAttribute("href", "https://store.example.com/app");
  });
});
