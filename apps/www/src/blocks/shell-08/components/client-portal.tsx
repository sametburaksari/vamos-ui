"use client";

import * as React from "react";
import { Check, Lock, MessageSquareText } from "lucide-react";
import {
  Avatar, AvatarGroup, Badge, Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Progress, Textarea, cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import type { Workspace } from "../../_shared/account";
import { useBlockFormat } from "../../_shared/format";
import { invoiceStatusLabels, invoiceStatusTone, receivables } from "../../_shared/finance";
import { person } from "../../_shared/people";
import { healthLabels, projects } from "../../_shared/projects";
import { daysBetween, TODAY } from "../../_shared/time";
import type { Approval } from "../data";

export interface ClientPortalProps {
  workspace: Workspace;
  /** Agency staff see budget and risks; "view as client" hides them. */
  asClient: boolean;
  approvals: Approval[];
  onDecide: (id: string, decision: "approved" | "changes", note?: string) => void;
}

export function ClientPortal({ workspace: ws, asClient, approvals, onDecide }: ClientPortalProps) {
  const { c, t, f, money, ago } = useBlockFormat();
  const pjs = projects.filter((p) => p.clientId === ws.companyId);
  const invs = receivables.filter((i) => i.companyId === ws.companyId).slice(0, 4);
  const mine = approvals.filter((a) => a.companyId === ws.companyId);
  const [changesFor, setChangesFor] = React.useState<Approval | null>(null);
  const [note, setNote] = React.useState("");

  return (
    <div className="mx-auto grid w-full max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-8">
      <header className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[length:calc(32px*var(--display-scale,1))] leading-tight text-fg">{c(`Welcome back, ${ws.name}`, `Tekrar hoş geldiniz, ${ws.name}`)}</h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            {mine.length
              ? c(`${mine.length} ${mine.length === 1 ? "item needs" : "items need"} your decision. Everything else is moving.`, `${mine.length} öğe kararınızı bekliyor. Geri kalan her şey ilerliyor.`)
              : c("Nothing needs your decision today.", "Bugün kararınızı bekleyen bir şey yok.")}
          </p>
        </div>
        {pjs[0] ? <AvatarGroup max={4} size="sm">{pjs[0].memberIds.map((id) => <Avatar key={id} name={person(id).name} />)}</AvatarGroup> : null}
      </header>

      <section aria-labelledby="cp-approvals">
        <h2 id="cp-approvals" className="text-[15px] font-semibold text-fg">{c("Waiting for you", "Sizi bekleyenler")}</h2>
        {mine.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-ui border border-dashed border-line px-4 py-6 text-[13px] text-fg-muted">
            <Check className="size-4 text-success" aria-hidden /> {c("All caught up. We'll email you when there's something new.", "Hepsi tamam. Yeni bir şey olduğunda e-posta göndereceğiz.")}
          </p>
        ) : (
          <Stagger asChild effect="fade">
            <ul className="mt-3 grid gap-2">
              {mine.map((a) => {
                const late = daysBetween(a.due, TODAY) > 0;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-ui border border-line bg-surface p-4">
                    <span className="min-w-0 flex-1 basis-56">
                      <span className="flex items-center gap-2">
                        <Badge tone="outline" shape="square">{t(a.kind)}</Badge>
                        <span className="font-mono text-[11px] text-fg-subtle">v{a.version}</span>
                      </span>
                      <span className="mt-1.5 block text-[14px] text-fg">{t(a.title)}</span>
                      <span className={cn("block text-[12px]", late ? "text-danger" : "text-fg-subtle")}>
                        {c("Sent", "Gönderildi")} {ago(a.sentAt)} · {late ? c("was due", "vadesi") : c("due", "vade")} {f.date(a.due, "medium")}
                      </span>
                    </span>
                    <span className="flex gap-2">
                      <Button size="sm" onClick={() => { setNote(""); setChangesFor(a); }}>
                        <MessageSquareText aria-hidden /> {c("Request changes", "Değişiklik iste")}
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => onDecide(a.id, "approved")}>
                        <Check aria-hidden /> {c("Approve", "Onayla")}
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Stagger>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="cp-projects">
          <h2 id="cp-projects" className="text-[15px] font-semibold text-fg">{c("Your projects", "Projeleriniz")}</h2>
          <ul className="mt-3 grid gap-3">
            {pjs.map((p) => {
              const next = p.milestones.find((m) => !m.done);
              const burn = Number(p.spent.amount) / Number(p.budget.amount);
              return (
                <li key={p.id} className="rounded-ui border border-line bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[11px] text-fg-subtle">{p.code}</span>
                      <span className="block text-[14.5px] font-medium text-fg">{t(p.name)}</span>
                    </span>
                    {!asClient ? <Badge tone={p.health === "on-track" ? "success" : p.health === "at-risk" ? "warning" : "danger"} dot>{t(healthLabels[p.health])}</Badge> : null}
                  </div>
                  <Progress className="mt-4" size="sm" value={p.progress} label={<span className="text-[12.5px] text-fg-muted">{c("Progress", "İlerleme")}</span>} showValue />
                  {next ? (
                    <p className="mt-3 text-[12.5px] text-fg-muted">
                      {c("Next", "Sıradaki")}: <span className="text-fg">{t(next.title)}</span> · {f.date(next.due, "medium")}
                    </p>
                  ) : null}
                  {!asClient ? (
                    <div className="mt-4 rounded-ui-sm border border-dashed border-line bg-surface-2 p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
                        <Lock className="size-3" aria-hidden /> {c("Agency only · hidden from client", "Yalnız ajans · müşteriden gizli")}
                      </p>
                      <Progress
                        className="mt-2"
                        size="xs"
                        tone="auto"
                        value={Math.round(burn * 100)}
                        label={<span className="text-[12px] text-fg-muted">{c("Budget used", "Kullanılan bütçe")}</span>}
                        showValue={() => <span className="tabular text-[12px] text-fg-muted">{money(p.spent, { whole: true })} / {money(p.budget, { whole: true })}</span>}
                      />
                      {p.risks.map((r) => (
                        <p key={r.id} className="mt-2 text-[12px] text-warning">{t(r.title)}</p>
                      ))}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="cp-invoices">
          <h2 id="cp-invoices" className="text-[15px] font-semibold text-fg">{c("Invoices", "Faturalar")}</h2>
          {invs.length === 0 ? (
            <p className="mt-3 text-[13px] text-fg-muted">{c("No invoices yet.", "Henüz fatura yok.")}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-ui border border-line bg-surface">
              {invs.map((i) => (
                <li key={i.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[12px] text-fg">{i.number}</span>
                    <span className="block text-[11.5px] text-fg-subtle">{c("Due", "Vade")} {f.date(i.dueDate, "medium")}</span>
                  </span>
                  <span className="text-end">
                    <span className="tabular block text-[13px] font-medium text-fg">{money(i.amount)}</span>
                    <Badge tone={invoiceStatusTone[i.status]} className="mt-0.5">{t(invoiceStatusLabels[i.status])}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Dialog open={!!changesFor} onOpenChange={(o) => !o && setChangesFor(null)}>
        <DialogContent size="md">
          <DialogHeader title={c("Request changes", "Değişiklik iste")} description={changesFor ? `${t(changesFor.title)} · v${changesFor.version}` : undefined} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!changesFor || !note.trim()) return;
              onDecide(changesFor.id, "changes", note.trim());
              setChangesFor(null);
            }}
          >
            <DialogBody>
              <Field label={c("What should change?", "Ne değişmeli?")} hint={c("The team sees this as a comment on the version.", "Ekip bunu sürüm üzerinde bir yorum olarak görür.")} required>
                <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setChangesFor(null)}>{c("Cancel", "Vazgeç")}</Button>
              <Button variant="primary" type="submit" disabled={!note.trim()}>
                {c("Send to the team", "Ekibe gönder")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
