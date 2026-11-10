import { render, screen } from "@testing-library/react";
import { formatMessage } from "./message-format";
import { createLabels, useLabels } from "./labels";
import { LocaleProvider, useFormat, useLocale, useMessages, useText } from "./locale";
import { tr } from "../locales/tr";
import { en } from "../locales/en";

describe("formatMessage", () => {
  it("interpolates and formats numbers with the locale", () => {
    expect(formatMessage("Remove {label}", { label: "Design" })).toBe("Remove Design");
    expect(formatMessage("{from}–{to} of {total}", { from: 1, to: 20, total: 1340 }, "en-US")).toBe("1–20 of 1,340");
    expect(formatMessage("{from}–{to} / {total}", { from: 1, to: 20, total: 1340 }, "tr-TR")).toBe("1–20 / 1.340");
  });
  it("leaves unknown placeholders visible", () => {
    expect(formatMessage("Hello {name}")).toBe("Hello {name}");
  });
  it("selects plural branches with Intl.PluralRules", () => {
    const t = "{count, plural, =0 {No replies} one {# reply} other {# replies}}";
    expect(formatMessage(t, { count: 0 })).toBe("No replies");
    expect(formatMessage(t, { count: 1 })).toBe("1 reply");
    expect(formatMessage(t, { count: 1250 })).toBe("1,250 replies");
    expect(formatMessage("{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}", { n: 22 })).toBe("22nd");
  });
  it("supports select and nested placeholders", () => {
    const t = "{role, select, admin {Admin {name}} other {Member {name}}}";
    expect(formatMessage(t, { role: "admin", name: "Ada" })).toBe("Admin Ada");
    expect(formatMessage(t, { role: "x", name: "Ada" })).toBe("Member Ada");
  });
});

function Remove({ labels }: { labels?: { remove?: string } }) {
  const t = useLabels("badge", { remove: "Remove {label}", removeGeneric: "Remove" }, labels);
  return <span>{t("remove", { label: "Design" })}</span>;
}

describe("useLabels", () => {
  it("uses English defaults with no provider", () => {
    render(<Remove />);
    expect(screen.getByText("Remove Design")).toBeInTheDocument();
  });
  it("uses the dictionary, then the per-instance override", () => {
    const { rerender } = render(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <Remove />
      </LocaleProvider>,
    );
    expect(screen.getByText("Design kaldır")).toBeInTheDocument();
    rerender(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <Remove labels={{ remove: "Etiketi sil: {label}" }} />
      </LocaleProvider>,
    );
    expect(screen.getByText("Etiketi sil: Design")).toBeInTheDocument();
  });
  it("deep-merges partial messages and supports unknown namespaces", () => {
    function Probe() {
      const m = useMessages();
      const t = useLabels("wishlist", { add: "Add card" });
      return (
        <span>
          {m.common.remove} | {m.common.close} | {t("add")}
        </span>
      );
    }
    render(
      <LocaleProvider messages={{ common: { remove: "Move to bin" }, wishlist: { add: "New card" } }}>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByText("Move to bin | Close | New card")).toBeInTheDocument();
  });
  it("createLabels works without React", () => {
    const t = createLabels("footer", { rights: "All rights reserved." }, { messages: { footer: { rights: "Tüm hakları saklıdır." } } });
    expect(t("rights")).toBe("Tüm hakları saklıdır.");
    expect(t.labels.rights).toBe("Tüm hakları saklıdır.");
  });
});

describe("LocaleProvider", () => {
  function Probe() {
    const { locale, dir, timeZone, currency, t } = useLocale();
    const f = useFormat();
    const text = useText();
    return (
      <span data-testid="out">
        {[locale, dir, timeZone, currency, t("pagination.range", { from: 1, to: 20, total: 340 }), f.currency("1250.5"), text.upper("istanbul")].join(" | ")}
      </span>
    );
  }
  it("defaults to en-US, USD, UTC", () => {
    render(<Probe />);
    expect(screen.getByTestId("out").textContent).toBe("en-US | ltr | UTC | USD | 1–20 of 340 | $1,250.50 | ISTANBUL");
  });
  it("applies locale, currency, time zone and Turkish text rules", () => {
    render(
      <LocaleProvider locale="tr-TR" messages={tr} currency="TRY" timeZone="Europe/Istanbul">
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("out").textContent).toBe("tr-TR | ltr | Europe/Istanbul | TRY | 1–20 / 340 | ₺1.250,50 | İSTANBUL");
  });
  it("nested providers inherit and override", () => {
    render(
      <LocaleProvider locale="tr-TR" messages={tr} currency="TRY">
        <LocaleProvider messages={{ pagination: { range: "{from}-{to} arası, toplam {total}" } }}>
          <Probe />
        </LocaleProvider>
      </LocaleProvider>,
    );
    expect(screen.getByTestId("out").textContent).toContain("1-20 arası, toplam 340");
    expect(screen.getByTestId("out").textContent).toContain("₺1.250,50");
  });
  it("derives rtl from the locale", () => {
    render(
      <LocaleProvider locale="ar-EG">
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("out").textContent).toMatch(/^ar-EG \| rtl/);
  });
  it("keeps the old useFormat signatures working", () => {
    function Old() {
      const f = useFormat();
      return <span data-testid="old">{[f.currency(5, "TRY"), f.relative(-1, "day"), f.percent(0.5), f.number(1000)].join(" | ")}</span>;
    }
    render(<Old />);
    expect(screen.getByTestId("old").textContent).toBe("TRY 5.00 | yesterday | 50% | 1,000".replace(" ", " "));
  });
  it("tr dictionary covers every en key", () => {
    for (const ns of Object.keys(en) as (keyof typeof en)[]) expect(Object.keys(tr[ns]).sort()).toEqual(Object.keys(en[ns]).sort());
  });
});
