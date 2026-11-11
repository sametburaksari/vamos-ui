import * as React from "react";
import { screen } from "@testing-library/react";
import { QrCode, encodeQr, qrPath } from "./qr-code";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("encodeQr", () => {
  it("picks the smallest version and keeps the finder patterns", () => {
    const qr = encodeQr("HELLO", { errorCorrection: "L" });
    expect(qr.version).toBe(1);
    expect(qr.size).toBe(21);
    // Top-left finder: dark outer ring, light gap, dark 3×3 core.
    expect(qr.modules[0]!.slice(0, 7)).toEqual([true, true, true, true, true, true, true]);
    expect(qr.modules[1]!.slice(0, 7)).toEqual([true, false, false, false, false, false, true]);
    expect(qr.modules[3]![3]).toBe(true);
    // Dark module next to the bottom-left finder.
    expect(qr.modules[qr.size - 8]![8]).toBe(true);
  });

  it("grows the version with the payload and level, and encodes UTF-8", () => {
    expect(encodeQr("x".repeat(300), { errorCorrection: "H" }).version).toBe(18);
    expect(encodeQr("z".repeat(2000), { errorCorrection: "M" }).version).toBe(38);
    expect(encodeQr("ğüşıöç", { errorCorrection: "Q" }).version).toBe(2); // 12 UTF-8 bytes
    expect(() => encodeQr("a".repeat(3000), { errorCorrection: "H" })).toThrow(RangeError);
  });

  it("is deterministic and draws one path", () => {
    const a = encodeQr("https://example.com/invite/7Hq2");
    const b = encodeQr("https://example.com/invite/7Hq2");
    expect(a.mask).toBe(b.mask);
    expect(qrPath(a, 2)).toBe(qrPath(b, 2));
    expect(qrPath(a, 2).startsWith("M2 2h7")).toBe(true);
  });
});

describe("QrCode", () => {
  it("renders a labelled image on a light plate and passes axe", async () => {
    const { container } = renderWithProviders(<QrCode value="otpauth://totp/Kiln:ada@example.com?secret=JBSWY3DPEHPK3PXP" aria-label="QR code for your authenticator app" />, { theme: { dark: true } });
    const img = screen.getByRole("img", { name: "QR code for your authenticator app" });
    expect(img).toHaveClass("light");
    expect(img.querySelector("path")!.getAttribute("d")).toMatch(/^M2 2h7/);
    await expectNoA11yViolations(container);
  });

  it("boosts error correction for a centre mark and shows the fallback when too long", () => {
    renderWithProviders(
      <>
        <QrCode value="https://example.com" aria-label="With mark">
          <svg aria-hidden="true" />
        </QrCode>
        <QrCode value={"a".repeat(4000)} aria-label="Too long" fallback="Link too long" />
      </>,
    );
    expect(screen.getByRole("img", { name: "With mark" }).querySelector("[data-slot=qr-code-mark]")).not.toBeNull();
    expect(screen.getByRole("img", { name: "Too long" })).toHaveTextContent("Link too long");
  });
});
