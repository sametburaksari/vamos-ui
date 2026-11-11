"use client";

import * as React from "react";
import { Download, FileSignature } from "lucide-react";
import {
  Badge,
  Button,
  ConfirmDialog,
  RecordAside,
  RecordHeader,
  RecordLayout,
  RecordMain,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  VersionHistory,
  toast,
} from "@vamos-ui/react";
import type { Signer } from "@vamos-ui/react/business";
import { useBlockFormat } from "../../_shared/format";
import { ClauseDocument } from "./clause-document";
import { CustomerSection, RemindersSection, SignersSection, TermsSection } from "./contract-aside";
import { clauses as seedClauses, contract, initialReminders, initialSigners, noticeDeadline, versions, type Clause, type Reminder } from "./contract-data";
import { ReminderDialog } from "./reminder-dialog";
import { TermRibbon } from "./term-ribbon";

/** Contract record: term ruler, clause text with proposals, versions, signers and renewal reminders. */
export function ContractView() {
  const { c, t, f, money } = useBlockFormat();
  const [clauses, setClauses] = React.useState<Clause[]>(seedClauses);
  const [flagged, setFlagged] = React.useState<Set<string>>(() => new Set(["cl-7"]));
  const [signers, setSigners] = React.useState<Signer[]>(() => initialSigners.map((s) => ({ ...s, role: t(s.role) })));
  const [reminders, setReminders] = React.useState<Reminder[]>(initialReminders);
  const [autoRenew, setAutoRenew] = React.useState(contract.autoRenew);
  const [confirmStop, setConfirmStop] = React.useState(false);
  const [adding, setAdding] = React.useState(false);

  // Roles are localised copy; refresh them when the language changes.
  const { lang } = useBlockFormat();
  React.useEffect(() => {
    setSigners((all) => all.map((s) => ({ ...s, role: t(initialSigners.find((x) => x.id === s.id)!.role) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const pending = clauses.filter((x) => x.redline).length;
  const signed = signers.filter((s) => s.status === "signed").length;

  const settle = (id: string, accept: boolean) => {
    const before = clauses;
    const clause = clauses.find((x) => x.id === id);
    if (!clause?.redline) return;
    setClauses((all) => all.map((x) => (x.id === id ? { ...x, body: accept ? x.redline!.text : x.body, changed: accept ? true : x.changed, redline: undefined } : x)));
    toast.success(
      accept ? c(`§${clause.number} updated with the proposal`, `§${clause.number} öneriyle güncellendi`) : c(`Draft kept for §${clause.number}`, `§${clause.number} için taslak korundu`),
      {
        description: accept
          ? c(`${clause.redline.by} is told the change was accepted.`, `${clause.redline.by} kişisine değişikliğin kabul edildiği bildirilir.`)
          : c(`${clause.redline.by} gets a note asking to sign the draft as is.`, `${clause.redline.by} kişisine taslağı olduğu gibi imzalaması için not gider.`),
        action: { label: c("Undo", "Geri al"), onClick: () => setClauses(before) },
      },
    );
  };

  const toggleFlag = (id: string) =>
    setFlagged((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const remind = async (s: Signer) => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success(c(`Reminder sent to ${s.name}`, `${s.name} kişisine hatırlatma gönderildi`), { description: s.email });
  };

  const current = signers.find((s) => s.status === "sent" || s.status === "viewed");
  const [nudging, setNudging] = React.useState(false);
  const nudgeCurrent = async () => {
    if (!current) return;
    if (pending > 0) {
      toast.warning(c("Settle the open proposals first", "Önce açık önerileri sonuçlandırın"), {
        description: c(`${current.name} would be signing text that is still under discussion.`, `${current.name} hâlâ tartışılan bir metni imzalamış olur.`),
      });
      return;
    }
    setNudging(true);
    await remind(current);
    setNudging(false);
  };

  const setReminder = (id: string, on: boolean) => {
    setReminders((all) => all.map((r) => (r.id === id ? { ...r, on } : r)));
    toast(on ? c("Reminder on", "Hatırlatıcı açık") : c("Reminder paused", "Hatırlatıcı duraklatıldı"));
  };

  const removeReminder = (id: string) => {
    const before = reminders;
    setReminders((all) => all.filter((r) => r.id !== id));
    toast(c("Reminder removed", "Hatırlatıcı silindi"), { action: { label: c("Undo", "Geri al"), onClick: () => setReminders(before) } });
  };

  const onAutoRenew = (on: boolean) => {
    if (on) {
      setAutoRenew(true);
      toast.success(c("Auto-renewal back on", "Otomatik yenileme yeniden açık"));
    } else setConfirmStop(true);
  };

  const versionRecords = React.useMemo(
    () =>
      Object.fromEntries(
        versions.map((v) => [
          v.id,
          {
            annualFee: v.terms.annualFee,
            seats: v.terms.seats,
            priceCap: v.terms.priceCap,
            noticeDays: v.terms.noticeDays,
            liability: t(v.terms.liability),
            uptime: v.terms.uptime,
            breachHours: v.terms.breachHours,
          },
        ]),
      ),
    [t],
  );

  return (
    <RecordLayout className="mx-auto max-w-[1440px]" defaultAsideWidth={340}>
      <RecordHeader
        back={{ href: "/work/contracts", label: c("Contracts", "Sözleşmeler") }}
        media={
          <span className="grid size-14 place-items-center rounded-ui-lg bg-surface-2 text-fg-muted">
            <FileSignature className="size-6" strokeWidth={1.5} />
          </span>
        }
        title={t(contract.title)}
        subtitle={`${contract.customer.name} · ${t(contract.amendment)}`}
        status={
          <Badge tone={pending > 0 ? "warning" : "info"} dot>
            {pending > 0 ? c("In negotiation", "Müzakerede") : c("Out for signature", "İmzada")}
          </Badge>
        }
        facts={[
          { label: c("Annual value", "Yıllık bedel"), value: <span className="tabular">{money(contract.proposedAnnualValue, { whole: true })}</span> },
          { label: c("Signed", "İmza"), value: <span className="tabular">{signed} / {signers.length}</span> },
          { label: c("Notice by", "Son bildirim"), value: f.date(noticeDeadline, "medium") },
          { label: c("Owner", "Sorumlu"), value: contract.owner.name },
        ]}
        actions={
          <>
            <Button onClick={() => toast.success(c(`${contract.id}-v4.pdf is ready`, `${contract.id}-v4.pdf hazır`))}>
              <Download /> {c("PDF", "PDF")}
            </Button>
            {current ? (
              <Button variant="primary" onClick={nudgeCurrent} loading={nudging}>
                <FileSignature /> {c(`Remind ${current.name.split(" ")[0]}`, `${current.name.split(" ")[0]} kişisine hatırlat`)}
              </Button>
            ) : null}
          </>
        }
      />

      <RecordMain>
        <TermRibbon autoRenew={autoRenew} />
        <Tabs defaultValue="clauses">
          <TabsList aria-label={c("Contract", "Sözleşme")}>
            <TabsTrigger value="clauses" count={pending} badgeTone={pending ? "warning" : undefined}>
              {c("Clauses", "Maddeler")}
            </TabsTrigger>
            <TabsTrigger value="versions" count={versions.length}>
              {c("Versions", "Sürümler")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="clauses" className="pt-4">
            <ClauseDocument clauses={clauses} flagged={flagged} onToggleFlag={toggleFlag} onAccept={(id) => settle(id, true)} onReject={(id) => settle(id, false)} />
          </TabsContent>
          <TabsContent value="versions" className="pt-4">
            <VersionHistory
              className="surface rounded-ui-lg"
              versions={versions.map((v) => ({ id: v.id, createdAt: v.createdAt, label: t(v.label), summary: t(v.summary), author: { name: v.author }, kind: v.kind, current: v.current }))}
              defaultCompare={["v3", "v4"]}
              loadVersion={(id) => versionRecords[id]!}
              fields={[
                { key: "annualFee", label: c("Annual fee", "Yıllık ücret") },
                { key: "seats", label: c("Seats", "Kullanıcı") },
                { key: "priceCap", label: c("Price increase cap", "Fiyat artış tavanı") },
                { key: "noticeDays", label: c("Notice period (days)", "Bildirim süresi (gün)") },
                { key: "uptime", label: c("Uptime target", "Erişilebilirlik hedefi") },
                { key: "breachHours", label: c("Breach report (hours)", "İhlal bildirimi (saat)") },
                { key: "liability", label: c("Liability cap", "Sorumluluk sınırı") },
              ]}
              onRestore={(id) => {
                toast.success(c("Draft reset to this version", "Taslak bu sürüme döndürüldü"), { description: t(versions.find((v) => v.id === id)!.label) });
              }}
            />
          </TabsContent>
        </Tabs>
      </RecordMain>

      <RecordAside>
        <SignersSection signers={signers} pending={pending} onRemind={remind} />
        <RemindersSection
          reminders={reminders}
          autoRenew={autoRenew}
          onAutoRenew={onAutoRenew}
          onToggle={setReminder}
          onRemove={removeReminder}
          onAdd={() => setAdding(true)}
        />
        <TermsSection />
        <CustomerSection />
      </RecordAside>

      <ReminderDialog
        open={adding}
        onOpenChange={setAdding}
        onSave={(r) => {
          setReminders((all) => [...all, { ...r, id: `rm-${all.length + 1}-${r.daysBefore}`, on: true }]);
          toast.success(c(`Reminder added: ${r.daysBefore} days before`, `Hatırlatıcı eklendi: ${r.daysBefore} gün önce`));
        }}
      />
      <ConfirmDialog
        open={confirmStop}
        tone="danger"
        title={c("Turn off auto-renewal?", "Otomatik yenileme kapatılsın mı?")}
        description={c(
          `The agreement will end on ${f.date(contract.end, "long")}. ${contract.customer.name} is sent a non-renewal notice today, ${f.date(noticeDeadline, "medium")} is the last day to do this.`,
          `Sözleşme ${f.date(contract.end, "long")} tarihinde sona erer. ${contract.customer.name} şirketine bugün yenilememe bildirimi gönderilir; bunun için son gün ${f.date(noticeDeadline, "medium")}.`,
        )}
        confirmLabel={c("Turn off and send notice", "Kapat ve bildirim gönder")}
        cancelLabel={c("Keep renewing", "Yenilemeye devam")}
        onResult={(ok) => {
          setConfirmStop(false);
          if (ok) {
            setAutoRenew(false);
            toast(c("Non-renewal notice queued", "Yenilememe bildirimi sıraya alındı"), { action: { label: c("Undo", "Geri al"), onClick: () => setAutoRenew(true) } });
          }
        }}
      />
    </RecordLayout>
  );
}
