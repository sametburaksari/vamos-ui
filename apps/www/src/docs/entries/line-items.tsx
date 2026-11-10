import { ex, type DocEntry } from "../types";
import LineItemsDemo from "../examples/line-items/demo";
import LineItemsTrKdv from "../examples/line-items/tr-kdv";
import LineItemsTaxInclusive from "../examples/line-items/tax-inclusive";
import LineItemsDiscounts from "../examples/line-items/discounts";
import LineItemsItemPicker from "../examples/line-items/item-picker";
import LineItemsReadOnly from "../examples/line-items/read-only";
import LineItemsMobile from "../examples/line-items/mobile";

const entry: DocEntry = {
  slug: "line-items",
  title: "Line items",
  group: "Forms & inputs",
  description:
    "Editable product and service rows — item, quantity, unit, price, discount, tax rate and a generic withholding field — with exact totals per tax rate. Money is decimal strings end to end (BigInt maths, half-up rounding), tax rules come from a locale pack (Turkish KDV and tevkifat ship in locale-data), and rows reorder by drag, keyboard or menu.",
  source: ["business/line-items.tsx", "business/line-items-core.ts"],
  basedOn: "Sortable (dnd-kit) · Record picker · Currency / Number input",
  usage: `import { LineItems, trLineTaxPack, computeLineTotals } from "@vamos-cms/ui/business";

<LineItems
  currency="TRY"
  taxPack={trLineTaxPack("2026-11-10")}
  units={["hour", "day", "pcs"]}
  value={rows}
  onValueChange={(rows, totals) => setDraft({ rows, payable: totals.payable })}
/>

// the same maths on the server
const totals = computeLineTotals(rows, { taxPack: trLineTaxPack(), pricesIncludeTax: false });`,
  demo: ex("demo", "Demo", "line-items/demo.tsx", LineItemsDemo),
  examples: [
    ex("tr-kdv", "Turkish KDV and tevkifat", "line-items/tr-kdv.tsx", LineItemsTrKdv, "trLineTaxPack() reads the KDV rates in force on a date and the tevkifat codes. Withholding is a generic field (602 = 9/10); the summary shows KDV per rate, the withheld VAT and the payable amount, plus the amount in words."),
    ex("tax-inclusive", "Tax-inclusive prices", "line-items/tax-inclusive.tsx", LineItemsTaxInclusive, "Retail checkout: prices include VAT. The entered gross is kept exactly; the net base is derived per line."),
    ex("discounts", "Row and document discounts", "line-items/discounts.tsx", LineItemsDiscounts, "Each discount toggles between % and an amount. The document discount is allocated pro-rata to the lines (largest remainder), so the cents always add up."),
    ex("item-picker", "Rows from a product catalogue", "line-items/item-picker.tsx", LineItemsItemPicker, "itemSource is a Record picker source; onItemPick copies name, price, unit and tax rate into the row."),
    ex("read-only", "Read-only (printable)", "line-items/read-only.tsx", LineItemsReadOnly, "readOnly renders plain text with row numbers — invoice previews, PDFs, customer portals."),
    ex("mobile", "Stacked on small screens", "line-items/mobile.tsx", LineItemsMobile, "A container query stacks each row into a card below 40rem; header names become field labels."),
  ],
  api: [
    { name: "LineItems", props: [
      { name: "value / defaultValue", type: "LineItem[]", description: "Rows. LineItem = { id, itemId?, description, quantity, unit?, unitPrice, discount?, taxRate?, withholding? } — every number is a decimal string." },
      { name: "onValueChange", type: "(rows: LineItem[], totals: LineTotals) => void", description: "Called on every edit with the recalculated totals." },
      { name: "currency", type: "string", default: "LocaleProvider currency", description: "ISO 4217 code for prices and totals." },
      { name: "taxPack", type: "LineTaxPack", default: "vatLineTaxPack", description: "Rates, withholding codes, rounding and the tax name. trLineTaxPack(date) builds the Turkish KDV pack from locale-data." },
      { name: "taxRates", type: "{ value: string; label: string }[]", description: "Overrides the pack's rates." },
      { name: "pricesIncludeTax", type: "boolean", default: "false", description: "Unit prices are gross; nets are derived." },
      { name: "units", type: "string[]", description: "Unit choices (a Select). Without it the unit cell is free text." },
      { name: "itemSource", type: "RecordSource<R>", description: "Products / services for the Item column." },
      { name: "onItemPick", type: "(record: R) => Partial<LineItem>", description: "Fields copied into the row when a record is picked." },
      { name: "columns", type: '("item" | "description" | "quantity" | "unit" | "unitPrice" | "discount" | "tax" | "withholding" | "total")[]', description: "Visible columns in order. Default: all that apply (item with itemSource, withholding when the pack has codes)." },
      { name: "documentDiscount", type: "{ type: \"percent\" | \"amount\"; value: string }", description: "Discount on the whole document, allocated pro-rata." },
      { name: "onDocumentDiscountChange", type: "(d?: LineDiscount) => void", description: "Makes the document discount editable in the summary." },
      { name: "readOnly", type: "boolean", default: "false", description: "Printable summary: no inputs, numbered rows." },
      { name: "disabled", type: "boolean", default: "false", description: "Shows values but blocks editing." },
      { name: "name", type: "string", description: "Hidden inputs for native form posts: name[0][quantity], name[0][discount][type]…" },
      { name: "minRows", type: "number", default: "1", description: "Rows that can't be deleted." },
      { name: "newRow", type: "() => Partial<LineItem>", description: "Defaults for added rows." },
      { name: "hideSummary", type: "boolean", default: "false", description: "Hide the totals block (render LineItemsSummary elsewhere)." },
      { name: "summaryFooter", type: "ReactNode", description: "Extra content under the totals (amount in words, notes)." },
      { name: "labels", type: "Partial<LineItemsLabels>", description: "Built-in strings (lineItems namespace)." },
    ] },
    { name: "LineItemsSummary", props: [
      { name: "totals", type: "LineTotals", description: "From computeLineTotals or onValueChange." },
      { name: "currency / taxPack / pricesIncludeTax", type: "string / LineTaxPack / boolean", description: "As on LineItems." },
      { name: "documentDiscount / onDocumentDiscountChange", type: "LineDiscount / fn", description: "Editable document discount row." },
    ] },
    { name: "computeLineTotals(rows, options)", props: [
      { name: "options.taxPack", type: "LineTaxPack", description: "Rounding: \"line\" (per line, tr e-invoice) or \"document\" (once per rate)." },
      { name: "options.pricesIncludeTax", type: "boolean", description: "Gross entry." },
      { name: "options.documentDiscount", type: "LineDiscount", description: "Allocated pro-rata to line nets." },
      { name: "returns", type: "LineTotals", description: "lines[], subtotal, discount, net, byRate[], withholding[], tax, total, withheld, payable, invalidCount — all decimal strings." },
    ] },
  ],
  notes: [
    "Keyboard: Enter on the last field of the last row adds a row; Alt+↑/↓ moves a row; Ctrl/⌘+Enter inserts below; Ctrl/⌘+Shift+Backspace deletes. The row menu offers the same actions without shortcuts or dragging.",
    "Totals are announced politely (debounced) and every input is named \"{column}, row {n}\".",
  ],
  covers: ["Line items"],
};

export default entry;
