import { Badge, Card, Table, TableBody, TableCaption, TableCell, TableContainer, TableFooter, TableHead, TableHeader, TableRow } from "@vamos-ui/react";

const lines = [
  { item: "Brand identity refresh", detail: "Logo, colour system, type scale", qty: 1, rate: "4500.00", amount: "4500.00" },
  { item: "Website build — 8 templates", detail: "Next.js, CMS integration", qty: 8, rate: "650.00", amount: "5200.00" },
  { item: "Copywriting", detail: "Home, services, about", qty: 3, rate: "180.00", amount: "540.00" },
  { item: "Hosting & maintenance", detail: "Nov 2026 – Oct 2027", qty: 12, rate: "40.00", amount: "480.00" },
];

const usd = (v: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v));

export default function TableDemo() {
  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <TableContainer aria-label="Invoice INV-2041 lines">
        <Table>
          <TableCaption>Invoice INV-2041 · Kadıköy Bistro · due Dec 10, 2026</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead numeric>Qty</TableHead>
              <TableHead numeric>Rate</TableHead>
              <TableHead numeric>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((l) => (
              <TableRow key={l.item}>
                <TableCell>
                  <div className="font-medium">{l.item}</div>
                  <div className="text-xs text-fg-subtle">{l.detail}</div>
                </TableCell>
                <TableCell numeric>{l.qty}</TableCell>
                <TableCell numeric>{usd(l.rate)}</TableCell>
                <TableCell numeric>{usd(l.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>
                <span className="me-2">Total</span>
                <Badge tone="warning" dot>Unpaid</Badge>
              </TableCell>
              <TableCell numeric className="text-[13.5px] font-semibold">{usd("10720.00")}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Card>
  );
}
