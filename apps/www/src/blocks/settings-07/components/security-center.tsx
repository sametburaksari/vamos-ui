"use client";

import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Avatar, Badge, PageHeader, cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { AllowListCard } from "./allow-list-card";
import { allowList, backupCodes, me, passkeys, sessions as initialSessions, usedBackupCodes, type AllowEntry, type SessionDevice } from "./data";
import { SessionsCard, isUnrecognised } from "./sessions-card";
import { TwoFactorCard, type TwoFactorState } from "./two-factor-card";
import { day } from "../../_shared/time";

/** Account → Security: posture score, two-step methods and backup codes, sessions, sign-in history, IP allow list. */
export function SecurityCenter() {
  const { c } = useBlockFormat();
  const [twoFactor, setTwoFactor] = React.useState<TwoFactorState>({ totp: true, totpAdded: day(-212), passkeys, codes: backupCodes, usedCodes: usedBackupCodes });
  const [sessions, setSessions] = React.useState<SessionDevice[]>(initialSessions);
  const [entries, setEntries] = React.useState<AllowEntry[]>(allowList);
  const [enforced, setEnforced] = React.useState(false);
  const [blocked, setBlocked] = React.useState<string[]>([]);

  const codesLeft = twoFactor.codes.length - twoFactor.usedCodes.length;
  const strange = sessions.filter(isUnrecognised);
  const checks = [
    { id: "sec-2fa", weight: 25, ok: twoFactor.totp, label: c("Authenticator app on", "Doğrulama uygulaması açık"), fix: c("Set up an authenticator app", "Doğrulama uygulaması kurun") },
    { id: "sec-2fa", weight: 20, ok: twoFactor.passkeys.length > 0, label: c("At least one passkey", "En az bir geçiş anahtarı"), fix: c("Add a passkey", "Geçiş anahtarı ekleyin") },
    { id: "sec-codes", weight: 15, ok: codesLeft >= 5, label: c(`${codesLeft} backup codes left`, `${codesLeft} yedek kod kaldı`), fix: c("Generate new backup codes", "Yeni yedek kod oluşturun") },
    { id: "sec-sessions", weight: 20, ok: strange.length === 0, label: c("No unrecognised sessions", "Tanınmayan oturum yok"), fix: c(`Review ${strange.length} unrecognised session`, `${strange.length} tanınmayan oturumu inceleyin`) },
    { id: "sec-ip", weight: 20, ok: enforced, label: c("IP allow list enforced", "IP izin listesi uygulanıyor"), fix: c("Turn on the IP allow list", "IP izin listesini açın") },
  ];
  const score = checks.reduce((n, k) => n + (k.ok ? k.weight : 0), 0);
  const verdict = score >= 90 ? c("Strong", "Güçlü") : score >= 60 ? c("Good, with gaps", "İyi, eksikleri var") : c("At risk", "Risk altında");

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.querySelector<HTMLElement>("h2")?.setAttribute("tabindex", "-1");
    el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        eyebrow={c("Your account", "Hesabınız")}
        title={c("Security", "Güvenlik")}
        description={c("How you sign in, where you're signed in, and which networks can reach this workspace.", "Nasıl giriş yaptığınız, nerede oturumunuz açık olduğu ve bu çalışma alanına hangi ağların erişebildiği.")}
        meta={
          <span className="flex items-center gap-2 text-[13px] text-fg-muted">
            <Avatar size="sm" name={me.name} /> {me.name} · <Badge tone="outline">{c("Admin", "Yönetici")}</Badge>
          </span>
        }
        className="mb-7"
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <aside aria-labelledby="sec-posture" className="xl:col-start-2 xl:row-start-1">
          <div className="sticky top-[calc(var(--topbar-h,56px)+16px)] rounded-ui-lg border border-line bg-surface p-5">
            <h2 id="sec-posture" className="text-[12px] uppercase tracking-[0.08em] text-fg-subtle">
              {c("Security posture", "Güvenlik durumu")}
            </h2>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="tabular font-display text-[2.6rem] leading-none text-fg">
                <CountUp value={score} duration={700} />
              </span>
              <span className="text-[13px] text-fg-subtle">/ 100</span>
              <span className={cn("ms-auto text-[13px] font-medium", score >= 90 ? "text-success" : score >= 60 ? "text-fg" : "text-danger")}>{verdict}</span>
            </p>
            <div className="mt-3 flex gap-1" aria-hidden>
              {checks.map((k, i) => (
                <span key={i} style={{ flexGrow: k.weight }} className={cn("h-1.5 rounded-full transition-colors duration-500", k.ok ? "bg-accent" : "bg-track")} />
              ))}
            </div>
            <ul className="mt-4 grid gap-0.5">
              {checks.map((k, i) => (
                <li key={i}>
                  {k.ok ? (
                    <p className="flex items-center gap-2.5 px-1 py-1.5 text-[13px] text-fg-muted">
                      <Check aria-hidden className="size-4 shrink-0 text-success" />
                      <span className="min-w-0 flex-1">{k.label}</span>
                      <span className="tabular text-[11.5px] text-fg-subtle">+{k.weight}</span>
                    </p>
                  ) : (
                    <button type="button" onClick={() => jump(k.id)} className="focus-ring group flex w-full items-center gap-2.5 rounded-ui-sm px-1 py-1.5 text-start text-[13px] text-fg hover:bg-hover">
                      <span aria-hidden className="size-4 shrink-0 rounded-full border-[1.5px] border-dashed border-fg-subtle" />
                      <span className="min-w-0 flex-1 font-medium">{k.fix}</span>
                      <ChevronRight aria-hidden className="size-3.5 text-fg-subtle transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6 xl:col-start-1 xl:row-start-1">
          <TwoFactorCard value={twoFactor} onChange={setTwoFactor} />
          <SessionsCard sessions={sessions} onSessionsChange={setSessions} blocked={blocked} onBlock={(ip) => setBlocked((b) => (b.includes(ip) ? b : [...b, ip]))} />
          <AllowListCard
            entries={entries}
            enforced={enforced}
            blocked={blocked}
            onChange={(next) => {
              if (next.entries) setEntries(next.entries);
              if (next.enforced !== undefined) setEnforced(next.enforced);
              if (next.blocked) setBlocked(next.blocked);
            }}
          />
        </div>
      </div>
    </div>
  );
}
