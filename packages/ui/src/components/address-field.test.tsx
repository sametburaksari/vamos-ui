import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { AddressField, RegionSelect, formatAddress, type Address } from "./address-field";
import { Field } from "./input";
import { trAddress } from "../locale-data/tr/address";

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
    render(<AddressField legend="Head office" readOnly value={{ country: "TR", region1: "İstanbul", region2: "Maltepe", line1: "Cevizli Mah. Rıhtım Cad. No: 14", postalCode: "34846" }} />);
    expect(screen.getByText("34846 Maltepe/İstanbul")).toBeInTheDocument();
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
