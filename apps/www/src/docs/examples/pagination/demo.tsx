"use client";

import * as React from "react";
import { Pagination } from "@vamos-ui/react";

export default function PaginationDemo() {
  const [page, setPage] = React.useState(6);
  return <Pagination page={page} pageCount={52} onPageChange={setPage} />;
}
