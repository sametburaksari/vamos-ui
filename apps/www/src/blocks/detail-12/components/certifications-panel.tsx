"use client";

import * as React from "react";
import { BellRing, GraduationCap } from "lucide-react";
import { Avatar, Badge, Button, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { daysBetween, TODAY } from "../../_shared/time";
import type { Cert } from "./partner-data";

type CertState = "valid" | "expiring" | "expired";
export const certState = (x: Cert): CertState => {
  const d = daysBetween(TODAY, x.expires);
  return d < 0 ? "expired" : d <= 90 ? "expiring" : "valid";
};

const trackLabel = {
  implementation: { en: "Implementation", tr: "Uygulama" },
  sales: { en: "Sales", tr: "Satış" },
  admin: { en: "Admin & security", tr: "Yönetim ve güvenlik" },
};

/** Certified people grouped by person, each certificate with its validity window. */
export function CertificationsPanel({ certs, needed }: { certs: Cert[]; needed: number }) {
  const { c, t, f } = useBlockFormat();
  const [nudged, setNudged] = React.useState<Set<string>>(new Set());
  const holders = [...new Set(certs.map((x) => x.holder))].map((name) => ({ name, items: certs.filter((x) => x.holder === name) }));
  holders.sort((a, b) => Number(a.items.every((x) => certState(x) === "expired")) - Number(b.items.every((x) => certState(x) === "expired")) || a.name.localeCompare(b.name));
  const tone = { valid: "success", expiring: "warning", expired: "danger" } as const;
  const label = { valid: c("Valid", "Geçerli"), expiring: c("Expiring", "Süresi doluyor"), expired: c("Expired", "Süresi doldu") };

  return (
    <div className="grid gap-3">
      <p className="text-[12.5px] text-fg-muted">
        {c(
          `Platinum needs ${needed} people with a valid certificate. Expiring certificates still count until their end date.`,
          `Platin için geçerli sertifikası olan ${needed} kişi gerekir. Süresi dolmak üzere olanlar bitiş tarihine kadar sayılır.`,
        )}
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {holders.map((h) => {
          const active = h.items.some((x) => certState(x) !== "expired");
          return (
            <li key={h.name} className={cn("surface rounded-ui-lg px-4 py-3.5", !active && "opacity-75")}>
              <div className="flex items-center gap-3">
                <Avatar name={h.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-fg">{h.name}</p>
                  <p className="text-[12px] text-fg-muted">{active ? c("Counts towards tier", "Seviyeye sayılır") : c("Not counted", "Sayılmıyor")}</p>
                </div>
              </div>
              <ul className="mt-3 grid gap-2 border-t border-line pt-3">
                {h.items.map((x) => {
                  const st = certState(x);
                  const left = daysBetween(TODAY, x.expires);
                  return (
                    <li key={x.id} className="flex items-start gap-2.5">
                      <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p id={`${x.id}-name`} className="text-[13px] text-fg">{t(x.name)}<span className="sr-only">, {h.name}</span></p>
                        <p className="text-[12px] text-fg-muted tabular">
                          {t(trackLabel[x.track])} · {st === "expired" ? c(`ended ${f.date(x.expires, "medium")}`, `${f.date(x.expires, "medium")} bitti`) : c(`until ${f.date(x.expires, "medium")}`, `${f.date(x.expires, "medium")} tarihine kadar`)}
                          {st === "expiring" ? ` · ${c(`${left} days`, `${left} gün`)}` : ""}
                        </p>
                      </div>
                      {st === "valid" ? (
                        <Badge tone={tone[st]}>{label[st]}</Badge>
                      ) : (
                        <Button
                          size="xs"
                          variant={nudged.has(x.id) ? "ghost" : "secondary"}
                          disabled={nudged.has(x.id)}
                          onClick={() => setNudged((s) => new Set(s).add(x.id))}
                          aria-describedby={`${x.id}-name`}
                        >
                          <BellRing /> {nudged.has(x.id) ? c("Reminded", "Hatırlatıldı") : st === "expired" ? c("Remind to renew", "Yenilemeyi hatırlat") : c("Remind", "Hatırlat")}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
