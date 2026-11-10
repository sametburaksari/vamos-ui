import { MessageSquare } from "lucide-react";
import { Badge, EntityCard, IconButton } from "@vamos-cms/ui";

export default function EntityCardPerson() {
  return (
    <EntityCard
      className="w-full max-w-sm"
      name="Jane Cooper"
      subtitle="Head of Operations · Northwind Traders"
      status={{ tone: "success", label: "Customer" }}
      badges={<Badge tone="outline">Decision maker</Badge>}
      href="#jane-cooper"
      contact={{ email: "jane.cooper@northwind.com", phone: "+1 (415) 555-0136" }}
      actions={
        <IconButton label="Message Jane Cooper" size="sm" variant="secondary" tooltip={false}>
          <MessageSquare />
        </IconButton>
      }
      fields={[
        { key: "owner", label: "Owner", value: "Ayşe Kaya" },
        { key: "last", label: "Last contact", value: "Nov 6, 2026 · Call" },
        { key: "timezone", label: "Time zone", value: "Pacific (UTC−8)" },
      ]}
    />
  );
}
