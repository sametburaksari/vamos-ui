"use client";

import * as React from "react";
import { ArrowRight, Check, Circle, Inbox, LogIn, Mail, UserPlus } from "lucide-react";
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Field,
  Input,
  RadioGroup,
  cn,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { PasswordInput } from "../../login-02/components/password-input";
import { invite, passwordRules } from "./data";

type Mode = "create" | "existing";
type Phase = { kind: "form" } | { kind: "submitting" } | { kind: "joined"; name: string } | { kind: "declined" };

/** Accept a team invite: the invitation on one side, create a password or join with an existing account on the other. */
export function InviteAccept() {
  const { c, t, f, ago } = useBlockFormat();
  const [mode, setMode] = React.useState<Mode>("create");
  const [phase, setPhase] = React.useState<Phase>({ kind: "form" });
  const [name, setName] = React.useState(invite.suggestedName);
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; password?: string; existing?: string }>({});
  const heading = React.useRef<HTMLHeadingElement>(null);

  const rules = passwordRules.map((r) => ({ ...r, ok: r.test(password, name) }));
  const strong = rules.every((r) => r.ok);

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = c("Enter the name your teammates will see.", "Ekip arkadaşlarınızın göreceği adı girin.");
    if (!strong)
      next.password = !rules[0]!.ok
        ? c("Use at least 12 characters.", "En az 12 karakter kullanın.")
        : c("Meet every rule below.", "Aşağıdaki tüm kuralları karşılayın.");
    setErrors(next);
    if (next.name || next.password) {
      document.getElementById(next.name ? "inv-name" : "inv-password")?.focus();
      return;
    }
    join(name.trim());
  };

  const submitExisting = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("password") ?? "");
    if (pw.length < 8) {
      setErrors({ existing: c("That password doesn’t match this account.", "Parola bu hesapla eşleşmiyor.") });
      document.getElementById("inv-existing-pw")?.focus();
      return;
    }
    setErrors({});
    join(invite.suggestedName);
  };

  const join = (who: string) => {
    setPhase({ kind: "submitting" });
    window.setTimeout(() => {
      setPhase({ kind: "joined", name: who });
      requestAnimationFrame(() => heading.current?.focus());
    }, 1000);
  };

  if (phase.kind === "joined" || phase.kind === "declined") {
    return <Outcome ref={heading} phase={phase} onUndo={() => setPhase({ kind: "form" })} />;
  }

  const submitting = phase.kind === "submitting";

  return (
    <div className="ui-rise grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
      {/* ── The invitation ─────────────────────────────────────────── */}
      <section aria-labelledby="inv-h" className="relative overflow-hidden rounded-ui-lg border border-line bg-surface shadow-(--surface-shadow)">
        <div className="grid gap-5 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <Avatar name={invite.inviter.name} size="md" status={invite.inviter.status} />
            <p className="text-[13.5px] leading-snug text-fg-muted">
              <span className="font-medium text-fg">{invite.inviter.name}</span> · {t(invite.inviter.title)}
              <br />
              {c("invited you", "sizi davet etti")} {ago(invite.sent)}
            </p>
          </div>
          <h1 id="inv-h" className="font-display text-[length:calc(32px*var(--display-scale))] leading-[1.08] text-fg text-balance">
            {c("Join", "Katılın:")} <em>{invite.workspace.name}</em>
          </h1>
          <blockquote className="border-s-2 border-accent ps-4 text-[14px] leading-relaxed text-fg-muted">“{t(invite.note)}”</blockquote>
        </div>
        <div aria-hidden className="mx-6 border-t border-dashed border-line sm:mx-7" />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-6 text-[13px] sm:p-7">
          <div>
            <dt className="text-fg-subtle">{c("Role", "Rol")}</dt>
            <dd className="mt-1 font-medium">{t(invite.role)}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle">{c("Team", "Ekip")}</dt>
            <dd className="mt-1 font-medium">{t(invite.team)}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle">{c("Teammates", "Ekip arkadaşları")}</dt>
            <dd className="mt-1.5">
              <AvatarGroup max={4} size="sm" aria-label={c("Support team", "Destek ekibi")}>
                {invite.teammates.map((p) => (
                  <Avatar key={p.id} name={p.name} />
                ))}
              </AvatarGroup>
            </dd>
          </div>
          <div>
            <dt className="text-fg-subtle">{c("Expires", "Son geçerlilik")}</dt>
            <dd className="mt-1 font-medium">
              {f.date(invite.expires, "medium")}{" "}
              <Badge tone="warning" size="sm" className="ms-1 align-middle">
                {c("6 days", "6 gün")}
              </Badge>
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-fg-subtle">{c("You’ll get access to", "Erişeceğiniz alanlar")}</dt>
            <dd>
              <ul className="mt-2 grid gap-1.5">
                {invite.access.map((a) => (
                  <li key={a.en} className="flex gap-2">
                    <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-accent-ink" />
                    {t(a)}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </section>

      {/* ── Accept ─────────────────────────────────────────────────── */}
      <Card className="grid gap-6 p-5 sm:p-7">
        <div className="grid gap-1">
          <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{c("Accept the invite", "Daveti kabul edin")}</h2>
          <p className="flex items-center gap-1.5 text-[13px] text-fg-muted">
            <Mail aria-hidden className="size-3.5" /> {c("Sent to", "Gönderildiği adres:")} <span className="font-medium text-fg">{invite.email}</span>
          </p>
        </div>

        <RadioGroup
          variant="card"
          orientation="horizontal"
          aria-label={c("How do you want to join?", "Nasıl katılmak istersiniz?")}
          value={mode}
          onValueChange={(v) => {
            setMode(v);
            setErrors({});
          }}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          items={[
            { value: "create", label: c("I’m new here", "Burada yeniyim"), description: c("Create a password", "Parola oluştur"), icon: <UserPlus /> },
            { value: "existing", label: c("I have an account", "Hesabım var"), description: c("Sign in to join", "Giriş yapıp katıl"), icon: <LogIn /> },
          ]}
        />

        {mode === "create" ? (
          <form noValidate onSubmit={submitCreate} className="grid gap-4" aria-label={c("Create your account", "Hesabınızı oluşturun")}>
            <Field label={c("Full name", "Ad soyad")} id="inv-name" error={errors.name}>
              <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={c("Password", "Parola")} id="inv-password" error={errors.password}>
              <PasswordInput
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((x) => ({ ...x, password: undefined }));
                }}
                aria-describedby="inv-rules"
                labels={{ showPassword: c("Show password", "Parolayı göster"), hidePassword: c("Hide password", "Parolayı gizle") }}
              />
            </Field>
            <ul id="inv-rules" className="-mt-1 grid gap-1 text-[12.5px]">
              {rules.map((r) => (
                <li key={r.id} className={cn("flex items-center gap-2 transition-colors", r.ok ? "text-fg" : "text-fg-muted")}>
                  {r.ok ? <Check aria-hidden className="size-3.5 text-success" /> : <Circle aria-hidden className="size-3 text-fg-subtle" />}
                  {t(r.label)}
                  <span className="sr-only">{r.ok ? c("(met)", "(karşılandı)") : c("(not met)", "(karşılanmadı)")}</span>
                </li>
              ))}
            </ul>
            <Button type="submit" variant="primary" block loading={submitting} loadingText={c("Joining…", "Katılınıyor…")}>
              {c("Accept invite", "Daveti kabul et")} <ArrowRight />
            </Button>
          </form>
        ) : (
          <form noValidate onSubmit={submitExisting} className="grid gap-4" aria-label={c("Sign in to join", "Katılmak için giriş yapın")}>
            {errors.existing ? (
              <Alert tone="danger" size="sm" live="assertive" title={c("Couldn’t sign you in", "Giriş yapılamadı")}>
                {errors.existing}
              </Alert>
            ) : null}
            <Field label={c("Email", "E-posta")} id="inv-existing-email">
              <Input name="email" type="email" autoComplete="username" defaultValue={invite.email} />
            </Field>
            <Field
              label={c("Password", "Parola")}
              id="inv-existing-pw"
              labelAction={
                <a href="#" className="rounded-ui-sm text-[12.5px] font-medium text-accent-ink hover:underline focus-ring">
                  {c("Forgot?", "Unuttum")}
                </a>
              }
            >
              <PasswordInput name="password" autoComplete="current-password" labels={{ showPassword: c("Show password", "Parolayı göster"), hidePassword: c("Hide password", "Parolayı gizle") }} />
            </Field>
            <Button type="submit" variant="primary" block loading={submitting} loadingText={c("Joining…", "Katılınıyor…")}>
              {c("Sign in and accept invite", "Giriş yap ve daveti kabul et")} <ArrowRight />
            </Button>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[12.5px] text-fg-muted">
          <span>
            {c("By joining you accept the", "Katılarak şunu kabul edersiniz:")}{" "}
            <a href="#" className="rounded-ui-sm underline decoration-line underline-offset-4 hover:text-fg focus-ring">
              {c("workspace policy", "çalışma alanı politikası")}
            </a>
            .
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="danger-ghost" size="sm" disabled={submitting}>
                {c("Decline", "Reddet")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent tone="danger">
              <AlertDialogHeader
                title={c("Decline this invite?", "Bu davet reddedilsin mi?")}
                description={c(`${invite.inviter.name} will be told you declined. They can invite you again later.`, `${invite.inviter.name} reddettiğiniz konusunda bilgilendirilecek. Sizi daha sonra tekrar davet edebilir.`)}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>{c("Keep invite", "Daveti tut")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => setPhase({ kind: "declined" })}>{c("Decline invite", "Daveti reddet")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}

const Outcome = React.forwardRef<HTMLHeadingElement, { phase: Extract<Phase, { kind: "joined" | "declined" }>; onUndo: () => void }>(function Outcome({ phase, onUndo }, ref) {
  const { c, t } = useBlockFormat();
  if (phase.kind === "declined") {
    return (
      <section className="ui-rise mx-auto grid max-w-[28rem] gap-4 text-center">
        <h1 ref={ref} tabIndex={-1} className="font-display text-[length:calc(30px*var(--display-scale))] leading-[1.1] text-fg outline-none">
          {c("Invite declined", "Davet reddedildi")}
        </h1>
        <p className="text-[14px] text-fg-muted">{c(`We let ${invite.inviter.name} know. You can close this tab.`, `${invite.inviter.name} bilgilendirildi. Bu sekmeyi kapatabilirsiniz.`)}</p>
        <div>
          <Button variant="ghost" onClick={onUndo}>
            {c("I changed my mind", "Fikrimi değiştirdim")}
          </Button>
        </div>
      </section>
    );
  }
  const first = phase.name.split(" ")[0];
  const next = [
    { icon: <UserPlus aria-hidden />, title: c("Add a photo and your working hours", "Fotoğraf ve çalışma saatlerinizi ekleyin"), meta: c("1 min", "1 dk") },
    { icon: <Inbox aria-hidden />, title: c("Open the returns queue with Kerem", "Kerem ile iade kuyruğunu açın"), meta: c("Monday 09:30", "Pazartesi 09:30") },
  ];
  return (
    <section className="ui-rise mx-auto grid w-full max-w-[32rem] gap-6">
      <div className="grid gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-fg [&_svg]:size-5">
          <Check aria-hidden />
        </span>
        <h1 ref={ref} tabIndex={-1} className="font-display text-[length:calc(34px*var(--display-scale))] leading-[1.08] text-fg outline-none">
          {c(`You’re in, ${first}.`, `Aramızdasınız, ${first}.`)}
        </h1>
        <p className="text-[14px] leading-relaxed text-fg-muted" aria-live="polite">
          {c(`You joined ${invite.workspace.name} as ${t(invite.role)}. Kerem gets a heads-up.`, `${invite.workspace.name} çalışma alanına ${t(invite.role)} olarak katıldınız. Kerem’e haber verildi.`)}
        </p>
      </div>
      <ol className="divide-y divide-line rounded-ui border border-line bg-surface">
        {next.map((n) => (
          <li key={n.title} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-ui-sm bg-surface-2 text-fg-muted [&_svg]:size-4">{n.icon}</span>
            <span className="min-w-0 flex-1 text-[13.5px]">{n.title}</span>
            <span className="shrink-0 text-[12px] text-fg-subtle">{n.meta}</span>
          </li>
        ))}
      </ol>
      <div>
        <Button variant="primary" asChild>
          <a href="#">
            {c("Open Kiln & Linen", "Kiln & Linen’i aç")} <ArrowRight />
          </a>
        </Button>
      </div>
    </section>
  );
});
