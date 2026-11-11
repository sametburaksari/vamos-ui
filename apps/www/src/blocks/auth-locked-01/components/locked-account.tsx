"use client";

import * as React from "react";
import { ArrowRight, Ban, CircleX, Lock, LockOpen, MailCheck, ShieldAlert } from "lucide-react";
import { Alert, Badge, Button, Card, Checkbox, Field, InputOTP, Progress, Stepper, cn, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { PasswordInput } from "../../login-02/components/password-input";
import { ELAPSED, LOCK_SECONDS, account, attempts, isUnlockCode, maskedEmail } from "./data";

type Step = "start" | "code" | "password" | "done";
const order: Step[] = ["start", "code", "password", "done"];

function useCountdown(from: number, running: boolean) {
  const [left, setLeft] = React.useState(from);
  React.useEffect(() => {
    if (!running || left <= 0) return;
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, running]);
  return [left, setLeft] as const;
}

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Locked after too many attempts: live countdown, what happened, and an email-code unlock that ends in a new password. */
export function LockedAccount() {
  const { c, f } = useBlockFormat();
  const [step, setStep] = React.useState<Step>("start");
  const [left] = useCountdown(LOCK_SECONDS - ELAPSED, step !== "done");
  const [resend, setResend] = useCountdown(0, true);
  const [sending, setSending] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [codeState, setCodeState] = React.useState<"idle" | "checking" | "wrong">("idle");
  const [pw, setPw] = React.useState("");
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const panelHeading = React.useRef<HTMLHeadingElement>(null);
  const unlocked = step === "done" || left <= 0;

  const move = (next: Step) => {
    setStep(next);
    requestAnimationFrame(() => panelHeading.current?.focus());
  };

  const send = () => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setResend(30);
      if (step === "start") move("code");
      toast.success(c("Code sent", "Kod gönderildi"), { description: c(`Check ${maskedEmail}. It works for 10 minutes.`, `${maskedEmail} adresini kontrol edin. Kod 10 dakika geçerli.`) });
    }, 800);
  };

  const check = (value: string) => {
    setCodeState("checking");
    window.setTimeout(() => {
      if (isUnlockCode(value)) {
        setCodeState("idle");
        move("password");
      } else {
        setCodeState("wrong");
        setCode("");
      }
    }, 700);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 12) {
      setPwError(c("Use at least 12 characters.", "En az 12 karakter kullanın."));
      document.getElementById("lk-pw")?.focus();
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      move("done");
    }, 900);
  };

  const pct = Math.max(0, (left / LOCK_SECONDS) * 100);

  return (
    <div className="ui-rise grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-14">
      {/* ── The lock ──────────────────────────────────────────────── */}
      <section aria-labelledby="lk-h" className="grid content-start gap-7">
        <div className="grid gap-3">
          <Badge tone={unlocked ? "success" : "warning"} size="md" className="w-fit">
            {unlocked ? <LockOpen /> : <Lock />} {unlocked ? c("Unlocked", "Kilit açık") : c("Sign-in paused", "Giriş durduruldu")}
          </Badge>
          <h1 id="lk-h" className="font-display text-[length:calc(36px*var(--display-scale))] leading-[1.05] text-fg text-balance">
            {unlocked ? c("You can sign in again", "Yeniden giriş yapabilirsiniz") : c("Too many wrong passwords", "Çok fazla hatalı parola")}
          </h1>
          <p className="max-w-[34rem] text-[14px] leading-relaxed text-fg-muted text-pretty">
            {c(
              `To protect ${account.email}, we paused password sign-in after three failed attempts. Nothing in the account was changed.`,
              `${account.email} hesabını korumak için üç başarısız denemeden sonra parolayla girişi durdurduk. Hesapta hiçbir şey değişmedi.`,
            )}
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-end justify-between gap-4">
            <p
              role="timer"
              aria-live="off"
              aria-label={c("Time until you can try again", "Tekrar deneyebilmenize kalan süre")}
              className={cn("font-mono text-[clamp(3rem,10vw,4.75rem)] font-light leading-none tracking-[-0.04em] tabular", unlocked ? "text-fg-subtle line-through decoration-2" : "text-fg")}
            >
              {mmss(Math.max(0, left))}
            </p>
            <p className="pb-2 text-end text-[12.5px] text-fg-muted">
              {unlocked ? c("Lock lifted", "Kilit kaldırıldı") : c("until you can try again", "sonra tekrar deneyebilirsiniz")}
            </p>
          </div>
          <Progress value={unlocked ? 0 : pct} tone="warning" aria-label={c("Lock time remaining", "Kalan kilit süresi")} valueText={mmss(Math.max(0, left))} />
        </div>

        <div className="grid gap-3">
          <h2 className="text-[13px] font-medium text-fg-muted">{c("What we saw", "Gördüklerimiz")}</h2>
          <ol className="grid gap-0 rounded-ui border border-line bg-surface">
            {attempts.map((a, i) => (
              <li key={a.id} className={cn("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-[13px]", i > 0 && "border-t border-line")}>
                {a.result === "blocked" ? <Ban aria-hidden className="size-4 text-danger" /> : <CircleX aria-hidden className="size-4 text-warning" />}
                <span className="min-w-0 truncate">
                  {a.result === "blocked" ? c("Sign-in blocked", "Giriş engellendi") : c("Wrong password", "Hatalı parola")}
                  <span className="text-fg-muted"> · {a.city} · </span>
                  <span className="font-mono text-[12px] text-fg-muted">{a.ip}</span>
                </span>
                <time dateTime={a.at} className="font-mono text-[12px] text-fg-subtle tabular">
                  {f.date(a.at, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </time>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2 text-[12.5px] text-fg-muted">
            <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
            <span>
              {c("Not you? Unlock with an emailed code and choose a new password — every other session gets signed out.", "Siz değil misiniz? E-postayla gelen kodla kilidi açın ve yeni parola seçin — diğer tüm oturumlar kapatılır.")}{" "}
              <a href="#" className="rounded-ui-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
                {c("Report it", "Bildirin")}
              </a>
            </span>
          </p>
        </div>
      </section>

      {/* ── Unlock ─────────────────────────────────────────────────── */}
      <Card className="grid content-start gap-5 p-5 sm:p-6 lg:sticky lg:top-6 lg:self-start">
        <Stepper
          variant="bar"
          size="sm"
          value={Math.min(order.indexOf(step), 2)}
          steps={[{ title: c("Email code", "E-posta kodu") }, { title: c("Verify", "Doğrula") }, { title: c("New password", "Yeni parola") }]}
          responsive={false}
          aria-label={c("Unlock progress", "Kilit açma adımları")}
        />

        {step === "start" ? (
          <div className="grid gap-4">
            <h2 ref={panelHeading} tabIndex={-1} className="text-[17px] font-semibold tracking-[-0.01em] outline-none">
              {c("Don’t want to wait?", "Beklemek istemiyor musunuz?")}
            </h2>
            <p className="text-[13.5px] leading-relaxed text-fg-muted">
              {c(`We’ll email a 6-digit code to ${maskedEmail}. Enter it here and set a new password to unlock right away.`, `${maskedEmail} adresine 6 haneli bir kod göndereceğiz. Buraya girip yeni parola belirleyin, kilit hemen açılsın.`)}
            </p>
            <Button variant="primary" block loading={sending} loadingText={c("Sending…", "Gönderiliyor…")} onClick={send}>
              <MailCheck /> {c("Email me an unlock code", "Kilit açma kodu gönder")}
            </Button>
          </div>
        ) : step === "code" ? (
          <div className="grid gap-4">
            <h2 ref={panelHeading} tabIndex={-1} className="text-[17px] font-semibold tracking-[-0.01em] outline-none">
              {c("Enter the code from your email", "E-postadaki kodu girin")}
            </h2>
            <Field
              label={c("Unlock code", "Kilit açma kodu")}
              id="lk-code"
              hint={c(`Sent to ${maskedEmail}.`, `${maskedEmail} adresine gönderildi.`)}
              error={codeState === "wrong" ? c("That code isn’t right or has expired.", "Kod yanlış ya da süresi dolmuş.") : undefined}
            >
              <InputOTP
                name="code"
                groups={[3, 3]}
                value={code}
                autoFocus
                invalid={codeState === "wrong"}
                loading={codeState === "checking"}
                onValueChange={(v) => {
                  setCode(v);
                  if (codeState === "wrong") setCodeState("idle");
                }}
                onComplete={check}
              />
            </Field>
            <p className="text-[12.5px] text-fg-muted" aria-live="polite">
              {resend > 0 ? (
                <>
                  {c("Resend in", "Tekrar gönderme:")} <span className="font-mono tabular">{f.number(resend)}s</span>
                </>
              ) : (
                <Button variant="link" className="text-[12.5px]" onClick={send} disabled={sending}>
                  {c("Send a new code", "Yeni kod gönder")}
                </Button>
              )}
            </p>
          </div>
        ) : step === "password" ? (
          <form noValidate onSubmit={save} className="grid gap-4">
            <h2 ref={panelHeading} tabIndex={-1} className="text-[17px] font-semibold tracking-[-0.01em] outline-none">
              {c("Choose a new password", "Yeni bir parola seçin")}
            </h2>
            <Field label={c("New password", "Yeni parola")} id="lk-pw" error={pwError ?? undefined} hint={pwError ? undefined : c("12 characters or more. Don’t reuse the old one.", "12 karakter veya daha fazla. Eskisini tekrar kullanmayın.")}>
              <PasswordInput
                autoComplete="new-password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setPwError(null);
                }}
                labels={{ showPassword: c("Show password", "Parolayı göster"), hidePassword: c("Hide password", "Parolayı gizle") }}
              />
            </Field>
            <Checkbox defaultChecked size="sm" label={c("Sign out every other session", "Diğer tüm oturumları kapat")} description={c("Including the device in Frankfurt.", "Frankfurt’taki cihaz dahil.")} />
            <Button type="submit" variant="primary" block loading={saving} loadingText={c("Saving…", "Kaydediliyor…")}>
              {c("Set password and unlock", "Parolayı kaydet ve kilidi aç")}
            </Button>
          </form>
        ) : (
          <div className="grid gap-4">
            <h2 ref={panelHeading} tabIndex={-1} className="sr-only">
              {c("Account unlocked", "Hesabın kilidi açıldı")}
            </h2>
            <Alert tone="success" icon={<LockOpen aria-hidden />} live="polite" title={c("Account unlocked", "Hesabın kilidi açıldı")}>
              {c("Your new password is saved and 3 other sessions were signed out.", "Yeni parolanız kaydedildi ve diğer 3 oturum kapatıldı.")}
            </Alert>
            <Button variant="primary" block asChild>
              <a href="#">
                {c("Sign in", "Giriş yap")} <ArrowRight />
              </a>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
