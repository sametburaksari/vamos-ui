import { EntityCard } from "@vamos-ui/react";

export default function EntityCardOrganization() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <EntityCard
        kind="organization"
        name="Northwind Traders"
        subtitle="northwind.com · Logistics · 240 employees"
        status={{ tone: "success", label: "Active" }}
        href="#northwind"
        contact={{ website: "https://northwind.example.com" }}
        stats={[
          { label: "Open deals", value: 4 },
          { label: "Pipeline", value: 182400, format: { type: "currency", options: { maximumFractionDigits: 0 } } },
          { label: "Win rate", value: 0.38, format: "percent" },
        ]}
      />
      <EntityCard
        kind="organization"
        name="Bosphorus Dental Clinic"
        subtitle="bosphorusdental.com · Healthcare"
        status={{ tone: "warning", label: "Renewal due" }}
        href="#bosphorus-dental"
        stats={[
          { label: "Open deals", value: 1 },
          { label: "Pipeline", value: 24000, format: { type: "currency", options: { maximumFractionDigits: 0 } } },
          { label: "Win rate", value: 0.5, format: "percent" },
        ]}
      />
    </div>
  );
}
