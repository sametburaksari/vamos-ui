"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Building2, Pencil } from "lucide-react";
import { Alert, Avatar, Button, Checkbox, Field, Input, Separator } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { PasswordInput } from "../../login-02/components/password-input";
import { GoogleMark, MicrosoftMark } from "../../login-02/components/sso-icons";
import { isCorrectPassword } from "./data";

type Step = { kind: "email" } | { kind: "password"; email: string } | { kind: "done"; email: string };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Email-first sign-in: social providers, then email → password on a second step, with inline errors. */
export function EmailFirstSignIn() {
  const { c } = useBlockFormat();
  const [step, setStep] = React.useState<Step>({ kind: "email" });
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<"email" | "password" | "google" | "microsoft" | null>(null);
  const pwRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);

  const social = (id: "google" | "microsoft") => {
    setBusy(id);
    window.setTimeout(() => setBusy(null), 1500);
  };

  const submitEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!EMAIL.test(email)) {
      setEmailError(email ? c("That doesn’t look like an email address.", "Bu bir e-posta adresine benzemiyor.") : c("Enter your work email.", "İş e-postanızı girin."));
      emailRef.current?.focus();
      return;
    }
    setEmailError(null);
    setBusy("email");
    window.setTimeout(() => {
      setBusy(null);
      setStep({ kind: "password", email });
      requestAnimationFrame(() => pwRef.current?.focus());
    }, 500);
  };

  const submitPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step.kind !== "password") return;
    const pw = String(new FormData(e.currentTarget).get("password") ?? "");
    if (!pw) {
      setPwError(c("Enter your password.", "Parolanızı girin."));
      return;
    }
    setBusy("password");
    window.setTimeout(() => {
      setBusy(null);
      if (isCorrectPassword(pw)) {
        setPwError(null);
        setStep({ kind: "done", email: step.email });
      } else {
        setPwError(c("That password is incorrect. 4 tries left.", "Parola hatalı. 4 deneme hakkınız kaldı."));
        pwRef.current?.select();
      }
    }, 800);
  };

  const back = () => {
    setStep({ kind: "email" });
    setPwError(null);
    requestAnimationFrame(() => emailRef.current?.focus());
  };

  return (
    <div className="grid gap-7">
      <div className="grid gap-2">
        <h1 className="font-display text-[length:calc(34px*var(--display-scale))] leading-[1.08] text-fg">
          {step.kind === "password" ? c("Enter your password", "Parolanızı girin") : c("Welcome back", "Tekrar hoş geldiniz")}
        </h1>
        <p className="text-[14px] text-fg-muted">
          {step.kind === "password"
            ? c("One more step and you’re in.", "Bir adım daha, sonra içerdesiniz.")
            : c("Sign in to the Kiln & Linen back office.", "Kiln & Linen arka ofisine giriş yapın.")}
        </p>
      </div>

      {step.kind === "done" ? (
        <Alert tone="success" live="polite" title={c("Signed in", "Giriş yapıldı")}>
          {c(`Opening today’s orders for ${step.email}…`, `${step.email} için bugünkü siparişler açılıyor…`)}
        </Alert>
      ) : step.kind === "email" ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" loading={busy === "google"} loadingMode="replace" disabled={busy !== null && busy !== "google"} onClick={() => social("google")}>
              <GoogleMark /> Google
            </Button>
            <Button variant="secondary" loading={busy === "microsoft"} loadingMode="replace" disabled={busy !== null && busy !== "microsoft"} onClick={() => social("microsoft")}>
              <MicrosoftMark /> Microsoft
            </Button>
          </div>
          <Separator label={c("or continue with email", "veya e-postayla devam edin")} className="text-[12px]" />
          <form noValidate onSubmit={submitEmail} className="grid gap-4" aria-label={c("Sign in with email", "E-postayla giriş")}>
            <Field label={c("Work email", "İş e-postası")} id="l3-email" error={emailError ?? undefined}>
              <Input ref={emailRef} name="email" type="email" autoComplete="username" placeholder="name@company.example.com" onChange={() => emailError && setEmailError(null)} />
            </Field>
            <Button type="submit" variant="primary" block loading={busy === "email"}>
              {c("Continue", "Devam")} <ArrowRight />
            </Button>
          </form>
          <a href="#" className="inline-flex w-fit items-center gap-2 rounded-ui-sm text-[13px] text-fg-muted hover:text-fg focus-ring">
            <Building2 aria-hidden className="size-4" /> {c("Use your company’s single sign-on", "Şirketinizin tek oturum açmasını kullanın")}
          </a>
        </>
      ) : (
        <form noValidate onSubmit={submitPassword} className="ui-rise grid gap-4" aria-label={c("Enter your password", "Parolanızı girin")}>
          <div className="flex items-center gap-3 rounded-ui border border-line bg-surface-2 px-3 py-2">
            <Avatar name={step.email.split("@")[0]!.replace(/[._]/g, " ")} size="sm" />
            <span className="min-w-0 flex-1 truncate text-[13.5px]">{step.email}</span>
            <Button size="xs" variant="ghost" onClick={back} aria-label={c("Change email", "E-postayı değiştir")}>
              <Pencil /> <span className="hidden sm:inline">{c("Change", "Değiştir")}</span>
            </Button>
          </div>
          <input type="email" name="username" autoComplete="username" value={step.email} readOnly hidden />
          <Field
            label={c("Password", "Parola")}
            id="l3-password"
            error={pwError ?? undefined}
            labelAction={
              <a href="#" className="rounded-ui-sm text-[12.5px] font-medium text-accent-ink hover:underline focus-ring">
                {c("Forgot password?", "Parolamı unuttum")}
              </a>
            }
          >
            <PasswordInput
              ref={pwRef}
              name="password"
              autoComplete="current-password"
              onChange={() => pwError && setPwError(null)}
              labels={{ showPassword: c("Show password", "Parolayı göster"), hidePassword: c("Hide password", "Parolayı gizle") }}
            />
          </Field>
          <Checkbox name="remember" size="sm" defaultChecked label={c("Keep me signed in on this device", "Bu cihazda oturumum açık kalsın")} />
          <Button type="submit" variant="primary" block loading={busy === "password"} loadingText={c("Signing in…", "Giriş yapılıyor…")}>
            {c("Sign in", "Giriş yap")}
          </Button>
          <Button variant="ghost" onClick={back} className="w-fit text-fg-muted">
            <ArrowLeft /> {c("Use a different email", "Başka bir e-posta kullan")}
          </Button>
        </form>
      )}
    </div>
  );
}
