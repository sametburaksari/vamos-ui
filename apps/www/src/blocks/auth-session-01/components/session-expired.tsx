"use client";

import * as React from "react";
import { BarChart3, Boxes, Fingerprint, Home, Package, RotateCcw, Search, TimerReset, Undo2, Users } from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  Field,
  Input,
  Kbd,
  Separator,
  Textarea,
  cn,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { PasswordInput } from "../../login-02/components/password-input";
import { KilnMark } from "../../auth-2fa-setup-01/components/kiln-brand";
import { IDLE_MINUTES, account, draftNote, draftOrder, nav, recentOrders } from "./data";

const navIcons: Record<string, React.ReactNode> = {
  home: <Home aria-hidden />,
  orders: <Package aria-hidden />,
  products: <Boxes aria-hidden />,
  customers: <Users aria-hidden />,
  returns: <Undo2 aria-hidden />,
  reports: <BarChart3 aria-hidden />,
};

/** The order desk with an unsaved note, and the re-auth dialog that appears over it when the session times out. */
export function SessionExpired() {
  const { c } = useBlockFormat();
  const [expired, setExpired] = React.useState(true);
  const [note, setNote] = React.useState<string | null>(null);

  const restored = () => {
    setExpired(false);
    toast.success(c(`Welcome back, ${account.name.split(" ")[0]}`, `Tekrar hoş geldiniz, ${account.name.split(" ")[0]}`), {
      description: c(`Your note on order ${draftOrder.number} is still here.`, `${draftOrder.number} siparişindeki notunuz duruyor.`),
    });
  };

  return (
    <>
      <AppBehind note={note} onNote={setNote} onExpire={() => setExpired(true)} />
      <ReauthDialog open={expired} onRestored={restored} />
    </>
  );
}

