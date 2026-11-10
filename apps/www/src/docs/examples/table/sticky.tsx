import { Card, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-cms/ui";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pages = [
  "/", "/menu", "/reservations", "/blog/qr-menus-guide", "/blog/local-seo-2026", "/contact",
  "/about", "/events", "/gift-cards", "/careers", "/blog/nfc-vs-paper", "/privacy",
];
const views = (row: number, col: number) => Math.round(400 + ((row * 97 + col * 53) % 37) * 41 + (12 - row) * 90);

export default function TableSticky() {
  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <TableContainer aria-label="Page views by month" maxHeight="20rem">
        <Table stickyHeader stickyFirstColumn density="compact" striped aria-label="Page views by month, 2026">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-48">Page</TableHead>
              {months.map((m) => (
                <TableHead key={m} numeric>{m}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((p, r) => (
              <TableRow key={p}>
                <TableCell rowHeader className="font-mono text-xs font-normal">{p}</TableCell>
                {months.map((m, c) => (
                  <TableCell key={m} numeric>{views(r, c).toLocaleString("en-US")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
