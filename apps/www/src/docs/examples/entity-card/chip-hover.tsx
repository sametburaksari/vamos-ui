import { EntityCard } from "@vamos-ui/react";

export default function EntityCardChipHover() {
  return (
    <p className="max-w-md text-sm leading-relaxed text-fg-muted">
      Deal owner{" "}
      <EntityCard
        variant="chip"
        name="Daniel Brooks"
        subtitle="Account executive · Sales"
        href="#daniel-brooks"
        status={{ tone: "success", label: "Available" }}
        contact={{ email: "daniel.brooks@vamos.ist" }}
        fields={[
          { key: "team", label: "Team", value: "Enterprise" },
          { key: "quota", label: "Q4 quota", value: "71% reached" },
        ]}
      />{" "}
      moved this deal to Negotiation with{" "}
      <EntityCard variant="chip" kind="organization" name="Northwind Traders" subtitle="northwind.com · Logistics" href="#northwind" />.
    </p>
  );
}
