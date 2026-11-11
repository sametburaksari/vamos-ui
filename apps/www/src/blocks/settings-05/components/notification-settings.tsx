"use client";

import * as React from "react";
import { BellOff, ChevronDown, RotateCcw } from "lucide-react";
import {
  Alert, Button, Card, CardHeader, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, InputOTP, SettingsSaveBar, toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { SettingsFrame } from "../../settings-03/components/settings-frame";
import { ChannelMatrix, editable } from "./channel-matrix";
import { DeliveryRules } from "./delivery-rules";
import { MessagePreview } from "./message-preview";
import { defaultMatrix, destinations, events, notifyChannels, savedMatrix, savedRules, type Matrix, type NotifyChannel } from "./notify-data";

const sameSet = (a: string[] = [], b: string[] = []) => a.length === b.length && a.every((x) => b.includes(x));

/** Settings → Notifications: personal events × channels with a live preview and delivery rules. */
export function NotificationSettings() {
  const { c } = useBlockFormat();
  return (
    <SettingsFrame
      section="notifications"
      title={c("Notifications", "Bildirimler")}
      description={c("Your own preferences. Admins set what the whole workspace gets under General.", "Kendi tercihleriniz. Tüm çalışma alanının aldıklarını yöneticiler Genel bölümünden ayarlar.")}
    >
      <NotificationBody />
    </SettingsFrame>
  );
}

const pauseOptions = [
  { id: "1h", en: "For 1 hour", tr: "1 saatliğine", until: { en: "11:24", tr: "11:24" } },
  { id: "tomorrow", en: "Until tomorrow 08:00", tr: "Yarın 08:00'e kadar", until: { en: "tomorrow 08:00", tr: "yarın 08:00" } },
  { id: "week", en: "For a week (holiday)", tr: "Bir hafta (tatil)", until: { en: "Nov 25", tr: "25 Kasım" } },
] as const;

function NotificationBody() {
  const { c, t } = useBlockFormat();
  const [base, setBase] = React.useState({ matrix: savedMatrix, rules: savedRules });
  const [matrix, setMatrix] = React.useState<Matrix>(savedMatrix);
  const [rules, setRules] = React.useState(savedRules);
  const [verified, setVerified] = React.useState<Record<NotifyChannel, boolean>>(() => Object.fromEntries(notifyChannels.map((ch) => [ch.key, destinations[ch.key].verified])) as Record<NotifyChannel, boolean>);
  const [selected, setSelected] = React.useState("ticket.sla");
  const [paused, setPaused] = React.useState<(typeof pauseOptions)[number] | null>(null);
  const [verifying, setVerifying] = React.useState<NotifyChannel | null>(null);
  const [saving, setSaving] = React.useState(false);

  const changes =
    events.filter((e) => !sameSet(matrix[e.key], base.matrix[e.key])).length + (Object.keys(rules) as Array<keyof typeof rules>).filter((k) => rules[k] !== base.rules[k]).length;
  const dirty = changes > 0;

  const setCell = (event: string, ch: NotifyChannel, on: boolean) =>
    setMatrix((m) => ({ ...m, [event]: on ? [...(m[event] ?? []), ch] : (m[event] ?? []).filter((x) => x !== ch) }));
  const setColumn = (ch: NotifyChannel, on: boolean) =>
    setMatrix((m) => {
      const next = { ...m };
      for (const e of events) {
        if (!editable(e, ch, verified)) continue;
        const cur = next[e.key] ?? [];
        next[e.key] = on ? Array.from(new Set([...cur, ch])) : cur.filter((x) => x !== ch);
      }
      return next;
    });

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setBase({ matrix, rules });
      setSaving(false);
      toast.success(c("Notification preferences saved", "Bildirim tercihleri kaydedildi"), { description: c("They apply to the next event.", "Sonraki olaydan itibaren geçerli.") });
    }, 600);
  };

  const sel = events.find((e) => e.key === selected)!;
  const selChannels = notifyChannels
    .map((ch) => ch.key)
    .filter((k) => (sel.locked?.includes(k) || matrix[selected]?.includes(k)) && verified[k] && !sel.unavailable?.includes(k));

  const tools = (
    <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setMatrix(defaultMatrix);
                    toast(c("Defaults restored — save to keep them", "Varsayılanlar geri yüklendi — korumak için kaydedin"));
                  }}
                >
                  <RotateCcw /> {c("Defaults", "Varsayılanlar")}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" disabled={!!paused}>
                      <BellOff /> {c("Pause", "Duraklat")} <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {pauseOptions.map((o) => (
                      <DropdownMenuItem key={o.id} onSelect={() => setPaused(o)}>
                        {c(o.en, o.tr)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
  );

  return (
    <>
      {paused ? (
        <Alert
          tone="info"
          icon={<BellOff />}
          className="mb-5"
          live="polite"
          title={c(`Paused until ${paused.until.en}`, `${paused.until.tr} tarihine kadar duraklatıldı`)}
          actions={
            <Button size="sm" onClick={() => setPaused(null)}>
              {c("Resume now", "Şimdi devam et")}
            </Button>
          }
        >
          {c("Push, email and SMS are on hold. Security emails still go out. Everything is waiting in the bell.", "Anlık bildirim, e-posta ve SMS bekletiliyor. Güvenlik e-postaları yine gider. Her şey zilde bekliyor.")}
        </Alert>
      ) : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader
            titleAs="h2"
            title={c("What reaches you, and where", "Ne, nereden ulaşsın")}
            description={c("Pick an event to preview how it arrives. Column boxes switch a channel for every event.", "Nasıl ulaştığını önizlemek için bir olay seçin. Sütun kutuları bir kanalı tüm olaylar için açıp kapatır.")}
            action={<div className="max-sm:hidden">{tools}</div>}
          />
          <div className="px-(--card-p) pb-3 sm:hidden">{tools}</div>
          <ChannelMatrix matrix={matrix} setCell={setCell} setColumn={setColumn} verified={verified} onVerify={setVerifying} selected={selected} onSelect={setSelected} paused={!!paused} />
        </Card>

        <div className="grid min-w-0 content-start gap-5 md:grid-cols-2 xl:sticky xl:top-20 xl:grid-cols-1 xl:self-start">
          <MessagePreview eventKey={selected} channels={selChannels} rules={rules} paused={!!paused} />
          <DeliveryRules rules={rules} set={(p) => setRules((r) => ({ ...r, ...p }))} />
        </div>
      </div>

      <SettingsSaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={() => {
          setMatrix(base.matrix);
          setRules(base.rules);
        }}
        message={c(`${changes} unsaved ${changes === 1 ? "change" : "changes"}`, `${changes} kaydedilmemiş değişiklik`)}
      />

      <VerifyDialog
        channel={verifying}
        onClose={() => setVerifying(null)}
        onVerified={(ch) => {
          setVerified((v) => ({ ...v, [ch]: true }));
          setMatrix((m) => ({ ...m, "ticket.sla": Array.from(new Set([...(m["ticket.sla"] ?? []), ch])) }));
          setSelected("ticket.sla");
          setVerifying(null);
          toast.success(c("Phone verified", "Telefon doğrulandı"), { description: c("SMS is on for SLA alerts. Turn on more events in the column.", "SMS, SLA uyarıları için açıldı. Sütundan daha fazla olay açın.") });
        }}
        label={verifying ? t(destinations[verifying].to) : ""}
      />
    </>
  );
}

function VerifyDialog({ channel, label, onClose, onVerified }: { channel: NotifyChannel | null; label: string; onClose: () => void; onVerified: (ch: NotifyChannel) => void }) {
  const { c } = useBlockFormat();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [busy, setBusy] = React.useState(false);
  const last = React.useRef<NotifyChannel>("sms");
  if (channel) last.current = channel;
  React.useEffect(() => {
    if (channel) {
      setCode("");
      setError(undefined);
      setBusy(false);
    }
  }, [channel]);
  const check = (v: string) => {
    if (v.length < 6) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      // Demo rule: any code except 000000 works.
      if (v === "000000") {
        setError(c("That code doesn't match. Check the latest SMS.", "Kod eşleşmiyor. En son SMS'i kontrol edin."));
        setCode("");
      } else onVerified(last.current);
    }, 600);
  };
  return (
    <Dialog open={!!channel} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="sm">
        <DialogHeader title={c("Verify your phone", "Telefonunuzu doğrulayın")} description={c(`We sent a 6-digit code to ${label}. It expires in 10 minutes.`, `${label} numarasına 6 haneli bir kod gönderdik. 10 dakika geçerlidir.`)} />
        <DialogBody className="grid justify-items-center gap-3">
          <InputOTP
            aria-label={c("Verification code", "Doğrulama kodu")}
            value={code}
            onValueChange={(v) => {
              setCode(v);
              setError(undefined);
            }}
            onComplete={check}
            disabled={busy}
            invalid={!!error}
            autoFocus
          />
          <p className={error ? "text-xs text-danger" : "text-xs text-fg-subtle"} role={error ? "alert" : undefined}>
            {error ?? c("Any 6 digits work in this preview.", "Bu önizlemede herhangi 6 hane çalışır.")}
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => toast(c("New code sent", "Yeni kod gönderildi"))}>
            {c("Resend code", "Kodu yeniden gönder")}
          </Button>
          <Button variant="primary" loading={busy} disabled={code.length < 6} onClick={() => check(code)}>
            {c("Verify", "Doğrula")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
