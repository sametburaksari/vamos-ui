import { Field, Select } from "@vamos-ui/react";

export default function SelectGroups() {
  return (
    <Field label="Department" className="w-full max-w-xs">
      <Select
        placeholder="Choose a department"
        items={[
          { value: "sales", label: "Sales", group: "Revenue" },
          { value: "partnerships", label: "Partnerships", group: "Revenue" },
          { value: "customer-success", label: "Customer success", group: "Revenue" },
          { value: "engineering", label: "Engineering", group: "Product" },
          { value: "design", label: "Design", group: "Product" },
          { value: "research", label: "Research", group: "Product" },
          { value: "finance", label: "Finance", group: "Operations" },
          { value: "people", label: "People & culture", group: "Operations" },
          { value: "legal", label: "Legal", group: "Operations", disabled: true },
        ]}
      />
    </Field>
  );
}
