"use client";

import * as React from "react";
import { Laptop, Monitor, ShieldAlert, Smartphone } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  cn,
  toast,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { methodLabels, resultLabels, signInHistory, type SessionDevice } from "./data";

const deviceIcon = (s: SessionDevice) => (s.os.startsWith("iOS") || s.os.startsWith("Android") ? Smartphone : s.os.startsWith("Windows") ? Monitor : Laptop);
/** A session is unrecognised when no successful sign-in came from its address. */
export const isUnrecognised = (s: SessionDevice) => !s.current && !signInHistory.some((h) => h.ip === s.ip && h.result === "success");

interface Props {
  sessions: SessionDevice[];
  onSessionsChange: (next: SessionDevice[]) => void;
  /** Adds the address to the blocked list (from a suspicious sign-in). */
  blocked: string[];
  onBlock: (ip: string) => void;
}

/** Signed-in devices with sign-out (one or all others), then the sign-in history with a failed-only filter. */
export function SessionsCard({ sessions, onSessionsChange, blocked, onBlock }: Props) {
  const { c, t, f, ago } = useBlockFormat();
  const [confirmAll, setConfirmAll] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "problems">("all");
  const others = sessions.filter((s) => !s.current);
  // Newest first: the shared fixture lists a failed burst oldest-first.
  const history = signInHistory.filter((h) => filter === "all" || h.result !== "success").sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const signOut = (s: SessionDevice) => {
    const before = sessions;
    onSessionsChange(sessions.filter((x) => x.id !== s.id));
    toast(c(`Signed out of ${s.device}`, `${s.device} oturumu kapatıldı`), {
      description: c("It needs a password and a second step to come back.", "Geri dönmek için parola ve ikinci adım gerekir."),
      action: { label: c("Undo", "Geri al"), onClick: () => onSessionsChange(before) },
    });
  };

  return (
    <>
      <Card id="sec-sessions" className="scroll-mt-24">
        <CardHeader
          titleAs="h2"
          title={c("Where you're signed in", "Oturum açık cihazlar")}
          description={c("Sign out anything you don't recognise, then change your password.", "Tanımadığınız her şeyden çıkış yapın, sonra parolanızı değiştirin.")}
          action={
            others.length > 0 ? (
              <Button size="sm" variant="danger-ghost" onClick={() => setConfirmAll(true)}>
                {c("Sign out all others", "Diğer tümünden çık")}
              </Button>
            ) : null
          }
          divider
        />
        <CardBody className="p-0!">
          <Stagger asChild step={50}>
            <ul className="divide-y divide-line">
              {sessions.map((s) => {
                const Icon = deviceIcon(s);
                const odd = isUnrecognised(s);
                return (
                  <li key={s.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-(--card-p) py-3.5", odd && "bg-[color-mix(in_srgb,var(--warning)_7%,transparent)]")}>
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-ui border border-line bg-surface-2", odd ? "text-warning" : "text-fg-muted")}>
                      {odd ? <ShieldAlert aria-hidden className="size-[18px]" strokeWidth={1.7} /> : <Icon aria-hidden className="size-[18px]" strokeWidth={1.6} />}
                    </span>
                    <div className="min-w-0 flex-1 basis-52">
                      <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-fg">
                        {s.device}
                        {s.current ? <Badge tone="accent">{c("This device", "Bu cihaz")}</Badge> : null}
                        {odd ? <Badge tone="warning">{c("Unrecognised", "Tanınmıyor")}</Badge> : null}
                      </p>
                      <p className="text-[12.5px] text-fg-muted">
                        {s.browser} · {s.os} · {s.city} <span className="font-mono text-[12px] text-fg-subtle">{s.ip}</span>
                      </p>
                    </div>
                    <p className="tabular text-[12.5px] text-fg-muted">{s.current ? <span className="inline-flex items-center gap-1.5 text-fg"><span aria-hidden className="size-1.5 rounded-full bg-success" />{c("Active now", "Şu an etkin")}</span> : ago(s.lastActive)}</p>
                    {s.current ? (
                      <span className="w-[5.5rem]" aria-hidden />
                    ) : (
                      <Button size="sm" className="w-[5.5rem]" onClick={() => signOut(s)} aria-label={c(`Sign out of ${s.device}`, `${s.device} oturumunu kapat`)}>
                        {c("Sign out", "Çıkış yap")}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Stagger>
        </CardBody>
      </Card>

      <Card id="sec-history" className="scroll-mt-24">
        <CardHeader
          titleAs="h2"
          title={c("Sign-in history", "Giriş geçmişi")}
          description={c("The last 30 days. Five wrong passwords in a row block the address for an hour.", "Son 30 gün. Art arda beş hatalı parola adresi bir saat engeller.")}
          action={
            <RadioGroup
              variant="segmented"
              size="sm"
              aria-label={c("Show", "Göster")}
              value={filter}
              onValueChange={setFilter}
              items={[
                { value: "all" as const, label: c("All", "Tümü") },
                { value: "problems" as const, label: c("Failed", "Başarısız") },
              ]}
            />
          }
          divider
        />
        <CardBody className="p-0!">
          <TableContainer className="border-0">
            <Table density="compact" bordered="rows">
              <TableHeader>
                <TableRow>
                  <TableHead>{c("When", "Zaman")}</TableHead>
                  <TableHead>{c("Result", "Sonuç")}</TableHead>
                  <TableHead className="max-md:hidden">{c("Method", "Yöntem")}</TableHead>
                  <TableHead>{c("From", "Nereden")}</TableHead>
                  <TableHead align="end">
                    <span className="sr-only">{c("Actions", "İşlemler")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => {
                  const isBlocked = blocked.includes(h.ip);
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="tabular whitespace-nowrap">
                        <time dateTime={h.at}>{f.dateTime(h.at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
                      </TableCell>
                      <TableCell>
                        <Badge tone={h.result === "success" ? "success" : h.result === "failed" ? "warning" : "danger"} dot>
                          {t(resultLabels[h.result])}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-fg-muted max-md:hidden">{t(methodLabels[h.method])}</TableCell>
                      <TableCell>
                        <span className="block text-fg">{h.city}</span>
                        <span className="font-mono text-[12px] text-fg-subtle">{h.ip}</span>
                      </TableCell>
                      <TableCell align="end">
                        {h.result !== "success" ? (
                          <Button
                            size="xs"
                            variant={isBlocked ? "ghost" : "secondary"}
                            disabled={isBlocked}
                            onClick={() => {
                              onBlock(h.ip);
                              toast.success(c(`${h.ip} is blocked`, `${h.ip} engellendi`), { description: c("Sign-ins from this address are refused, even with the right password.", "Bu adresten gelen girişler doğru parolayla bile reddedilir.") });
                            }}
                          >
                            {isBlocked ? c("Blocked", "Engellendi") : c("Block IP", "IP'yi engelle")}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmAll}
        tone="danger"
        title={c(`Sign out of ${others.length} other sessions?`, `Diğer ${others.length} oturum kapatılsın mı?`)}
        description={c("Everything except this browser is signed out right away. Your phone app will ask you to sign in again.", "Bu tarayıcı dışındaki her şeyden hemen çıkılır. Telefon uygulaması yeniden giriş isteyecek.")}
        confirmLabel={c("Sign out all others", "Diğer tümünden çık")}
        onResult={(ok) => {
          setConfirmAll(false);
          if (!ok) return;
          onSessionsChange(sessions.filter((s) => s.current));
          toast.success(c("Signed out everywhere else", "Diğer her yerden çıkıldı"));
        }}
      />
    </>
  );
}
