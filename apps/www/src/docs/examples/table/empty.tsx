import { Button, Card, Table, TableBody, TableEmpty, TableHead, TableHeader, TableRow } from "@vamos-cms/ui";

export default function TableEmptyExample() {
  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <Table aria-label="Overdue invoices">
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Due</TableHead>
            <TableHead numeric>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty colSpan={4} title="No overdue invoices" description="Everything issued before Nov 1 has been paid.">
            <Button size="sm">Show all invoices</Button>
          </TableEmpty>
        </TableBody>
      </Table>
    </Card>
  );
}
