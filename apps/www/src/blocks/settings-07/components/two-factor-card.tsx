"use client";

import * as React from "react";
import { Copy, Fingerprint, KeyRound, MessageSquareText, Plus, Smartphone, Trash2, Usb } from "lucide-react";
import {
  Alert,
  BackupCodes,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  InputOTP,
  QrCode,
  Switch,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { day } from "../../_shared/time";
import { backupCodes, me, totpUri, type Passkey } from "./data";

export interface TwoFactorState {
  totp: boolean;
  totpAdded?: string;
  passkeys: Passkey[];
  codes: string[];
  usedCodes: string[];
}

interface Props {
  value: TwoFactorState;
  onChange: (next: TwoFactorState) => void;
}

const SECRET_GROUPS = "JBSW Y3DP EHPK 3PXP";
const freshCodes = () =>
  backupCodes.map((code) => code.replace(/[A-Z0-9]/g, (ch, i: number) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[(ch.charCodeAt(0) * 7 + i * 13) % 32]!));

/** Two-step verification: authenticator app, passkeys, SMS (disabled by policy) and backup codes. */
export function TwoFactorCard({ value, onChange }: Props) {
  const { c, t, f } = useBlockFormat();
  const [enrolling, setEnrolling] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [regenerating, setRegenerating] = React.useState(false);
  const [addingKey, setAddingKey] = React.useState(false);
  const left = value.codes.length - value.usedCodes.length;

  const verify = (v: string) => {
    setChecking(true);
    setCodeError(null);
    window.setTimeout(() => {
      setChecking(false);
      if (v === "000000") {
        setCodeError(c("That code didn't match. Wait for the next one and try again.", "Kod eşleşmedi. Bir sonrakini bekleyip tekrar deneyin."));
        setCode("");
        return;
      }
      onChange({ ...value, totp: true, totpAdded: day(0) });
      setEnrolling(false);
      setCode("");
      toast.success(c("Authenticator app updated", "Doğrulama uygulaması güncellendi"), { description: c("Codes from the old app stopped working.", "Eski uygulamadaki kodlar artık geçmez.") });
    }, 700);
  };

  const removeKey = (k: Passkey) => {
    if (value.passkeys.length === 1 && !value.totp) {
      toast.warning(c("Keep at least one method", "En az bir yöntem kalmalı"), { description: c("Add an authenticator app before removing your last passkey.", "Son geçiş anahtarını kaldırmadan önce bir doğrulama uygulaması ekleyin.") });
      return;
    }
    onChange({ ...value, passkeys: value.passkeys.filter((p) => p.id !== k.id) });
    toast(c(`“${k.name}” removed`, `“${k.name}” kaldırıldı`), { action: { label: c("Undo", "Geri al"), onClick: () => onChange(value) } });
  };

  const addKey = () => {
    setAddingKey(true);
    window.setTimeout(() => {
      setAddingKey(false);
      onChange({ ...value, passkeys: [...value.passkeys, { id: `pk-${Date.now()}`, name: c("Phone", "Telefon"), authenticator: { en: "Phone screen lock", tr: "Telefon ekran kilidi" }, added: day(0) }] });
      toast.success(c("Passkey added", "Geçiş anahtarı eklendi"), { description: c("Next time, sign in with your phone's screen lock.", "Bir dahaki sefere telefonunuzun ekran kilidiyle girin.") });
    }, 1000);
  };

  return (
    <Card id="sec-2fa" className="scroll-mt-24">
      <CardHeader
        titleAs="h2"
        title={c("Two-step verification", "İki adımlı doğrulama")}
        description={c("A second step after your password. Admins at Kiln & Linen must keep at least one method on.", "Parolanızdan sonra ikinci bir adım. Kiln & Linen yöneticileri en az bir yöntemi açık tutmalıdır.")}
        divider
      />
      <CardBody className="p-0!">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-(--card-p) py-4">
          <Smartphone aria-hidden className="size-5 shrink-0 text-fg-subtle" strokeWidth={1.6} />
          <div className="min-w-0 flex-1 basis-48">
            <p className="flex items-center gap-2 text-[14px] font-medium text-fg">
              {c("Authenticator app", "Doğrulama uygulaması")}
              {value.totp ? <Badge tone="success" dot>{c("On", "Açık")}</Badge> : <Badge tone="outline">{c("Off", "Kapalı")}</Badge>}
            </p>
            <p className="text-[12.5px] text-fg-muted">
              {value.totp && value.totpAdded ? c(`Six-digit codes · set up ${f.date(value.totpAdded, "medium")}`, `Altı haneli kodlar · ${f.date(value.totpAdded, "medium")} tarihinde kuruldu`) : c("Six-digit codes from any authenticator app.", "Herhangi bir doğrulama uygulamasından altı haneli kodlar.")}
            </p>
          </div>
          <Button size="sm" onClick={() => setEnrolling(true)}>
            {value.totp ? c("Move to a new phone", "Yeni telefona taşı") : c("Set up", "Kur")}
          </Button>
        </div>

        <div className="border-b border-line px-(--card-p) py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Fingerprint aria-hidden className="size-5 shrink-0 text-fg-subtle" strokeWidth={1.6} />
            <div className="min-w-0 flex-1 basis-48">
              <p className="flex items-center gap-2 text-[14px] font-medium text-fg">
                {c("Passkeys", "Geçiş anahtarları")} <span className="tabular text-[12.5px] font-normal text-fg-subtle">{value.passkeys.length}</span>
              </p>
              <p className="text-[12.5px] text-fg-muted">{c("Sign in with a fingerprint, face or security key — no code to type.", "Parmak izi, yüz veya güvenlik anahtarıyla girin — kod yazmadan.")}</p>
            </div>
            <Button size="sm" loading={addingKey} onClick={addKey}>
              <Plus /> {addingKey ? c("Waiting for device…", "Cihaz bekleniyor…") : c("Add passkey", "Geçiş anahtarı ekle")}
            </Button>
          </div>
          {value.passkeys.length > 0 ? (
            <ul className="mt-3 grid gap-1.5 sm:ms-9">
              {value.passkeys.map((k) => (
                <li key={k.id} className="flex min-w-0 items-center gap-3 rounded-ui border border-line bg-surface-2 px-3 py-2">
                  {k.authenticator.en.includes("USB") ? <Usb aria-hidden className="size-4 text-fg-subtle" /> : <KeyRound aria-hidden className="size-4 text-fg-subtle" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] text-fg">{k.name}</p>
                    <p className="truncate text-[12px] text-fg-subtle">
                      {t(k.authenticator)} · {k.lastUsed ? c(`used ${f.date(k.lastUsed, "medium")}`, `son kullanım ${f.date(k.lastUsed, "medium")}`) : c("never used", "hiç kullanılmadı")}
                    </p>
                  </div>
                  <Button size="icon-sm" variant="ghost" aria-label={c(`Remove ${k.name}`, `${k.name} kaldır`)} onClick={() => removeKey(k)}>
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-(--card-p) py-4">
          <MessageSquareText aria-hidden className="size-5 shrink-0 text-fg-subtle" strokeWidth={1.6} />
          <div className="min-w-0 flex-1 basis-48">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-medium text-fg">
              <span className="whitespace-nowrap">{c("Text message", "SMS")}</span> <Badge tone="outline">{c("Turned off by your admin", "Yöneticiniz kapattı")}</Badge>
            </p>
            <p className="text-[12.5px] text-fg-muted">{c("SMS codes can be intercepted, so this workspace doesn't allow them.", "SMS kodları ele geçirilebildiği için bu çalışma alanı izin vermiyor.")}</p>
          </div>
          <Switch aria-label={c("Text message codes", "SMS kodları")} checked={false} disabled />
        </div>

        <div id="sec-codes" className="scroll-mt-24 px-(--card-p) py-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[14px] font-medium text-fg">{c("Backup codes", "Yedek kodlar")}</p>
            <p className={left <= 3 ? "text-[12.5px] text-warning" : "text-[12.5px] text-fg-muted"}>
              {c(`${left} of ${value.codes.length} left · each works once`, `${value.codes.length} kodun ${left} tanesi kaldı · her biri bir kez geçer`)}
            </p>
          </div>
          <BackupCodes
            title={null}
            aria-label={c("Backup codes", "Yedek kodlar")}
            codes={value.codes}
            used={value.usedCodes}
            filename="kiln-linen-backup-codes.txt"
            fileNote={`Kiln & Linen · ${me.email}`}
            regenerating={regenerating}
            onCopy={() => toast(c("Codes copied", "Kodlar kopyalandı"), { description: c("Keep them somewhere other than this computer.", "Bu bilgisayar dışında bir yerde saklayın.") })}
            onRegenerate={() => {
              setRegenerating(true);
              window.setTimeout(() => {
                setRegenerating(false);
                onChange({ ...value, codes: freshCodes(), usedCodes: [] });
                toast.success(c("New backup codes", "Yeni yedek kodlar"), { description: c("The old ones no longer work.", "Eskiler artık geçmez.") });
              }, 800);
            }}
          />
        </div>
      </CardBody>

      <Dialog open={enrolling} onOpenChange={(o) => !checking && (setEnrolling(o), setCode(""), setCodeError(null))}>
        <DialogContent size="md">
          <DialogHeader title={c("Scan with your authenticator app", "Doğrulama uygulamanızla tarayın")} description={c("Your current app keeps working until you confirm a code from the new one.", "Yeni uygulamadan bir kod onaylayana kadar mevcut uygulamanız çalışmaya devam eder.")} />
          <DialogBody className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <QrCode value={totpUri(me.email)} size={168} aria-label={c("QR code to add Kiln & Linen to your authenticator app", "Kiln & Linen'i doğrulama uygulamanıza eklemek için QR kod")} className="justify-self-center" />
            <div className="grid gap-4">
              <div>
                <p className="text-[12.5px] text-fg-muted">{c("Can't scan? Enter this key:", "Tarayamıyor musunuz? Bu anahtarı girin:")}</p>
                <p className="mt-1 flex items-center gap-2">
                  <code className="rounded-ui-sm bg-surface-2 px-2 py-1 font-mono text-[13px] tracking-[0.08em] text-fg">{SECRET_GROUPS}</code>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={c("Copy key", "Anahtarı kopyala")}
                    onClick={() => {
                      void navigator.clipboard?.writeText(SECRET_GROUPS.replace(/ /g, "")).catch(() => {});
                      toast(c("Key copied", "Anahtar kopyalandı"));
                    }}
                  >
                    <Copy />
                  </Button>
                </p>
              </div>
              <Field label={c("Code from the app", "Uygulamadaki kod")} hint={c("Any six digits work in this preview, except 000000.", "Bu önizlemede 000000 dışında her altı hane geçer.")} error={codeError ?? undefined}>
                <InputOTP groups={[3, 3]} value={code} onValueChange={setCode} onComplete={verify} loading={checking} invalid={Boolean(codeError)} autoFocus />
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEnrolling(false)} disabled={checking}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button variant="primary" disabled={code.length < 6} loading={checking} onClick={() => verify(code)}>
              {c("Verify and switch", "Doğrula ve geç")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {left <= 3 ? (
        <Alert tone="warning" size="sm" className="m-(--card-p) mt-0">
          {c("You're running low on backup codes. Generate a new set and store it safely.", "Yedek kodlarınız azalıyor. Yeni bir set oluşturup güvenle saklayın.")}
        </Alert>
      ) : null}
    </Card>
  );
}
