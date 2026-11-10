import { CalendarClock, FileText, Megaphone, Users } from "lucide-react";
import { CheckboxGroup, Field } from "@vamos-cms/ui";

export default function CheckboxCard() {
  return (
    <Field label="Modules" hint="You can turn modules on or off later in Settings → Workspace.">
      <CheckboxGroup
        variant="card"
        name="modules"
        defaultValue={["crm", "invoicing"]}
        className="w-full max-w-2xl"
        items={[
          { value: "crm", label: "CRM", description: "Contacts, companies and a sales pipeline.", icon: <Users /> },
          { value: "invoicing", label: "Invoicing", description: "Quotes, invoices and payment links.", icon: <FileText /> },
          { value: "booking", label: "Bookings", description: "Online booking with staff calendars.", icon: <CalendarClock /> },
          { value: "campaigns", label: "Campaigns", description: "Email and SMS campaigns to segments.", icon: <Megaphone /> },
        ]}
      />
    </Field>
  );
}
