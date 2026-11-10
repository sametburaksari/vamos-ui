import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@vamos-cms/ui";

export default function TableStates() {
  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <Table aria-label="Team access" bordered="grid">
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow highlighted>
            <TableCell rowHeader>Can Özkan <span className="ms-1 text-xs font-normal text-accent-ink">just invited</span></TableCell>
            <TableCell>Editor</TableCell>
            <TableCell className="text-fg-muted">—</TableCell>
          </TableRow>
          <TableRow selected>
            <TableCell rowHeader>Meltem Aydın</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell className="text-fg-muted">2 hours ago</TableCell>
          </TableRow>
          <TableRow>
            <TableCell rowHeader>Ece Demir</TableCell>
            <TableCell>Author</TableCell>
            <TableCell className="text-fg-muted">Yesterday</TableCell>
          </TableRow>
          <TableRow disabled>
            <TableCell rowHeader>Ahmet Kaya</TableCell>
            <TableCell>Suspended</TableCell>
            <TableCell>Oct 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
