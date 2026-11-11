"use client";

import * as React from "react";
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Check, CircleAlert, RefreshCw, TriangleAlert } from "lucide-react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Select,
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { directionLabels, frequencyLabels, integrationCategoryLabels, statusLabels, type MarketIntegration, type SyncObject } from "./data";
import { IntegrationMark } from "./integration-mark";

const directionIcon = { in: ArrowDownToLine, out: ArrowUpFromLine, both: ArrowLeftRight } as const;

export interface IntegrationSheetProps {
  integration: MarketIntegration | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: Pick<MarketIntegration, "syncs" | "frequency">) => void;
  onSyncNow: (id: string) => Promise<void>;
  onReconnect: (id: string) => void;
  onDisconnect: (id: string) => void;
}

/** Configure one connected integration: what syncs and how often, its sync log and the access it holds. */
export function IntegrationSheet({ integration, onOpenChange, onSave, onSyncNow, onReconnect, onDisconnect }: IntegrationSheetProps) {
  const { c, t, f, ago } = useBlockFormat();
  const [syncs, setSyncs] = React.useState<SyncObject[]>([]);
  const [frequency, setFrequency] = React.useState<MarketIntegration["frequency"]>("hourly");
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    if (!integration) return;
    setSyncs(integration.syncs);
    setFrequency(integration.frequency);
    // Reset the draft only when a different integration opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integration?.id]);

  const dirty = integration ? frequency !== integration.frequency || syncs.some((s, i) => s.enabled !== integration.syncs[i]?.enabled) : false;
  const broken = integration?.status === "error";

  return (
    <Sheet open={Boolean(integration)} onOpenChange={onOpenChange}>
      <SheetContent side="end" size="md">
        {integration ? (
          <>
            <SheetHeader
              icon={<IntegrationMark mark={integration.mark} size="sm" />}
              title={integration.name}
              description={[t(integrationCategoryLabels[integration.category]), integration.publisher !== integration.name ? integration.publisher : c("Official app", "Resmî uygulama")].join(" · ")}
            />
            <SheetBody className="grid content-start gap-5">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-ui border border-line bg-surface-2 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={broken ? "danger" : "success"} dot>
                      {t(statusLabels[integration.status])}
                    </Badge>
                    {integration.lastSync ? <span className="text-[12.5px] text-fg-muted">{c("Last sync", "Son senkron")} {ago(integration.lastSync)}</span> : null}
                  </div>
                  <p className="tabular mt-1.5 text-[13px] text-fg-muted">
                    {c(`${f.number(integration.recordsToday ?? 0)} records today`, `Bugün ${f.number(integration.recordsToday ?? 0)} kayıt`)} · {t(frequencyLabels[integration.frequency])}
                  </p>
                </div>
                {broken ? (
                  <Button size="sm" variant="primary" onClick={() => onReconnect(integration.id)}>
                    {c("Reconnect", "Yeniden bağla")}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    loading={syncing}
                    onClick={async () => {
                      setSyncing(true);
                      await onSyncNow(integration.id);
                      setSyncing(false);
                    }}
                  >
                    <RefreshCw /> {syncing ? c("Syncing…", "Senkronlanıyor…") : c("Sync now", "Şimdi senkronla")}
                  </Button>
                )}
              </div>

              {broken && integration.error ? (
                <Alert tone="danger" size="sm" title={c("Sync is paused", "Senkron duraklatıldı")}>
                  {t(integration.error)}
                </Alert>
              ) : null}

              <Tabs defaultValue="sync">
                <TabsList>
                  <TabsTrigger value="sync">{c("What syncs", "Senkronlananlar")}</TabsTrigger>
                  <TabsTrigger value="log" count={integration.log.length}>
                    {c("Activity", "Etkinlik")}
                  </TabsTrigger>
                  <TabsTrigger value="access">{c("Access", "Erişim")}</TabsTrigger>
                </TabsList>

                <TabsContent value="sync" className="grid gap-5 pt-4">
                  <ul className="divide-y divide-line rounded-ui border border-line">
                    {syncs.map((s, i) => {
                      const Icon = directionIcon[s.direction];
                      return (
                        <li key={s.key} className="flex items-center gap-3 px-3.5 py-3">
                          <Icon aria-hidden className="size-4 shrink-0 text-fg-subtle" strokeWidth={1.7} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] text-fg">{t(s.label)}</p>
                            <p className="text-[12px] text-fg-subtle">{t(directionLabels[s.direction])}</p>
                          </div>
                          <Switch
                            aria-label={t(s.label)}
                            checked={s.enabled}
                            onCheckedChange={(v) => setSyncs((all) => all.map((x, j) => (j === i ? { ...x, enabled: v } : x)))}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <div className="grid gap-1.5">
                    <label htmlFor="sync-frequency" className="text-[13px] font-medium text-fg">
                      {c("Sync frequency", "Senkron sıklığı")}
                    </label>
                    <Select
                      id="sync-frequency"
                      value={frequency}
                      onValueChange={(v) => v && setFrequency(v)}
                      items={(Object.keys(frequencyLabels) as MarketIntegration["frequency"][]).map((k) => ({ value: k, label: t(frequencyLabels[k]) }))}
                    />
                    <p className="text-[12.5px] text-fg-subtle">{c("Webhooks still arrive instantly; this sets the safety net sweep.", "Webhook'lar yine anında gelir; bu, yedek taramanın sıklığıdır.")}</p>
                  </div>
                </TabsContent>

                <TabsContent value="log" className="pt-4">
                  {integration.log.length === 0 ? (
                    <p className="rounded-ui border border-dashed border-line px-4 py-8 text-center text-[13px] text-fg-muted">{c("Nothing synced yet. The first run starts within a minute.", "Henüz senkron yok. İlk çalışma bir dakika içinde başlar.")}</p>
                  ) : (
                    <ol className="relative grid gap-4 ps-5 before:absolute before:inset-y-1 before:start-[5px] before:w-px before:bg-line">
                      {integration.log.map((e) => (
                        <li key={e.id} className="relative">
                          <span
                            aria-hidden
                            className={cn(
                              "absolute -start-5 top-1 grid size-[11px] place-items-center rounded-full border-2 border-surface",
                              e.result === "ok" && "bg-success",
                              e.result === "warning" && "bg-warning",
                              e.result === "failed" && "bg-danger",
                            )}
                          />
                          <p className="flex items-center gap-1.5 text-[13.5px] text-fg">
                            {e.result === "failed" ? <CircleAlert aria-hidden className="size-3.5 text-danger" /> : e.result === "warning" ? <TriangleAlert aria-hidden className="size-3.5 text-warning" /> : null}
                            <span className="sr-only">{e.result === "ok" ? c("Succeeded:", "Başarılı:") : e.result === "warning" ? c("Warning:", "Uyarı:") : c("Failed:", "Başarısız:")}</span>
                            {t(e.message)}
                          </p>
                          <p className="tabular text-[12px] text-fg-subtle">
                            <time dateTime={e.at}>{f.time(e.at)}</time> · {ago(e.at)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                </TabsContent>

                <TabsContent value="access" className="grid gap-4 pt-4">
                  <ul className="grid gap-2">
                    {integration.scopes.map((s) => (
                      <li key={s.key} className="flex items-start gap-2 text-[13.5px] text-fg">
                        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                        {t(s.label)}
                      </li>
                    ))}
                  </ul>
                  {integration.connectedBy ? (
                    <div className="flex items-center gap-2.5 border-t border-line pt-4 text-[13px] text-fg-muted">
                      <Avatar size="sm" name={person(integration.connectedBy).name} />
                      <span>
                        {c("Connected by", "Bağlayan")} <span className="text-fg">{person(integration.connectedBy).name}</span>
                      </span>
                    </div>
                  ) : null}
                </TabsContent>
              </Tabs>
            </SheetBody>
            <SheetFooter align="between">
              <Button variant="danger-ghost" onClick={() => onDisconnect(integration.id)}>
                {c("Disconnect", "Bağlantıyı kes")}
              </Button>
              <Button variant="primary" disabled={!dirty} onClick={() => onSave(integration.id, { syncs, frequency })}>
                {c("Save changes", "Değişiklikleri kaydet")}
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
