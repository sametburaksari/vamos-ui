"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Users, ListChecks, ArrowRight } from "lucide-react";
import {
  PageHeader,
  StatGroup,
  Stat,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  ItemList,
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMeta,
} from "@vamos-cms/ui";
import { MEMBERS, FIXTURE } from "@/lib/no17-data";
import { matchSubtitle } from "@/lib/no17-helpers";
import { useAttendance } from "@/lib/no17-store";

export default function No17Overview() {
  const { countFor } = useAttendance();
  const withTc = MEMBERS.filter((m) => m.hasTc).length;
  const kombine = MEMBERS.filter((m) => m.kombine).length;

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        size="lg"
        eyebrow="NO:17 · Yönetim"
        title="Genel bakış"
        description="Fenerbahçe NO:17 taraftar grubu — üyeler, maçlar ve katılım tek yerde."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/no17/katilimlar">
                <ListChecks /> Katılım matrisi
              </Link>
            </Button>
            <Button asChild variant="solid">
              <Link href="/no17/uyeler">
                <Users /> Üyeler
              </Link>
            </Button>
          </>
        }
      />

      <StatGroup>
        <Stat label="Toplam kişi" value={MEMBERS.length} />
        <Stat label="T.C. kayıtlı" value={withTc} />
        <Stat label="Kombineli" value={kombine} />
        <Stat label="Takipteki maç" value={FIXTURE.length} />
      </StatGroup>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <Card className="ui-rise lg:col-span-2">
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-accent-ink" /> Maçlar &amp; katılım
              </span>
            }
            description="Kasım – Aralık 2026"
            action={
              <Button asChild variant="link" size="sm">
                <Link href="/no17/maclar">
                  Tümü <ArrowRight />
                </Link>
              </Button>
            }
          />
          <ItemList className="border-t border-line">
            {FIXTURE.map((f) => (
              <Item key={f.id} asChild>
                <Link href={`/no17/maclar/${f.id}`}>
                  <ItemContent>
                    <ItemTitle>{f.opp}</ItemTitle>
                    <ItemDescription>{matchSubtitle(f)}</ItemDescription>
                  </ItemContent>
                  <ItemMeta>
                    <Badge tone={f.ha === "İç" ? "success" : "neutral"}>{f.ha}</Badge>
                    <Badge tone="accent">{countFor(f.id)} kişi</Badge>
                  </ItemMeta>
                </Link>
              </Item>
            ))}
          </ItemList>
        </Card>

        <Card className="ui-rise">
          <CardHeader title="Kısayollar" />
          <CardBody className="grid gap-2">
            <Button asChild variant="secondary" block>
              <Link href="/no17/uyeler">
                <Users /> Üye listesi &amp; profiller
              </Link>
            </Button>
            <Button asChild variant="secondary" block>
              <Link href="/no17/maclar">
                <CalendarDays /> Maçlar
              </Link>
            </Button>
            <Button asChild variant="secondary" block>
              <Link href="/no17/katilimlar">
                <ListChecks /> Katılım matrisi
              </Link>
            </Button>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">
              TC numaraları KVKK için her yerde maskeli gösterilir. Katılım işaretlerin tarayıcında saklanır.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
