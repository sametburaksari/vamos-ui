import * as React from "react";
import { screen } from "@testing-library/react";
import { ReferralPanel } from "./referral-panel";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

const URL_ = "https://example.com/r/k7q2";

describe("ReferralPanel", () => {
  it("is a labelled region with the position as one sentence and the big number hidden", async () => {
    const { container } = renderWithProviders(<ReferralPanel position={412} total={2380} shareUrl={URL_} referrals={2} goal={3} reward="early access" />);
    expect(screen.getByRole("region", { name: "Invite friends" })).toBeInTheDocument();
    expect(screen.getByText("You are number 412 of 2,380 in line.")).toHaveAttribute("aria-live", "polite");
    expect(container.querySelector('[data-slot="referral-position"] [aria-hidden="true"]')).toHaveTextContent("#412of 2,380");
    expect(screen.getByRole("textbox", { name: "Your invite link" })).toHaveValue(URL_);
    const bar = screen.getByRole("progressbar", { name: "Invites toward early access" });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "3");
    expect(screen.getByText("1 more friend to unlock early access")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("copies the link and announces it", async () => {
    const onCopy = vi.fn();
    const { user } = renderWithProviders(<ReferralPanel shareUrl={URL_} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(await navigator.clipboard.readText()).toBe(URL_);
    expect(onCopy).toHaveBeenCalledWith(URL_);
    expect(screen.getByRole("status")).toHaveTextContent("Invite link copied");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("offers the native share sheet only where it exists", async () => {
    const { unmount } = renderWithProviders(<ReferralPanel shareUrl={URL_} />);
    expect(screen.queryByRole("button", { name: "Share" })).not.toBeInTheDocument();
    unmount();
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    const onShare = vi.fn();
    const { user } = renderWithProviders(<ReferralPanel shareUrl={URL_} shareText="Join me" onShare={onShare} />);
    await user.click(await screen.findByRole("button", { name: "Share" }));
    expect(share).toHaveBeenCalledWith({ url: URL_, text: "Join me", title: undefined });
    expect(onShare).toHaveBeenCalledWith(URL_);
    delete (navigator as { share?: unknown }).share;
  });

  it("counts referrals without a goal and marks an unlocked reward", () => {
    const { unmount } = renderWithProviders(<ReferralPanel shareUrl={URL_} referrals={0} />);
    expect(screen.getByText("Nobody has joined with your link yet")).toBeInTheDocument();
    unmount();
    const { container } = renderWithProviders(<ReferralPanel shareUrl={URL_} referrals={4} goal={3} />);
    expect(screen.getByText("your reward unlocked")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="referral-panel"]')).toHaveAttribute("data-state", "unlocked");
  });

  it("speaks Turkish from the built-in dictionary", () => {
    renderWithProviders(<ReferralPanel position={7} shareUrl={URL_} referrals={1} goal={3} reward="erken erişim" />, { locale: "tr-TR", messages: tr });
    expect(screen.getByRole("region", { name: "Arkadaşlarınızı davet edin" })).toBeInTheDocument();
    expect(screen.getByText("Sırada 7. kişisiniz.")).toBeInTheDocument();
    expect(screen.getByText("erken erişim için 2 arkadaş daha")).toBeInTheDocument();
  });
});
