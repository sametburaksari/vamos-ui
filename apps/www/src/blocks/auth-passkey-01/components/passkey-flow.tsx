"use client";

import * as React from "react";
import { ArrowRight, Fingerprint, KeyRound, Laptop, Pencil, Plus, Smartphone, Trash2, Usb } from "lucide-react";
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  IconButton,
  Input,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { account, initialPasskeys, kindLabels, thisDevice, type Passkey } from "./data";
import { PasskeySensor, type Ceremony } from "./passkey-sensor";
import { Eyebrow } from "../../auth-2fa-setup-01/components/kiln-brand";

type View = "signin" | "manage";

/** Runs a fake WebAuthn ceremony: waiting for the authenticator, then server verification. */
function useCeremony(onDone: () => void) {
  const [state, setState] = React.useState<Ceremony>("idle");
  const timers = React.useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  React.useEffect(() => clear, []);
  const start = () => {
    clear();
    setState("waiting");
    timers.current.push(
      window.setTimeout(() => setState("verifying"), 1500),
      window.setTimeout(() => {
        setState("done");
        onDone();
      }, 2300),
    );
  };
  const cancel = () => {
    clear();
    setState("cancelled");
  };
  const reset = () => {
    clear();
    setState("idle");
  };
  return { state, start, cancel, reset };
}

/** Passkey sign-in, then the account's passkey list with add / rename / remove. */
export function PasskeyFlow() {
  const { c } = useBlockFormat();
  const [view, setView] = React.useState<View>("signin");

  return (
    <div className="grid gap-6">
      <div role="group" aria-label={c("Demo view", "Demo görünümü")} className="mx-auto inline-flex rounded-full border border-line bg-surface-2 p-0.5 text-[12.5px]">
        {(["signin", "manage"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className="rounded-full px-3.5 py-1.5 font-medium text-fg-muted transition-colors hover:text-fg focus-ring aria-pressed:bg-surface aria-pressed:text-fg aria-pressed:shadow-sm"
          >
            {v === "signin" ? c("Sign in", "Giriş") : c("Manage passkeys", "Anahtarları yönet")}
          </button>
        ))}
      </div>
      {view === "signin" ? <SignIn onSignedIn={() => setView("manage")} /> : <Manage />}
    </div>
  );
}

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const { c } = useBlockFormat();
  const ceremony = useCeremony(() => window.setTimeout(onSignedIn, 1100));
  const { state } = ceremony;
  const busy = state === "waiting" || state === "verifying";

  const status =
    state === "waiting"
      ? c("Follow the prompt from your device — touch the sensor or unlock with your face.", "Cihazınızın isteğini izleyin — sensöre dokunun veya yüzünüzle kilidi açın.")
      : state === "verifying"
        ? c("Checking your passkey…", "Geçiş anahtarınız kontrol ediliyor…")
        : state === "done"
          ? c(`Signed in as ${account.name}. Opening your passkeys…`, `${account.name} olarak giriş yapıldı. Anahtarlarınız açılıyor…`)
          : state === "cancelled"
            ? ""
            : c("No password to type. Your device confirms it’s you.", "Yazacak parola yok. Cihazınız sizi doğrular.");

  return (
    <section aria-labelledby="pk-signin" className="ui-rise mx-auto grid w-full max-w-[25rem] justify-items-center gap-6 text-center">
      <div className="grid w-full place-items-center overflow-hidden py-2">
        <PasskeySensor state={state} />
      </div>
      <div className="grid gap-2">
        <h1 id="pk-signin" className="font-display text-[length:calc(32px*var(--display-scale))] leading-[1.1] text-fg text-balance">
          {state === "done" ? c("Welcome back", "Tekrar hoş geldiniz") : c("Sign in with a passkey", "Geçiş anahtarıyla giriş")}
        </h1>
        <p aria-live="polite" className="min-h-[2.75em] text-[14px] leading-relaxed text-fg-muted text-pretty">
          {status}
        </p>
      </div>

      {state === "cancelled" ? (
        <Alert tone="warning" size="sm" className="w-full text-start" live="polite" title={c("The request was cancelled", "İstek iptal edildi")}>
          {c("Nothing was sent. Try again, or sign in another way.", "Hiçbir şey gönderilmedi. Tekrar deneyin ya da başka bir yolla giriş yapın.")}
        </Alert>
      ) : null}

      <form
        className="grid w-full gap-3 text-start"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy) ceremony.start();
        }}
      >
        <Field label={c("Email", "E-posta")} id="pk-email">
          <Input name="email" type="email" autoComplete="username webauthn" defaultValue={account.email} readOnly={busy} />
        </Field>
        {busy ? (
          <Button type="button" variant="secondary" block onClick={ceremony.cancel}>
            {c("Cancel", "İptal")}
          </Button>
        ) : (
          <Button type="submit" variant="primary" block disabled={state === "done"}>
            <Fingerprint /> {state === "cancelled" ? c("Try again", "Tekrar dene") : c("Sign in with a passkey", "Geçiş anahtarıyla giriş yap")}
          </Button>
        )}
      </form>

      <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[13px]">
        <a href="#" className="rounded-ui-sm text-fg-muted hover:text-fg focus-ring">
          {c("Use my password", "Parolamı kullan")}
        </a>
        <a href="#" className="rounded-ui-sm text-fg-muted hover:text-fg focus-ring">
          {c("Sign in on another phone", "Başka bir telefonla giriş")}
        </a>
      </div>
    </section>
  );
}

