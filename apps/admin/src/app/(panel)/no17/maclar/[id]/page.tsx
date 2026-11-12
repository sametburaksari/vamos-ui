"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  PageHeader,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Input,
  Switch,
  Checkbox,
  Avatar,
  EmptyState,
} from "@vamos-cms/ui";
import { MATCH_BY_ID, titlecase, fmtPhone, matchSubtitle, hasBlood } from "@/lib/no17-helpers";
import { MEMBERS } from "@/lib/no17-data";
import { useAttendance } from "@/lib/no17-store";
import { useMembersFull } from "@/lib/no17-sensitive";

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o");

export default function No17MatchDetail() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const match = MATCH_BY_ID[id];
  const { isGoing, set, toggle, countFor } = useAttendance();
  const membersFull = useMembersFull();

  const [q, setQ] = React.useState("");
  const [onlyGoing, setOnlyGoing] = React.useState(false);

  if (!match) {
    return (
      <div className="mx-auto max-w-[960px]">
        <PageHeader back={{ href: "/no17/maclar", label: "Maçlar" }} title="Maç bulunamadı" />
        <EmptyState title="Bu maç yok" description="Fikstürde böyle bir kayıt bulunamadı." />
      </div>
    );
  }

  const count = countFor(id);
  const list = membersFull.filter((m) => {
    if (onlyGoing && !isGoing(id, m.key)) return false;
    if (q && !norm(m.name).includes(norm(q))) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        back={{ href: "/no17/maclar", label: "Maçlar" }}
        title={match.opp}
        description={
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <Badge tone={match.ha === "İç" ? "success" : "neutral"}>{match.ha === "İç" ? "İç saha" : "Deplasman"}</Badge>
            <span className="text-fg-muted">{matchSubtitle(match)}</span>
          </span>
        }
        actions={<Badge tone="accent">{count} kişi geliyor</Badge>}
      />

      <Card>
        <CardHeader
          title="Katılım işaretle"
          description="İsme tıkla; değişiklik anında kaydedilir."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => MEMBERS.forEach((m) => set(id, m.key, false))}
                disabled={count === 0}
              >
                Temizle
              </Button>
            </div>
          }
        />
        <CardBody className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="İsim ara…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-xs"
            />
            <Switch label="Sadece gelenler" checked={onlyGoing} onCheckedChange={setOnlyGoing} />
            <span className="ml-auto text-sm text-fg-muted tabular-nums">{list.length} kişi</span>
          </div>

          {list.length === 0 ? (
            <EmptyState title="Eşleşme yok" description="Arama veya filtreyle eşleşen kimse kalmadı." />
          ) : (
            <div className="divide-y divide-line rounded-ui-sm border border-line">
              {list.map((m) => {
                const going = isGoing(id, m.key);
                return (
                  <div key={m.key} className="flex items-center gap-3 px-3 py-2.5">
                    <Checkbox
                      checked={going}
                      onCheckedChange={(v) => set(id, m.key, v === true)}
                      aria-label={titlecase(m.name)}
                    />
                    <Avatar size="sm" name={titlecase(m.name)} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{titlecase(m.name)}</div>
                      <div className="truncate text-xs text-fg-muted">
                        {fmtPhone(m.phone)}
                        {hasBlood(m.blood) ? ` · ${m.blood}` : ""}
                      </div>
                    </div>
                    {m.kombine ? (
                      <Badge tone="accent" dot>
                        Kombine
                      </Badge>
                    ) : null}
                    {going ? <Badge tone="success">Geliyor</Badge> : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
