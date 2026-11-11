"use client";

import * as React from "react";
import { PlayCircle } from "lucide-react";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Progress, toast } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { daysBetween, TODAY } from "../../_shared/time";
import { competencies, goals, reviewCycles } from "./data";

/** Five dots for a 1–5 rating. */
function Rating({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`h-2 w-4 rounded-full ${i < value ? "bg-accent-ink" : "bg-track"}`} />
      ))}
    </span>
  );
}

export function Reviews() {
  const { c, t, f } = useBlockFormat();
  const [started, setStarted] = React.useState(false);

  return (
    <div className="grid gap-(--gap)">
      <Card>
        <CardHeader
          title={c("H2 2026 review", "2026 2. yarı değerlendirmesi")}
          description={
            started
              ? c(`Self-review open · due ${f.date("2026-12-12", "medium")}`, `Öz değerlendirme açık · son tarih ${f.date("2026-12-12", "medium")}`)
              : c(`Cycle opens for the whole company on ${f.date("2026-12-01", "medium")}.`, `Dönem tüm şirket için ${f.date("2026-12-01", "medium")} tarihinde açılıyor.`)
          }
          action={
            started ? (
              <Badge tone="info" dot>
                {c("In progress", "Sürüyor")}
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setStarted(true);
                  toast.success(c("Review started early", "Değerlendirme erken başlatıldı"), { description: c("Kerem and his manager got the self-review form.", "Kerem ve yöneticisi öz değerlendirme formunu aldı.") });
                }}
              >
                <PlayCircle /> {c("Start early", "Erken başlat")}
              </Button>
            )
          }
        />
        <CardBody className="grid gap-5">
          <div className="grid gap-4">
            <h4 className="text-small font-medium text-fg-muted">{c("Goals this half", "Bu dönemin hedefleri")}</h4>
            <Stagger asChild step={60}>
              <ul className="grid gap-4">
                {goals.map((g) => (
                  <li key={g.id}>
                    <Progress
                      label={t(g.title)}
                      value={g.progress}
                      size="sm"
                      tone={g.progress >= 75 ? "success" : g.progress < 40 ? "warning" : "accent"}
                      showValue
                      hint={c(`Due ${f.date(g.due, "medium")} · ${daysBetween(TODAY, g.due)} days`, `Son tarih ${f.date(g.due, "medium")} · ${daysBetween(TODAY, g.due)} gün`)}
                    />
                  </li>
                ))}
              </ul>
            </Stagger>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-(--gap) 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader title={c("Competencies", "Yetkinlikler")} description={c("Manager's scores, 1–5, last two cycles.", "Yöneticinin puanları, 1–5, son iki dönem.")} />
          <CardBody>
            <ul className="grid gap-4">
              {competencies.map((k) => {
                const delta = k.current - k.previous;
                return (
                  <li key={k.key} className="grid gap-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-fg">{t(k.label)}</span>
                      <span className="text-small text-fg-muted tabular">
                        {k.previous} → <span className="font-medium text-fg">{k.current}</span>
                        {delta > 0 ? <span className="ms-1.5 text-success">+{delta}</span> : null}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1" role="img" aria-label={c(`${t(k.label)}: ${k.current} of 5, was ${k.previous}`, `${t(k.label)}: 5 üzerinden ${k.current}, önceki ${k.previous}`)}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2 rounded-full ${i < k.current ? (i < k.previous ? "bg-accent-ink" : "bg-success") : "bg-track"}`}
                        />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-small text-fg-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-accent-ink" aria-hidden /> {c("Held from last cycle", "Önceki dönemden")}</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-success" aria-hidden /> {c("Gained this cycle", "Bu dönem kazanılan")}</span>
            </p>
          </CardBody>
        </Card>

        <Card className="min-w-0">
          <CardHeader title={c("Past reviews", "Geçmiş değerlendirmeler")} />
          <CardBody className="p-0">
            <ul className="divide-y divide-line border-t border-line">
              {[...reviewCycles].reverse().map((r) => (
                <li key={r.id} className="grid gap-2 px-(--card-p) py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-fg">{t(r.name)}</span>
                    <Rating value={r.rating} label={c(`Rated ${r.rating} of 5`, `5 üzerinden ${r.rating}`)} />
                  </div>
                  <p className="text-pretty text-fg">“{t(r.summary)}”</p>
                  <p className="flex items-center gap-1.5 text-small text-fg-muted">
                    <Avatar name={person(r.reviewerId).name} size="xs" /> {person(r.reviewerId).name} · {f.date(r.closed, "medium")}
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
