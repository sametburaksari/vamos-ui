import * as React from "react";
import { screen } from "@testing-library/react";
import { PrintButton, PrintStyles, printStyles } from "./print-button";
import { tr } from "../locales/tr";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("PrintButton", () => {
  it("opens the print dialog with the file name as the title, then restores it", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {
      expect(document.title).toBe("cv-2026");
      window.dispatchEvent(new Event("afterprint"));
    });
    document.title = "Page title";
    const onAfterPrint = vi.fn();
    const { user, container } = renderWithProviders(<PrintButton fileName="cv-2026" onAfterPrint={onAfterPrint}>Download PDF</PrintButton>);
    const button = screen.getByRole("button", { name: "Download PDF" });
    expect(button).toHaveAccessibleDescription("Opens the print dialog. Choose Save as PDF to download a copy.");
    expect(button).toHaveAttribute("data-print", "hide");
    await user.click(button);
    expect(print).toHaveBeenCalledTimes(1);
    expect(document.title).toBe("Page title");
    expect(onAfterPrint).toHaveBeenCalledTimes(1);
    await expectNoA11yViolations(container);
    print.mockRestore();
  });

  it("has a default label per locale", () => {
    renderWithProviders(<PrintButton noHint />, { locale: "tr-TR", messages: tr });
    expect(screen.getByRole("button", { name: "Yazdır" })).not.toHaveAccessibleDescription();
  });
});

describe("printStyles", () => {
  it("hides chrome, prints link addresses and honours options", () => {
    const css = printStyles();
    expect(css).toContain("@media print{");
    expect(css).toContain('[data-print="hide"],nav,');
    expect(css).toContain('a[href^="http"]:not([data-print-url="off"])::after');
    expect(css).toContain("@page{margin:16mm}");
    const custom = printStyles({ hideChrome: false, showUrls: false, hide: [".ad"], size: "A4", margin: "1cm" });
    expect(custom).not.toContain("nav,");
    expect(custom).not.toContain("::after{content");
    expect(custom).toContain('[data-print="hide"],.ad{display:none!important}');
    expect(custom).toContain("@page{margin:1cm;size:A4}");
  });

  it("PrintStyles renders one style tag", () => {
    const { container } = renderWithProviders(<PrintStyles nonce="abc" />);
    const style = container.querySelector("style[data-vui-print]")!;
    expect(style).toHaveAttribute("nonce", "abc");
    expect(style.textContent).toBe(printStyles());
  });
});
