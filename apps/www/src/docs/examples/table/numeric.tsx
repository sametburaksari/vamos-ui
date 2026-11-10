"use client";

import * as React from "react";
import { Card, Delta, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, useFormat } from "@vamos-cms/ui";

type Row = { client: string; mrr: string; seats: number; change: number };
const rows: Row[] = [
  { client: "Moda Wellness", mrr: "1450.00", seats: 6, change: 0.082 },
  { client: "Harbor & Pine", mrr: "980.50", seats: 4, change: -0.031 },
  { client: "Northwind Traders", mrr: "12400.00", seats: 48, change: 0.214 },
  { client: "Kadıköy Bistro", mrr: "320.00", seats: 2, change: 0 },
];

type Key = "client" | "mrr" | "seats" | "change";

export default function TableNumeric() {
  const f = useFormat();
  const [sort, setSort] = React.useState<{ key: Key; dir: "asc" | "desc" }>({ key: "mrr", dir: "desc" });
  const sorted = [...rows].sort((a, b) => {
    const av = sort.key === "mrr" ? Number(a.mrr) : a[sort.key];
    const bv = sort.key === "mrr" ? Number(b.mrr) : b[sort.key];
    const c = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sort.dir === "asc" ? c : -c;
  });
  const head = (key: Key, label: string, numeric = true) => (
    <TableHead
      numeric={numeric}
      sort={sort.key === key ? sort.dir : false}
      onSort={() => setSort({ key, dir: sort.key === key && sort.dir === "desc" ? "asc" : "desc" })}
    >
      {label}
    </TableHead>
  );
  return (
    <Card className="w-full max-w-2xl overflow-hidden">
      <Table>
        <TableCaption>Monthly recurring revenue by client — click a header to sort.</TableCaption>
        <TableHeader>
          <TableRow>
            {head("client", "Client", false)}
            {head("seats", "Seats")}
            {head("mrr", "MRR")}
            {head("change", "vs last month")}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.client}>
              <TableCell rowHeader>{r.client}</TableCell>
              <TableCell numeric>{f.number(r.seats)}</TableCell>
              <TableCell numeric>{f.currency(r.mrr)}</TableCell>
              <TableCell numeric>
                <Delta value={r.change} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
