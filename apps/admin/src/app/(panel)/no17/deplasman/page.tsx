"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList, CheckSquare, Bus } from "lucide-react";
import { PageHeader, Card, CardHeader, CardBody, Button, Badge, EmptyState } from "@vamos-cms/ui";
import { FIXTURE } from "@/lib/no17-data";
import { matchSubtitle } from "@/lib/no17-helpers";
import { useAttendance } from "@/lib/no17-store";

export default function No17Away() {
  const { countFor } = useAttendance();
  const away = FIXTURE.filter((f) => f.ha === "Dep");

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        eyebrow="NO:17"
        title="Deplasman listeleri"
        description="Deplasman maçları için katılım topla, sonra tek tıkla ad-soyad + TC listesi oluştur (kulübe sunmak için)."
      />

      {away.length === 0 ? (
        <Card>
          <EmptyState icon={<Bus />} title="Deplasman maçı yok" description="Fikstürde deplasman maçı bulunmuyor." />
        </Card>
      ) : (
        <div className="grid gap-(--gap) sm:grid-cols-2">
          {away.map((f) => {
            const c = countFor(f.id);
            return (
              <Card key={f.id} className="ui-rise">
                <CardHeader title={f.opp} description={matchSubtitle(f)} action={<Badge tone="warning">Deplasman</Badge>} />
                <CardBody className="grid gap-3">
                  <div>
                    <div className="text-3xl font-semibold tabular-nums">{c}</div>
                    <div className="text-xs text-fg-muted">katılım işaretli</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/no17/maclar/${f.id}`}>
                        <CheckSquare /> İşaretle
                      </Link>
                    </Button>
                    <Button asChild variant="solid" size="sm" disabled={c === 0}>
                      <Link href={`/no17/listeler/yeni?match=${f.id}`}>
                        <ClipboardList /> Liste yap ({c})
                      </Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