function AppBehind({ note, onNote, onExpire }: { note: string | null; onNote: (v: string) => void; onExpire: () => void }) {
  const { c, t, money, ago } = useBlockFormat();
  const value = note ?? t(draftNote);
  return (
    <div className="relative z-10 grid min-h-dvh md:grid-cols-[14.5rem_minmax(0,1fr)]">
      <aside className="surface-nav hidden flex-col gap-6 border-e border-nav-line px-3 py-4 md:flex">
        <div className="px-2 text-nav-fg-strong [&_span]:text-nav-fg-strong">
          <KilnMark />
        </div>
        <nav aria-label={c("Main", "Ana menü")} className="grid gap-0.5">
          {nav.map((n) => (
            <a
              key={n.id}
              href="#"
              aria-current={n.id === "orders" ? "page" : undefined}
              className="flex items-center gap-2.5 rounded-ui-sm px-2.5 py-1.5 text-[13.5px] text-nav-fg transition-colors hover:bg-nav-hover hover:text-nav-fg-strong focus-ring aria-[current=page]:bg-nav-active aria-[current=page]:text-nav-fg-strong [&_svg]:size-4"
            >
              {navIcons[n.id]}
              <span className="flex-1">{t(n.label)}</span>
              {n.count ? <span className="font-mono text-[11px] text-nav-fg/60">{n.count}</span> : null}
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
          <div className="md:hidden">
            <KilnMark label={false} />
          </div>
          <div className="relative hidden max-w-[22rem] flex-1 sm:block">
            <Input size="sm" aria-label={c("Search orders", "Siparişlerde ara")} placeholder={c("Search orders, customers…", "Sipariş, müşteri ara…")} leading={<Search aria-hidden className="size-3.5" />} trailing={<Kbd size="sm">/</Kbd>} />
          </div>
          <div className="ms-auto flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onExpire} className="text-fg-muted">
              <TimerReset /> <span className="sr-only sm:not-sr-only">{c("Simulate timeout", "Zaman aşımını dene")}</span>
            </Button>
            <Avatar name={account.name} size="sm" status="online" />
          </div>
        </header>

        <main className="grid gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="orders-h" className="grid content-start gap-4">
            <div className="flex items-baseline justify-between gap-3">
              <h1 id="orders-h" className="font-display text-[length:calc(26px*var(--display-scale))] leading-none text-fg">
                {c("Orders", "Siparişler")}
              </h1>
              <span className="text-[12.5px] text-fg-muted">{c("Today", "Bugün")}</span>
            </div>
            <Card className="overflow-hidden p-0">
              <ul className="divide-y divide-line">
                {recentOrders.map((o) => (
                  <li key={o.id} className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[6rem_minmax(0,1fr)_8rem_7rem]", o.id === draftOrder.id && "bg-accent-soft/40")}>
                    <span className="font-mono text-[12.5px] text-fg-muted">{o.number}</span>
                    <span className="order-first col-span-2 min-w-0 truncate text-[13.5px] font-medium sm:order-none sm:col-span-1">
                      {o.customer}
                      <span className="ms-2 text-[12px] font-normal text-fg-subtle">{ago(o.placedAt)}</span>
                    </span>
                    <Badge tone={o.tone === "accent" ? "accent" : o.tone} size="sm" className="hidden w-fit sm:inline-flex">
                      {t(o.status)}
                    </Badge>
                    <span className="text-end font-mono text-[13px] tabular">{money(o.total)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section aria-labelledby="draft-h" className="grid content-start gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="draft-h" className="text-[14px] font-semibold">
                {c("Order", "Sipariş")} <span className="font-mono">{draftOrder.number}</span>
              </h2>
              <Badge tone="warning" size="sm" dot>
                {c("Unsaved", "Kaydedilmedi")}
              </Badge>
            </div>
            <Card className="grid gap-4 p-4">
              <Field label={c("Internal note", "İç not")} id="draft-note" hint={c("Only your team sees this.", "Bunu yalnızca ekibiniz görür.")}>
                <Textarea rows={5} value={value} onChange={(e) => onNote(e.target.value)} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => onNote(t(draftNote))}>
                  <RotateCcw /> {c("Reset", "Sıfırla")}
                </Button>
                <Button size="sm" variant="primary" onClick={() => toast.success(c("Note saved", "Not kaydedildi"))}>
                  {c("Save note", "Notu kaydet")}
                </Button>
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

function ReauthDialog({ open, onRestored }: { open: boolean; onRestored: () => void }) {
  const { c, t } = useBlockFormat();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<"password" | "passkey" | null>(null);

  React.useEffect(() => {
    if (open) {
      setError(null);
      setBusy(null);
    }
  }, [open]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get("password") ?? "");
    if (!pw) {
      setError(c("Enter your password.", "Parolanızı girin."));
      return;
    }
    setBusy("password");
    window.setTimeout(() => {
      setBusy(null);
      if (pw.length < 8) {
        setError(c("That password is incorrect.", "Parola hatalı."));
        document.getElementById("reauth-pw")?.focus();
      } else onRestored();
    }, 800);
  };

  const passkey = () => {
    setBusy("passkey");
    window.setTimeout(() => {
      setBusy(null);
      onRestored();
    }, 1400);
  };

  return (
    <Dialog open={open}>
      <DialogContent size="sm" mobile="center" dismissible={false} hideClose overlayClassName="backdrop-blur-[3px]">
        <DialogHeader
          title={c("Your session timed out", "Oturumunuzun süresi doldu")}
          description={c(
            `After ${IDLE_MINUTES} minutes without activity we lock the panel. Sign in again to pick up where you left off.`,
            `${IDLE_MINUTES} dakika işlem yapılmayınca paneli kilitliyoruz. Kaldığınız yerden devam etmek için yeniden giriş yapın.`,
          )}
        />
        <DialogBody className="grid grid-cols-[minmax(0,1fr)] gap-4 pb-6">
          <div className="flex items-center gap-3 rounded-ui border border-line bg-surface-2 px-3 py-2.5">
            <Avatar name={account.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium">{account.name}</p>
              <p className="truncate text-[12.5px] text-fg-muted">
                {account.email} · {t(account.title)}
              </p>
            </div>
          </div>

          <Alert tone="info" size="sm" title={c("Nothing is lost", "Hiçbir şey kaybolmadı")}>
            {c(`Your unsaved note on order ${draftOrder.number} is kept in this tab.`, `${draftOrder.number} siparişindeki kaydedilmemiş notunuz bu sekmede duruyor.`)}
          </Alert>

          <form noValidate onSubmit={submit} className="grid gap-3">
            {/* Hidden username so password managers fill the right account. */}
            <input type="email" name="username" autoComplete="username" value={account.email} readOnly hidden />
            <Field label={c("Password", "Parola")} id="reauth-pw" error={error ?? undefined}>
              <PasswordInput
                name="password"
                autoComplete="current-password"
                data-autofocus
                onChange={() => error && setError(null)}
                labels={{ showPassword: c("Show password", "Parolayı göster"), hidePassword: c("Hide password", "Parolayı gizle") }}
              />
            </Field>
            <Button type="submit" variant="primary" block loading={busy === "password"} loadingText={c("Signing in…", "Giriş yapılıyor…")} disabled={busy === "passkey"}>
              {c("Sign in", "Giriş yap")}
            </Button>
          </form>

          <Separator label={c("or", "veya")} className="text-[12px]" />

          <Button variant="secondary" block loading={busy === "passkey"} loadingText={c("Waiting for your device…", "Cihazınız bekleniyor…")} disabled={busy === "password"} onClick={passkey}>
            <Fingerprint /> {c("Use a passkey", "Geçiş anahtarı kullan")}
          </Button>

          <p className="text-center text-[12.5px] text-fg-muted">
            {c(`Not ${account.name.split(" ")[0]}?`, `${account.name.split(" ")[0]} değil misiniz?`)}{" "}
            <a href="#" className="rounded-ui-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
              {c("Sign out and switch account", "Çıkış yapıp hesap değiştir")}
            </a>
          </p>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
