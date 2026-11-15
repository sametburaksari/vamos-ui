import * as React from "react";
import { screen } from "@testing-library/react";
import { AccessibilityToolbar } from "./accessibility-toolbar";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.style.fontSize = "";
});

describe("AccessibilityToolbar", () => {
  it("is a labelled region with a size group and switches", async () => {
    const { container } = renderWithProviders(
      <AccessibilityToolbar>
        <a href="/accessibility">Accessibility statement</a>
      </AccessibilityToolbar>,
    );
    expect(screen.getByRole("region", { name: "Accessibility settings" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Text size" })).toBeInTheDocument();
    for (const name of ["High contrast", "Readable font", "Underline links", "Reduce motion"]) expect(screen.getByRole("switch", { name })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Accessibility statement" })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("applies settings to the target with kit tokens and axes, and resets them", async () => {
    const target = document.createElement("div");
    target.setAttribute("data-font", "editorial");
    document.body.appendChild(target);
    const { user } = renderWithProviders(<AccessibilityToolbar target={target} />);

    await user.click(screen.getByRole("switch", { name: "High contrast" }));
    await user.click(screen.getByRole("switch", { name: "Readable font" }));
    await user.click(screen.getByRole("switch", { name: "Underline links" }));
    await user.click(screen.getByRole("switch", { name: "Reduce motion" }));
    expect(target).toHaveAttribute("data-a11y-contrast", "high");
    expect(target).toHaveAttribute("data-font", "system");
    expect(target).toHaveAttribute("data-a11y-underline");
    expect(target).toHaveAttribute("data-motion", "off");

    screen.getByRole("radio", { name: "Standard text" }).focus();
    await user.keyboard(keys.right);
    await user.keyboard(keys.space);
    expect(screen.getByRole("radio", { name: "Large text" })).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.style.fontSize).toBe("115%");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(target).not.toHaveAttribute("data-a11y-contrast");
    expect(target).not.toHaveAttribute("data-motion");
    expect(target).toHaveAttribute("data-font", "editorial");
    expect(document.documentElement.style.fontSize).toBe("");
    target.remove();
  });

  it("remembers the choice under storageKey and restores it after mount", async () => {
    window.localStorage.setItem("display", JSON.stringify({ highContrast: true, textSize: "larger" }));
    const onChange = vi.fn();
    const { user } = renderWithProviders(<AccessibilityToolbar storageKey="display" onValueChange={onChange} features={["textSize", "highContrast"]} layout="stacked" hideTitle />);
    expect(screen.getByRole("switch", { name: "High contrast" })).toBeChecked();
    expect(screen.queryByRole("switch", { name: "Reduce motion" })).toBeNull();
    expect(document.documentElement).toHaveAttribute("data-a11y-contrast", "high");
    expect(document.documentElement.style.fontSize).toBe("130%");
    await user.click(screen.getByRole("switch", { name: "High contrast" }));
    expect(JSON.parse(window.localStorage.getItem("display")!)).toMatchObject({ highContrast: false, textSize: "larger" });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ highContrast: false }));
    expect(document.documentElement).not.toHaveAttribute("data-a11y-contrast");
  });

  it("can be controlled and translated", () => {
    renderWithProviders(
      <AccessibilityToolbar
        value={{ textSize: "default", highContrast: false, readableFont: false, underlineLinks: true, reduceMotion: false }}
        labels={{ region: "Erişilebilirlik ayarları", underlineLinks: "Bağlantıların altını çiz" }}
      />,
    );
    expect(screen.getByRole("region", { name: "Erişilebilirlik ayarları" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Bağlantıların altını çiz" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
    expect(document.documentElement).toHaveAttribute("data-a11y-underline");
  });
});
