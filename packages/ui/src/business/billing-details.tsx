"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { AddressField, type Address, type AddressFieldProps, type AddressPart } from "../components/address-field";
import { IdInput } from "../components/id-input";
import { Field, Fieldset, Input } from "../components/input";
import { RadioGroup } from "../components/radio-group";
import { billingDetailsLabels, type BillingDetails, type BillingDetailsLabels, type BillingField, type BillingPartyType } from "./billing-details-core";

export interface BillingDetailsFieldsProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange"> {
  value?: BillingDetails;
  defaultValue?: BillingDetails;
  onValueChange?: (details: BillingDetails) => void;
  /** Which party types to offer. Default both; one type hides the toggle. */
  types?: BillingPartyType[];
  /** Form name prefix: `billing` → `billing[type]`, `billing[taxId]`, `billing[address][region1]`… Read it back with `billingDetailsFromFormData`. */
  name?: string;
  legend?: React.ReactNode;
  hint?: React.ReactNode;
  /** Per-field messages, e.g. `billingErrorMessages(validateBillingDetails(d).errors)` from the server. */
  errors?: Partial<Record<BillingField, React.ReactNode>>;
  /** Show and require a phone number. Default: shown, optional. */
  phone?: "optional" | "required" | "hidden";
  /** Passed to the address fieldset (e.g. `sources` with neighbourhoods, `countries`). */
  addressProps?: Omit<AddressFieldProps, "value" | "defaultValue" | "onValueChange" | "name" | "errors">;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  labels?: Partial<BillingDetailsLabels>;
}

const EMPTY: BillingDetails = { type: "individual", address: { country: "TR" } };

/**
 * Buyer details for an e-Fatura / e-Arşiv invoice: individual (name + TCKN) or company (title, tax
 * office, VKN — or the owner's TCKN for a sole proprietorship), e-mail, phone and a structured
 * address. Fields only; validate the posted values with `validateBillingDetails` on the server.
 *
 * ```tsx
 * <form action={saveBilling}>
 *   <BillingDetailsFields name="billing" defaultValue={{ type: "company", address: { country: "TR" } }} />
 * </form>
 * ```
 */
