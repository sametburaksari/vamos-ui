import { Field, Select } from "@vamos-cms/ui";

export default function SelectDemo() {
  return (
    <Field label="Status" hint="Only published posts appear on the website." className="w-full max-w-xs">
      <Select
        name="status"
        defaultValue="draft"
        items={[
          { value: "draft", label: "Draft" },
          { value: "review", label: "In review" },
          { value: "scheduled", label: "Scheduled" },
          { value: "published", label: "Published" },
          { value: "archived", label: "Archived" },
        ]}
      />
    </Field>
  );
}
