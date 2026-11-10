import { ex, type DocEntry } from "../types";
import PaginationDemo from "../examples/pagination/demo";
import PaginationBarExample from "../examples/pagination/bar";
import PaginationVariants from "../examples/pagination/variants";
import PaginationLinks from "../examples/pagination/links";
import PaginationCursor from "../examples/pagination/cursor";
import PaginationLoading from "../examples/pagination/loading";

const entry: DocEntry = {
  slug: "pagination",
  title: "Pagination",
  group: "Navigation",
  description:
    "Page through long lists. Numbered pages with a stable width, a table footer bar with \"1–20 of 312\" and rows per page, SEO-friendly links, and cursor paging for APIs without a total.",
  source: ["components/pagination.tsx"],
  usage: `import { Pagination, PaginationBar } from "@vamos-ui/react";

<Pagination page={page} pageCount={52} onPageChange={setPage} />
<PaginationBar total={312} page={page} pageSize={20} onPageChange={setPage} onPageSizeChange={setPageSize} />`,
  demo: ex("demo", "Demo", "pagination/demo.tsx", PaginationDemo),
  examples: [
    ex("bar", "Table footer (HR)", "pagination/bar.tsx", PaginationBarExample, "PaginationBar formats the range with Intl and the locale. Changing the page size keeps the first visible row on screen."),
    ex("variants", "Variants and sizes", "pagination/variants.tsx", PaginationVariants, "numbers, compact (\"3 / 24\") and simple (Previous / Next). Below 640px numbers shows as compact through CSS."),
    ex("links", "Links for SEO (blog archive)", "pagination/links.tsx", PaginationLinks, "getHref renders real links through the app's router Link, so crawlers can follow every page."),
    ex("cursor", "Cursor-based (CRM)", "pagination/cursor.tsx", PaginationCursor, "CursorPagination for APIs that only know whether there is a next page. The pressed button shows the spinner."),
    ex("loading", "Loading", "pagination/loading.tsx", PaginationLoading, "loading puts a spinner on the current page and locks the controls until the next page arrives."),
  ],
  api: [
    { name: "Pagination", props: [
      { name: "page", type: "number", description: "Required. Current page, 1-based." },
      { name: "pageCount", type: "number", description: "Required. Number of pages." },
      { name: "onPageChange", type: "(page: number) => void", description: "Called with the requested page." },
      { name: "getHref", type: "(page: number) => string", description: "Render links instead of buttons (websites, SEO)." },
      { name: "siblingCount", type: "number", default: "1", description: "Pages on each side of the current one." },
      { name: "boundaryCount", type: "number", default: "1", description: "Pages always shown at the start and end." },
      { name: "variant", type: '"numbers" | "compact" | "simple"', default: '"numbers"', description: "Numbered, \"3 / 52\" with arrows, or Previous / Next." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "md follows --control-h." },
      { name: "hideOnSinglePage", type: "boolean", default: "true", description: "Render nothing when pageCount ≤ 1." },
      { name: "loading", type: "boolean", default: "false", description: "Spinner on the current page; controls locked." },
      { name: "labels", type: "Partial<PaginationLabels>", description: "Overrides: label, previous, next, previousPage, nextPage, goTo (\"Page {page}\"), page, range, pageSize, morePages, empty." },
    ] },
    { name: "PaginationBar", props: [
      { name: "total", type: "number", description: "Required. Total rows." },
      { name: "pageSize", type: "number", description: "Required. Rows per page." },
      { name: "pageSizeOptions", type: "number[]", default: "[10, 20, 50, 100]", description: "Choices for rows per page; [] hides the picker." },
      { name: "onPageSizeChange", type: "(size: number) => void", description: "Shows the rows-per-page picker when set." },
      { name: "page · onPageChange · size · labels · getHref", type: "—", description: "As on Pagination; pageCount is computed." },
    ] },
    { name: "CursorPagination", props: [
      { name: "hasPrev · hasNext", type: "boolean", description: "Required. Enable the buttons." },
      { name: "onPrev · onNext", type: "() => void", description: "Called on click." },
      { name: "loading", type: "boolean", default: "false", description: "Locks both; spinner on the pressed one." },
      { name: "status", type: "ReactNode", description: "Text between the buttons." },
    ] },
    { name: "usePaginationRange / paginationRange", props: [
      { name: "{ page, pageCount, siblingCount?, boundaryCount? }", type: "PaginationRangeOptions", description: "Returns the items to render: numbers plus \"ellipsis-start\" / \"ellipsis-end\". Constant length while paging." },
    ] },
    { name: "Primitives", props: [
      { name: "PaginationList · PaginationItem", type: "ul · li", description: "Layout parts." },
      { name: "PaginationLink", type: "{ href?; isActive?; disabled?; loading? }", description: "Router Link with href, otherwise a button." },
      { name: "PaginationPrevious · PaginationNext", type: "PaginationLink + { showLabel? }", description: "Arrows (flip in RTL), named \"Previous page\" / \"Next page\"." },
      { name: "PaginationEllipsis", type: "span", description: "\"…\" announced as \"More pages\"." },
    ] },
  ],
  notes: ["Moving focus to the top of the list after a page change is your app's job — focus the table caption or heading."],
  covers: ["Pagination"],
};

export default entry;
