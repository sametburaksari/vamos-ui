"use client";

import * as React from "react";
import { Pagination } from "@vamos-cms/ui";

export default function PaginationVariants() {
  const [page, setPage] = React.useState(3);
  return (
    <div className="flex flex-col items-start gap-5">
      <Pagination page={page} pageCount={24} onPageChange={setPage} size="sm" />
      <Pagination page={page} pageCount={24} onPageChange={setPage} variant="compact" />
      <Pagination page={page} pageCount={24} onPageChange={setPage} variant="simple" />
    </div>
  );
}
