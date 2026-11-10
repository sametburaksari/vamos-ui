import { createFormatter } from "@vamos-cms/ui/format";
import { Numeric, Text } from "@vamos-cms/ui";

const rows = [
  { label: "Website redesign", amount: "12400.00", change: 0.18 },
  { label: "Monthly retainer · Nov", amount: "3250.00", change: 0 },
  { label: "Google Ads management", amount: "980.50", change: -0.042 },
  { label: "Photography (half day)", amount: "640.00", change: 0.075 },
];

export default function TypographyNumeric() {
  const f = createFormatter("en-US", { currency: "USD" });
  return (
    <div className="grid w-full max-w-md gap-1">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[1fr_auto_4.5rem] items-baseline gap-4 border-b border-line py-2 text-sm">
          <Text as="span" truncate>
            {r.label}
          </Text>
          <Numeric className="text-end">{f.currency(r.amount)}</Numeric>
          <Numeric signOf={r.change} className="text-end text-xs">
            {f.percent(r.change, { signDisplay: "exceptZero" })}
          </Numeric>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_auto_4.5rem] items-baseline gap-4 pt-2 text-sm font-semibold">
        <span>Total</span>
        <Numeric className="text-end">{f.currency("17270.50")}</Numeric>
        <span />
      </div>
      <Text size="xs" tone="subtle" className="pt-3">
        Mono variant for IDs: <Numeric mono>INV-2041 · ORD-88310</Numeric>
      </Text>
    </div>
  );
}
