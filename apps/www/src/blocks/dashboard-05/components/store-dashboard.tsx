"use client";

import { ExternalLink, PackagePlus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Item,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemMeta,
  ItemTitle,
  PageHeader,
  Sparkline,
  Stat,
  StatGroup,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  sparklineSummary,
  useFormat,
  type BadgeProps,
} from "@vamos-ui/react";
import { DonutChart, Funnel } from "@vamos-ui/react/charts";
import { RevenueCard } from "./revenue-card";
import { TODAY, channelConfig, channels, checkout, orders, products, type Fulfillment, type Payment } from "./data";

const paymentTone: Record<Payment, BadgeProps["tone"]> = { Paid: "success", Pending: "warning", Refunded: "neutral" };
const fulfillmentTone: Record<Fulfillment, BadgeProps["tone"]> = { Unfulfilled: "warning", Shipped: "info", Delivered: "success", Returned: "neutral" };

function RecentOrders() {
  const f = useFormat();
  return (
    <Card className="ui-rise min-w-0 lg:col-span-2" style={{ animationDelay: "300ms" }}>
      <CardHeader titleAs="h2" title="Recent orders" description="3 waiting to be packed" action={<Button variant="link" size="sm">All orders</Button>} />
      <TableContainer className="border-t border-line">
        <Table>
          <TableCaption visuallyHidden>Most recent orders</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead className="max-sm:hidden">Placed</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="max-md:hidden">Fulfilment</TableHead>
              <TableHead numeric>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const today = o.placed.slice(0, 10) === TODAY;
              return (
                <TableRow key={o.number}>
                  <TableCell rowHeader>
                    <a href={`#order-${o.number.slice(1)}`} className="rounded-ui-sm font-mono text-[13px] font-medium text-fg hover:underline focus-ring">{o.number}</a>
                    <div className="truncate text-xs text-fg-subtle">{o.customer} · {o.city} · {o.items} {o.items === 1 ? "item" : "items"}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-fg-muted tabular max-sm:hidden">
                    {today ? `Today, ${f.time(o.placed, { hour: "numeric", minute: "2-digit" })}` : f.date(o.placed, { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell><Badge tone={paymentTone[o.payment]} dot>{o.payment}</Badge></TableCell>
                  <TableCell className="max-md:hidden"><Badge tone={fulfillmentTone[o.fulfillment]} shape="square">{o.fulfillment}</Badge></TableCell>
                  <TableCell numeric className="font-medium text-fg">{f.currency(o.total, { currency: "USD" })}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function TopProducts() {
  const f = useFormat();
  const domain = [0, Math.max(...products.flatMap((p) => p.weekly))] as const;
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "360ms" }}>
      <CardHeader titleAs="h2" title="Top products" description="By revenue, last 30 days" action={<Button variant="link" size="sm">Catalogue</Button>} />
      <ItemList as="ol" className="border-t border-line">
        {products.map((p, i) => (
          <Item key={p.sku}>
            <ItemLeading>
              <span className="grid size-8 place-items-center rounded-ui-sm bg-surface-2 font-mono text-xs text-fg-muted tabular">{i + 1}</span>
            </ItemLeading>
            <ItemContent>
              <ItemTitle>{p.name}</ItemTitle>
              <ItemDescription className="flex items-center gap-2">
                <span className="truncate">{p.variant}</span>
                {p.stock < 20 ? <Badge tone="danger" size="sm">{p.stock} left</Badge> : null}
              </ItemDescription>
            </ItemContent>
            <Sparkline values={p.weekly} size="xs" domain={domain} className="hidden shrink-0 text-accent-ink sm:block" label={`Weekly units: ${sparklineSummary(p.weekly)}`} />
            <ItemMeta className="w-20 text-end">
              <div className="font-mono text-[13px] text-fg tabular">{f.currency(p.revenue, { currency: "USD" }, { maximumFractionDigits: 0 })}</div>
              <div className="text-[11.5px] tabular">{f.number(p.units)} sold</div>
            </ItemMeta>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}

export function StoreDashboard() {
  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        size="lg"
        eyebrow="Store · Last 30 days"
        title={<>Hearth & <em>Hollow</em></>}
        description="Sales across the online store, Instagram, marketplaces and the shop counter."
        meta={<Badge tone="success" dot>Store online</Badge>}
        actions={
          <>
            <Button variant="secondary"><ExternalLink aria-hidden />View store</Button>
            <Button variant="primary"><PackagePlus aria-hidden />Add product</Button>
          </>
        }
      />

      <StatGroup columns={4} variant="plain" className="ui-rise">
        <Stat variant="plain" label="Revenue" value="84210.00" format={{ type: "currency", currency: "USD", options: { maximumFractionDigits: 0 } }} delta={0.163} comparison="vs previous 30 days" trend={[61, 64, 62, 70, 73, 71, 78, 84]} />
        <Stat variant="plain" label="Orders" value={1236} delta={0.091} comparison="vs previous 30 days" trend={[920, 980, 1010, 990, 1080, 1120, 1190, 1236]} />
        <Stat variant="plain" label="Average order" value="68.13" format={{ type: "currency", currency: "USD" }} delta={0.066} comparison="vs previous 30 days" />
        <Stat variant="plain" label="Conversion rate" value={0.028} format={{ type: "percent", options: { maximumFractionDigits: 1 } }} delta={-0.035} comparison="vs previous 30 days" trend={[3.1, 3.0, 2.9, 3.0, 2.9, 2.8, 2.8, 2.8]} />
      </StatGroup>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <RevenueCard />
        <Card className="ui-rise min-w-0" style={{ animationDelay: "180ms" }}>
          <CardHeader titleAs="h2" title="Sales by channel" description="Revenue share" />
          <CardBody className="pt-1">
            <DonutChart title="Revenue by sales channel, last 30 days" data={channels} nameKey="channel" valueKey="revenue" config={channelConfig} format={{ currency: "USD", compact: true }} centerLabel="Revenue" legend="bottom" size="sm" />
          </CardBody>
        </Card>
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <RecentOrders />
        <TopProducts />
      </div>

      <Card className="ui-rise mt-(--gap) min-w-0" style={{ animationDelay: "420ms" }}>
        <CardHeader titleAs="h2" title="Checkout funnel" description="From session to paid order, last 30 days" />
        <CardBody className="pt-1">
          <Funnel title="Checkout funnel, last 30 days" steps={checkout} show={["conversion", "overall"]} color="chart-2" size="sm" className="w-full" />
        </CardBody>
      </Card>
    </div>
  );
}
