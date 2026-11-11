"use client";

import * as React from "react";
import { BellOff, Target } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  IconButton,
  Progress,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  toast,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { planLabels } from "../../_shared/companies";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { playOptions, watchList, type WatchAccount } from "./data";

interface Play {
  play: string;
  note: string;
}

/** Accounts to expand and accounts to save: usage signals, seats, owner and a logged play. */
export function AccountsWatch() {
  const { f, t, c } = useBlockFormat();
  const [tab, setTab] = React.useState<WatchAccount["kind"]>("risk");
  const [snoozed, setSnoozed] = React.useState<Set<string>>(() => new Set());
  const [plays, setPlays] = React.useState<Record<string, Play>>({});
  const [editing, setEditing] = React.useState<WatchAccount | null>(null);

  const visible = (kind: WatchAccount["kind"]) => watchList.filter((a) => a.kind === kind && !snoozed.has(a.company.id));

  const snooze = (a: WatchAccount) => {
    setSnoozed((s) => new Set(s).add(a.company.id));
    toast(c(`${a.company.name} snoozed for 14 days`, `${a.company.name} 14 gün ertelendi`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setSnoozed((s) => { const n = new Set(s); n.delete(a.company.id); return n; }) },
    });
  };

  const savePlay = (a: WatchAccount, p: Play) => {
    const before = plays[a.company.id];
    setPlays((s) => ({ ...s, [a.company.id]: p }));
    setEditing(null);
    const label = t(playOptions.find((o) => o.value === p.play)!.label);
    toast.success(c(`Play logged for ${a.company.name}`, `${a.company.name} için aksiyon kaydedildi`), {
      description: `${label} · ${person(a.company.ownerId).name}`,
      action: { label: c("Undo", "Geri al"), onClick: () => setPlays((s) => { const n = { ...s }; if (before) n[a.company.id] = before; else delete n[a.company.id]; return n; }) },
    });
  };

  const list = (kind: WatchAccount["kind"]) => {
    const rows = visible(kind);
    if (!rows.length) {
      return <p className="border-t border-line px-(--card-px,1.25rem) py-10 text-center text-sm text-fg-muted">{c("Nothing to look at here. Snoozed accounts come back in 14 days.", "Burada bakılacak bir şey yok. Ertelenen hesaplar 14 gün sonra geri gelir.")}</p>;
    }
    return (
      <Stagger asChild effect="fade">
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((a) => {
            const owner = person(a.company.ownerId);
            const play = plays[a.company.id];
            return (
              <li key={a.company.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 px-5 py-3.5 sm:grid-cols-[auto_minmax(0,1.5fr)_minmax(11rem,1fr)_auto] sm:items-center">
                <Avatar name={a.company.name} shape="square" size="md" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-sm font-medium text-fg">{a.company.name}</span>
                    <Badge shape="square">{t(planLabels[a.company.plan])}</Badge>
                    {play ? <Badge tone="accent" dot>{t(playOptions.find((o) => o.value === play.play)!.label)}</Badge> : null}
                  </p>
                  <p className="mt-0.5 text-[13px] text-fg-muted">{t(a.signal)}</p>
                </div>
                <div className="col-start-2 min-w-0 sm:col-start-auto">
                  <Progress
                    size="xs"
                    value={a.seatsUsed}
                    max={a.seats}
                    tone={kind === "expansion" ? "auto" : "accent"}
                    display="fraction"
                    label={<span className="text-xs text-fg-subtle">{c("Seats", "Kullanıcı")}</span>}
                    showValue
                  />
                  <p className="mt-1 flex justify-between gap-2 text-xs text-fg-subtle">
                    <span className="font-mono text-fg tabular">{f.currency(a.company.mrr.amount, a.company.mrr.currency, { maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" })}{c("/mo", "/ay")}</span>
                    <span className="whitespace-nowrap">{a.idleDays === 0 ? c("Active today", "Bugün aktif") : c(`Idle ${a.idleDays} days`, `${a.idleDays} gündür pasif`)}</span>
                  </p>
                </div>
                <div className="col-start-2 flex items-center gap-1 sm:col-start-auto">
                  <Tooltip content={c(`Owner: ${owner.name}`, `Sorumlu: ${owner.name}`)}>
                    <span tabIndex={0} className="rounded-full focus-ring">
                      <Avatar name={owner.name} size="xs" />
                    </span>
                  </Tooltip>
                  <Button size="sm" variant={play ? "ghost" : "secondary"} onClick={() => setEditing(a)}>
                    <Target aria-hidden />
                    {play ? c("Edit play", "Aksiyonu düzenle") : kind === "risk" ? c("Save play", "Kurtarma aksiyonu") : c("Expansion play", "Büyüme aksiyonu")}
                  </Button>
                  <IconButton size="sm" variant="ghost" label={c(`Snooze ${a.company.name}`, `${a.company.name} ertele`)} onClick={() => snooze(a)}>
                    <BellOff aria-hidden />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      </Stagger>
    );
  };

  return (
    <Card className="ui-rise min-w-0 overflow-hidden" style={{ animationDelay: "240ms" }}>
      <Tabs value={tab} onValueChange={(v) => setTab(v as WatchAccount["kind"])}>
        <CardHeader
          titleAs="h2"
          title={c("Accounts to watch", "Takip edilecek hesaplar")}
          description={c("Signals from product usage and billing, refreshed nightly", "Ürün kullanımı ve faturalamadan sinyaller, her gece yenilenir")}
        />
        <div className="px-5 pb-3">
          <TabsList aria-label={c("Watch list", "Takip listesi")}>
            <TabsTrigger value="risk" count={visible("risk").length}>{c("Churn risk", "Kayıp riski")}</TabsTrigger>
            <TabsTrigger value="expansion" count={visible("expansion").length}>{c("Ready to expand", "Büyümeye hazır")}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="risk">{list("risk")}</TabsContent>
        <TabsContent value="expansion">{list("expansion")}</TabsContent>
      </Tabs>
      <PlayDialog account={editing} initial={editing ? plays[editing.company.id] : undefined} onClose={() => setEditing(null)} onSave={savePlay} />
    </Card>
  );
}

function PlayDialog({ account, initial, onClose, onSave }: { account: WatchAccount | null; initial?: Play; onClose: () => void; onSave: (a: WatchAccount, p: Play) => void }) {
  const { t, c } = useBlockFormat();
  const [play, setPlay] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!account) return;
    setPlay(initial?.play ?? (account.kind === "risk" ? "call" : "upgrade"));
    setNote(initial?.note ?? "");
    setError(null);
  }, [account, initial]);

  return (
    <Dialog open={!!account} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader
          title={account?.kind === "risk" ? c("Log a save play", "Kurtarma aksiyonu kaydet") : c("Log an expansion play", "Büyüme aksiyonu kaydet")}
          description={account ? `${account.company.name} · ${t(account.signal)}` : undefined}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!account) return;
            if (!play) return setError(c("Choose what you will do.", "Ne yapacağınızı seçin."));
            onSave(account, { play, note });
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Play", "Aksiyon")} required error={error ?? undefined}>
              <Select value={play} onValueChange={(v) => { setPlay(v); setError(null); }} items={playOptions.map((o) => ({ value: o.value, label: t(o.label) }))} />
            </Field>
            <Field label={c("Note for the account owner", "Hesap sorumlusuna not")} optional>
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={c("What you heard, what you offer, by when.", "Ne duydunuz, ne teklif ediyorsunuz, ne zamana kadar.")} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{c("Cancel", "Vazgeç")}</Button>
            <Button type="submit" variant="primary">{c("Log play", "Kaydet")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
