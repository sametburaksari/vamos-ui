"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, Trash2 } from "lucide-react";
import { PageHeader, Card, CardHeader, CardBody, Button, Badge, EmptyState } from "@vamos-cms/ui";
import { DataTable, type DataTableColumn } from "@vamos-cms/ui/data-table";
import { MEMBER_BY_KEY, titlecase, maskTc, fmtPhone, bloodTone, hasBlood } from "@/lib/no17-helpers";
import { useLists } from "@/lib/no17-lists";
import { useSensitive } from "@/lib/no17-sensitive";

type Row = { sira: number; key: string; name: string; tc: string; phone: string; blood: string };

const slug = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "liste";

function printList(title: string, note: string | undefined, rows: Row[]) {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  const body = rows
    .map(
      (r) =>
        `<tr><td class="n">${r.sira}</td><td>${esc(r.name)}</td><td class="m">${esc(r.tc || "—")}</td><td class="m">${esc(fmtPhone(r.phone))}</td><td>${esc(r.blood || "")}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  *{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  h1{font-size:18px;margin:0 0 2px} .sub{color:#555;font-size:12px;margin:0 0 14px}
  table{border-collapse:collapse;width:100%;font-size:12px}
  th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  th{background:#f3f3f3} .n{width:36px;text-align:center;color:#666} .m{font-variant-numeric:tabular-nums}
  @media print{@page{margin:14mm}}
</style></head><body>
  <h1>${esc(title)}</h1>
  <p class="sub">NO:17 · ${rows.length} kişi${note ? " · " + esc(note) : ""}</p>
  <table><thead><tr><th class="n">#</th><th>Ad Soyad</th><th>T.C. Kimlik No</th><th>Telefon</th><th>Kan</th></tr></thead><tbody>${body}</tbody></table>
  <script>window.onload=function(){window.print()}</script>
</body></html>`;
  const w = window.open("", "_blank", "width=800,height=900");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export default function No17ListDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { get, remove } = useLists();
  const sens = useSensitive();
  const list = get(params.id);

  if (!list) {
    return (
      <div className="mx-auto max-w-[960px]">
        <PageHeader back={{ href: "/no17/listeler", label: "Listeler" }} title="Liste bulunamadı" />
        <EmptyState title="Bu liste yok" description="Silinmiş olabilir ya da bağlantı hatalı." />
      </div>
    );
  }

  const rows: Row[] = list.keys
    .map((k) => MEMBER_BY_KEY[k])
    .filter(Boolean)
    .map((m, i) => ({ sira: i + 1, key: m!.key, name: titlecase(m!.name), tc: sens[m!.key]?.tc ?? "", phone: sens[m!.key]?.phone ?? "", blood: m!.blood }));

  const columns: DataTableColumn<Row>[] = [
    { id: "sira", header: "#", accessor: "sira", type: "number", size: 56, filter: false, sortable: false },
    { id: "name", header: "Ad Soyad", accessor: "name", rowHeader: true, size: 240 },
    {
      id: "tc",
      header: "T.C. Kimlik No",
      accessor: "tc",
      size: 150,
      searchable: true,
      cell: ({ row }) => <span className="font-mono tabular-nums text-fg-muted">{maskTc(row.tc)}</span>,
      exportValue: (r) => r.tc || "",
    },
    { id: "phone", header: "Telefon", accessor: "phone", size: 150, cell: ({ row }) => <span className="font-mono tabular-nums">{fmtPhone(row.phone)}</span>, exportValue: (r) => r.phone || "" },
    {
      id: "blood",
      header: "Kan",
      accessor: (r) => r.blood || "—",
      size: 110,
      filter: false,
      cell: ({ row }) => (hasBlood(row.blood) ? <Badge tone={bloodTone(row.blood)}>{row.blood}</Badge> : <span className="text-fg-subtle">—</span>),
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        back={{ href: "/no17/listeler", label: "Listeler" }}
        title={list.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Badge tone="accent">{rows.length} kişi</Badge>
            {list.note ? <span className="text-fg-muted">{list.note}</span> : null}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => printList(list.name, list.note, rows)}>
              <Printer /> Yazdır
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm(`"${list.name}" listesi silinsin mi?`)) {
                  remove(list.id);
                  router.push("/no17/listeler");
                }
              }}
            >
              <Trash2 /> Sil
            </Button>
          </>
        }
      />

      <Card className="ui-rise">
        <CardHeader title="Liste" description="Excel/CSV dışa aktarımında TC numaraları tam yazılır (resmî liste için)." />
        <CardBody>
          <DataTable
            caption={list.name}
            columns={columns}
            data={rows}
            getRowId={(r) => r.key}
            storageKey="no17-list-detail"
            pagination="none"
            export={{ filename: `no17-${slug(list.name)}` }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
