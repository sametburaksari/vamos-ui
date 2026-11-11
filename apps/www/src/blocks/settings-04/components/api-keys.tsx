"use client";

import * as React from "react";
import { Check, Copy, KeyRound, MoreHorizontal, Plus, RotateCw, ShieldAlert, SlidersHorizontal, Trash2 } from "lucide-react";
import {
  Alert, Avatar, Badge, Button, Card, CardHeader, Checkbox, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Field, IconButton, Input, RadioGroup, Select,
  Sparkline, Tabs, TabsList, TabsTrigger, cn, toast, useConfirm,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { me, person } from "../../_shared/people";
import { day, NOW } from "../../_shared/time";
import { apiKeys, apiScopes, expiryOptions, fakeSecret, keyTraffic, levelLabels, resources, type ApiKey } from "./developer-data";

type Env = "all" | "live" | "test";
interface KeyRow extends ApiKey {
  fresh?: boolean;
}
const envOf = (k: ApiKey) => (k.masked.startsWith("vk_test") ? "test" : "live");

/** API keys: environment filter, traffic per key, create (secret shown once), edit scopes, roll and revoke. */
export function ApiKeys() {
  const { c, f, t, ago } = useBlockFormat();
  const confirm = useConfirm();
  const [keys, setKeys] = React.useState<KeyRow[]>(apiKeys);
  const [env, setEnv] = React.useState<Env>("all");
  const [showRevoked, setShowRevoked] = React.useState(false);
  const [editor, setEditor] = React.useState<{ open: boolean; key?: KeyRow }>({ open: false });
  const [secret, setSecret] = React.useState<{ name: string; value: string } | null>(null);

  const visible = keys.filter((k) => (env === "all" || envOf(k) === env) && (showRevoked || !k.revoked));
  const revokedCount = keys.filter((k) => k.revoked).length;
  const scopeLabel = (s: string) => t(apiScopes.find((x) => x.key === s)?.label ?? { en: s, tr: s });

  const revoke = async (k: KeyRow) => {
    const ok = await confirm({
      tone: "danger",
      title: c(`Revoke “${k.name}”?`, `“${k.name}” iptal edilsin mi?`),
      description: c(
        "Requests with this key start failing with 401 right away. Anything still using it — a sync job, a connector — stops.",
        "Bu anahtarla gelen istekler hemen 401 ile reddedilir. Onu kullanan her şey — senkron işi, bağlayıcı — durur.",
      ),
      confirmLabel: c("Revoke key", "Anahtarı iptal et"),
      requireText: k.name,
    });
    if (!ok) return;
    setKeys((all) => all.map((x) => (x.id === k.id ? { ...x, revoked: true, fresh: false } : x)));
    toast(c(`${k.name} revoked`, `${k.name} iptal edildi`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setKeys((all) => all.map((x) => (x.id === k.id ? { ...x, revoked: false } : x))) },
    });
  };

  const roll = async (k: KeyRow) => {
    const ok = await confirm({
      title: c(`Roll “${k.name}”?`, `“${k.name}” yenilensin mi?`),
      description: c("You get a new secret now. The old one keeps working for 24 hours so you can deploy the change.", "Şimdi yeni bir gizli anahtar alırsınız. Değişikliği yayına almanız için eskisi 24 saat çalışmaya devam eder."),
      confirmLabel: c("Roll key", "Anahtarı yenile"),
    });
    if (!ok) return;
    const value = fakeSecret(envOf(k) === "test" ? "vk_test_" : "vk_live_", k.id.length + keys.length + 7);
    setKeys((all) => all.map((x) => (x.id === k.id ? { ...x, masked: `${value.slice(0, 8)}…${value.slice(-4)}`, fresh: true } : x)));
    setSecret({ name: k.name, value });
  };

  return (
    <Card className="min-w-0">
      <CardHeader
        titleAs="h2"
        title={c("API keys", "API anahtarları")}
        description={c("Keys act as the workspace, not as a person. Give each integration its own key and only the scopes it needs.", "Anahtarlar bir kişi olarak değil, çalışma alanı olarak işlem yapar. Her entegrasyona ayrı anahtar ve yalnızca gereken izinleri verin.")}
        action={
          <Button variant="primary" onClick={() => setEditor({ open: true })}>
            <Plus /> {c("Create key", "Anahtar oluştur")}
          </Button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-(--card-p) pb-3">
        <Tabs value={env} onValueChange={(v) => setEnv(v as Env)}>
          <TabsList variant="pill" size="sm" aria-label={c("Environment", "Ortam")}>
            <TabsTrigger value="all">{c("All", "Tümü")}</TabsTrigger>
            <TabsTrigger value="live">{c("Live", "Canlı")}</TabsTrigger>
            <TabsTrigger value="test">{c("Test", "Test")}</TabsTrigger>
          </TabsList>
        </Tabs>
        {revokedCount ? (
          <Checkbox size="sm" label={c(`Show revoked (${revokedCount})`, `İptal edilenleri göster (${revokedCount})`)} checked={showRevoked} onCheckedChange={(v) => setShowRevoked(v === true)} />
        ) : null}
      </div>

      <Stagger asChild step={50}>
        <ul className="border-t border-line" aria-label={c("API keys", "API anahtarları")}>
          {visible.map((k) => {
            const owner = person(k.createdBy);
            const traffic = keyTraffic[k.id] ?? Array(14).fill(0);
            const total = traffic.reduce((s, v) => s + v, 0);
            const expiresIn = k.expires ? Math.round((Date.parse(k.expires) - Date.parse(NOW)) / 86_400_000) : null;
            return (
              <li
                key={k.id}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-line px-(--card-p) py-3.5 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_8rem_auto]",
                  k.revoked && "opacity-60",
                  k.fresh && "bg-accent-soft",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[13.5px] font-medium text-fg">{k.name}</span>
                    <Badge tone={envOf(k) === "live" ? "outline" : "neutral"} shape="square">
                      {envOf(k) === "live" ? c("Live", "Canlı") : c("Test", "Test")}
                    </Badge>
                    {k.revoked ? <Badge tone="danger">{c("Revoked", "İptal")}</Badge> : null}
                    {expiresIn !== null && !k.revoked ? <Badge tone={expiresIn < 45 ? "warning" : "neutral"}>{c(`Expires in ${expiresIn} days`, `${expiresIn} gün sonra doluyor`)}</Badge> : null}
                    {k.fresh ? <Badge tone="accent">{c("New", "Yeni")}</Badge> : null}
                  </div>
                  <p className="mt-1 flex items-center gap-1 font-mono text-[12px] text-fg-muted">
                    {k.masked}
                  </p>
                  <p className="mt-1.5 flex flex-wrap gap-1">
                    {k.scopes.map((s) => (
                      <Badge key={s} tone="neutral" shape="square" className="font-mono" title={scopeLabel(s)}>
                        {s}
                      </Badge>
                    ))}
                  </p>
                </div>
                <div className="col-start-1 row-start-2 flex min-w-0 items-center gap-2 text-xs text-fg-muted md:col-start-2 md:row-start-1">
                  <Avatar name={owner.name} size="xs" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate">{c(`${owner.name.split(" ")[0]} · ${f.date(k.created, "medium")}`, `${owner.name.split(" ")[0]} · ${f.date(k.created, "medium")}`)}</span>
                    <span className="block truncate text-fg-subtle">{k.lastUsed ? c(`Used ${ago(k.lastUsed)}`, `Son kullanım ${ago(k.lastUsed)}`) : c("Never used", "Hiç kullanılmadı")}</span>
                  </span>
                </div>
                <div className="hidden min-w-0 md:block">
                  <Sparkline values={traffic} variant="bars" width="100%" height={28} color={k.revoked ? "fg-subtle" : k.fresh ? "accent-ink" : "fg-muted"} aria-label={c(`${f.number(total)} requests in 14 days`, `14 günde ${f.number(total)} istek`)} />
                  <span className="mt-0.5 block font-mono text-[11px] text-fg-subtle tabular">{c(`${f.compact(total)} / 14 d`, `${f.compact(total)} / 14 g`)}</span>
                </div>
                <div className="row-span-2 self-start md:row-span-1 md:self-center">
                  {k.revoked ? null : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton label={c(`Actions for ${k.name}`, `${k.name} işlemleri`)} variant="ghost" size="sm">
                          <MoreHorizontal />
                        </IconButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem icon={<SlidersHorizontal />} onSelect={() => setEditor({ open: true, key: k })}>
                          {c("Edit name & scopes", "Ad ve izinleri düzenle")}
                        </DropdownMenuItem>
                        <DropdownMenuItem icon={<RotateCw />} onSelect={() => roll(k)}>
                          {c("Roll secret", "Gizli anahtarı yenile")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem icon={<Trash2 />} tone="danger" onSelect={() => revoke(k)}>
                          {c("Revoke", "İptal et")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </li>
            );
          })}
          {visible.length === 0 ? (
            <li className="px-(--card-p) py-10 text-center text-[13px] text-fg-muted">{c("No keys in this environment yet.", "Bu ortamda henüz anahtar yok.")}</li>
          ) : null}
        </ul>
      </Stagger>

      <KeyEditor
        open={editor.open}
        edit={editor.key}
        onOpenChange={(open) => setEditor((e) => ({ ...e, open }))}
        onSave={(draft) => {
          if (editor.key) {
            setKeys((all) => all.map((x) => (x.id === editor.key!.id ? { ...x, name: draft.name, scopes: draft.scopes } : x)));
            toast.success(c("Key updated", "Anahtar güncellendi"), { description: c("New scopes apply to the next request.", "Yeni izinler sonraki istekte geçerli olur.") });
          } else {
            const value = fakeSecret(draft.env === "test" ? "vk_test_" : "vk_live_", keys.length * 13 + draft.name.length);
            const id = `key-${keys.length + 10}`;
            setKeys((all) => [
              { id, name: draft.name, masked: `${value.slice(0, 8)}…${value.slice(-4)}`, scopes: draft.scopes, createdBy: me.id, created: day(0), expires: draft.expiry === "never" ? undefined : day(Number(draft.expiry)), fresh: true },
              ...all.map((x) => ({ ...x, fresh: false })),
            ]);
            setSecret({ name: draft.name, value });
          }
          setEditor({ open: false });
        }}
      />
      <SecretDialog secret={secret} onClose={() => setSecret(null)} />
    </Card>
  );
}

interface Draft {
  name: string;
  env: "live" | "test";
  scopes: string[];
  expiry: string;
}

function KeyEditor({ open, edit, onOpenChange, onSave }: { open: boolean; edit?: KeyRow; onOpenChange: (open: boolean) => void; onSave: (d: Draft) => void }) {
  const { c, t } = useBlockFormat();
  const [d, setD] = React.useState<Draft>({ name: "", env: "live", scopes: [], expiry: "90" });
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setTried(false);
    setD(edit ? { name: edit.name, env: envOf(edit), scopes: edit.scopes, expiry: "never" } : { name: "", env: "live", scopes: ["orders:read"], expiry: "90" });
  }, [open, edit]);
  const has = (s: string) => d.scopes.includes(s);
  const toggle = (s: string, on: boolean) => setD((x) => ({ ...x, scopes: on ? [...x.scopes, s] : x.scopes.filter((y) => y !== s) }));
  const nameError = d.name.trim().length < 3 ? c("Name it after what uses it, e.g. “Warehouse sync”.", "Kullanan sisteme göre adlandırın, ör. “Depo senkronu”.") : undefined;
  const scopeError = d.scopes.length === 0 ? c("Pick at least one scope.", "En az bir izin seçin.") : undefined;
  const writes = d.scopes.filter((s) => !s.endsWith(":read")).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" mobile="fullscreen">
        <DialogHeader
          icon={<KeyRound />}
          title={edit ? c(`Edit ${edit.name}`, `${edit.name} düzenle`) : c("Create API key", "API anahtarı oluştur")}
          description={edit ? c("The secret stays the same.", "Gizli anahtar değişmez.") : c("You'll see the secret once, right after you create it.", "Gizli anahtarı yalnızca bir kez, oluşturduktan hemen sonra görürsünüz.")}
        />
        <form
          id="key-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!nameError && !scopeError) onSave({ ...d, name: d.name.trim() });
          }}
        >
          <DialogBody className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Field label={c("Name", "Ad")} error={tried ? nameError : undefined} required>
                <Input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder={c("Warehouse sync", "Depo senkronu")} data-autofocus />
              </Field>
              {edit ? null : (
                <Field label={c("Environment", "Ortam")}>
                  <RadioGroup
                    variant="segmented"
                    value={d.env}
                    onValueChange={(v) => setD({ ...d, env: v as Draft["env"] })}
                    items={[
                      { value: "live", label: c("Live", "Canlı") },
                      { value: "test", label: c("Test", "Test") },
                    ]}
                  />
                </Field>
              )}
            </div>

            <fieldset className="min-w-0">
              <legend className="text-[13px] font-medium text-fg">{c("Scopes", "İzinler")}</legend>
              <div className="mt-2 overflow-hidden rounded-ui border border-line">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-selected text-xs text-fg-muted">
                      <th scope="col" className="px-3 py-2 text-start font-medium">
                        {c("Resource", "Kaynak")}
                      </th>
                      {(["read", "write", "manage"] as const).map((l) => (
                        <th key={l} scope="col" className="w-20 px-2 py-2 text-center font-medium">
                          {t(levelLabels[l])}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((r) => (
                      <tr key={r.key} className="border-t border-line">
                        <th scope="row" className="px-3 py-2 text-start font-normal text-fg">
                          {t(r.label)}
                        </th>
                        {(["read", "write", "manage"] as const).map((l) => {
                          const s = `${r.key}:${l}`;
                          return (
                            <td key={l} className="px-2 py-2 text-center">
                              {r.levels.includes(l) ? (
                                <Checkbox className="justify-center" aria-label={`${t(r.label)}: ${t(levelLabels[l])}`} checked={has(s)} onCheckedChange={(v) => toggle(s, v === true)} />
                              ) : (
                                <span aria-hidden className="text-fg-subtle">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tried && scopeError ? <p className="mt-2 text-xs text-danger">{scopeError}</p> : null}
              {writes > 0 && d.env === "live" ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                  <ShieldAlert aria-hidden className="size-3.5" />
                  {c(`This key can change live data (${writes} write ${writes === 1 ? "scope" : "scopes"}).`, `Bu anahtar canlı verileri değiştirebilir (${writes} yazma izni).`)}
                </p>
              ) : null}
            </fieldset>

            {edit ? null : (
              <Field label={c("Expires", "Geçerlilik")} hint={c("We email the creator 7 days before a key expires.", "Anahtarın süresi dolmadan 7 gün önce oluşturana e-posta gönderilir.")}>
                <Select value={d.expiry} onValueChange={(v) => v && setD({ ...d, expiry: v })} items={expiryOptions.map((o) => ({ value: o.value, label: t(o.label) }))} />
              </Field>
            )}
          </DialogBody>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c("Cancel", "Vazgeç")}
          </Button>
          <Button variant="primary" type="submit" form="key-form">
            {edit ? c("Save changes", "Değişiklikleri kaydet") : c("Create key", "Anahtar oluştur")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The one time the full secret is visible. Closing needs the "stored it" tick. */
function SecretDialog({ secret, onClose }: { secret: { name: string; value: string } | null; onClose: () => void }) {
  const { c } = useBlockFormat();
  const [stored, setStored] = React.useState(false);
  const [shown, setShown] = React.useState(secret);
  React.useEffect(() => {
    if (secret) {
      setShown(secret);
      setStored(false);
    }
  }, [secret]);
  return (
    <Dialog open={!!secret} onOpenChange={(o) => !o && stored && onClose()}>
      <DialogContent size="md" dismissible={false} hideClose>
        <DialogHeader title={c(`Secret for ${shown?.name ?? ""}`, `${shown?.name ?? ""} gizli anahtarı`)} description={c("Copy it into your secret manager now. We only store a hash, so it can't be shown again.", "Şimdi gizli anahtar yöneticinize kopyalayın. Yalnızca özetini saklıyoruz; tekrar gösterilemez.")} />
        <DialogBody className="grid gap-4">
          <div className="flex min-w-0 items-center gap-2 rounded-ui border border-line surface-2 py-1.5 ps-3 pe-1.5">
            <code className="min-w-0 flex-1 font-mono text-[12.5px] break-all text-fg">{shown?.value}</code>
            {shown ? <CopyButton text={shown.value} label={c("Copy", "Kopyala")} done={c("Copied", "Kopyalandı")} onCopied={() => setStored(true)} /> : null}
          </div>
          <Alert tone="warning" variant="soft">
            {c("Anyone with this secret can call the API as Kiln & Linen. Never paste it into a browser app or a public repository.", "Bu anahtara sahip herkes API'yi Kiln & Linen olarak çağırabilir. Tarayıcı uygulamasına veya herkese açık depoya asla yapıştırmayın.")}
          </Alert>
          <Checkbox label={c("I've stored the secret somewhere safe", "Gizli anahtarı güvenli bir yere kaydettim")} checked={stored} onCheckedChange={(v) => setStored(v === true)} />
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" disabled={!stored} onClick={onClose}>
            {c("Done", "Tamam")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Copy with a visible and announced confirmation. */
export function CopyButton({ text, label, done, onCopied }: { text: string; label: string; done: string; onCopied?: () => void }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard?.writeText(text);
        } catch {
          /* clipboard blocked: the text stays selectable */
        }
        setCopied(true);
        onCopied?.();
      }}
    >
      {copied ? <Check /> : <Copy />}
      <span aria-live="polite">{copied ? done : label}</span>
    </Button>
  );
}
