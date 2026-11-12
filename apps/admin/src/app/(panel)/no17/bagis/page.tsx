"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, HandCoins, Users } from "lucide-react";
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  Button,
  Progress,
  Stat,
  StatGroup,
  StatLabel,
  StatValue,
  EmptyState,
} from "@vamos-cms/ui";
import { useCampaigns } from "@/lib/no17-campaigns";
import { campaignTypeLabel } from "@/lib/no17-campaigns";
import { fmtTL, campaignTone } from "@/lib/no17-helpers";

export default function No17Campaigns() {
  const { campaigns, totalOf, countOf, grandTotal } = useCampaigns();
  const openCount = campaigns.filter((c) => !c.closed).length;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Bağış & kampanyalar"
        description="Köy okulu, pankart, cenaze/vefa gibi para toplama hikayeleri ve kimin ne kadar katkı verdiği."
        actions={
          <Button asChild variant="solid">
            <Link href="/no17/bagis/yeni">
              <Plus /> Yeni kampanya
            </Link>
          </Button>
        }
      />

      <StatGroup className="mb-(--gap)">
        <Stat>
          <StatLabel>Toplam toplanan</StatLabel>
          <StatValue>{fmtTL(grandTotal())}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Kampanya</StatLabel>
          <StatValue>{campaigns.length}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Açık kampanya</StatLabel>
          <StatValue>{openCount}</StatValue>
        </Stat>
      </StatGroup>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<HandCoins />}
          title="Henüz kampanya yok"
          description="İlk para toplama hikayeni ekle: köy okulu, pankart, cenaze yardımı…"
          actions={
            <Button asChild variant="solid">
              <Link href="/no17/bagis/yeni">
                <Plus /> Yeni kampanya
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-(--gap) sm:grid-cols-2">
          {campaigns.map((c) => {
            const total = totalOf(c.id);
            const pct = c.target && c.target > 0 ? Math.min(100, Math.round((total / c.target) * 100)) : null;
            return (
              <Card key={c.id} asChild interactive>
                <Link href={`/no17/bagis/${c.id}`}>
                  <CardBody className="grid gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{c.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <Badge tone={campaignTone(c.type)}>{campaignTypeLabel(c.type)}</Badge>
                          {c.closed ? <Badge tone="neutral">Kapandı</Badge> : <Badge tone="success" dot>Açık</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums">{fmtTL(total)}</div>
                        {c.target ? <div className="text-xs text-fg-muted tabular-nums">hedef {fmtTL(c.target)}</div> : null}
                      </div>
                    </div>

                    <p className="line-clamp-2 text-sm text-fg-muted">{c.story}</p>

                    {pct !== null ? (
                      <div className="grid gap-1">
                        <Progress value={pct} tone={pct >= 100 ? "success" : "accent"} />
                        <div className="flex justify-between text-xs text-fg-muted tabular-nums">
                          <span>%{pct}</span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3.5" /> {countOf(c.id)} katkı
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end text-xs text-fg-muted tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3.5" /> {countOf(c.id)} katkı
                        </span>
                      </div>
                    )}
                  </CardBody>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
