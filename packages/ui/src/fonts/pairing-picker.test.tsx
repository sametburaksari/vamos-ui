import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { FontPairingPicker } from "./pairing-picker";
import { fontPairings } from "./pairings";
import { expectNoA11yViolations, expectRovingFocus, keys, renderWithProviders } from "../../test/utils";

describe("FontPairingPicker", () => {
  it("renders a radio group of every pairing and passes axe (grid and list)", async () => {
    const { rerender } = renderWithProviders(<FontPairingPicker defaultValue="editorial" loadPreviews={false} />);
    expect(screen.getByRole("radiogroup", { name: "Type pairing" })).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(fontPairings.length);
    expect(screen.getByRole("radio", { name: /Editorial: Instrument Serif \/ Onest/ })).toHaveAttribute("aria-checked", "true");
    await expectNoA11yViolations();
    rerender(<FontPairingPicker layout="list" defaultValue="editorial" loadPreviews={false} />);
    await expectNoA11yViolations();
  });

  it("roving focus: arrows move and select, Home/End jump, wraps around", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<FontPairingPicker defaultValue="grotesk" onValueChange={onValueChange} loadPreviews={false} />);
    await user.tab();
    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toHaveFocus();
    expectRovingFocus(radios);
    await user.keyboard(keys.right);
    expect(radios[2]).toHaveFocus();
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("corporate", expect.objectContaining({ id: "corporate" }));
    await user.keyboard(keys.end);
    expect(radios[radios.length - 1]).toHaveFocus();
    await user.keyboard(keys.down);
    expect(radios[0]).toHaveFocus();
    await user.keyboard(keys.up);
    expect(radios[radios.length - 1]).toHaveFocus();
    await user.keyboard(keys.home);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expectRovingFocus(screen.getAllByRole("radio"));
  });

  it("selects on click, respects disabled and custom pairings", async () => {
    const onValueChange = vi.fn();
    const { user, rerender } = renderWithProviders(<FontPairingPicker pairings={fontPairings.slice(4, 7)} onValueChange={onValueChange} loadPreviews={false} />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getAllByRole("radio")[0]).toHaveAttribute("tabindex", "0");
    await user.click(screen.getByRole("radio", { name: /Product/ }));
    expect(onValueChange).toHaveBeenCalledWith("product", expect.anything());
    rerender(<FontPairingPicker pairings={fontPairings.slice(4, 7)} disabled onValueChange={onValueChange} loadPreviews={false} />);
    await user.click(screen.getByRole("radio", { name: /Fintech/ }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});
