"use client";

import * as React from "react";
import { Field, Input, Select, toast } from "@vamos-cms/ui";
import { MultiStepForm, MultiStepFormFooter, MultiStepFormReview, MultiStepFormStep, MultiStepFormStepper, type StepDef } from "@vamos-cms/ui/business";

interface Employee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string | null;
  startDate: string;
  contract: string | null;
}

export default function MultiStepFormDemo() {
  const [v, setV] = React.useState<Employee>({ firstName: "", lastName: "", email: "", phone: "", department: null, startDate: "2026-12-01", contract: "full-time" });
  const [errors, setErrors] = React.useState<Partial<Record<keyof Employee, string>>>({});
  const set = (k: keyof Employee) => (value: string | null) => setV((s) => ({ ...s, [k]: value }));

  const check = (rules: Partial<Record<keyof Employee, string | false>>) => {
    const next = Object.fromEntries(Object.entries(rules).filter(([, m]) => m)) as Partial<Record<keyof Employee, string>>;
    setErrors(next);
    return Object.keys(next).length ? "Fill in the highlighted fields to continue." : true;
  };

  const steps: StepDef[] = [
    { id: "identity", title: "Identity", description: "As written on the ID card.", validate: () => check({ firstName: !v.firstName.trim() && "Enter a first name.", lastName: !v.lastName.trim() && "Enter a last name." }) },
    { id: "contact", title: "Contact", validate: () => check({ email: !/^\S+@\S+\.\S+$/.test(v.email) && "Enter a work email like name@company.com." }) },
    { id: "contract", title: "Contract", validate: () => check({ department: !v.department && "Pick a department." }) },
    { id: "review", title: "Review", description: "Check everything before creating the employee record." },
  ];

  return (
    <div className="w-full max-w-2xl">
      <MultiStepForm
        steps={steps}
        presentation="dialog"
        onComplete={async () => {
          await new Promise((r) => setTimeout(r, 900));
          toast.success(`${v.firstName} ${v.lastName} added to People`);
        }}
      >
        <MultiStepFormStepper />
        <MultiStepFormStep id="identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" required error={errors.firstName}>
              <Input value={v.firstName} onChange={(e) => set("firstName")(e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <Input value={v.lastName} onChange={(e) => set("lastName")(e.target.value)} autoComplete="family-name" />
            </Field>
          </div>
        </MultiStepFormStep>
        <MultiStepFormStep id="contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Work email" required error={errors.email}>
              <Input type="email" value={v.email} onChange={(e) => set("email")(e.target.value)} placeholder="ayse.yilmaz@northwind.com" />
            </Field>
            <Field label="Mobile" optional>
              <Input type="tel" value={v.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+90 532 000 00 00" />
            </Field>
          </div>
        </MultiStepFormStep>
        <MultiStepFormStep id="contract">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Department" required error={errors.department}>
              <Select value={v.department} onValueChange={set("department")} items={["Engineering", "Design", "Sales", "Finance", "People"].map((d) => ({ value: d, label: d }))} />
            </Field>
            <Field label="Contract">
              <Select value={v.contract} onValueChange={set("contract")} items={[{ value: "full-time", label: "Full-time" }, { value: "part-time", label: "Part-time" }, { value: "contractor", label: "Contractor" }]} />
            </Field>
            <Field label="Start date">
              <Input type="date" value={v.startDate} onChange={(e) => set("startDate")(e.target.value)} />
            </Field>
          </div>
        </MultiStepFormStep>
        <MultiStepFormStep id="review">
          <MultiStepFormReview
            sections={[
              { step: "identity", items: [{ label: "Name", value: `${v.firstName} ${v.lastName}`.trim() }] },
              { step: "contact", items: [{ label: "Work email", value: v.email }, { label: "Mobile", value: v.phone }] },
              { step: "contract", items: [{ label: "Department", value: v.department }, { label: "Contract", value: v.contract }, { label: "Start date", value: v.startDate }] },
            ]}
          />
        </MultiStepFormStep>
        <MultiStepFormFooter submitLabel="Create employee" />
      </MultiStepForm>
    </div>
  );
}
