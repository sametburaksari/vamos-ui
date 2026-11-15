import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { AddressField, RegionSelect, formatAddress, type Address } from "./address-field";
import { Field } from "./input";
import { LocaleProvider } from "../lib/locale";
import { loadAddressFormats } from "../locale-data/world/formats";
import { trAddress } from "../locale-data/tr/address";
import { createTrNeighbourhoodLoader, withNeighbourhoods, type TrNeighbourhoodFile } from "../locale-data/tr/neighbourhoods";

// A small fixture in the shape of the bundled province files (Kadıköy is district 1421).
const fixtureSource = withNeighbourhoods(
  trAddress,
  createTrNeighbourhoodLoader(async (plate): Promise<TrNeighbourhoodFile> => ({
    source: "fixture",
    license: "MIT",
    generated: "2026-11-15",
    plate,
    districts: plate === 34 ? { "1421": [["Caferağa", "34710"], ["Rasimpaşa", "34716"]] } : ({} as TrNeighbourhoodFile["districts"]),
  })),
);

describe("formatAddress", () => {
  it("follows country conventions", () => {
    expect(formatAddress({ country: "TR", line1: "Caferağa Mah. Moda Cad. No: 12", postalCode: "34710", region2: "Kadıköy", region1: "İstanbul" })).toEqual([
      "Caferağa Mah. Moda Cad. No: 12",
      "34710 Kadıköy/İstanbul",
      expect.stringMatching(/T(ü|u)rk/),
    ]);
    expect(formatAddress({ country: "US", line1: "548 Market St", region2: "San Francisco", region1: "CA", postalCode: "94104" }, { includeCountry: false })).toEqual(["548 Market St", "San Francisco, CA 94104"]);
  });
});

describe("AddressField", () => {
  it("cascades province → district and clears the district when the province changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<AddressField legend="Billing address" name="billing" defaultValue={{ country: "TR" }} onValueChange={onValueChange} />);
    const group = screen.getByRole("group", { name: "Billing address" });
    const province = await within(group).findByRole("combobox", { name: "Province" });
    const district = within(group).getByRole("combobox", { name: "District" });
    expect(district).toBeDisabled();
    await screen.findByRole("option", { name: "İstanbul" });
    await user.selectOptions(province, "İstanbul");
    await screen.findByRole("option", { name: "Kadıköy" });
    expect(district).toBeEnabled();
    await user.selectOptions(district, "Kadıköy");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ country: "TR", region1: "İstanbul", region2: "Kadıköy" }));
    await user.selectOptions(province, "İzmir");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ region1: "İzmir", region2: undefined }));
    expect(screen.getByText("District cleared")).toBeInTheDocument();
    expect(province).toHaveAttribute("name", "billing[region1]");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("follows the chosen country's format and warns on a mismatched TR postal code", async () => {
    const user = userEvent.setup();
    function Demo() {
      const [a, setA] = React.useState<Address>({ country: "TR", region1: "Ankara" });
      return <AddressField legend="Address" value={a} onValueChange={setA} />;
    }
    render(<Demo />);
    await screen.findByRole("option", { name: "Ankara" });
    await user.type(screen.getByRole("textbox", { name: "Postal code" }), "34710");
    await user.tab();
    expect(screen.getByText("Postal codes in Ankara start with 06")).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Country" }), "DE");
    expect(screen.getByRole("textbox", { name: "City" })).toBeInTheDocument();
    // German addresses have no state line.
    expect(screen.queryByRole("textbox", { name: /State/ })).toBeNull();
  });

  it("read-only renders a formatted address", () => {
    render(<AddressField legend="Head office" readOnly value={{ country: "TR", region1: "İstanbul", region2: "Maltepe", line1: "Rasimpaşa Mah. Rıhtım Cad. No: 14", postalCode: "34844" }} />);
    expect(screen.getByText("34844 Maltepe/İstanbul")).toBeInTheDocument();
  });
});

