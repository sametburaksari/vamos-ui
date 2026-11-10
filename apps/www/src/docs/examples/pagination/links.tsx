"use client";

import { Pagination } from "@vamos-cms/ui";

// Blog archive: real <a href> links (crawlable), rendered with your router's Link.
export default function PaginationLinks() {
  return <Pagination page={4} pageCount={18} getHref={(p) => (p === 1 ? "/blog" : `/blog/page/${p}`)} />;
}
