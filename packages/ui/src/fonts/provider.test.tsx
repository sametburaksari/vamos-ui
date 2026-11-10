import { screen } from "@testing-library/react";
import { FontProvider, useFontPairing } from "./provider";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function Probe() {
  const { pairing, setPairing } = useFontPairing();
  return (
    <div>
      <h2 className="font-display">Spring menu</h2>
      <p>Current: {pairing.label}</p>
      <button type="button" onClick={() => setPairing("bistro")}>Use Bistro</button>
    </div>
  );
}

describe("FontProvider", () => {
  it("scopes the pairing tokens to its wrapper and switches via useFontPairing", async () => {
    const { user, container } = renderWithProviders(<FontProvider defaultPairing="boutique" load={false}><Probe /></FontProvider>);
    const wrap = container.querySelector<HTMLElement>("[data-slot=font-provider]")!;
    expect(wrap.dataset.font).toBe("boutique");
    expect(wrap.style.getPropertyValue("--font-heading")).toMatch(/^"Fraunces"/);
    await user.click(screen.getByRole("button", { name: "Use Bistro" }));
    expect(screen.getByText("Current: Bistro")).toBeInTheDocument();
    expect(wrap.style.getPropertyValue("--font-heading")).toMatch(/^"Young Serif"/);
    await expectNoA11yViolations();
  });

  it("document scope writes to <html> and restores on unmount", () => {
    const h = document.documentElement;
    h.dataset.font = "editorial";
    const { unmount } = renderWithProviders(<FontProvider scope="document" pairing="product" load={false}><Probe /></FontProvider>);
    expect(h.dataset.font).toBe("product");
    expect(h.style.getPropertyValue("--font-ui")).toMatch(/^"Geist"/);
    unmount();
    expect(h.dataset.font).toBe("editorial");
    expect(h.style.getPropertyValue("--font-ui")).toBe("");
  });

  it("falls back to Editorial outside a provider", () => {
    renderWithProviders(<Probe />);
    expect(screen.getByText("Current: Editorial")).toBeInTheDocument();
  });
});
