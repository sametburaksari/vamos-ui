import { Building2 } from "lucide-react";
import { Breadcrumb } from "@vamos-cms/ui";

export default function BreadcrumbWithMenu() {
  return (
    <Breadcrumb
      items={[
        { label: "Companies", href: "/crm/companies", icon: <Building2 /> },
        {
          label: "Northwind Traders",
          href: "/crm/companies/northwind",
          menu: [
            { label: "Northwind Traders", href: "/crm/companies/northwind", current: true },
            { label: "Contoso Pharmaceuticals", href: "/crm/companies/contoso" },
            { label: "Fabrikam Logistics", href: "/crm/companies/fabrikam" },
            { label: "Tailspin Toys", href: "/crm/companies/tailspin" },
          ],
        },
        { label: "Contacts" },
      ]}
    />
  );
}
