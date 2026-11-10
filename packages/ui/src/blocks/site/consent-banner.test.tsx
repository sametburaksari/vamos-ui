import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ConsentBanner, ConsentDefaults } from "./consent-banner";
import { Footer } from "./footer";
import { CONSENT_COOKIE, readConsent, writeConsent } from "./shared/consent";
import { site2LabelsTr } from "./shared/labels-2";
import { consentBlock } from "./registry-2";

const clear = () => {
  document.cookie = `${CONSENT_COOKIE}=; max-age=0; path=/`;
};

describe("ConsentBanner", () => {
  beforeEach(clear);

  it("bar: a non-modal labelled region with equal Reject / Accept buttons", async () => {
    const { container } = render(<main><ConsentBanner policyLink={{ href: "/cookies" }} contained /></main>);
    const region = await screen.findByRole("region", { name: "Cookie consent" });
    const reject = within(region).getByRole("button", { name: "Reject all" });
    const accept = within(region).getByRole("button", { name: "Accept all" });
    expect(reject.className).toBe(accept.className);
    expect(document.activeElement).toBe(document.body); // never steals focus
    expect(within(region).getByRole("link", { name: "Cookie policy" })).toHaveAttribute("href", "/cookies");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("reject all stores a denial and hides the banner", async () => {
    const user = userEvent.setup();
    render(<ConsentBanner version={2} />);
    await user.click(await screen.findByRole("button", { name: "Reject all" }));
    expect(screen.queryByRole("region")).toBeNull();
    expect(readConsent(2)?.c).toEqual({ functional: 0, analytics: 0, marketing: 0 });
  });

  it("is not shown again after a choice, but a newer version asks again", async () => {
    writeConsent({ analytics: true }, 1);
    const { unmount } = render(<ConsentBanner version={1} />);
    await waitFor(() => expect(screen.queryByRole("region")).toBeNull());
    unmount();
    render(<ConsentBanner version={2} />);
    expect(await screen.findByRole("region")).toBeInTheDocument();
  });

  it("preferences: switches start off, necessary is locked, saving stores the selection", async () => {
    const user = userEvent.setup();
    render(<ConsentBanner variant="box" contained locale="tr-TR" labels={site2LabelsTr} />);
    await user.click(await screen.findByRole("button", { name: "Tercihler" }));
    const dialog = await screen.findByRole("dialog", { name: "Çerez tercihleri" });
    const switches = within(dialog).getAllByRole("switch");
    expect(switches).toHaveLength(4);
    expect(switches[0]).toBeChecked();
    expect(switches[0]).toBeDisabled();
    switches.slice(1).forEach((s) => expect(s).not.toBeChecked());
    await user.click(switches[2]!); // analytics
    await user.click(within(dialog).getByRole("button", { name: "Seçimleri kaydet" }));
    expect(readConsent()?.c).toEqual({ functional: 0, analytics: 1, marketing: 0 });
  });

  it("the footer's Cookie settings button reopens the preferences", async () => {
    const user = userEvent.setup();
    writeConsent({}, 1);
    render(
      <>
        <ConsentBanner />
        <Footer brand={{ name: "Meyhane" }} legalLinks={[{ href: "/privacy", label: "Privacy" }]} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(await screen.findByRole("dialog", { name: "Cookie preferences" })).toBeInTheDocument();
  });

  it("ConsentDefaults renders the Consent Mode snippet; preview validates", () => {
    const { container } = render(<ConsentDefaults version={3} />);
    expect(container.querySelector("script")?.innerHTML).toContain("'consent','default'");
    expect(consentBlock.schema.safeParse(consentBlock.sample()).success).toBe(true);
  });
});
