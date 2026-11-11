"use client";

import * as React from "react";
import { ChevronsDownUp, ChevronsUpDown, Download, Search } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { addDecimal } from "../../_shared/money";
import { customersById } from "../../_shared/orders";
import { GroupRows } from "./group-rows";
import {
  groupByLabels,
  groupOrders,
  netOf,
  orders,
  scopeLabels,
  scopeStatuses,
  sortLabels,
  unitsOf,
  type GroupBy,
  type GroupSort,
  type OrderGroup,
  type StatusScope,
} from "./grouped-orders-data";

const scopes = Object.keys(scopeLabels) as StatusScope[];


/** Orders grouped by customer (or status / channel): expandable groups and orders, subtotals, a grand total. */
export function GroupedOrders() {
  const { c, t, f, money } = useBlockFormat();
  const [q, setQ] = React.useState("");
  const [scope, setScope] = React.useState<StatusScope>("all");
  const [by, setBy] = React.useState<GroupBy>("customer");
  const [sort, setSort] = React.useState<GroupSort>("revenue");
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(() => new Set());
  const [openOrders, setOpenOrders] = React.useState<Set<string>>(() => new Set());
  const seeded = React.useRef(false);

  const nameOf = React.useCallback((g: OrderGroup) => (typeof g.name === "string" ? g.name : t(g.name)), [t]);

  const filtered = React.useMemo(() => {
    const allowed = scopeStatuses[scope];
    const needle = q.trim().toLocaleLowerCase();
    return orders.filter((o) => {
      if (allowed && !allowed.includes(o.status)) return false;
      if (!needle) return true;
      const cu = customersById[o.customerId];
      return [o.number, cu?.name, cu?.city, ...o.lines.map((l) => `${l.sku} ${t(l.name)}`)].join(" ").toLocaleLowerCase().includes(needle);
    });
  }, [q, scope, t]);

  const groups = React.useMemo(() => {
    const list = groupOrders(filtered, by);
    const cmp: Record<GroupSort, (a: OrderGroup, b: OrderGroup) => number> = {
      revenue: (a, b) => Number(b.net) - Number(a.net),
      orders: (a, b) => b.orders.length - a.orders.length || Number(b.net) - Number(a.net),
      latest: (a, b) => b.latest.localeCompare(a.latest),
      name: (a, b) => nameOf(a).localeCompare(nameOf(b)),
    };
    return list.sort(cmp[sort]);
  }, [filtered, by, sort, nameOf]);

  // Open the two biggest customers on first render so the nesting is visible straight away.
  React.useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    setOpenGroups(new Set(groups.slice(0, 2).map((g) => `customer:${g.key}`)));
    const first = groups[0]?.orders[0];
    if (first) setOpenOrders(new Set([first.id]));
  }, [groups]);

  const gid = (g: OrderGroup) => `${by}:${g.key}`;
  const allOpen = groups.length > 0 && groups.every((g) => openGroups.has(gid(g)));
  const toggleGroup = (g: OrderGroup) =>
    setOpenGroups((s) => {
      const n = new Set(s);
      if (n.has(gid(g))) n.delete(gid(g));
      else n.add(gid(g));
      return n;
    });
  const toggleOrder = (id: string) =>
    setOpenOrders((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const net = addDecimal(filtered.map(netOf));
  const units = filtered.reduce((s, o) => s + unitsOf(o), 0);
  const paying = filtered.filter((o) => Number(netOf(o)) > 0).length;
  const aov = paying ? (Number(net) / paying).toFixed(2) : "0.00";
  const allGroups = groupOrders(orders, "customer");
  const repeaters = allGroups.filter((g) => g.orders.length > 1).length;
  const repeat = repeaters / allGroups.length;
  const maxNet = Math.max(1, ...groups.map((g) => Number(g.net)));
  const groupWord = { customer: c("customers", "müşteri"), status: c("statuses", "durum"), channel: c("channels", "kanal") }[by];

  return (
    <div className="mx-auto w-full max-w-[1320px]">
      <PageHeader
        eyebrow={c("Shop · last 30 days", "Mağaza · son 30 gün")}
        title={c("Orders by customer", "Müşteriye göre siparişler")}
        meta={<Badge tone="outline" className="tabular">{orders.length}</Badge>}
        description={c(
          "Every order grouped, with subtotals per group. Open a group to see its orders, and an order to see what was in the box.",
          "Tüm siparişler gruplanmış, her grubun ara toplamıyla. Siparişleri görmek için grubu, içeriği görmek için siparişi açın.",
        )}
        actions={
          <Button
            onClick={() =>
              toast.success(c("Export started", "Dışa aktarma başladı"), {
                description: c(`${filtered.length} orders in ${groups.length} groups, CSV with subtotals.`, `${groups.length} grupta ${filtered.length} sipariş, ara toplamlı CSV.`),
              })
            }
          >
            <Download /> {c("Export", "Dışa aktar")}
          </Button>
        }
      />

      <dl className="surface mt-6 grid grid-cols-2 overflow-hidden rounded-ui-lg lg:grid-cols-4">
        {[
          [c("Net revenue", "Net ciro"), money({ amount: net, currency: "TRY" }, { whole: true }), c(`${filtered.length} orders shown`, `${filtered.length} sipariş gösteriliyor`)],
          [c("Average order", "Ortalama sepet"), money({ amount: aov, currency: "TRY" }, { whole: true }), c("cancelled and refunded excluded", "iptal ve iadeler hariç")],
          [c("Units", "Adet"), f.number(units), c(`across ${groups.length} ${groupWord}`, `${groups.length} ${groupWord} genelinde`)],
          [c("Repeat customers", "Tekrar gelen müşteri"), f.percent(repeat), c(`${repeaters} of ${allGroups.length} ordered again`, `${allGroups.length} müşteriden ${repeaters} tekrar sipariş verdi`)],
        ].map(([label, value, note], i) => (
          <div key={label} className={cn("grid content-start gap-1 border-line px-4 py-3.5 sm:px-5 sm:py-4", i % 2 === 1 && "border-s", i >= 2 && "max-lg:border-t", i === 2 && "lg:border-s")}>
            <dt className="text-[12px] text-fg-muted">{label}</dt>
            <dd className="tabular text-[19px] leading-tight font-medium tracking-tight text-fg sm:text-[23px]">{value}</dd>
            <dd className="text-[11.5px] text-fg-subtle">{note}</dd>
          </div>
        ))}
      </dl>

      <Card className="mt-6 min-w-0 overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-(--cell-px) py-3">
          <Input
            type="search"
            size="sm"
            leading={<Search />}
            clearable
            onClear={() => setQ("")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={c("Search orders", "Siparişlerde ara")}
            placeholder={c("Order, customer or product…", "Sipariş, müşteri ya da ürün…")}
            className="w-full sm:w-64"
          />
          <div className="-mx-1 max-w-full overflow-x-auto px-1 py-0.5">
            <ToggleGroup type="single" size="sm" value={scope} onValueChange={(v) => setScope((v || "all") as StatusScope)} aria-label={c("Order status", "Sipariş durumu")}>
              {scopes.map((s) => (
                <ToggleGroupItem key={s} value={s} className="whitespace-nowrap">
                  {t(scopeLabels[s])}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-2 sm:ms-auto">
            <Select
              size="sm"
              className="w-36 sm:w-40"
              aria-label={c("Group by", "Gruplama")}
              value={by}
              onValueChange={(v) => v && setBy(v as GroupBy)}
              items={(Object.keys(groupByLabels) as GroupBy[]).map((k) => ({ value: k, label: c(`Group: ${t(groupByLabels[k])}`, `Grup: ${t(groupByLabels[k])}`) }))}
            />
            <Select
              size="sm"
              className="w-36 sm:w-40"
              aria-label={c("Sort groups", "Grupları sırala")}
              value={sort}
              onValueChange={(v) => v && setSort(v as GroupSort)}
              items={(Object.keys(sortLabels) as GroupSort[]).map((k) => ({ value: k, label: t(sortLabels[k]) }))}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenGroups(allOpen ? new Set() : new Set(groups.map(gid)))}
              aria-label={allOpen ? c("Collapse all groups", "Tüm grupları daralt") : c("Expand all groups", "Tüm grupları genişlet")}
            >
              {allOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
              <span className="max-sm:sr-only">{allOpen ? c("Collapse all", "Hepsini daralt") : c("Expand all", "Hepsini aç")}</span>
            </Button>
          </div>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            kind="no-results"
            className="py-16"
            title={c("No orders match", "Eşleşen sipariş yok")}
            description={c("Try another word, or show all statuses.", "Başka bir kelime deneyin ya da tüm durumları gösterin.")}
            actions={
              <Button
                size="sm"
                onClick={() => {
                  setQ("");
                  setScope("all");
                }}
              >
                {c("Clear search and filters", "Aramayı ve filtreleri temizle")}
              </Button>
            }
          />
        ) : (
          <TableContainer className="rounded-none border-0">
            <Table density="inherit" bordered="rows">
              <TableCaption visuallyHidden>
                {c(`Orders grouped by ${t(groupByLabels[by]).toLowerCase()}, with subtotals`, `${t(groupByLabels[by])} bazında gruplanmış siparişler, ara toplamlarla`)}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 ps-3">
                    <span className="sr-only">{c("Expand", "Aç")}</span>
                  </TableHead>
                  <TableHead>{c("Order", "Sipariş")}</TableHead>
                  <TableHead className="max-lg:hidden">{c("Placed", "Tarih")}</TableHead>
                  <TableHead className="max-sm:hidden">{c("Status", "Durum")}</TableHead>
                  <TableHead className="max-xl:hidden">{by === "channel" ? c("Customer", "Müşteri") : c("Channel", "Kanal")}</TableHead>
                  <TableHead className="max-xl:hidden">{c("Payment", "Ödeme")}</TableHead>
                  <TableHead numeric className="max-lg:hidden">
                    {c("Units", "Adet")}
                  </TableHead>
                  <TableHead numeric className="pe-5">
                    {c("Total", "Tutar")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              {groups.map((g) => (
                <GroupRows
                  key={gid(g)}
                  group={g}
                  by={by}
                  name={nameOf(g)}
                  share={Number(g.net) / maxNet}
                  open={openGroups.has(gid(g))}
                  onToggle={() => toggleGroup(g)}
                  openOrders={openOrders}
                  onToggleOrder={toggleOrder}
                />
              ))}
              <TableFooter>
                <TableRow className="bg-surface-2">
                  <TableCell colSpan={2} className="ps-3">
                    <span className="grid ps-8 leading-tight">
                      <span className="font-display text-[15px] text-fg">{c("Grand total", "Genel toplam")}</span>
                      <span className="tabular text-[12px] font-normal text-fg-subtle sm:hidden">{c(`${filtered.length} orders`, `${filtered.length} sipariş`)}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-fg-muted max-lg:hidden">
                    {c(`${groups.length} ${groupWord}`, `${groups.length} ${groupWord}`)}
                  </TableCell>
                  <TableCell className="text-fg-muted max-sm:hidden">
                    <span className="tabular whitespace-nowrap">{c(`${filtered.length} orders`, `${filtered.length} sipariş`)}</span>
                  </TableCell>
                  <TableCell className="max-xl:hidden" />
                  <TableCell className="max-xl:hidden" />
                  <TableCell numeric className="max-lg:hidden">
                    {f.number(units)}
                  </TableCell>
                  <TableCell numeric className="pe-5 text-[15px] font-semibold text-fg">
                    {money({ amount: net, currency: "TRY" })}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        )}
        <p className="border-t border-line px-(--cell-px) py-2.5 text-[12px] text-fg-subtle">
          {c("Totals include 20% VAT and shipping. Cancelled and refunded orders count as zero.", "Tutarlara %20 KDV ve kargo dahildir. İptal ve iade edilen siparişler sıfır sayılır.")}
        </p>
      </Card>
    </div>
  );
}
