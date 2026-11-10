"use client";

import { CalendarPlus, Download, Megaphone } from "lucide-react";
import {
  Avatar, AvatarGroup, Badge, Button, Card, CardBody, CardHeader, EmptyState, IconButton, PageHeader, Progress, SmartLink,
  Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, useFormat,
} from "@vamos-ui/react";
import { titleFor } from "./nav";

const balances = [
  { label: "Annual leave", left: 11, total: 25 },
  { label: "Wellbeing days", left: 2, total: 3 },
  { label: "Learning budget (days)", left: 4, total: 5 },
];

const upcoming = [
  { what: "Annual leave", when: "Dec 22 – Jan 2", days: "7 working days", status: "Approved" as const },
  { what: "Dentist", when: "Nov 21, 09:00 – 11:00", days: "2 hours", status: "Pending" as const },
];

const payslips = [
  { period: "October 2026", paid: "Oct 31", gross: "5240.00", net: "3412.80" },
  { period: "September 2026", paid: "Sep 30", gross: "5240.00", net: "3412.80" },
  { period: "August 2026", paid: "Aug 29", gross: "5240.00", net: "3398.15" },
];

const away = [
  { name: "Liam O'Connor", note: "Parental leave · until Mar 28" },
  { name: "Can Yıldız", note: "Annual leave · back Thursday" },
  { name: "Priya Raman", note: "Conference · Lisbon" },
  { name: "Ece Demir", note: "Sick leave · today" },
  { name: "Jonas Weber", note: "Remote · Berlin" },
];

export function SelfServiceHome({ path }: { path: string }) {
  const f = useFormat();
  if (path !== "/me") return <PlaceholderPage path={path} />;
  const eur = (v: string) => f.currency(v, "EUR");

  return (
    <div className="mx-auto grid w-full max-w-[1120px] gap-(--gap)">
      <PageHeader
        size="lg"
        eyebrow="Tuesday, November 10"
        title={<>Good morning, <em>Sofia</em></>}
        description="Your next day off is the Dentist appointment on Nov 21. One request is waiting for Mert's approval."
        actions={<Button variant="secondary" size="sm"><CalendarPlus aria-hidden /> Request time off</Button>}
      />

      <div className="grid gap-(--gap) md:grid-cols-2 lg:grid-cols-3">
        <Card as="section" aria-labelledby="ss-balance">
          <CardHeader titleId="ss-balance" titleAs="h2" title="Time off left" description="Resets on Jan 1, 2027" />
          <CardBody className="grid gap-4">
            {balances.map((b) => (
              <Progress key={b.label} label={b.label} value={b.left} max={b.total} display="fraction" showValue size="sm" />
            ))}
          </CardBody>
        </Card>

        <Card as="section" aria-labelledby="ss-upcoming">
          <CardHeader titleId="ss-upcoming" titleAs="h2" title="Upcoming" description="Your booked time off" />
          <CardBody>
            <ul className="divide-y divide-line">
              {upcoming.map((u) => (
                <li key={u.what} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="min-w-0 flex-1 leading-snug">
                    <span className="block text-[13.5px] font-medium">{u.what}</span>
                    <span className="block text-[12.5px] text-fg-muted tabular">{u.when} · {u.days}</span>
                  </span>
                  <Badge tone={u.status === "Approved" ? "success" : "warning"}>{u.status}</Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card as="section" aria-labelledby="ss-away" className="md:col-span-2 lg:col-span-1">
          <CardHeader titleId="ss-away" titleAs="h2" title="Away this week" description="Design & Engineering" action={<AvatarGroup max={4} size="sm" aria-label="Away this week">{away.map((p) => <Avatar key={p.name} name={p.name} />)}</AvatarGroup>} />
          <CardBody>
            <ul className="grid gap-2.5">
              {away.slice(0, 4).map((p) => (
                <li key={p.name} className="flex items-center gap-2.5 text-[13px]">
                  <Avatar name={p.name} size="xs" aria-hidden />
                  <span className="truncate"><span className="font-medium">{p.name}</span> <span className="text-fg-muted">· {p.note}</span></span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-(--gap) lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card as="section" aria-labelledby="ss-pay" className="min-w-0 overflow-hidden">
          <CardHeader titleId="ss-pay" titleAs="h2" title="Payslips" description="Paid on the last working day of the month" divider />
          <TableContainer>
            <Table aria-labelledby="ss-pay">
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="max-sm:hidden">Paid</TableHead>
                  <TableHead numeric className="max-sm:hidden">Gross</TableHead>
                  <TableHead numeric>Net</TableHead>
                  <TableHead><span className="sr-only">Download</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((p) => (
                  <TableRow key={p.period}>
                    <TableCell className="font-medium">{p.period}</TableCell>
                    <TableCell className="text-fg-muted max-sm:hidden">{p.paid}</TableCell>
                    <TableCell numeric className="max-sm:hidden">{eur(p.gross)}</TableCell>
                    <TableCell numeric>{eur(p.net)}</TableCell>
                    <TableCell align="end" className="w-12">
                      <IconButton size="xs" variant="ghost" label={`Download ${p.period} payslip`}><Download /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Card as="section" aria-labelledby="ss-news">
          <CardHeader titleId="ss-news" titleAs="h2" title="From People Ops" />
          <CardBody>
            <ul className="grid gap-4">
              <li className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-ui-sm bg-accent-soft text-accent-ink"><Megaphone aria-hidden className="size-4" /></span>
                <span className="leading-snug">
                  <span className="block text-[13.5px] font-medium">Open enrolment closes Nov 28</span>
                  <span className="block text-[12.5px] text-fg-muted">Pick your 2027 health plan and pension rate in Benefits.</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Avatar name="Mert Aydın" size="sm" />
                <span className="leading-snug">
                  <span className="block text-[13.5px] font-medium">Winter office hours</span>
                  <span className="block text-[12.5px] text-fg-muted">The studio closes at 16:00 on Fridays from Dec 5. — Mert</span>
                </span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function PlaceholderPage({ path }: { path: string }) {
  const title = titleFor(path);
  return (
    <div className="mx-auto grid w-full max-w-[1120px] gap-(--gap)">
      <PageHeader title={title} />
      <Card>
        <EmptyState
          title={`${title} goes here`}
          description="This block ships the shell and the Home page. Put your own page in the shell's content slot."
          actions={<Button asChild variant="secondary" size="sm"><SmartLink href="/me">Back to Home</SmartLink></Button>}
        />
      </Card>
    </div>
  );
}
