import { Card, Delta, Sparkline, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@vamos-cms/ui";

const pages = [
  { path: "/blog/qr-menus-guide", weeks: [120, 180, 240, 310, 290, 360, 420, 480, 455, 510, 560, 610], change: 0.18 },
  { path: "/menu", weeks: [380, 390, 370, 410, 400, 420, 415, 430, 425, 440, 438, 445], change: 0.02 },
  { path: "/reservations", weeks: [300, 280, 260, 240, 250, 230, 210, 220, 200, 190, 185, 170], change: -0.08 },
  { path: "/blog/local-seo-2026", weeks: [null, null, null, null, 40, 90, 150, 210, 260, 330, 380, 410], change: 0.41 },
];

// One shared domain keeps the rows comparable.
const max = Math.max(...pages.flatMap((p) => p.weeks.filter((v): v is number => v !== null)));

export default function SparklineInTable() {
  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <Table density="compact" aria-label="Top pages, last 12 weeks">
        <TableHeader>
          <TableRow>
            <TableHead>Page</TableHead>
            <TableHead>Last 12 weeks</TableHead>
            <TableHead numeric>Views</TableHead>
            <TableHead numeric>Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((p) => (
            <TableRow key={p.path}>
              <TableCell rowHeader className="font-mono text-xs font-normal">{p.path}</TableCell>
              <TableCell>
                <Sparkline values={p.weeks} size="xs" domain={[0, max]} className={p.change >= 0 ? "text-accent-ink" : "text-fg-subtle"} />
              </TableCell>
              <TableCell numeric>{p.weeks[p.weeks.length - 1]?.toLocaleString("en-US")}</TableCell>
              <TableCell numeric>
                <Delta value={p.change} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
