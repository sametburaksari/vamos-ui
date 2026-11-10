import { Combobox, Field } from "@vamos-cms/ui";

const labels = [
  { value: "bug", label: "Bug", group: "Type" },
  { value: "feature", label: "Feature request", group: "Type" },
  { value: "question", label: "Question", group: "Type" },
  { value: "billing", label: "Billing", group: "Area" },
  { value: "integrations", label: "Integrations", group: "Area" },
  { value: "mobile", label: "Mobile app", group: "Area" },
  { value: "onboarding", label: "Onboarding", group: "Area" },
  { value: "urgent", label: "Urgent", group: "Priority" },
  { value: "vip", label: "VIP customer", group: "Priority" },
];

export default function ComboboxMultiple() {
  return (
    <Field label="Labels" hint="Backspace in the search box removes the last label." className="w-full max-w-md">
      <Combobox multiple name="labels" items={labels} defaultValue={["bug", "billing", "urgent", "vip"]} maxVisibleChips={3} clearable />
    </Field>
  );
}