describe("AddressField neighbourhoods", () => {
  it("adds a neighbourhood picker for a source with a neighbourhood level and fills the postal code", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<AddressField legend="Delivery address" sources={{ TR: fixtureSource }} defaultValue={{ country: "TR" }} onValueChange={onValueChange} />);
    const neighbourhood = await screen.findByRole("combobox", { name: "Neighbourhood" });
    expect(neighbourhood).toBeDisabled();
    await screen.findByRole("option", { name: "İstanbul" });
    await user.selectOptions(screen.getByRole("combobox", { name: "Province" }), "İstanbul");
    await screen.findByRole("option", { name: "Kadıköy" });
    await user.selectOptions(screen.getByRole("combobox", { name: "District" }), "Kadıköy");
    await screen.findByRole("option", { name: "Caferağa Mah." });
    await user.selectOptions(neighbourhood, "Caferağa Mah.");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ region2: "Kadıköy", region3: "Caferağa Mah.", postalCode: "34710" }));
    // A code the visitor typed is never overwritten; an auto-filled one follows the neighbourhood.
    await user.selectOptions(neighbourhood, "Rasimpaşa Mah.");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ region3: "Rasimpaşa Mah.", postalCode: "34716" }));
    const postal = screen.getByRole("textbox", { name: "Postal code" });
    await user.clear(postal);
    await user.type(postal, "34000");
    await user.selectOptions(neighbourhood, "Caferağa Mah.");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ region3: "Caferağa Mah.", postalCode: "34000" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "District" }), "Üsküdar");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ region2: "Üsküdar", region3: undefined }));
    expect(screen.getByText("Neighbourhood cleared")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the free-text neighbourhood for the default source and formats it in front of the street", () => {
    render(<AddressField legend="Address" fields={["region3"]} defaultValue={{ country: "TR" }} />);
    expect(screen.getByRole("textbox", { name: "Neighbourhood" })).toBeInTheDocument();
    expect(formatAddress({ country: "TR", region3: "Caferağa Mah.", line1: "Moda Cad. No: 12", region2: "Kadıköy", region1: "İstanbul" }, { includeCountry: false })).toEqual([
      "Caferağa Mah. Moda Cad. No: 12",
      "Kadıköy/İstanbul",
    ]);
    expect(formatAddress({ country: "TR", region3: "Caferağa Mah.", line1: "Caferağa Mahallesi Moda Cad. No: 12" }, { includeCountry: false })).toEqual(["Caferağa Mahallesi Moda Cad. No: 12"]);
  });
});

describe("RegionSelect", () => {
  it("works alone with a Field", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Branch province">
        <RegionSelect source={trAddress} level="province" onValueChange={onValueChange} />
      </Field>,
    );
    const select = await screen.findByRole("combobox", { name: "Branch province" });
    await screen.findByRole("option", { name: "Antalya" });
    await user.selectOptions(select, "Antalya");
    expect(onValueChange).toHaveBeenCalledWith("Antalya");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("AddressField for every country", () => {
  beforeAll(() => loadAddressFormats());
  const labelsOf = (container: HTMLElement) => [...container.querySelectorAll("label")].map((l) => l.textContent?.replace(/\s*\*$/, "").trim());

  it("lays out and names the parts the way the country writes them", async () => {
    const { container, rerender } = render(<AddressField legend="Address" defaultValue={{ country: "US" }} />);
    expect(labelsOf(container)).toEqual(["Country", "Street address", "Apartment, suite, building(optional)", "City", "State", "ZIP code"]);
    rerender(<AddressField key="de" legend="Address" defaultValue={{ country: "DE" }} />);
    expect(labelsOf(container)).toEqual(["Country", "Street address", "Apartment, suite, building(optional)", "Postal code", "City"]);
    rerender(<AddressField key="ae" legend="Address" defaultValue={{ country: "AE" }} />);
    expect(labelsOf(container)).toEqual(["Country", "Street address", "Apartment, suite, building(optional)", "Emirate"]);
    rerender(<AddressField key="in" legend="Address" defaultValue={{ country: "IN" }} />);
    expect(labelsOf(container)).toContain("PIN code");
    rerender(<AddressField key="jp" legend="Address" defaultValue={{ country: "JP" }} />);
    expect(labelsOf(container)).toEqual(["Country", "Street address", "Apartment, suite, building(optional)", "Prefecture", "Postal code"]);
    rerender(
      <LocaleProvider locale="ja-JP">
        <AddressField key="jp-ja" legend="Address" defaultValue={{ country: "JP" }} />
      </LocaleProvider>,
    );
    // In Japanese the local order: postal code, prefecture, then the street.
    expect(labelsOf(container)).toEqual(["Country", "Postal code", "Prefecture", "Street address", "Apartment, suite, building(optional)"]);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("checks and normalises postal codes against the country pattern", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<AddressField legend="Address" defaultValue={{ country: "GB" }} onValueChange={onValueChange} />);
    const postal = screen.getByRole("textbox", { name: "Postal code" });
    expect(postal).toHaveAttribute("placeholder", "EC1Y 8SY");
    expect(postal).not.toHaveAttribute("inputmode");
    await user.type(postal, "ec1y 8sy");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ postalCode: "EC1Y 8SY" }));
    await user.clear(postal);
    await user.type(postal, "12345");
    await user.tab();
    expect(screen.getByText("Expected a code like EC1Y 8SY")).toBeInTheDocument();
  });

  it('required="auto" uses the country rules', () => {
    render(<AddressField legend="Address" defaultValue={{ country: "US" }} required="auto" />);
    expect(screen.getByRole("textbox", { name: /ZIP code/ })).toBeRequired();
    expect(screen.getByRole("combobox", { name: /State/ })).toBeRequired();
    expect(screen.getByRole("textbox", { name: /Apartment/ })).not.toBeRequired();
  });

  it("read-only prints the country's format", () => {
    render(<AddressField legend="Office" readOnly value={{ country: "JP", postalCode: "154-0023", region1: "Tokyo", line1: "1-2-3 Wakabayashi" }} />);
    expect(screen.getByText("1-2-3 Wakabayashi, Tokyo")).toBeInTheDocument();
    expect(screen.getByText("154-0023")).toBeInTheDocument();
  });
});

