"use client";

import * as React from "react";
import { Card, CardBody, CardHeader, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Heatmap, type HeatmapCell } from "@vamos-ui/react/charts";
import { useBlockFormat } from "../../_shared/format";
import { cohorts } from "./data";

/** Retention triangle: one row per sign-up month, one column per month since sign-up. */
export function CohortCard() {
  const { f, c } = useBlockFormat();
  const [mode, setMode] = React.useState<"share" | "accounts">("share");
  const rowLabel = (cohort: string, size: number) => `${f.date(cohort, { month: "short", year: "2-digit" })} · ${size}`;
  const xLabels = Array.from({ length: 8 }, (_, i) => c(`M${i}`, `A${i}`));
  const yLabels = cohorts.map((r) => rowLabel(r.cohort, r.size));
  const data: HeatmapCell[] = cohorts.flatMap((r) =>
    xLabels.map((x, i) => {
      const share = r.retention[i];
      return { x, y: rowLabel(r.cohort, r.size), value: share == null ? null : mode === "share" ? share : Math.round(share * r.size) };
    }),
  );
  // Average month-6 retention over the cohorts old enough to have one.
  const m6 = cohorts.filter((r) => r.retention[6] != null);
  const avg6 = m6.reduce((s, r) => s + r.retention[6]!, 0) / Math.max(1, m6.length);

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "180ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Retention by sign-up month", "Kayıt ayına göre elde tutma")}
        description={c(`Month 6 average: ${f.percent(avg6)} of logos still paying`, `6. ay ortalaması: müşterilerin ${f.percent(avg6)} kadarı hâlâ ödüyor`)}
        action={
          <ToggleGroup size="sm" aria-label={c("Show retention as", "Elde tutmayı göster")} value={mode} onValueChange={(v) => v && setMode(v as typeof mode)}>
            <ToggleGroupItem value="share">%</ToggleGroupItem>
            <ToggleGroupItem value="accounts">{c("Accounts", "Hesap")}</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <CardBody className="pt-1">
        <Heatmap
          mode="matrix"
          title={c("Customers retained by sign-up month and months since sign-up", "Kayıt ayı ve kayıttan sonraki aya göre elde tutulan müşteriler")}
          data={data}
          xLabels={xLabels}
          yLabels={yLabels}
          valueLabel={mode === "share" ? c("Retained", "Elde tutulan") : c("Accounts", "Hesap")}
          format={mode === "share" ? "percent" : "integer"}
          domain={mode === "share" ? [0.6, 1] : undefined}
          steps={5}
          color="chart-1"
          tableToggle
          className="w-full"
        />
        <p className="mt-3 text-xs text-fg-subtle">{c("Rows show sign-up month and cohort size. M0 is the sign-up month.", "Satırlar kayıt ayını ve grup büyüklüğünü gösterir. A0 kayıt ayıdır.")}</p>
      </CardBody>
    </Card>
  );
}
