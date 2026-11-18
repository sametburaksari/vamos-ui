import { describe, expect, it } from "vitest";
import { formatMoney } from "./pricing";

describe("formatMoney", () => {
  it("keeps the Intl default symbol", () => {
    expect(formatMoney(340000, "TRY", "en-US").replace(/\s/g, " ")).toBe("TRY 3,400");
    expect(formatMoney(14990, "TRY", "tr-TR")).toBe("₺149,90");
  });
  it("takes currencyDisplay", () => {
    expect(formatMoney(340000, "TRY", "en-US", "narrowSymbol")).toBe("₺3,400");
    expect(formatMoney(14990, "TRY", "en-US", "narrowSymbol")).toBe("₺149.90");
    expect(formatMoney(340000, "TRY", "en-US", "code")).toMatch(/^TRY\s3,400$/);
  });
});
