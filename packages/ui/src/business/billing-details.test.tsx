import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { BillingDetailsFields } from "./billing-details";
import { billingDetailsFromFormData, billingErrorMessages, validateBillingDetails, type BillingDetails } from "./billing-details-core";
import { LocaleProvider } from "../lib/locale";
import { tr } from "../locales/tr";
import { en } from "../locales/en";
import { billingDetailsLabels } from "./billing-details-core";
import { vknCheckDigit } from "../locale-data/tr/id";

const address = { country: "TR", region1: "İstanbul", region2: "Maltepe", line1: "Cevizli Mah. Tugay Yolu Cad. No: 20" };
const person: BillingDetails = { type: "individual", firstName: " Deniz ", lastName: "Kaya", nationalId: "100 000 001 46", email: "deniz@ornek.com.tr", address };
const company: BillingDetails = { type: "company", companyName: "Yelken Atölye Tasarım Ltd. Şti.", taxId: "10000000146", taxOffice: "Kozyatağı", email: "muhasebe@ornek.com.tr", phone: "+902160000000", address };

describe("validateBillingDetails", () => {
  it("normalises an individual party (TCKN scheme)", () => {
    const v = validateBillingDetails(person);
    expect(v.ok).toBe(true);
    expect(v.party).toEqual({ type: "individual", name: "Deniz Kaya", firstName: "Deniz", lastName: "Kaya", taxId: "10000000146", taxScheme: "TCKN", email: "deniz@ornek.com.tr", address });
  });

  it("accepts a VKN, or a sole proprietor's TCKN, for a company", () => {
    const vkn = "123456789" + vknCheckDigit("123456789");
    expect(validateBillingDetails({ ...company, taxId: vkn }).party).toMatchObject({ taxId: vkn, taxScheme: "VKN" });
    expect(validateBillingDetails({ ...company, taxId: "123456789" + ((Number(vknCheckDigit("123456789")) + 1) % 10) }).errors).toEqual({ taxId: "invalid" });
    const withTckn = validateBillingDetails({ ...company, taxId: "10000000146" });
    expect(withTckn.party).toMatchObject({ type: "company", name: "Yelken Atölye Tasarım Ltd. Şti.", taxScheme: "TCKN", taxOffice: "Kozyatağı", phone: "+902160000000" });
  });

  it("reports missing and invalid fields per party type", () => {
    expect(validateBillingDetails({ type: "company", email: "x", address: { country: "TR" } }).errors).toEqual({
      companyName: "required",
      taxOffice: "required",
      taxId: "required",
      email: "invalid",
      line1: "required",
      region1: "required",
      region2: "required",
    });
    expect(validateBillingDetails({ ...person, nationalId: "10000000147" }).errors).toEqual({ nationalId: "invalid" });
    expect(validateBillingDetails({ ...person, phone: "abc" }, { requirePhone: true }).errors).toEqual({ phone: "invalid" });
    expect(validateBillingDetails({ ...person, phone: undefined }, { requirePhone: true }).errors).toEqual({ phone: "required" });
    expect(validateBillingDetails({ ...person, type: "x" as never }).errors).toEqual({ type: "required" });
  });

  it("only accepts the e-Arşiv placeholder TCKN when asked", () => {
    expect(validateBillingDetails({ ...person, nationalId: "11111111111" }).errors).toEqual({ nationalId: "unknownTckn" });
    expect(validateBillingDetails({ ...person, nationalId: "11111111111" }, { allowUnknownTckn: true }).party?.taxId).toBe("11111111111");
  });

  it("formats messages, English or Turkish", () => {
    const { errors } = validateBillingDetails({ type: "company", address: { country: "TR" } });
    expect(billingErrorMessages(errors)).toMatchObject({ taxId: "Tax number is required", region1: "Province is required", email: "Email is required" });
    expect(billingErrorMessages(errors, tr.billingDetails)).toMatchObject({ taxId: "Vergi kimlik no zorunlu", taxOffice: "Vergi dairesi zorunlu" });
  });

  it("keeps the component defaults and the en dictionary in sync", () => {
    expect(en.billingDetails).toEqual(billingDetailsLabels);
  });
});

describe("BillingDetailsFields", () => {
  it("switches between individual and company fields and posts named values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form aria-label="Checkout">
        <BillingDetailsFields name="billing" onValueChange={onValueChange} />
      </form>,
    );
    const group = screen.getByRole("group", { name: "Billing details" });
    expect(within(group).getByRole("textbox", { name: /First name/ })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Company" }));
    expect(screen.queryByRole("textbox", { name: /First name/ })).not.toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /Company title/ }), "Yelken Atölye Ltd. Şti.");
    await user.type(screen.getByRole("textbox", { name: /Tax office/ }), "Kozyatağı");
    await user.type(screen.getByRole("textbox", { name: /Tax number/ }), "10000000146");
    await user.type(screen.getByRole("textbox", { name: /Email/ }), "muhasebe@ornek.com.tr");
    await screen.findByRole("option", { name: "İstanbul" });
    await user.selectOptions(screen.getByRole("combobox", { name: /Province/ }), "İstanbul");
    await screen.findByRole("option", { name: "Maltepe" });
    await user.selectOptions(screen.getByRole("combobox", { name: /District/ }), "Maltepe");
    await user.type(screen.getByRole("textbox", { name: /Street address/ }), "Cevizli Mah. Tugay Yolu Cad. No: 20");
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ type: "company", taxId: "10000000146", address: expect.objectContaining({ region2: "Maltepe" }) }));

    const posted = billingDetailsFromFormData(new FormData(container.querySelector("form")!));
    expect(posted).toMatchObject({ type: "company", companyName: "Yelken Atölye Ltd. Şti.", taxOffice: "Kozyatağı", taxId: "10000000146", email: "muhasebe@ornek.com.tr" });
    expect(posted.address).toMatchObject({ country: "TR", region1: "İstanbul", region2: "Maltepe", line1: "Cevizli Mah. Tugay Yolu Cad. No: 20" });
    expect(validateBillingDetails(posted).party).toMatchObject({ taxScheme: "TCKN", name: "Yelken Atölye Ltd. Şti." });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows checksum errors from the ID input and server errors", async () => {
    const user = userEvent.setup();
    render(<BillingDetailsFields errors={{ email: "Email is required" }} />);
    await user.type(screen.getByRole("textbox", { name: /Turkish ID number/ }), "10000000147");
    await user.tab();
    expect(screen.getByText("This number isn't valid. Check it for typos.")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("uses the Turkish labels from the tr locale and hides the toggle for one type", () => {
    render(
      <LocaleProvider locale="tr-TR" messages={tr}>
        <BillingDetailsFields types={["company"]} name="fatura" />
      </LocaleProvider>,
    );
    expect(screen.getByRole("group", { name: "Fatura bilgileri" })).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Unvan/ })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Vergi dairesi/ })).toBeInTheDocument();
    expect(document.querySelector('input[type="hidden"][name="fatura[type]"]')).toHaveValue("company");
  });
});
