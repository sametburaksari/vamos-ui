"use client";

import * as React from "react";
import { PageHeader, Card, CardHeader, CardBody, Badge, Avatar } from "@vamos-cms/ui";
import { DataTable, type DataTableColumn } from "@vamos-cms/ui/data-table";
import { MEMBERS, type Member } from "@/lib/no17-data";
import { titlecase, maskTc, fmtPhone, bloodTone, hasBlood, bloodOptions, uyeOptions } from "@/lib/no17-helpers";
import { useMembersFull } from "@/lib/no17-sensitive";

export default function No17Members() {
  const members = useMembersFull();
  const [me, setMe] = React.useState<{ id: string; name: string } | undefined>(undefined);
  React.useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.profile?.key) setMe({ id: d.profile.key, name: d.profile.name });
      })
      .catch(() => {});
  }, []);
  const columns: DataTableColumn<Member>[] = [
    {
      id: "name",
      header: "Ad Soyad",
      accessor: "name",
      rowHeader: true,
      size: 240,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm" name={titlecase(row.name)} />
          <span className="font-medium">{titlecase(row.name)}</span>
        </div>
      ),
      exportValue: (r) => titlecase(r.name),
    },
    {
      id: "tc",
      header: "T.C. Kimlik No",
      accessor: "tc",
      size: 150,
      searchable: true,
      cell: ({ row }) => <span className="font-mono tabular-nums text-fg-muted">{maskTc(row.tc)}</span>,
      exportValue: (r) => r.tc || "",
    },
    {
      id: "phone",
      header: "Telefon",
      accessor: "phone",
      size: 150,
      searchable: true,
      cell: ({ row }) => <span className="font-mono tabular-nums">{fmtPhone(row.phone)}</span>,
      exportValue: (r) => r.phone || "",
    },
    {
      id: "blood",
      header: "Kan Grubu",
      accessor: (r) => r.blood || "Bilinmiyor",
      type: "enum",
      options: bloodOptions,
      size: 120,
      cell: ({ row }) =>
        hasBlood(row.blood) ? <Badge tone={bloodTone(row.blood)}>{row.blood}</Badge> : <span className="text-fg-subtle">—</span>,
    },
    { id: "bday", header: "Doğum Günü", accessor: (r) => r.bday || "—", size: 130, filter: false },
    {
      id: "kombine",
      header: "Kombine",
      accessor: "kombine",
      type: "boolean",
      align: "center",
      size: 110,
      cell: ({ row }) =>
        row.kombine ? (
          <Badge tone="accent" dot>
            Kombine
          </Badge>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    {
      id: "uye",
      header: "Durum",
      accessor: (r) => (r.uye ? "uye" : "form"),
      type: "enum",
      options: uyeOptions,
      size: 120,
      cell: ({ row }) => <Badge tone={row.uye ? "success" : "neutral"}>{row.uye ? "Üye" : "Form"}</Badge>,
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="NO:17"
        title="Üyeler"
        description={`${MEMBERS.length} kişi · bir satıra tıkla, profili aç. TC numaraları KVKK için maskeli.`}
      />
      <Card className="ui-rise">
        <CardHeader title="Üye bilgileri" description="Ara, filtrele, seç ve Excel/CSV olarak dışa aktar." />
        <CardBody>
          <DataTable
            caption="NO:17 üyeleri"
            columns={columns}
            data={members}
            getRowId={(r) => r.key}
            rowHref={(r) => `/no17/uyeler/${encodeURIComponent(r.key)}`}
            selectable
            storageKey="no17-members"
            pageSizes={[25, 50, 100]}
            export={{ filename: "no17-uyeler" }}
            me={me}
          />
        </CardBody>
      </Card>
    </div>
  );
}
