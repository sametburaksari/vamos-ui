"use client";

import * as React from "react";
import { Card, CardBody, CardHeader, Progress, Select, toast } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { SettingsFrame } from "../../settings-03/components/settings-frame";
import { ApiKeys, CopyButton } from "./api-keys";
import { Webhooks } from "./webhooks";

/** Settings → API & webhooks. */
export function DeveloperSettings() {
  const { c } = useBlockFormat();
  return (
    <SettingsFrame
      section="developers"
      title={c("API & webhooks", "API ve webhook")}
      description={c("Connect your ERP, warehouse and marketplaces. Every key and endpoint change is written to the audit log.", "ERP, depo ve pazaryerlerinizi bağlayın. Her anahtar ve uç nokta değişikliği denetim kaydına yazılır.")}
    >
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-5">
          <ApiKeys />
          <Webhooks />
        </div>
        <ConnectionPanel />
      </div>
    </SettingsFrame>
  );
}

const BASE_URL = "https://api.kilnlinen.example.com/v3";

/** Base URL, pinned API version and live rate-limit use. */
function ConnectionPanel() {
  const { c, f } = useBlockFormat();
  const [version, setVersion] = React.useState("2026-10-01");
  return (
    <aside aria-label={c("Connection", "Bağlantı")} className="grid min-w-0 content-start gap-5 md:grid-cols-2 xl:sticky xl:top-20 xl:grid-cols-1 xl:self-start">
      <Card>
        <CardHeader titleAs="h2" title={c("Connection", "Bağlantı")} />
        <CardBody className="grid gap-4 pt-0">
          <div className="min-w-0">
            <p className="text-xs text-fg-subtle">{c("Base URL", "Temel adres")}</p>
            <div className="mt-1 flex min-w-0 items-center gap-1 rounded-ui border border-line surface-2 py-1 ps-2.5 pe-1">
              <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-fg">{BASE_URL}</code>
              <CopyButton text={BASE_URL} label={c("Copy", "Kopyala")} done={c("Copied", "Kopyalandı")} />
            </div>
          </div>
          <div>
            <p id="api-version-label" className="text-xs text-fg-subtle">
              {c("API version", "API sürümü")}
            </p>
            <Select
              aria-labelledby="api-version-label"
              className="mt-1"
              value={version}
              onValueChange={(v) => {
                if (!v || v === version) return;
                setVersion(v);
                toast.success(c(`Pinned to ${v}`, `${v} sürümüne sabitlendi`), { description: c("Requests without a version header use it from now on.", "Sürüm başlığı olmayan istekler artık bunu kullanır.") });
              }}
              items={[
                { value: "2026-10-01", label: c("2026-10-01 · current", "2026-10-01 · güncel") },
                { value: "2026-04-15", label: "2026-04-15" },
                { value: "2025-11-01", label: c("2025-11-01 · retires Mar 2027", "2025-11-01 · Mart 2027'de kalkıyor") },
              ]}
            />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader titleAs="h2" title={c("Last 24 hours", "Son 24 saat")} />
        <CardBody className="grid gap-4 pt-0">
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs text-fg-subtle">{c("Requests", "İstekler")}</dt>
              <dd className="font-mono text-[1.4rem] leading-tight text-fg tabular">
                <CountUp value={41_386} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Errors", "Hatalar")}</dt>
              <dd className="font-mono text-[1.4rem] leading-tight text-fg tabular">{f.percent(0.0042, { maximumFractionDigits: 2 })}</dd>
            </div>
          </dl>
          <Progress label={c("Rate limit, busiest minute", "Hız sınırı, en yoğun dakika")} value={472} max={600} tone="auto" display="fraction" showValue hint={c("600 requests per minute per key. Over it, we answer 429 with Retry-After.", "Anahtar başına dakikada 600 istek. Aşılırsa Retry-After ile 429 döneriz.")} />
        </CardBody>
      </Card>
    </aside>
  );
}
