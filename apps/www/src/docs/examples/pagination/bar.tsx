"use client";

import * as React from "react";
import { PaginationBar } from "@vamos-ui/react";

const TOTAL = 312;
const names = ["Ayşe Demir", "Jonas Weber", "Priya Nair", "Lucas Martin", "Sofia Rossi", "Kenji Sato", "Emma Clarke", "Omar Haddad"];
const roles = ["Account executive", "Support lead", "Product designer", "Payroll specialist"];

export default function PaginationBarExample() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const start = (page - 1) * pageSize;
  const rows = Array.from({ length: Math.min(pageSize, TOTAL - start) }, (_, i) => start + i);

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-ui-lg border border-line">
      <table className="w-full text-start text-sm">
        <thead className="bg-surface-2 text-start text-[12px] text-fg-muted">
          <tr>
            <th className="px-4 py-2 text-start font-medium">Employee</th>
            <th className="px-4 py-2 text-start font-medium">Role</th>
            <th className="px-4 py-2 text-end font-medium">ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((n) => (
            <tr key={n}>
              <td className="px-4 py-2">{names[n % names.length]}</td>
              <td className="px-4 py-2 text-fg-muted">{roles[n % roles.length]}</td>
              <td className="tabular px-4 py-2 text-end text-fg-muted">E-{String(1001 + n)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationBar
        className="border-t border-line px-4 py-2.5"
        size="sm"
        total={TOTAL}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[5, 20, 50, 100]}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
