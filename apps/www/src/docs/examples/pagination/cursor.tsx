"use client";

import * as React from "react";
import { CursorPagination } from "@vamos-ui/react";

// Cursor APIs (10,000+ contacts): no total, only "is there more?".
export default function PaginationCursor() {
  const [batch, setBatch] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const load = (next: number) => {
    setLoading(true);
    setTimeout(() => {
      setBatch(next);
      setLoading(false);
    }, 700);
  };
  return (
    <CursorPagination
      hasPrev={batch > 0}
      hasNext={batch < 9}
      loading={loading}
      onPrev={() => load(batch - 1)}
      onNext={() => load(batch + 1)}
      status={`Contacts ${batch * 50 + 1}–${batch * 50 + 50}`}
    />
  );
}
