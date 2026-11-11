"use client";

import * as React from "react";
import { ArrowLeft, Bell, Eye, Menu } from "lucide-react";
import { Button, DialogTitle, EmptyState, IconButton, Sheet, SheetContent, Switch, Toaster, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../_shared/format";
import { dealRegistrations as initialRegistrations, partners, type DealRegistration } from "../_shared/partners";
import { day } from "../_shared/time";
import { approvals as initialApprovals, navByKind, workspaces } from "./data";
import { ContextNav, WorkspaceMenu, WorkspaceStrip } from "./components/workspace-rail";
import { AgencyHome } from "./components/agency-home";
import { ClientPortal } from "./components/client-portal";
import { PartnerPortal } from "./components/partner-portal";

/**
 * Multi-workspace shell for an agency: a strip of workspaces (the agency, each client portal,
 * each partner portal), the open workspace's own menu next to it, and a banner while staff look
 * inside a client's or partner's portal. ⌘/Ctrl + 1…5 switches workspace.
 */
export default function Shell08() {
  const { c, t } = useBlockFormat();
  const [wsId, setWsId] = React.useState(workspaces[0]!.id);
  const [page, setPage] = React.useState("home");
  const [asClient, setAsClient] = React.useState(false);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [registrations, setRegistrations] = React.useState<DealRegistration[]>(initialRegistrations);
  const [approvals, setApprovals] = React.useState(initialApprovals);

  const ws = workspaces.find((w) => w.id === wsId)!;
  const home = workspaces[0]!;

  const switchTo = React.useCallback((id: string) => {
    setWsId(id);
    setPage("home");
    setAsClient(false);
    setMobileNav(false);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= workspaces.length) {
        e.preventDefault();
        switchTo(workspaces[n - 1]!.id);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [switchTo]);

  const decideRegistration = (id: string, decision: "approved" | "rejected") => {
    const before = registrations;
    setRegistrations((r) => r.map((x) => (x.id === id ? { ...x, status: decision } : x)));
    const r = registrations.find((x) => x.id === id)!;
    (decision === "approved" ? toast.success : toast)(
      decision === "approved" ? c(`${r.prospect} approved`, `${r.prospect} onaylandı`) : c(`${r.prospect} rejected`, `${r.prospect} reddedildi`),
      {
        description: c("The partner is notified by email.", "İş ortağına e-postayla bildirildi."),
        action: { label: c("Undo", "Geri al"), onClick: () => setRegistrations(before) },
      },
    );
  };

  const decideApproval = (id: string, decision: "approved" | "changes") => {
    const a = approvals.find((x) => x.id === id)!;
    setApprovals((list) => list.filter((x) => x.id !== id));
    toast.success(decision === "approved" ? c(`Approved: ${t(a.title)}`, `Onaylandı: ${t(a.title)}`) : c("Changes sent to the team", "Değişiklikler ekibe gönderildi"), {
      action: { label: c("Undo", "Geri al"), onClick: () => setApprovals((list) => (list.some((x) => x.id === id) ? list : [a, ...list])) },
    });
  };

  const register = (prospect: string, amount: string) => {
    const partnerId = partners.find((p) => p.name === ws.name)?.id ?? "pt-1";
    setRegistrations((r) => [
      { id: `dr-${r.length + 1}-${prospect.length}`, partnerId, prospect, value: { amount, currency: "USD" }, submitted: day(0), expires: day(90), status: "submitted" },
      ...r,
    ]);
    toast.success(c(`${prospect} submitted for review`, `${prospect} incelemeye gönderildi`));
  };

  const counts: Record<string, number> = {
    approvals: approvals.filter((a) => a.companyId === ws.companyId).length,
    registrations: ws.kind === "company" ? registrations.filter((r) => r.status === "submitted").length : 0,
  };

  const item = navByKind[ws.kind].find((n) => n.id === page);
  const content =
    page !== "home" ? (
      <EmptyState
        size="lg"
        title={item ? t(item.label) : ""}
        description={c("This page isn't part of the preview. Every workspace keeps its own menu and state.", "Bu sayfa önizlemeye dahil değil. Her çalışma alanı kendi menüsünü ve durumunu korur.")}
        actions={<Button onClick={() => setPage("home")}>{c("Back to the overview", "Genel bakışa dön")}</Button>}
      />
    ) : ws.kind === "company" ? (
      <AgencyHome registrations={registrations} onDecide={decideRegistration} onOpenWorkspace={switchTo} />
    ) : ws.kind === "client" ? (
      <ClientPortal workspace={ws} asClient={asClient} approvals={approvals} onDecide={decideApproval} />
    ) : (
      <PartnerPortal partnerId={partners.find((p) => p.name === ws.name)?.id ?? "pt-1"} registrations={registrations} onRegister={register} />
    );

  return (
    <div className="relative z-10 flex h-dvh overflow-hidden">
      <WorkspaceStrip className="max-md:hidden" active={wsId} onSwitch={switchTo} />
      <ContextNav className="max-lg:hidden" workspace={ws} page={page} onPage={setPage} counts={counts} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4 md:px-6">
          <IconButton size="sm" label={c("Open menu", "Menüyü aç")} className="lg:hidden" onClick={() => setMobileNav(true)}>
            <Menu />
          </IconButton>
          <WorkspaceMenu active={wsId} onSwitch={switchTo} className="md:hidden" />
          <span className="min-w-0 truncate text-[13px] text-fg-muted max-md:hidden">
            {ws.name} <span className="text-fg-subtle">/</span> <span className="font-medium text-fg">{item ? t(item.label) : ""}</span>
          </span>
          <div className="flex-1" />
          <IconButton size="sm" label={c("Notifications", "Bildirimler")}>
            <Bell />
          </IconButton>
        </header>

        {ws.kind !== "company" ? (
          <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-accent-soft px-4 py-2 text-[12.5px] text-accent-ink md:px-6">
            <Eye className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 basis-56">
              {ws.kind === "client"
                ? asClient
                  ? c(`Previewing exactly what ${ws.name} sees.`, `${ws.name} ne görüyorsa onu önizliyorsunuz.`)
                  : c(`You're inside ${ws.name}'s portal as an agency admin. Agency-only notes are marked.`, `${ws.name} portalındasınız (ajans yöneticisi). Yalnız ajansa özel notlar işaretli.`)
                : c(`You're inside ${ws.name}'s partner portal as programme owner.`, `${ws.name} iş ortağı portalındasınız (program sahibi).`)}
            </span>
            {ws.kind === "client" ? (
              <label className="flex items-center gap-2 font-medium">
                <Switch size="sm" checked={asClient} onCheckedChange={setAsClient} />
                {c("View as client", "Müşteri gibi gör")}
              </label>
            ) : null}
            <Button size="xs" variant="ghost" className="text-accent-ink" onClick={() => switchTo(home.id)}>
              <ArrowLeft aria-hidden className="rtl:-scale-x-100" /> {c(`Back to ${home.name}`, `${home.name} alanına dön`)}
            </Button>
          </div>
        ) : null}

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-7 md:px-8 md:py-9">
          <div key={`${wsId}-${page}`} data-state="open" className="ui-fade">
            {content}
          </div>
        </main>
      </div>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="start" size="sm" hideClose className="max-w-[92vw] border-0 p-0">
          <DialogTitle className="sr-only">{c("Navigation", "Gezinme")}</DialogTitle>
          <div className="flex h-full">
            <WorkspaceStrip active={wsId} onSwitch={switchTo} />
            <ContextNav
              className="w-auto min-w-0 flex-1 border-e-0"
              workspace={ws}
              page={page}
              onPage={(p) => {
                setPage(p);
                setMobileNav(false);
              }}
              counts={counts}
            />
          </div>
        </SheetContent>
      </Sheet>
      <Toaster />
    </div>
  );
}
