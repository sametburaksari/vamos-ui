import { Badge, Card, CardBody, CardHeader, DescriptionList } from "@vamos-cms/ui";

export default function DescriptionListDemo() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader title="Northwind renewal" description="Deal details" action={<Badge tone="info" dot>Negotiation</Badge>} />
      <CardBody>
        <DescriptionList
          items={[
            { key: "owner", label: "Owner", value: "Ayşe Kaya" },
            { key: "company", label: "Company", value: "Northwind Traders" },
            { key: "value", label: "Deal value", value: "48500.00", format: "currency" },
            { key: "probability", label: "Probability", value: 0.65, format: "percent" },
            { key: "close", label: "Expected close", value: "2026-12-15", format: "date", hint: "Moved from Nov 30 by Ayşe" },
            { key: "source", label: "Lead source", value: null },
          ]}
        />
      </CardBody>
    </Card>
  );
}
