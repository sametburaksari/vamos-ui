"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, KeyRound, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import {
  Alert,
  BackupCodes,
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  InputOTP,
  ProgressCircle,
  QrCode,
  Stepper,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { account, apps, initialCodes, isValidCode, otpauth, regeneratedCodes, secretGroups, steps } from "./data";
import { Eyebrow, KilnMark } from "./kiln-brand";

const PERIOD = 30;

/** Seconds left in the current 30-second TOTP window. Starts full on the server, ticks on the client. */
function useTotpWindow() {
  const [left, setLeft] = React.useState(PERIOD);
  React.useEffect(() => {
    const tick = () => setLeft(PERIOD - (Math.floor(Date.now() / 1000) % PERIOD));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return left;
}

type Verify = { kind: "idle" } | { kind: "checking" } | { kind: "wrong"; tries: number } | { kind: "ok" };

/** Three-step TOTP enrolment: scan → verify → save backup codes, then a summary of the account's methods. */
export function TwoFactorSetup() {
  const { c, t } = useBlockFormat();
  const [step, setStep] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [verify, setVerify] = React.useState<Verify>({ kind: "idle" });
  const [codes, setCodes] = React.useState(initialCodes);
  const [regenerating, setRegenerating] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [savedError, setSavedError] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const left = useTotpWindow();

  const go = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  };

  const check = (value: string) => {
    setVerify({ kind: "checking" });
    window.setTimeout(() => {
      if (isValidCode(value)) {
        setVerify({ kind: "ok" });
        window.setTimeout(() => go(2), 700);
      } else {
        setVerify((v) => ({ kind: "wrong", tries: v.kind === "wrong" ? v.tries + 1 : 1 }));
        setCode("");
      }
    }, 800);
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secretGroups.join(""));
    } catch {
      /* clipboard can be blocked in iframes; the toast still confirms the intent */
    }
    toast.success(c("Setup key copied", "Kurulum anahtarı kopyalandı"), { description: c("Paste it into your authenticator app.", "Doğrulama uygulamanıza yapıştırın.") });
  };

  const regenerate = () => {
    setRegenerating(true);
    window.setTimeout(() => {
      setCodes((prev) => (prev === initialCodes ? regeneratedCodes : initialCodes));
      setRegenerating(false);
      setSaved(false);
      toast(c("New backup codes created", "Yeni yedek kodlar oluşturuldu"), { description: c("The previous set no longer works.", "Önceki kodlar artık geçersiz.") });
    }, 900);
  };

  const finish = () => {
    if (!saved) {
      setSavedError(true);
      return;
    }
    setDone(true);
    toast.success(c("Two-step verification is on", "İki adımlı doğrulama açık"), { description: account.email });
    requestAnimationFrame(() => heading.current?.focus());
  };

  const wrong = verify.kind === "wrong";

  return (
    <div className="mx-auto grid w-full max-w-[68rem] gap-6 px-4 pb-16 pt-2 sm:px-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 lg:pt-6">
      {/* ── Aside: where you are + why ─────────────────────────────── */}
      <aside className="grid content-start gap-6 lg:sticky lg:top-6">
        <div className="grid gap-2">
          <Eyebrow>{c("Security · Two-step verification", "Güvenlik · İki adımlı doğrulama")}</Eyebrow>
          <p className="font-display text-[length:calc(26px*var(--display-scale))] leading-[1.15] text-fg text-balance">
            {c("A second lock on", "Hesabınıza")} <em>{c("your account", "ikinci kilit")}</em>
          </p>
        </div>
        <Stepper
          orientation="vertical"
          size="sm"
          value={done ? steps.length : step}
          onValueChange={(i) => !done && go(i)}
          steps={steps.map((s) => ({ id: s.id, title: t(s.title), description: t(s.hint) }))}
          className="hidden lg:flex"
        />
        <Stepper
          variant="compact"
          value={done ? steps.length - 1 : step}
          steps={steps.map((s) => ({ id: s.id, title: t(s.title) }))}
          className="lg:hidden"
        />
        <p className="hidden border-t border-line pt-4 text-[12.5px] leading-relaxed text-fg-muted lg:block">
          {c(
            "Admins of Kiln & Linen must use two-step verification from 1 December. Passwords alone stop working for payouts and refunds.",
            "Kiln & Linen yöneticileri 1 Aralık’tan itibaren iki adımlı doğrulama kullanmalı. Ödeme ve iadelerde tek başına parola yetmeyecek.",
          )}
        </p>
      </aside>

      {/* ── Main panel ─────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        {done ? (
          <DoneSummary headingRef={heading} codesLeft={codes.length} />
        ) : step === 0 ? (
          <section aria-labelledby="tfa-h" className="ui-rise grid md:grid-cols-[minmax(0,1fr)_15.5rem]">
            <div className="grid content-start gap-5 p-5 sm:p-7">
              <StepHeading ref={heading} n={1}>
                {c("Scan this code with your authenticator app", "Bu kodu doğrulama uygulamanızla okutun")}
              </StepHeading>
              <ul className="grid gap-2 text-[13.5px] text-fg-muted">
                {apps.map((a, i) => (
                  <li key={a.en} className="flex gap-2.5">
                    {i === 0 ? <Smartphone aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" /> : <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />}
                    {t(a)}
                  </li>
                ))}
              </ul>
              <div className="rounded-ui border border-line bg-surface-2">
                <button
                  type="button"
                  aria-expanded={showKey}
                  aria-controls="tfa-key"
                  onClick={() => setShowKey((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 rounded-ui px-4 py-3 text-start text-[13.5px] font-medium focus-ring"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound aria-hidden className="size-4 text-fg-subtle" />
                    {c("Can’t scan? Enter the key by hand", "Okutamıyor musunuz? Anahtarı elle girin")}
                  </span>
                  <ChevronDown aria-hidden className={`size-4 text-fg-subtle transition-transform ${showKey ? "rotate-180" : ""}`} />
                </button>
                {showKey ? (
                  <div id="tfa-key" className="ui-rise grid gap-3 border-t border-line px-4 py-4">
                    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12.5px]">
                      <dt className="text-fg-subtle">{c("Account", "Hesap")}</dt>
                      <dd className="truncate">{account.email}</dd>
                      <dt className="text-fg-subtle">{c("Type", "Tür")}</dt>
                      <dd>{c("Time-based, 6 digits, 30 s", "Zamana dayalı, 6 hane, 30 sn")}</dd>
                    </dl>
                    <div className="flex flex-wrap items-center gap-3">
                      <code aria-label={c("Setup key", "Kurulum anahtarı")} className="flex flex-wrap gap-x-2.5 font-mono text-[15px] tracking-[0.08em] text-fg">
                        {secretGroups.map((g) => (
                          <span key={g}>{g}</span>
                        ))}
                      </code>
                      <Button size="sm" variant="secondary" onClick={copySecret}>
                        <Copy /> {c("Copy key", "Anahtarı kopyala")}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => go(1)}>
                  {c("I’ve scanned it", "Okuttum")} <ArrowRight />
                </Button>
              </div>
            </div>
            <div className="order-first grid place-items-center gap-3 border-b border-line bg-surface-2 p-6 md:order-none md:border-b-0 md:border-s">
              <QrCode value={otpauth} size={184} aria-label={c("QR code that adds Kiln & Linen to your authenticator app", "Kiln & Linen’i doğrulama uygulamanıza ekleyen QR kod")}>
                <KilnMark label={false} />
              </QrCode>
              <p className="max-w-[13rem] text-center text-[12px] leading-snug text-fg-subtle">
                {c("The app will show “Kiln & Linen” with", "Uygulamada şu hesapla “Kiln & Linen” görünecek:")} <span className="break-all text-fg-muted">{account.email}</span>
              </p>
            </div>
          </section>
        ) : step === 1 ? (
          <section aria-labelledby="tfa-h" className="ui-rise grid content-start gap-6 p-5 sm:p-7">
            <StepHeading ref={heading} n={2}>
              {c("Enter the 6-digit code from the app", "Uygulamadaki 6 haneli kodu girin")}
            </StepHeading>
            <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
              <Field
                label={c("Verification code", "Doğrulama kodu")}
                id="tfa-code"
                error={wrong ? c("That code didn’t match. Use the newest code in the app.", "Kod eşleşmedi. Uygulamadaki en yeni kodu kullanın.") : undefined}
                hint={c("Try 000000 to see an error.", "Hata görmek için 000000 deneyin.")}
              >
                <InputOTP
                  name="code"
                  size="lg"
                  groups={[3, 3]}
                  value={code}
                  autoFocus
                  invalid={wrong}
                  loading={verify.kind === "checking"}
                  onValueChange={(v) => {
                    setCode(v);
                    if (wrong) setVerify({ kind: "idle" });
                  }}
                  onComplete={check}
                />
              </Field>
              <div className="flex items-center gap-3 pb-1">
                <ProgressCircle
                  size="md"
                  value={left}
                  max={PERIOD}
                  tone={left <= 5 ? "warning" : "accent"}
                  aria-label={c("Time until the code changes", "Kodun değişmesine kalan süre")}
                  valueText={`${left}s`}
                >
                  <span className="font-mono text-[12px] tabular">{left}</span>
                </ProgressCircle>
                <p className="max-w-[11rem] text-[12.5px] leading-snug text-fg-muted">
                  {c("Codes change every 30 seconds. A code that just changed still works.", "Kodlar 30 saniyede bir değişir. Yeni değişen kod da çalışır.")}
                </p>
              </div>
            </div>
            {verify.kind === "ok" ? (
              <Alert tone="success" size="sm" live="polite" icon={<Check aria-hidden />} title={c("Code accepted", "Kod kabul edildi")}>
                {c("Your app is linked. One last step.", "Uygulamanız bağlandı. Son bir adım kaldı.")}
              </Alert>
            ) : wrong && verify.tries >= 2 ? (
              <Alert tone="warning" size="sm" live="polite" title={c("Still not matching?", "Hâlâ eşleşmiyor mu?")}>
                {c(
                  "Check that your phone’s clock is set automatically — codes depend on the exact time.",
                  "Telefonunuzun saatinin otomatik ayarlı olduğundan emin olun — kodlar tam saate bağlıdır.",
                )}
              </Alert>
            ) : null}
            <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-5">
              <Button variant="ghost" onClick={() => go(0)}>
                <ArrowLeft /> {c("Back to the code", "Koda dön")}
              </Button>
              <Button variant="primary" disabled={code.length < 6} loading={verify.kind === "checking"} onClick={() => check(code)}>
                {c("Verify", "Doğrula")}
              </Button>
            </div>
          </section>
        ) : (
          <section aria-labelledby="tfa-h" className="ui-rise grid content-start gap-5 p-5 sm:p-7">
            <StepHeading ref={heading} n={3}>
              {c("Save your backup codes", "Yedek kodlarınızı saklayın")}
            </StepHeading>
            <p className="-mt-2 max-w-prose text-[13.5px] leading-relaxed text-fg-muted">
              {c(
                "If you lose your phone, each of these codes gets you in once. We won’t show them again — store them in your password manager or print them.",
                "Telefonunuzu kaybederseniz bu kodların her biri sizi bir kez içeri alır. Tekrar göstermeyeceğiz — parola yöneticinize kaydedin ya da yazdırın.",
              )}
            </p>
            <BackupCodes
              codes={codes}
              title={null}
              aria-label={c("Backup codes", "Yedek kodlar")}
              filename="kiln-linen-backup-codes.txt"
              fileNote={`Kiln & Linen · ${account.email}`}
              onRegenerate={regenerate}
              regenerating={regenerating}
              labels={{
                copy: c("Copy", "Kopyala"),
                copied: c("Copied", "Kopyalandı"),
                copiedAnnouncement: c("Backup codes copied to the clipboard", "Yedek kodlar panoya kopyalandı"),
                download: c("Download", "İndir"),
                regenerate: c("New codes", "Yeni kodlar"),
                used: c("used", "kullanıldı"),
                remaining: c("{left} of {total} left", "{total} kodun {left} tanesi kaldı"),
                fileHeader: c("Backup codes — each code works once. Keep them somewhere safe.", "Yedek kodlar — her kod bir kez çalışır. Güvenli bir yerde saklayın."),
              }}
            />
            <Checkbox
              checked={saved}
              invalid={savedError && !saved}
              onCheckedChange={(v) => {
                setSaved(v === true);
                setSavedError(false);
              }}
              label={c("I’ve stored these codes somewhere safe", "Bu kodları güvenli bir yere kaydettim")}
              description={savedError && !saved ? c("Confirm this before you finish.", "Bitirmeden önce bunu onaylayın.") : undefined}
            />
            <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-5">
              <Button variant="ghost" onClick={() => go(1)}>
                <ArrowLeft /> {c("Back", "Geri")}
              </Button>
              <Button variant="primary" onClick={finish}>
                <ShieldCheck /> {c("Turn on two-step verification", "İki adımlı doğrulamayı aç")}
              </Button>
            </div>
          </section>
        )}
      </Card>
    </div>
  );
}

const StepHeading = React.forwardRef<HTMLHeadingElement, { n: number; children: React.ReactNode }>(function StepHeading({ n, children }, ref) {
  return (
    <div className="flex items-baseline gap-3">
      <span aria-hidden className="font-mono text-[12px] text-fg-subtle tabular">0{n}</span>
      <h1 ref={ref} id="tfa-h" tabIndex={-1} className="font-display text-[length:calc(23px*var(--display-scale))] leading-[1.2] text-fg text-balance outline-none">
        {children}
      </h1>
    </div>
  );
});

function DoneSummary({ headingRef, codesLeft }: { headingRef: React.Ref<HTMLHeadingElement>; codesLeft: number }) {
  const { c } = useBlockFormat();
  const rows = [
    { icon: <Smartphone aria-hidden />, name: c("Authenticator app", "Doğrulama uygulaması"), state: <Badge tone="success" dot>{c("On", "Açık")}</Badge>, note: c("Added just now", "Az önce eklendi") },
    { icon: <KeyRound aria-hidden />, name: c("Backup codes", "Yedek kodlar"), state: <Badge tone="neutral">{codesLeft} {c("left", "kaldı")}</Badge>, note: c("Each works once", "Her biri bir kez çalışır") },
    { icon: <ShieldCheck aria-hidden />, name: c("Passkey", "Geçiş anahtarı"), state: <Button size="xs" variant="soft">{c("Add", "Ekle")}</Button>, note: c("Faster than codes on this device", "Bu cihazda koddan daha hızlı") },
  ];
  return (
    <section aria-labelledby="tfa-h" className="ui-rise grid gap-6 p-5 sm:p-8">
      <div className="grid gap-2">
        <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent-ink [&_svg]:size-5">
          <ShieldCheck aria-hidden />
        </span>
        <h1 ref={headingRef} id="tfa-h" tabIndex={-1} className="mt-2 font-display text-[length:calc(28px*var(--display-scale))] leading-[1.15] text-fg outline-none">
          {c("Two-step verification is on", "İki adımlı doğrulama açık")}
        </h1>
        <p className="max-w-prose text-[13.5px] text-fg-muted">
          {c("Next time you sign in from a new device we’ll ask for a code after your password.", "Yeni bir cihazdan giriş yaptığınızda parolanızdan sonra kod isteyeceğiz.")}
        </p>
      </div>
      <ul className="divide-y divide-line rounded-ui border border-line">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-ui-sm bg-surface-2 text-fg-muted [&_svg]:size-4">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium">{r.name}</p>
              <p className="text-[12.5px] text-fg-muted">{r.note}</p>
            </div>
            {r.state}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" asChild>
          <a href="#">{c("Back to security settings", "Güvenlik ayarlarına dön")}</a>
        </Button>
      </div>
    </section>
  );
}
