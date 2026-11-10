import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@vamos-ui/react";

const people = [
  { name: "Ece Demir", role: "Product designer", team: "Studio", since: "Mar 2023" },
  { name: "Meltem Aydın", role: "Account manager", team: "Clients", since: "Jan 2022" },
  { name: "Can Özkan", role: "Frontend engineer", team: "Platform", since: "Sep 2024" },
];

const densities = ["compact", "comfortable", "spacious"] as const;

export default function TableDensity() {
  return (
    <div className="grid w-full max-w-2xl gap-6">
      {densities.map((density) => (
        <div key={density} className="surface overflow-hidden rounded-ui-lg">
          <Table density={density} aria-label={`Team (${density})`}>
            <TableHeader>
              <TableRow>
                <TableHead>{density}</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead align="end">Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((p) => (
                <TableRow key={p.name}>
                  <TableCell rowHeader>{p.name}</TableCell>
                  <TableCell className="text-fg-muted">{p.role}</TableCell>
                  <TableCell className="text-fg-muted">{p.team}</TableCell>
                  <TableCell align="end" className="tabular text-fg-muted">{p.since}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
