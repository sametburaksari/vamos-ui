"use client";

import * as React from "react";
import { Badge, Card, CardBody, CardHeader, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import type { ImportField } from "@vamos-ui/react/business";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { pastImports } from "./data";

const typeLabel = (type: ImportField["type"], c: (en: string, tr: string) => string) =>
  ({
    text: c("text", "metin"),
    email: c("email", "e-posta"),
    phone: c("phone", "telefon"),
    enum: c("one of", "seçenek"),
    date: c("date", "tarih"),
    boolean: c("yes / no", "evet / hayır"),
  })[type as string] ?? type;

/** The field guide (what each column should hold) and the last few imports. */
export function ImportSidebar({ fields }: { fields: ImportField[] }) {
  const { c, f } = useBlockFormat();
  return (
    <div className="grid min-w-0 gap-(--gap) md:grid-cols-2 xl:grid-cols-1">
      <Card>
        <CardHeader titleAs="h2" title={c("Field guide", "Alan rehberi")} description={c("What each contact column should hold.", "Her kişi sütununun neyi içermesi gerektiği.")} />
        <CardBody>
          <dl className="m-0 grid gap-3">
            {fields.map((x) => (
              <div key={x.id} className="grid min-w-0 gap-0.5">
                <dt className="flex items-center gap-2 text-[13px] font-medium text-fg">
                  {x.label}
                  {x.required ? <Badge tone="accent" size="sm">{c("Required", "Zorunlu")}</Badge> : null}
                  <span className="ms-auto font-mono text-[11px] font-normal text-fg-subtle">{typeLabel(x.type, c)}</span>
                </dt>
                <dd className="m-0 truncate font-mono text-[11.5px] text-fg-muted">{x.example}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card className="min-w-0">
        <CardHeader titleAs="h2" title={c("Recent imports", "Son içe aktarmalar")} description={c("Undo is available for 7 days.", "7 gün içinde geri alınabilir.")} />
        <TableContainer className="pb-2">
          <Table density="compact">
            <TableCaption visuallyHidden>{c("Recent contact imports", "Son kişi aktarmaları")}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{c("File", "Dosya")}</TableHead>
                <TableHead numeric>{c("Rows", "Satır")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastImports.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="min-w-0">
                    <span className="block max-w-[13rem] truncate text-[13px] text-fg">{p.file}</span>
                    <span className="block text-[11.5px] text-fg-subtle">
                      {f.date(p.date, { day: "numeric", month: "short" })} · {person(p.by).name.split(" ")[0]}
                    </span>
                  </TableCell>
                  <TableCell numeric>
                    <span className="block">{f.number(p.rows)}</span>
                    {p.failed ? <span className="block text-[11px] text-warning">{c(`${p.failed} failed`, `${p.failed} hatalı`)}</span> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  );
}
