"use client";

import { ArrowRight, Download, SlidersHorizontal } from "lucide-react";
import {
  Avatar, Badge, Button, Card, CardBody, CardHeader, EmptyState, PageHeader, Progress, SmartLink, Stat, StatGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, type BadgeProps,
} from "@vamos-ui/react";
import { titleFor } from "./nav";

type Status = "In transit" | "Loading" | "Delayed" | "Customs hold" | "Delivered";

const tone: Record<Status, BadgeProps["tone"]> = {
  "In transit": "info",
  Loading: "neutral",
  Delayed: "warning",
  "Customs hold": "danger",
  Delivered: "success",
};

const shipments: { id: string; from: string; to: string; customer: string; carrier: string; eta: string; status: Status; progress: number }[] = [
  { id: "FF-20418", from: "Oslo", to: "Gothenburg", customer: "Nordvik Seafood", carrier: "Fjord Freight", eta: "Nov 10, 16:40", status: "Customs hold", progress: 82 },
  { id: "FF-20415", from: "Bergen", to: "Rotterdam", customer: "Hagen Timber AS", carrier: "Maersk Line", eta: "Nov 12, 09:00", status: "In transit", progress: 46 },
  { id: "FF-20411", from: "Oslo", to: "Trondheim", customer: "Kiwi Norge", carrier: "Fjord Freight", eta: "Nov 10, 18:15", status: "Delayed", progress: 61 },
  { id: "FF-20409", from: "Stavanger", to: "Hamburg", customer: "Equinor Supply", carrier: "DFDS", eta: "Nov 11, 07:30", status: "In transit", progress: 34 },
  { id: "FF-20402", from: "Drammen", to: "Copenhagen", customer: "Brødrene Dahl", carrier: "PostNord", eta: "Nov 10, 14:05", status: "Delivered", progress: 100 },
  { id: "FF-20398", from: "Oslo", to: "Stockholm", customer: "Ikea Slependen", carrier: "Fjord Freight", eta: "Nov 11, 11:20", status: "Loading", progress: 8 },
  { id: "FF-20391", from: "Kristiansand", to: "Aarhus", customer: "Tine SA", carrier: "Color Line", eta: "Nov 10, 21:50", status: "In transit", progress: 71 },
];

const docks = [
  { name: "Alnabru terminal", used: 18, total: 22 },
  { name: "Bergen Dokken", used: 9, total: 14 },
  { name: "Gardermoen cargo", used: 13, total: 13 },
];

export function ShipmentsPage({ path }: { path: string }) {
  const exceptionsOnly = path === "/ops/shipments/exceptions";
  const known = path === "/ops" || path === "/ops/shipments" || exceptionsOnly;
  if (!known) return <PlaceholderPage path={path} />;

  const rows = exceptionsOnly ? shipments.filter((s) => s.status === "Delayed" || s.status === "Customs hold") : shipments;

  return (
    <div className="grid gap-(--gap)">
      <PageHeader
        eyebrow="Operations · Tuesday, November 10"
        title={exceptionsOnly ? "Exceptions" : "Shipments"}
        description={exceptionsOnly ? "Shipments that need a decision before the next cut-off at 17:00." : "248 shipments on the road, 31 loading, 12 due before end of day."}
        actions={
          <>
            <Button variant="secondary" size="sm"><SlidersHorizontal aria-hidden /> Filters</Button>
            <Button variant="secondary" size="sm"><Download aria-hidden /> Export</Button>
          </>
        }
      />

      <StatGroup columns={4}>
        <Stat label="In transit" value={248} delta={0.064} deltaKind="percent" comparison="vs last Tuesday" trend={[212, 220, 218, 231, 236, 241, 248]} />
        <Stat label="On-time rate" value={0.942} format="percent" delta={-0.011} deltaKind="percent" comparison="vs last week" trend={[0.95, 0.953, 0.949, 0.951, 0.946, 0.944, 0.942]} />
        <Stat label="Exceptions" value={4} intent="lower-is-better" delta={-2} deltaKind="number" comparison="vs yesterday" trend={[7, 5, 6, 6, 8, 6, 4]} trendVariant="bars" />
        <Stat label="Revenue today" value={386450} format={{ type: "currency", currency: "NOK", options: { maximumFractionDigits: 0 } }} target={{ value: 450000, label: "Daily target" }} />
      </StatGroup>

      <div className="grid gap-(--gap) xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader titleAs="h2" title={exceptionsOnly ? "Needs attention" : "Active shipments"} description={`${rows.length} of 248 · sorted by ETA`} action={<Button variant="ghost" size="sm">View all <ArrowRight aria-hidden className="rtl:-scale-x-100" /></Button>} divider />
          <TableContainer aria-label="Active shipments">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead className="max-sm:hidden">Customer</TableHead>
                  <TableHead className="max-lg:hidden">Carrier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="max-md:hidden" style={{ width: 140 }}>Progress</TableHead>
                  <TableHead align="end">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id} highlighted={s.status === "Customs hold"}>
                    <TableCell>
                      <span className="block font-mono text-[12.5px] text-fg">{s.id}</span>
                      <span className="block text-[12px] text-fg-muted">{s.from} → {s.to}</span>
                    </TableCell>
                    <TableCell className="max-sm:hidden">{s.customer}</TableCell>
                    <TableCell className="text-fg-muted max-lg:hidden">{s.carrier}</TableCell>
                    <TableCell><Badge tone={tone[s.status]}>{s.status}</Badge></TableCell>
                    <TableCell className="max-md:hidden">
                      <Progress size="xs" value={s.progress} aria-label={`${s.id} route progress`} tone={s.status === "Delivered" ? "success" : s.status === "Customs hold" ? "danger" : "accent"} />
                    </TableCell>
                    <TableCell align="end" className="whitespace-nowrap tabular text-fg-muted">{s.eta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <div className="grid content-start gap-(--gap) md:grid-cols-2 xl:grid-cols-1">
          <Card>
            <CardHeader titleAs="h2" title="Dock capacity" description="Bays in use right now" />
            <CardBody className="grid gap-4">
              {docks.map((d) => (
                <Progress key={d.name} label={d.name} value={d.used} max={d.total} display="fraction" tone="auto" showValue />
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader titleAs="h2" title="On shift" description="Dispatch · Oslo" />
            <CardBody>
              <ul className="grid gap-3">
                {[
                  { name: "Ingrid Solberg", role: "Shift lead", status: "online" as const },
                  { name: "Tariq Haddad", role: "Dispatcher", status: "busy" as const },
                  { name: "Maja Lindqvist", role: "Customs broker", status: "away" as const },
                ].map((p) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <Avatar name={p.name} size="sm" status={p.status} />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                      <span className="block truncate text-[12px] text-fg-muted">{p.role}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ path }: { path: string }) {
  const title = titleFor(path);
  return (
    <div className="grid gap-(--gap)">
      <PageHeader eyebrow="Operations" title={title} />
      <Card>
        <EmptyState
          kind="first-use"
          title={`${title} lives here`}
          description="This block only ships the shell and the Shipments page. Drop your own page into the shell's content slot."
          actions={<Button asChild variant="secondary" size="sm"><SmartLink href="/ops/shipments">Back to shipments</SmartLink></Button>}
        />
      </Card>
    </div>
  );
}