describe("subdivisions", () => {
  it("lists a country's states with the values the post expects", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<AddressField legend="Address" defaultValue={{ country: "US" }} onValueChange={onValueChange} />);
    const state = screen.getByRole("combobox", { name: "State" });
    await screen.findByRole("option", { name: "California" });
    await user.selectOptions(state, "California");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ region1: "CA" }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows local names in the country's language and Latin ones elsewhere", async () => {
    const { unmount } = render(<AddressField legend="Address" defaultValue={{ country: "JP" }} />);
    expect(await screen.findByRole("option", { name: "Tokyo" })).toHaveAttribute("value", "Tokyo");
    unmount();
    render(
      <LocaleProvider locale="ja-JP">
        <AddressField legend="Address" defaultValue={{ country: "JP" }} />
      </LocaleProvider>,
    );
    expect(await screen.findByRole("option", { name: "東京都" })).toHaveAttribute("value", "東京都");
    // Source order (north to south) in Japanese.
    expect(within(screen.getByRole("combobox", { name: "Prefecture" })).getAllByRole("option")[1]).toHaveTextContent("北海道");
  });

  it("selects a stored name or ISO code of a known subdivision, and keeps text for countries without a list", async () => {
    render(
      <>
        <Field label="Region">
          <RegionSelect country="US" defaultValue="US-CA" />
        </Field>
        <AddressField legend="Address" defaultValue={{ country: "AE" }} subdivisions={false} />
      </>,
    );
    await screen.findByRole("option", { name: "California" });
    expect(screen.getByRole("combobox", { name: "Region" })).toHaveValue("CA");
    expect(screen.getByRole("textbox", { name: "Emirate" })).toBeInTheDocument();
  });

  it("uses a custom loader", async () => {
    const loader = vi.fn(async () => ({ source: "fixture", license: "MIT", generated: "2026-11-15", country: "ZZ", lang: "en", from: "cldr", rows: [["N", "North", "", ""], ["S", "South", "", ""]] as [string, string, string, string][] }));
    render(
      <Field label="Area">
        <RegionSelect country="ZZ" subdivisions={loader} />
      </Field>,
    );
    expect(await screen.findByRole("option", { name: "South" })).toBeInTheDocument();
    expect(loader).toHaveBeenCalledWith("ZZ");
  });
});
