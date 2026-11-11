import { RefreshCw } from "lucide-react";
import { Badge, Card, CardHeader, IconButton, Spinner } from "@vamos-ui/react";

const invoices = [
  { id: "INV-2041", client: "Kadıköy Bistro", amount: "$1,280.00", status: "Paid" },
  { id: "INV-2042", client: "Moda Wellness", amount: "$640.00", status: "Due" },
  { id: "INV-2043", client: "Rıhtım Caddesi 14", amount: "$2,150.00", status: "Due" },
];

export default function SpinnerRefresh() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader
        title="Recent invoices"
        description={
          <span className="inline-flex items-center gap-1.5">
            {/* delay: fast refreshes never flash a spinner */}
            <Spinner size="xs" delay={300} label="Refreshing invoices" /> Syncing with accounting
          </span>
        }
        action={
          <IconButton label="Refresh" size="sm" variant="secondary">
            <RefreshCw />
          </IconButton>
        }
      />
      <ul className="grid px-5 pb-4 text-[13px]">
        {invoices.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between border-t border-line py-2.5">
            <span className="font-mono text-fg-muted">{inv.id}</span>
            <span className="flex-1 px-4">{inv.client}</span>
            <span className="tabular">{inv.amount}</span>
            <Badge tone={inv.status === "Paid" ? "success" : "warning"} className="ms-3">
              {inv.status}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
