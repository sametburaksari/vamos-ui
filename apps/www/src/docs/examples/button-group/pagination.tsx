"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonGroup, ButtonGroupText, IconButton, useFormat } from "@vamos-cms/ui";

const TOTAL = 340;
const PER_PAGE = 20;

export default function ButtonGroupPagination() {
  const f = useFormat();
  const [page, setPage] = React.useState(2);
  const last = Math.ceil(TOTAL / PER_PAGE);
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, TOTAL);

  return (
    <ButtonGroup aria-label="Pagination" variant="secondary" size="sm">
      <IconButton label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
        <ChevronLeft className="rtl:-scale-x-100" />
      </IconButton>
      <ButtonGroupText size="sm" aria-live="polite">
        {f.number(from)}–{f.number(to)} of {f.number(TOTAL)}
      </ButtonGroupText>
      <IconButton label="Next page" disabled={page === last} onClick={() => setPage((p) => p + 1)}>
        <ChevronRight className="rtl:-scale-x-100" />
      </IconButton>
    </ButtonGroup>
  );
}