export const BillingDetailsFields = /*#__PURE__*/ React.forwardRef<HTMLFieldSetElement, BillingDetailsFieldsProps>(function BillingDetailsFields(
  { value, defaultValue, onValueChange, types = ["individual", "company"], name, legend, hint, errors, phone = "optional", addressProps, disabled, size, labels, className, ...rest },
  ref,
) {
  const t = useLabels("billingDetails", billingDetailsLabels, labels);
  const [details, setDetails] = useControllableState<BillingDetails>({
    value,
    defaultValue: defaultValue ?? { ...EMPTY, type: types[0] ?? "individual" },
    onChange: onValueChange,
    name: "BillingDetailsFields",
  });
  const d: BillingDetails = details ?? EMPTY;
  const latest = useLatest(d);
  const set = (patch: Partial<BillingDetails>) => setDetails({ ...latest.current!, ...patch });
  const [idErrors, setIdErrors] = React.useState<{ nationalId?: string; taxId?: string }>({});
  const fname = (k: string) => (name ? `${name}[${k}]` : undefined);
  const err = (k: BillingField) => errors?.[k] ?? (k === "nationalId" || k === "taxId" ? idErrors[k] : undefined);
  const company = d.type === "company";
  const countries = addressProps?.countries ?? ["TR"];
  const neighbourhoods = !!addressProps?.sources?.[(d.address?.country ?? countries[0] ?? "TR").toUpperCase()]?.neighbourhoods;
  const addressFields: AddressPart[] =
    addressProps?.fields ??
    ([...(countries.length > 1 ? ["country"] : []), "region1", "region2", ...(neighbourhoods ? ["region3"] : []), "line1", "line2", "postalCode"] as AddressPart[]);
  const addressErrors: Partial<Record<AddressPart, React.ReactNode>> | undefined =
    errors && (errors.line1 || errors.region1 || errors.region2) ? { line1: errors.line1, region1: errors.region1, region2: errors.region2 } : undefined;

  return (
    <Fieldset ref={ref} {...rest} legend={legend ?? t("legend")} hint={hint} disabled={disabled} data-slot="billing-details" data-type={d.type} className={className}>
      <div className="grid min-w-0 gap-x-4 gap-y-3.5 sm:grid-cols-2">
        {types.length > 1 ? (
          <Field label={t("type")} error={errors?.type} className="sm:col-span-2">
            <RadioGroup
              name={fname("type")}
              variant="segmented"
              size={size === "lg" ? "md" : "sm"}
              value={d.type}
              onValueChange={(type) => set({ type: type as BillingPartyType })}
              items={types.map((ty) => ({ value: ty, label: t(ty) }))}
            />
          </Field>
        ) : name ? (
          <input type="hidden" name={fname("type")} value={d.type} />
        ) : null}

        {company ? (
          <>
            <Field label={t("companyName")} required error={err("companyName")} className="sm:col-span-2">
              <Input size={size} name={fname("companyName")} value={d.companyName ?? ""} autoComplete="organization" maxLength={250} onChange={(e) => set({ companyName: e.currentTarget.value })} />
            </Field>
            <Field label={t("taxId")} hint={t("taxIdHint")} required error={err("taxId")}>
              <IdInput
                kind="tr-tax-id"
                size={size}
                name={fname("taxId")}
                value={d.taxId ?? null}
                onValueChange={(taxId) => set({ taxId: taxId ?? undefined })}
                onValidate={(r) => setIdErrors((e) => ({ ...e, taxId: r.valid ? undefined : r.message }))}
              />
            </Field>
            <Field label={t("taxOffice")} required error={err("taxOffice")}>
              <Input size={size} name={fname("taxOffice")} value={d.taxOffice ?? ""} maxLength={80} onChange={(e) => set({ taxOffice: e.currentTarget.value })} />
            </Field>
          </>
        ) : (
          <>
            <Field label={t("firstName")} required error={err("firstName")}>
              <Input size={size} name={fname("firstName")} value={d.firstName ?? ""} autoComplete="given-name" maxLength={80} onChange={(e) => set({ firstName: e.currentTarget.value })} />
            </Field>
            <Field label={t("lastName")} required error={err("lastName")}>
              <Input size={size} name={fname("lastName")} value={d.lastName ?? ""} autoComplete="family-name" maxLength={80} onChange={(e) => set({ lastName: e.currentTarget.value })} />
            </Field>
            <Field label={t("nationalId")} hint={t("nationalIdHint")} required error={err("nationalId")} className="sm:col-span-2">
              <IdInput
                kind="tr-tckn"
                size={size}
                name={fname("nationalId")}
                value={d.nationalId ?? null}
                onValueChange={(nationalId) => set({ nationalId: nationalId ?? undefined })}
                onValidate={(r) => setIdErrors((e) => ({ ...e, nationalId: r.valid ? undefined : r.message }))}
              />
            </Field>
          </>
        )}

        <Field label={t("email")} hint={t("emailHint")} required error={err("email")} className={cn(phone === "hidden" && "sm:col-span-2")}>
          <Input size={size} type="email" inputMode="email" name={fname("email")} value={d.email ?? ""} autoComplete="email" maxLength={160} onChange={(e) => set({ email: e.currentTarget.value })} />
        </Field>
        {phone !== "hidden" ? (
          <Field label={t("phone")} required={phone === "required"} optional={phone === "optional"} error={err("phone")}>
            <Input size={size} type="tel" inputMode="tel" name={fname("phone")} value={d.phone ?? ""} autoComplete="tel" maxLength={20} onChange={(e) => set({ phone: e.currentTarget.value })} />
          </Field>
        ) : null}
      </div>

      <AddressField
        legend={t("address")}
        required={["region1", "region2", "line1"]}
        size={size}
        {...addressProps}
        countries={countries}
        fields={addressFields}
        name={name ? `${name}[address]` : undefined}
        value={d.address ?? { country: countries[0] ?? "TR" }}
        onValueChange={(address: Address) => set({ address })}
        errors={addressErrors}
        className={cn("mt-2", addressProps?.className)}
      />
    </Fieldset>
  );
});
