"use client";

import * as React from "react";
import { Pagination } from "@vamos-ui/react";

export default function PaginationLoading() {
  const [page, setPage] = React.useState(2);
  const [loading, setLoading] = React.useState(false);
  const change = (p: number) => {
    setPage(p);
    setLoading(true);
    setTimeout(() => setLoading(false), 900);
  };
  return <Pagination page={page} pageCount={9} onPageChange={change} loading={loading} />;
}
