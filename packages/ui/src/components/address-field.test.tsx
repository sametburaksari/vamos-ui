import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { AddressField, RegionSelect, formatAddress, type Address } from "./address-field";
import { Field } from "./input";
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

  it("falls back to free text for countries without data and warns on a mismatched TR postal code", async () => {
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
    expect(screen.getByRole("textbox", { name: "State / Province" })).toBeInTheDocument();
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
