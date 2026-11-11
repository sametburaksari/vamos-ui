"use client";

import * as React from "react";
import { ArrowRight, Building2, Check, CircleSlash, Copy, LockKeyhole } from "lucide-react";
import { Alert, Avatar, Badge, Button, Field, Input, Spinner, Tabs, TabsContent, TabsList, TabsTrigger, cn, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { findByEmail, findBySlug, personalDomains, recent, type SsoOrg } from "./data";

type Lookup =
  | { kind: "empty" }
  | { kind: "typing" }
  | { kind: "searching"; domain: string }
  | { kind: "match"; org: SsoOrg; domain: string }
  | { kind: "none"; domain: string; personal: boolean };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function useDomainLookup(email: string): Lookup {
  const [result, setResult] = React.useState<Lookup>({ kind: "empty" });
  React.useEffect(() => {
    const value = email.trim();
    if (!value) return setResult({ kind: "empty" });
    if (!EMAIL.test(value)) return setResult({ kind: "typing" });
    const domain = value.split("@")[1]!.toLowerCase();
    setResult({ kind: "searching", domain });
    const id = window.setTimeout(() => {
      const org = findByEmail(value);
      setResult(org ? { kind: "match", org, domain } : { kind: "none", domain, personal: personalDomains.includes(domain) });
    }, 450);
    return () => window.clearTimeout(id);
  }, [email]);
  return result;
}

type Redirect = { org: SsoOrg; step: number } | null;

/** "Find your organisation": email-domain lookup or organisation ID, then a staged redirect to the identity provider. */
export function SsoFinder() {
  const { c } = useBlockFormat();
  const [email, setEmail] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugError, setSlugError] = React.useState<string | null>(null);
  const [redirect, setRedirect] = React.useState<Redirect>(null);
  const lookup = useDomainLookup(email);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const go = (org: SsoOrg) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setRedirect({ org, step: 1 });
    timers.current = [900, 1900].map((ms, i) => window.setTimeout(() => setRedirect((r) => (r ? { ...r, step: i + 2 } : r)), ms));
  };

  const cancel = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setRedirect(null);
  };

  if (redirect) return <RedirectPanel redirect={redirect} onCancel={cancel} />;

  return (
    <div className="ui-rise grid gap-7">
      <div className="grid gap-2">
        <h1 className="font-display text-[length:calc(34px*var(--display-scale))] leading-[1.08] text-fg text-balance">
          {c("Sign in with your", "Kurumunuzun hesabıyla")} <em>{c("company account", "giriş yapın")}</em>
        </h1>
        <p className="text-[14px] leading-relaxed text-fg-muted text-pretty">
          {c("We’ll find your organisation and send you to its sign-in page. Your password never touches Kiln & Linen.", "Kurumunuzu bulup kendi giriş sayfasına yönlendireceğiz. Parolanız Kiln & Linen’e hiç uğramaz.")}
        </p>
      </div>

      <Tabs defaultValue="email">
        <TabsList aria-label={c("Find by", "Şununla bul")}>
          <TabsTrigger value="email">{c("Work email", "İş e-postası")}</TabsTrigger>
          <TabsTrigger value="id">{c("Organisation ID", "Kurum kimliği")}</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="grid gap-4 pt-5">
          <form
            noValidate
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (lookup.kind === "match") go(lookup.org);
            }}
          >
            <Field label={c("Work email", "İş e-postası")} id="sso-email" hint={lookup.kind === "empty" ? c("Try ruth@tidewell.example.com", "ruth@tidewell.example.com deneyin") : undefined}>
              <Input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="name@company.example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                trailing={lookup.kind === "searching" ? <Spinner size="sm" /> : lookup.kind === "match" ? <Check aria-hidden className="size-4 text-success" /> : undefined}
              />
            </Field>
            <Readout lookup={lookup} />
            <div aria-live="polite" className="grid gap-3">
              {lookup.kind === "match" ? (
                <Button type="submit" variant="primary" block>
                  {c(`Continue to ${lookup.org.name}`, `${lookup.org.name} ile devam et`)} <ArrowRight />
                </Button>
              ) : lookup.kind === "none" ? (
                <NoMatch domain={lookup.domain} personal={lookup.personal} />
              ) : null}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="id" className="pt-5">
          <form
            noValidate
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const org = findBySlug(slug);
              if (org) go(org);
              else setSlugError(slug.trim() ? c(`No organisation uses “${slug.trim()}”. Check with your IT team.`, `“${slug.trim()}” kimliğini kullanan bir kurum yok. BT ekibinize danışın.`) : c("Enter your organisation ID.", "Kurum kimliğinizi girin."));
            }}
          >
            <Field label={c("Organisation ID", "Kurum kimliği")} id="sso-slug" error={slugError ?? undefined} hint={c("The short name your admin shared, e.g. larkspur.", "Yöneticinizin paylaştığı kısa ad, örn. larkspur.")}>
              <Input
                name="slug"
                autoComplete="organization"
                spellCheck={false}
                leading={<span className="font-mono text-[12.5px] text-fg-subtle">sso/</span>}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugError(null);
                }}
                className="font-mono"
              />
            </Field>
            <Button type="submit" variant="primary" block>
              {c("Find organisation", "Kurumu bul")}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="grid gap-2.5">
        <p className="text-[12px] font-medium text-fg-subtle">{c("Used on this browser", "Bu tarayıcıda kullanılanlar")}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {recent.map((o) => (
            <li key={o.slug}>
              <button
                type="button"
                onClick={() => go(o)}
                className="flex w-full items-center gap-3 rounded-ui border border-line bg-surface px-3 py-2.5 text-start transition-colors hover:border-field-border-hover hover:bg-hover focus-ring"
              >
                <Avatar name={o.name} shape="square" size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{o.name}</span>
                  <span className="block truncate font-mono text-[11.5px] text-fg-subtle">{o.domain}</span>
                </span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-subtle" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[13px] text-fg-muted">
        {c("Not using single sign-on?", "Tek oturum açma kullanmıyor musunuz?")}{" "}
        <a href="#" className="rounded-ui-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
          {c("Sign in with email and password", "E-posta ve parolayla giriş yapın")}
        </a>
      </p>
    </div>
  );
}

/** Monospace ledger that shows what the lookup found, line by line. */
function Readout({ lookup }: { lookup: Lookup }) {
  const { c } = useBlockFormat();
  if (lookup.kind === "empty" || lookup.kind === "typing") return null;
  const rows: Array<[string, React.ReactNode, string?]> = [[c("domain", "alan adı"), lookup.domain]];
  if (lookup.kind === "searching") rows.push([c("match", "eşleşme"), c("looking up…", "aranıyor…"), "muted"]);
  if (lookup.kind === "match") {
    rows.push([c("match", "eşleşme"), lookup.org.name]);
    rows.push([c("protocol", "protokol"), lookup.org.provider]);
  }
  if (lookup.kind === "none") rows.push([c("match", "eşleşme"), c("none", "yok"), "danger"]);
  return (
    <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-y-1 rounded-ui border border-line bg-surface-2 px-4 py-3 font-mono text-[12.5px]">
      {rows.map(([k, v, tone]) => (
        <React.Fragment key={k}>
          <dt className="text-fg-subtle">{k}</dt>
          <dd className={cn("truncate", tone === "muted" ? "text-fg-muted" : tone === "danger" ? "text-danger" : "text-fg")}>{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function NoMatch({ domain, personal }: { domain: string; personal: boolean }) {
  const { c } = useBlockFormat();
  const message = c(
    `Hi — could we set up single sign-on to Kiln & Linen for ${domain}? Setup guide: https://help.example.com/sso`,
    `Merhaba — ${domain} için Kiln & Linen’e tek oturum açma kurabilir miyiz? Kurulum rehberi: https://help.example.com/sso`,
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      /* blocked in some iframes */
    }
    toast.success(c("Message copied", "Mesaj kopyalandı"), { description: c("Send it to your IT team.", "BT ekibinize gönderin.") });
  };
  return (
    <Alert
      tone={personal ? "info" : "neutral"}
      icon={<CircleSlash aria-hidden />}
      title={personal ? c("That’s a personal address", "Bu kişisel bir adres") : c(`No single sign-on for ${domain}`, `${domain} için tek oturum açma yok`)}
      actions={
        <>
          <Button size="sm" variant="secondary" asChild>
            <a href="#">{c("Use email and password", "E-posta ve parola kullan")}</a>
          </Button>
          {personal ? null : (
            <Button size="sm" variant="ghost" onClick={copy}>
              <Copy /> {c("Copy a note for IT", "BT için not kopyala")}
            </Button>
          )}
        </>
      }
    >
      {personal
        ? c("Use the email your company gave you, or sign in with a password.", "Şirketinizin verdiği e-postayı kullanın ya da parolayla giriş yapın.")
        : c("Your organisation hasn’t connected its sign-in yet. You can still use a password if your admin invited you.", "Kurumunuz girişini henüz bağlamamış. Yöneticiniz sizi davet ettiyse parolayla girebilirsiniz.")}
    </Alert>
  );
}

function RedirectPanel({ redirect, onCancel }: { redirect: NonNullable<Redirect>; onCancel: () => void }) {
  const { c } = useBlockFormat();
  const { org, step } = redirect;
  const steps = [
    c(`Found ${org.name}`, `${org.name} bulundu`),
    c(`Contacting ${org.provider} provider`, `${org.provider} sağlayıcısına bağlanılıyor`),
    c(`Redirecting to ${org.idpHost}`, `${org.idpHost} adresine yönlendiriliyor`),
  ];
  return (
    <section aria-labelledby="sso-redirect" className="ui-rise grid gap-7">
      <div className="flex items-center gap-4">
        <Avatar name={org.name} shape="square" size="lg" />
        <div className="min-w-0">
          <Badge tone="outline" size="sm">
            <LockKeyhole /> {org.provider}
          </Badge>
          <h1 id="sso-redirect" className="mt-1.5 truncate font-display text-[length:calc(28px*var(--display-scale))] leading-[1.1] text-fg">
            {org.name}
          </h1>
        </div>
      </div>
      <ol aria-live="polite" className="grid gap-0 border-s border-line ps-5">
        {steps.map((label, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <li key={label} className="relative py-2.5 text-[14px]">
              <span
                aria-hidden
                className={cn(
                  "absolute -start-[1.72rem] top-3 grid size-3.5 place-items-center rounded-full border bg-scene",
                  state === "done" ? "border-accent-ink bg-accent" : state === "active" ? "border-accent-ink" : "border-line",
                )}
              />
              <span className={cn("flex items-center gap-2", state === "todo" ? "text-fg-subtle" : "text-fg")}>
                {label}
                {state === "active" ? <Spinner size="xs" /> : null}
                <span className="sr-only">{state === "done" ? c("(done)", "(tamam)") : state === "active" ? c("(in progress)", "(sürüyor)") : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-[13px] text-fg-muted">
        {c("You’ll come back here after signing in with", "Şununla giriş yaptıktan sonra buraya döneceksiniz:")} <span className="font-mono text-fg">{org.idpHost}</span>.{" "}
        {c("If nothing happens in a few seconds,", "Birkaç saniye içinde bir şey olmazsa")}{" "}
        <a href="#" className="rounded-ui-sm font-medium text-accent-ink hover:underline focus-ring">
          {c("open it yourself", "kendiniz açın")}
        </a>
        .
      </p>
      <div>
        <Button variant="ghost" onClick={onCancel}>
          <Building2 /> {c("Choose a different organisation", "Başka bir kurum seç")}
        </Button>
      </div>
    </section>
  );
}
