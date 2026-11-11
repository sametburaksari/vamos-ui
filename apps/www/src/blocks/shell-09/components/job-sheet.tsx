"use client";

import * as React from "react";
import { Clock, MapPin, Navigation, Package, Phone, TriangleAlert } from "lucide-react";
import {
  Alert,
  Button,
  Checkbox,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  Sheet,
  SignaturePad,
  Textarea,
  useMediaQuery,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { isMine, type Job, type JobStatus } from "./data";
import { JobStatusBadge, StatusTrack, useWindow } from "./job-parts";

export interface JobSheetProps {
  job: Job | null;
  onOpenChange: (open: boolean) => void;
  onAdvance: (job: Job, next: JobStatus) => void;
  onCheck: (job: Job, itemId: string, done: boolean) => void;
  onDelay: (job: Job) => void;
}

const nextStatus: Partial<Record<JobStatus, JobStatus>> = { unassigned: "en-route", delayed: "on-site", "en-route": "on-site", "on-site": "done" };

/** Job detail: bottom sheet on phones, side sheet from tablets up. Moves the job along and collects the sign-off. */
export function JobSheet({ job, onOpenChange, onAdvance, onCheck, onDelay }: JobSheetProps) {
  const { t, c } = useBlockFormat();
  const { window } = useWindow();
  const wide = useMediaQuery("(min-width: 768px)");
  const [signature, setSignature] = React.useState<unknown>(null);
  const [notes, setNotes] = React.useState("");
  React.useEffect(() => {
    setSignature(null);
    setNotes("");
  }, [job?.id]);

  const next = job ? nextStatus[job.status] : undefined;
  const allChecked = job ? job.checklist.every((x) => x.done) : false;
  const needsSignOff = job?.status === "on-site" && job.checklist.length > 0;
  const blocked = needsSignOff && (!allChecked || !signature);
  const action: Partial<Record<JobStatus, string>> = {
    unassigned: c("Start driving", "Yola çık"),
    delayed: c("I've arrived", "Vardım"),
    "en-route": c("I've arrived", "Vardım"),
    "on-site": c("Complete job", "İşi tamamla"),
  };

  return (
    <Sheet open={!!job} onOpenChange={onOpenChange}>
      <SheetContent side={wide ? "end" : "bottom"} size={wide ? "md" : "xl"} className={wide ? undefined : "rounded-t-[calc(var(--radius)*2)]"}>
        {job && (
          <>
            <SheetHeader title={t(job.title)} description={`${job.ref} · ${job.customer}`} action={<JobStatusBadge status={job.status} />} />
            <SheetBody className="grid grid-cols-[minmax(0,1fr)] gap-5">
              <StatusTrack status={job.status} />

              <dl className="grid gap-2.5 text-[13.5px] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-subtle">
                <div className="flex gap-2.5">
                  <dt className="sr-only">{c("Window", "Zaman aralığı")}</dt>
                  <Clock />
                  <dd className="tabular">{window(job)} · {c(`${job.duration} min on site`, `sahada ${job.duration} dk`)}</dd>
                </div>
                <div className="flex gap-2.5">
                  <dt className="sr-only">{c("Address", "Adres")}</dt>
                  <MapPin />
                  <dd>{job.address}</dd>
                </div>
              </dl>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" asChild>
                  <a href={`tel:${job.phone.replace(/\s/g, "")}`}>
                    <Phone />
                    {c("Call", "Ara")}
                  </a>
                </Button>
                <Button variant="secondary" type="button">
                  <Navigation />
                  {c("Directions", "Yol tarifi")}
                </Button>
              </div>

              {t(job.note) && <p className="rounded-ui bg-surface-2 px-3.5 py-3 text-[13.5px] leading-relaxed text-pretty">{t(job.note)}</p>}

              {job.checklist.length > 0 && (
                <fieldset>
                  <legend className="mb-2 flex w-full items-baseline justify-between text-xs font-medium tracking-[0.06em] text-fg-muted uppercase">
                    <span>{c("Checklist", "Kontrol listesi")}</span>
                    <span className="tabular normal-case">{job.checklist.filter((x) => x.done).length}/{job.checklist.length}</span>
                  </legend>
                  <ul className="grid gap-px overflow-hidden rounded-ui border border-line bg-line">
                    {job.checklist.map((item) => (
                      <li key={item.id} className="bg-surface px-3 py-2.5">
                        <Checkbox
                          checked={item.done}
                          disabled={job.status === "done" || !isMine(job)}
                          onCheckedChange={(v) => onCheck(job, item.id, v === true)}
                          label={<span className={item.done ? "text-fg-muted line-through" : undefined}>{t(item.label)}</span>}
                        />
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}

              {job.parts.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium tracking-[0.06em] text-fg-muted uppercase">{c("Parts from the van", "Araçtan parçalar")}</h3>
                  <ul className="grid gap-1.5 text-[13.5px]">
                    {job.parts.map((p) => (
                      <li key={p.sku} className="flex items-center gap-2.5">
                        <Package className="size-4 text-fg-subtle" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{t(p.name)}</span>
                        <span className="font-mono text-xs text-fg-muted">{p.sku}</span>
                        <span className="w-8 text-end tabular">×{p.qty}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {needsSignOff && (
                <section className="grid gap-3">
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={c("Notes for the office (optional)", "Ofise not (isteğe bağlı)")} aria-label={c("Job notes", "İş notları")} />
                  <div>
                    <h3 className="mb-2 text-xs font-medium tracking-[0.06em] text-fg-muted uppercase">{c("Customer sign-off", "Müşteri onayı")}</h3>
                    <SignaturePad height={140} value={signature as never} onValueChange={(v) => setSignature(v)} />
                  </div>
                  {blocked && (
                    <p className="text-xs text-fg-muted" aria-live="polite">
                      {!allChecked ? c("Tick every checklist item to complete the job.", "İşi tamamlamak için tüm maddeleri işaretleyin.") : c("Ask the customer to sign above.", "Müşteriden yukarıyı imzalamasını isteyin.")}
                    </p>
                  )}
                </section>
              )}

              {job.status === "done" && (
                <Alert tone="success" title={c("Job complete", "İş tamamlandı")}>
                  {job.signed ? c("Signed off by the customer and synced to the office.", "Müşteri onayladı ve ofise iletildi.") : c("Synced to the office.", "Ofise iletildi.")}
                </Alert>
              )}
            </SheetBody>
            {next && isMine(job) && (
              <SheetFooter className="flex-row">
                {(job.status === "en-route" || job.status === "unassigned") && (
                  <Button variant="ghost" type="button" onClick={() => onDelay(job)}>
                    <TriangleAlert />
                    {c("Running late", "Gecikiyorum")}
                  </Button>
                )}
                <Button variant="primary" size="lg" className="flex-1" type="button" disabled={blocked} onClick={() => onAdvance(job, next)}>
                  {action[job.status]}
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
