import { Combobox, Field } from "@vamos-ui/react";

const permissions = [
  { value: "posts.read", label: "Read posts", group: "Content" },
  { value: "posts.write", label: "Write and edit posts", group: "Content" },
  { value: "posts.publish", label: "Publish posts", group: "Content" },
  { value: "media.upload", label: "Upload media", group: "Content" },
  { value: "contacts.read", label: "View contacts", group: "CRM" },
  { value: "contacts.export", label: "Export contacts", group: "CRM", description: "Includes email addresses and phone numbers" },
  { value: "invoices.read", label: "View invoices", group: "Billing" },
  { value: "invoices.refund", label: "Issue refunds", group: "Billing" },
  { value: "settings.manage", label: "Manage workspace settings", group: "Admin", disabled: true },
];

export default function ComboboxInline() {
  return (
    <Field label="Permissions for “Editor”" className="w-full max-w-sm">
      <Combobox mode="inline" multiple clearable name="permissions" items={permissions} defaultValue={["posts.read", "posts.write", "media.upload"]} searchPlaceholder="Filter permissions…" listClassName="max-h-64" />
    </Field>
  );
}
