import { Card, CardBody, CardHeader, Inset } from "@vamos-cms/ui";

const metrics = [
  { label: "Sessions", value: "18,204" },
  { label: "Bookings", value: "312" },
  { label: "Conversion", value: "1.7%" },
];

export default function CardNestedInset() {
  // In glass mode a nested card must be Inset (surface-2): a second blur costs frames and blurs text.
  return (
    <Card className="w-full max-w-md">
      <CardHeader title="Website — last 30 days" description="vamos.ist · Google Analytics" />
      <CardBody className="grid grid-cols-3 gap-2">
        {metrics.map((m) => (
          <Inset key={m.label} className="grid gap-1 px-3 py-2.5">
            <span className="text-xs text-fg-muted">{m.label}</span>
            <span className="font-mono text-lg tabular">{m.value}</span>
          </Inset>
        ))}
      </CardBody>
    </Card>
  );
}
