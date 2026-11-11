"use client";

import * as React from "react";
import { BellRing, Plug, Search, Settings2 } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle,
  Input,
  PageHeader,
  RadioGroup,
  Select,
  cn,
  toast,
} from "@vamos-ui/react";
import { CountUp, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { NOW } from "../../_shared/time";
import { ConnectDialog } from "./connect-dialog";
import { integrationCategoryLabels, marketIntegrations, statusLabels, type Category, type MarketIntegration } from "./data";
import { IntegrationMark } from "./integration-mark";
import { IntegrationSheet } from "./integration-sheet";

type View = "all" | "in-use" | "available";
const categories = Object.keys(integrationCategoryLabels) as Category[];
const inUse = (i: MarketIntegration) => i.status === "connected" || i.status === "error";

/** Settings → Apps & modules: connected integrations with health, and a directory to connect more. */
export function IntegrationsMarketplace() {
  const { c, t, f, ago } = useBlockFormat();
  const [items, setItems] = React.useState(marketIntegrations);
  const [category, setCategory] = React.useState<Category | "all">("all");
  const [view, setView] = React.useState<View>("all");
  const [q, setQ] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [connect, setConnect] = React.useState<{ id: string; mode: "connect" | "reconnect" } | null>(null);
  const [disconnecting, setDisconnecting] = React.useState<string | null>(null);

  const byId = (id: string | null) => items.find((i) => i.id === id) ?? null;
  const patch = (id: string, p: Partial<MarketIntegration>) => setItems((all) => all.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const query = q.trim().toLocaleLowerCase();
  const visible = items.filter(
    (i) =>
      (category === "all" || i.category === category) &&
      (!query || i.name.toLocaleLowerCase().includes(query) || t(i.description).toLocaleLowerCase().includes(query)) &&
      (view === "all" || (view === "in-use" ? inUse(i) : !inUse(i))),
  );
  const used = visible.filter(inUse);
  const directory = visible.filter((i) => !inUse(i));
  const broken = items.filter((i) => i.status === "error");
  const connectedCount = items.filter(inUse).length;
  const recordsToday = items.reduce((n, i) => n + (i.recordsToday ?? 0), 0);
  const latest = items.filter((i) => inUse(i) && i.lastSync).sort((a, b) => b.lastSync!.localeCompare(a.lastSync!))[0];

  const onConnected = (id: string, scopes: string[]) => {
    const i = byId(id)!;
    const wasReconnect = connect?.mode === "reconnect";
    patch(id, {
      status: "connected",
      lastSync: NOW,
      error: undefined,
      connectedBy: i.connectedBy ?? "p-defne",
      scopes: wasReconnect ? i.scopes : i.scopes.filter((s) => scopes.includes(s.key)),
      log: [{ id: `l-${Date.now()}`, at: NOW, result: "ok", message: wasReconnect ? { en: "Reconnected, catching up on queued records", tr: "Yeniden bağlandı, bekleyen kayıtlar işleniyor" } : { en: "Connected, first sync started", tr: "Bağlandı, ilk senkron başladı" } }, ...i.log],
    });
    setConnect(null);
    toast.success(wasReconnect ? c(`${i.name} is syncing again`, `${i.name} yeniden senkronlanıyor`) : c(`${i.name} connected`, `${i.name} bağlandı`), {
      description: wasReconnect ? c("Queued records go out in the next few minutes.", "Bekleyen kayıtlar birkaç dakika içinde gönderilir.") : c("Choose what to sync — defaults are on.", "Neyin senkronlanacağını seçin — varsayılanlar açık."),
      action: wasReconnect ? undefined : { label: c("Configure", "Yapılandır"), onClick: () => setOpenId(id) },
    });
  };

  const disconnect = (id: string) => {
    const before = byId(id)!;
    patch(id, { status: "available", lastSync: undefined, recordsToday: undefined, error: undefined });
    setOpenId(null);
    toast(c(`${before.name} disconnected`, `${before.name} bağlantısı kesildi`), {
      description: c("Access was revoked. Synced records stay in Kiln & Linen.", "Erişim kaldırıldı. Senkronlanan kayıtlar Kiln & Linen'de kalır."),
      action: { label: c("Undo", "Geri al"), onClick: () => patch(id, before) },
    });
  };

  const syncNow = (id: string) =>
    new Promise<void>((resolve) => {
      window.setTimeout(() => {
        const i = byId(id)!;
        const n = 3 + (i.name.length % 7);
        patch(id, { lastSync: NOW, recordsToday: (i.recordsToday ?? 0) + n, log: [{ id: `l-${Date.now()}`, at: NOW, result: "ok", records: n, message: { en: `${n} records synced (manual run)`, tr: `${n} kayıt senkronlandı (elle)` } }, ...i.log] });
        toast.success(c(`${i.name} synced`, `${i.name} senkronlandı`), { description: c(`${n} records were up to date or updated.`, `${n} kayıt güncel ya da güncellendi.`) });
        resolve();
      }, 1100);
    });

  const counts = (cat: Category | "all") => items.filter((i) => cat === "all" || i.category === cat).length;

  return (
    <div className="mx-auto max-w-[1240px]">
      <PageHeader
        eyebrow={c("Settings · Apps & modules", "Ayarlar · Uygulamalar ve modüller")}
        title={c("Integrations", "Entegrasyonlar")}
        description={c("Connect the tools around your store. Each one syncs on its own schedule and can be paused or revoked at any time.", "Mağazanızın çevresindeki araçları bağlayın. Her biri kendi takviminde senkronlanır; dilediğiniz an durdurabilir veya kaldırabilirsiniz.")}
        actions={
          <Button onClick={() => toast(c("Request sent", "Talep gönderildi"), { description: c("We read every request. Popular ones land on the roadmap.", "Her talebi okuyoruz. Çok istenenler yol haritasına girer.") })}>
            <Plug /> {c("Request an integration", "Entegrasyon iste")}
          </Button>
        }
        className="mb-6"
      />

      <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-ui-lg border border-line bg-line md:grid-cols-4">
        {[
          { k: c("In use", "Kullanımda"), v: connectedCount, note: c(`of ${items.length} in the directory`, `dizindeki ${items.length} taneden`) },
          { k: c("Need attention", "İlgilenilmeli"), v: broken.length, note: broken.length ? broken.map((b) => b.name).join(", ") : c("All healthy", "Hepsi sağlıklı"), tone: broken.length > 0 },
          { k: c("Records synced today", "Bugün senkronlanan kayıt"), v: recordsToday, note: c("since 00:00", "00:00'dan beri") },
          { k: c("Last sync", "Son senkron"), v: null, note: latest?.name ?? "—", text: latest ? ago(latest.lastSync!) : "—" },
        ].map((s) => (
          <div key={s.k} className="bg-surface px-4 py-3.5">
            <dt className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{s.k}</dt>
            <dd className={cn("tabular mt-1 font-display text-[1.6rem] leading-none", s.tone ? "text-danger" : "text-fg")}>
              {s.v === null ? <span className="text-[1.15rem]">{s.text}</span> : <CountUp value={s.v} duration={800} />}
            </dd>
            <dd className="mt-1.5 truncate text-[12px] text-fg-muted">{s.note}</dd>
          </div>
        ))}
      </dl>

      {broken.map((b) => (
        <Alert
          key={b.id}
          tone="danger"
          className="mb-6"
          title={c(`${b.name} stopped syncing ${ago(b.lastSync ?? NOW)}`, `${b.name} ${ago(b.lastSync ?? NOW)} senkronu durdurdu`)}
          actions={
            <>
              <Button size="sm" variant="primary" onClick={() => setConnect({ id: b.id, mode: "reconnect" })}>
                {c("Reconnect", "Yeniden bağla")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpenId(b.id)}>
                {c("View log", "Kaydı gör")}
              </Button>
            </>
          }
        >
          {b.error ? t(b.error) : null}
        </Alert>
      ))}

      <div className="grid gap-6 lg:grid-cols-[208px_minmax(0,1fr)]">
        <nav aria-label={c("Categories", "Kategoriler")} className="max-lg:hidden">
          <ul className="sticky top-[calc(var(--topbar-h,56px)+16px)] grid gap-0.5">
            {(["all", ...categories] as const).map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  aria-pressed={category === cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "focus-ring flex w-full items-center justify-between rounded-ui-sm px-2.5 py-1.5 text-start text-[13.5px] text-fg-muted transition-colors hover:bg-hover hover:text-fg",
                    category === cat && "bg-selected font-medium text-fg",
                  )}
                >
                  {cat === "all" ? c("All categories", "Tüm kategoriler") : t(integrationCategoryLabels[cat])}
                  <span className="tabular text-[12px] text-fg-subtle">{counts(cat)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <div className="min-w-0 flex-1 basis-56">
              <Input
                type="search"
                leading={<Search />}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={c("Search integrations", "Entegrasyon ara")}
                aria-label={c("Search integrations", "Entegrasyon ara")}
              />
            </div>
            <Select
              aria-label={c("Category", "Kategori")}
              className="w-full lg:hidden sm:w-48"
              value={category}
              onValueChange={(v) => v && setCategory(v)}
              items={[{ value: "all" as const, label: c("All categories", "Tüm kategoriler") }, ...categories.map((k) => ({ value: k, label: t(integrationCategoryLabels[k]) }))]}
            />
            <RadioGroup
              variant="segmented"
              size="sm"
              aria-label={c("Show", "Göster")}
              value={view}
              onValueChange={setView}
              items={[
                { value: "all" as const, label: c("All", "Tümü") },
                { value: "in-use" as const, label: c("In use", "Kullanımda") },
                { value: "available" as const, label: c("Available", "Eklenebilir") },
              ]}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState kind="no-results" className="rounded-ui-lg border border-dashed border-line py-16">
              <EmptyStateTitle>{c(`Nothing matches “${q}”`, `“${q}” ile eşleşen yok`)}</EmptyStateTitle>
              <EmptyStateDescription>{c("Try another name or category, or ask us to build it.", "Başka bir ad veya kategori deneyin ya da bizden isteyin.")}</EmptyStateDescription>
              <EmptyStateActions>
                <Button
                  onClick={() => {
                    setQ("");
                    setCategory("all");
                    setView("all");
                  }}
                >
                  {c("Clear filters", "Filtreleri temizle")}
                </Button>
              </EmptyStateActions>
            </EmptyState>
          ) : null}

          {used.length > 0 ? (
            <section aria-labelledby="int-in-use" className="mb-8">
              <h2 id="int-in-use" className="mb-2.5 flex items-baseline gap-2 text-[13px] font-medium text-fg">
                {c("In use", "Kullanımda")} <span className="tabular text-fg-subtle">{used.length}</span>
              </h2>
              <Stagger asChild step={50}>
                <ul className="divide-y divide-line overflow-hidden rounded-ui-lg border border-line bg-surface">
                  {used.map((i) => (
                    <li key={i.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 px-4 py-3.5 xl:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1fr)_7rem_auto]">
                      <IntegrationMark mark={i.mark} />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-fg">{i.name}</p>
                        <p className="truncate text-[12.5px] text-fg-subtle">{t(integrationCategoryLabels[i.category])}</p>
                      </div>
                      <div className="col-start-2 row-start-2 min-w-0 xl:col-start-auto xl:row-start-auto">
                        {i.status === "error" ? (
                          <Badge tone="danger" dot>
                            {t(statusLabels.error)}
                          </Badge>
                        ) : (
                          <p className="flex items-center gap-1.5 text-[12.5px] text-fg-muted">
                            <span aria-hidden className="size-1.5 rounded-full bg-success" />
                            {c("Synced", "Senkron")} {i.lastSync ? ago(i.lastSync) : "—"}
                          </p>
                        )}
                      </div>
                      <p className="tabular hidden text-end text-[13px] text-fg-muted xl:block">
                        <span className="text-fg">{f.number(i.recordsToday ?? 0)}</span> {c("today", "bugün")}
                      </p>
                      <Button size="sm" className="row-span-2 xl:row-span-1" onClick={() => setOpenId(i.id)} aria-label={c(`Configure ${i.name}`, `${i.name} yapılandır`)}>
                        <Settings2 /> <span className="max-sm:sr-only">{c("Configure", "Yapılandır")}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </Stagger>
            </section>
          ) : null}

          {directory.length > 0 ? (
            <section aria-labelledby="int-directory">
              <h2 id="int-directory" className="mb-2.5 flex items-baseline gap-2 text-[13px] font-medium text-fg">
                {c("Directory", "Dizin")} <span className="tabular text-fg-subtle">{directory.length}</span>
              </h2>
              <Stagger asChild step={45}>
                <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {directory.map((i) => {
                    const soon = i.status === "coming-soon";
                    return (
                      <li key={i.id} className={cn("flex flex-col rounded-ui-lg border border-line bg-surface p-4", soon && "border-dashed bg-transparent")}>
                        <div className="flex items-start gap-3">
                          <IntegrationMark mark={i.mark} muted={soon} />
                          <div className="min-w-0 flex-1">
                            <h3 className="flex items-center gap-2 text-[14px] font-medium text-fg">
                              {i.name}
                              {soon ? <Badge tone="outline">{t(statusLabels["coming-soon"])}</Badge> : null}
                            </h3>
                            <p className="text-[12.5px] text-fg-subtle">{t(integrationCategoryLabels[i.category])}</p>
                          </div>
                        </div>
                        <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-fg-muted">{t(i.description)}</p>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
                          <span className="tabular text-[12px] text-fg-subtle">
                            {soon ? c("In private beta", "Kapalı betada") : c(`${f.compact(i.installs)} workspaces`, `${f.compact(i.installs)} çalışma alanı`)}
                          </span>
                          {soon ? (
                            <Button
                              size="sm"
                              variant={i.waitlist ? "soft" : "secondary"}
                              aria-pressed={Boolean(i.waitlist)}
                              onClick={() => {
                                patch(i.id, { waitlist: !i.waitlist });
                                toast(i.waitlist ? c("You won't be notified", "Bildirim almayacaksınız") : c(`We'll email you when ${i.name} launches`, `${i.name} çıktığında size e-posta göndereceğiz`));
                              }}
                            >
                              <BellRing /> {i.waitlist ? c("Notifying you", "Haber verilecek") : c("Notify me", "Haber ver")}
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => setConnect({ id: i.id, mode: "connect" })} aria-label={c(`Connect ${i.name}`, `${i.name} bağla`)}>
                              {c("Connect", "Bağla")}
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Stagger>
            </section>
          ) : null}
        </div>
      </div>

      <IntegrationSheet
        integration={byId(openId)}
        onOpenChange={(o) => !o && setOpenId(null)}
        onSave={(id, p) => {
          patch(id, p);
          setOpenId(null);
          toast.success(c("Sync settings saved", "Senkron ayarları kaydedildi"), { description: c("They apply from the next run.", "Bir sonraki çalışmadan itibaren geçerli.") });
        }}
        onSyncNow={syncNow}
        onReconnect={(id) => {
          setOpenId(null);
          setConnect({ id, mode: "reconnect" });
        }}
        onDisconnect={(id) => setDisconnecting(id)}
      />

      <ConnectDialog integration={connect ? byId(connect.id) : null} mode={connect?.mode ?? "connect"} onOpenChange={(o) => !o && setConnect(null)} onConnected={onConnected} />

      <ConfirmDialog
        open={Boolean(disconnecting)}
        tone="danger"
        title={c(`Disconnect ${byId(disconnecting)?.name ?? ""}?`, `${byId(disconnecting)?.name ?? ""} bağlantısı kesilsin mi?`)}
        description={c("Syncing stops and the key is revoked. Records already synced stay where they are.", "Senkron durur ve anahtar iptal edilir. Senkronlanmış kayıtlar yerinde kalır.")}
        confirmLabel={c("Disconnect", "Bağlantıyı kes")}
        onResult={(ok) => {
          const id = disconnecting;
          setDisconnecting(null);
          if (ok && id) disconnect(id);
        }}
      />
    </div>
  );
}
