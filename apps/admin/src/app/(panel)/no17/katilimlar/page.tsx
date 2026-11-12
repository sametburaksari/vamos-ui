"use client";

import * as React from "react";
import {
  PageHeader,
  Card,
  CardBody,
  Input,
  Checkbox,
  Badge,
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@vamos-cms/ui";
import { FIXTURE, MEMBERS } from "@/lib/no17-data";
import { titlecase } from "@/lib/no17-helpers";
import { useAttendance } from "@/lib/no17-store";

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o");

export default function No17Attendance() {
  const { isGoing, set, countFor } = useAttendance();
  const [q, setQ] = React.useState("");

  const rows = MEMBERS.filter((m) => !q || norm(m.name).includes(norm(q)));

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="NO:17"
        title="Katılım matrisi"
        description="Kim hangi maça geliyor? Hücreye tıkla; anında kaydedilir. İsim sütunu ve başlık sabit kalır."
      />

      <Card className="ui-rise">
        <CardBody className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input placeholder="İsim ara…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
            <span className="ml-auto text-sm text-fg-muted tabular-nums">
              {rows.length} / {MEMBERS.length} kişi
            </span>
          </div>

          <TableContainer maxHeight="68vh">
            <Table stickyHeader stickyFirstColumn bordered="grid" hover>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Üye</TableHead>
                  {FIXTURE.map((f) => (
                    <TableHead key={f.id} align="center" className="whitespace-nowrap">
                      <div className="text-xs font-semibold leading-tight">{f.opp}</div>
                      <div className="text-[11px] font-normal text-fg-muted">
                        {f.date} · {f.ha}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead align="center" className="whitespace-nowrap">
                    Toplam
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((m) => {
                  const rowTotal = FIXTURE.reduce((n, f) => n + (isGoing(f.id, m.key) ? 1 : 0), 0);
                  return (
                    <TableRow key={m.key}>
                      <TableHead scope="row" className="font-medium">
                        {titlecase(m.name)}
                      </TableHead>
                      {FIXTURE.map((f) => (
                        <TableCell key={f.id} align="center">
                          <Checkbox
                            size="sm"
                            checked={isGoing(f.id, m.key)}
                            onCheckedChange={(v) => set(f.id, m.key, v === true)}
                            aria-label={`${titlecase(m.name)} — ${f.opp}`}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center" className="tabular-nums text-fg-muted">
                        {rowTotal || ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableHead scope="row">Maç toplamı</TableHead>
                  {FIXTURE.map((f) => (
                    <TableCell key={f.id} align="center" className="font-semibold tabular-nums">
                      <Badge tone="accent">{countFor(f.id)}</Badge>
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </div>
  );
}
