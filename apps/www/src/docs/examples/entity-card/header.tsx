import { Plus } from "lucide-react";
import { Badge, Button, EntityCard } from "@vamos-ui/react";

export default function EntityCardHeader() {
  return (
    <EntityCard
      className="w-full"
      variant="header"
      headingAs="h2"
      name="Selin Arslan"
      subtitle="Senior Product Designer · Design team · Istanbul office"
      description="Leads the design system and the mobile app redesign. Joined from Trendyol in 2023."
      status={{ tone: "success", label: "Active" }}
      badges={<Badge tone="outline">Full-time</Badge>}
      contact={{ email: "selin.arslan@vamos.ist", phone: "+90 532 555 01 42" }}
      actions={
        <Button size="sm" variant="primary">
          <Plus aria-hidden />
          Request feedback
        </Button>
      }
      stats={[
        { label: "Tenure", value: "2 yrs 8 mo" },
        { label: "Leave balance", value: "11 days" },
        { label: "Reviews", value: 6 },
        { label: "Direct reports", value: 3 },
      ]}
      fields={[
        { key: "manager", label: "Manager", value: "Can Demir" },
        { key: "start", label: "Start date", value: "2023-03-06", format: "date" },
        { key: "location", label: "Location", value: "Istanbul, TR" },
        { key: "employee-id", label: "Employee ID", value: "EMP-00418", copyable: true },
        { key: "contract", label: "Contract", value: "Permanent" },
        { key: "salary-band", label: "Salary band", value: "L5" },
      ]}
    />
  );
}