const kindIcon = { synced: <Smartphone aria-hidden />, device: <Laptop aria-hidden />, "security-key": <Usb aria-hidden /> } as const;

function Manage() {
  const { c, t, f, ago } = useBlockFormat();
  const [keys, setKeys] = React.useState<Passkey[]>(initialPasskeys);
  const [fresh, setFresh] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState<Passkey | null>(null);
  const [adding, setAdding] = React.useState(false);
  const hasThisDevice = keys.some((k) => k.name === thisDevice);

  const rename = (id: string, name: string) => {
    const clean = name.trim();
    setEditing(null);
    if (!clean) return;
    setKeys((ks) => ks.map((k) => (k.id === id ? { ...k, name: clean } : k)));
    toast.success(c("Passkey renamed", "Anahtar yeniden adlandırıldı"));
  };

  const remove = (key: Passkey) => {
    const index = keys.findIndex((k) => k.id === key.id);
    setKeys((ks) => ks.filter((k) => k.id !== key.id));
    toast(c(`“${key.name}” removed`, `“${key.name}” kaldırıldı`), {
      description: c("It can no longer sign in to Kiln & Linen.", "Artık Kiln & Linen’e giriş yapamaz."),
      action: {
        label: c("Undo", "Geri al"),
        onClick: () => setKeys((ks) => [...ks.slice(0, index), key, ...ks.slice(index)]),
      },
    });
  };

  const added = (name: string) => {
    const id = `pk-${Date.now()}`;
    setKeys((ks) => [{ id, name, kind: "device", created: "2026-11-18", lastUsed: undefined }, ...ks]);
    setFresh(id);
    setAdding(false);
    toast.success(c("Passkey added", "Geçiş anahtarı eklendi"), { description: c(`Next time, sign in on ${name} with a touch.`, `Bir dahaki sefere ${name} üzerinde dokunarak giriş yapın.`) });
  };

  return (
    <section aria-labelledby="pk-manage" className="ui-rise mx-auto grid w-full max-w-[44rem] gap-5">
      <div className="flex items-center gap-3 rounded-ui border border-line bg-surface-2 px-4 py-3">
        <Avatar name={account.name} size="sm" />
        <p className="min-w-0 flex-1 text-[13px] text-fg-muted">
          {c("Signed in as", "Giriş yapan:")} <span className="font-medium text-fg">{account.name}</span>{" "}
          <span className="hidden sm:inline">· {c("with the “Work laptop” passkey", "“Work laptop” anahtarıyla")}</span>
        </p>
        <Badge tone="success" dot>
          {c("Verified", "Doğrulandı")}
        </Badge>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1.5">
          <Eyebrow>{c("Security", "Güvenlik")}</Eyebrow>
          <h1 id="pk-manage" className="font-display text-[length:calc(30px*var(--display-scale))] leading-[1.1] text-fg">
            {c("Passkeys", "Geçiş anahtarları")}
          </h1>
          <p className="max-w-[32rem] text-[13.5px] text-fg-muted text-pretty">
            {c("Each passkey lives on a device you own. Remove one if a device is lost or sold.", "Her anahtar size ait bir cihazda durur. Cihaz kaybolursa veya satılırsa anahtarı kaldırın.")}
          </p>
        </div>
        <Button variant={hasThisDevice ? "secondary" : "primary"} onClick={() => setAdding(true)}>
          <Plus /> {c("Add a passkey", "Anahtar ekle")}
        </Button>
      </div>

      {!hasThisDevice ? (
        <div className="grid gap-4 rounded-ui border border-dashed border-line p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent-ink [&_svg]:size-5">
            <KeyRound aria-hidden />
          </span>
          <div>
            <p className="text-[13.5px] font-medium">{c(`This browser (${thisDevice}) has no passkey yet`, `Bu tarayıcıda (${thisDevice}) henüz anahtar yok`)}</p>
            <p className="text-[12.5px] text-fg-muted">{c("Add one and skip the password next time you sign in here.", "Bir tane ekleyin, burada bir dahaki girişte parolaya gerek kalmasın.")}</p>
          </div>
          <Button size="sm" variant="soft" onClick={() => setAdding(true)}>
            {c("Add for this device", "Bu cihaza ekle")} <ArrowRight />
          </Button>
        </div>
      ) : null}

      {keys.length === 0 ? (
        <p className="rounded-ui border border-line p-6 text-center text-[13.5px] text-fg-muted">
          {c("No passkeys. You’ll sign in with your password and a code.", "Anahtar yok. Parolanız ve bir kodla giriş yapacaksınız.")}
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-ui border border-line bg-surface" aria-label={c("Your passkeys", "Anahtarlarınız")}>
          {keys.map((k) => (
            <li key={k.id} className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${fresh === k.id ? "bg-accent-soft/50 ui-rise" : ""}`}>
              <span className="grid size-9 shrink-0 place-items-center rounded-ui-sm border border-line bg-surface-2 text-fg-muted [&_svg]:size-4">{kindIcon[k.kind]}</span>
              <div className="min-w-0 flex-1">
                {editing === k.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      rename(k.id, String(new FormData(e.currentTarget).get("name") ?? ""));
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      name="name"
                      size="sm"
                      autoFocus
                      defaultValue={k.name}
                      aria-label={c("Passkey name", "Anahtar adı")}
                      onKeyDown={(e) => e.key === "Escape" && setEditing(null)}
                      className="max-w-[16rem]"
                    />
                    <Button size="sm" type="submit" variant="secondary">
                      {c("Save", "Kaydet")}
                    </Button>
                  </form>
                ) : (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-medium">
                    <span className="truncate">{k.name}</span>
                    {fresh === k.id ? <Badge tone="accent">{c("New", "Yeni")}</Badge> : null}
                  </p>
                )}
                <p className="mt-0.5 text-[12.5px] text-fg-muted">
                  {t(kindLabels[k.kind])} · {c("added", "eklendi")} {f.date(k.created, "medium")}
                  <span className="hidden sm:inline">
                    {" · "}
                    {k.lastUsed ? `${c("last used", "son kullanım")} ${ago(k.lastUsed)}${k.lastCity ? `, ${k.lastCity}` : ""}` : c("never used", "hiç kullanılmadı")}
                  </span>
                </p>
              </div>
              {editing === k.id ? null : (
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconButton size="sm" variant="ghost" label={c(`Rename ${k.name}`, `${k.name} adını değiştir`)} onClick={() => setEditing(k.id)}>
                    <Pencil />
                  </IconButton>
                  <IconButton size="sm" variant="ghost" label={c(`Remove ${k.name}`, `${k.name} anahtarını kaldır`)} onClick={() => setRemoving(k)} className="hover:text-danger">
                    <Trash2 />
                  </IconButton>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <AddPasskeyDialog open={adding} onOpenChange={setAdding} onAdded={added} />

      <AlertDialog open={removing !== null} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent tone="danger">
          <AlertDialogHeader
            title={c(`Remove “${removing?.name ?? ""}”?`, `“${removing?.name ?? ""}” kaldırılsın mı?`)}
            description={
              keys.length === 1
                ? c("This is your last passkey. You’ll sign in with your password and a code until you add another.", "Bu son anahtarınız. Yenisini ekleyene kadar parola ve kodla giriş yapacaksınız.")
                : c("That device won’t be able to sign in with it any more. The passkey stays on the device until someone deletes it there.", "O cihaz artık bu anahtarla giriş yapamaz. Anahtar, orada silinene kadar cihazda kalır.")
            }
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{c("Keep it", "Kalsın")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => removing && remove(removing)}>{c("Remove passkey", "Anahtarı kaldır")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function AddPasskeyDialog({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (o: boolean) => void; onAdded: (name: string) => void }) {
  const { c } = useBlockFormat();
  const [name, setName] = React.useState(thisDevice);
  const nameRef = React.useRef(name);
  nameRef.current = name;
  const ceremony = useCeremony(() => window.setTimeout(() => onAdded(nameRef.current.trim() || thisDevice), 600));
  const busy = ceremony.state === "waiting" || ceremony.state === "verifying" || ceremony.state === "done";

  React.useEffect(() => {
    if (open) {
      ceremony.reset();
      setName(thisDevice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => (busy && !o ? undefined : onOpenChange(o))}>
      <DialogContent size="sm" dismissible={!busy}>
        <DialogHeader
          title={c("Add a passkey", "Geçiş anahtarı ekle")}
          description={c("Your device will ask you to confirm with your fingerprint, face or screen lock.", "Cihazınız parmak iziniz, yüzünüz veya ekran kilidiyle onay isteyecek.")}
        />
        <DialogBody className="grid gap-5">
          <div className="grid place-items-center overflow-hidden py-1">
            <PasskeySensor state={ceremony.state} size="md" />
          </div>
          <p aria-live="polite" className="-mt-2 text-center text-[13px] text-fg-muted">
            {ceremony.state === "waiting"
              ? c("Waiting for your device…", "Cihazınız bekleniyor…")
              : ceremony.state === "verifying"
                ? c("Saving the passkey…", "Anahtar kaydediliyor…")
                : ceremony.state === "done"
                  ? c("Done.", "Tamam.")
                  : ceremony.state === "cancelled"
                    ? c("Cancelled on the device. Nothing was saved.", "Cihazda iptal edildi. Hiçbir şey kaydedilmedi.")
                    : null}
          </p>
          <Field label={c("Name", "Ad")} id="pk-name" hint={c("So you can tell your passkeys apart later.", "Anahtarlarınızı sonra ayırt edebilmeniz için.")}>
            <Input value={name} onChange={(e) => setName(e.target.value)} readOnly={busy} maxLength={40} />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={() => onOpenChange(false)}>
            {c("Cancel", "İptal")}
          </Button>
          <Button variant="primary" loading={ceremony.state === "waiting" || ceremony.state === "verifying"} disabled={ceremony.state === "done"} onClick={ceremony.start}>
            <Fingerprint /> {c("Create passkey", "Anahtarı oluştur")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
