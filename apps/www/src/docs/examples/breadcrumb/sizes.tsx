import { Breadcrumb } from "@vamos-cms/ui";

const items = [
  { label: "Settings", href: "/settings" },
  { label: "Billing", href: "/settings/billing" },
  { label: "Invoice INV-2026-0418" },
];

export default function BreadcrumbSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb size="sm" items={items} />
      <Breadcrumb items={items} />
      <Breadcrumb items={items} separator={<span className="px-0.5">/</span>} />
    </div>
  );
}
