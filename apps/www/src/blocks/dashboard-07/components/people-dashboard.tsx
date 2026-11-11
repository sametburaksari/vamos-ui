"use client";

import * as React from "react";
import { Download, Plus } from "lucide-react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Input,
  PageHeader,
  Select,
  toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { person, teamLabels, type TeamKey } from "../../_shared/people";
import { day } from "../../_shared/time";
import { EnpsCard } from "./enps-card";
import { HeadcountCard } from "./headcount-card";
import { LeaveBoard } from "./leave-board";
import { OpenRoles } from "./open-roles";
import { leaveRequests, openRoles, roleStages, type LeaveRequest, type OpenRole } from "./data";

/** HR overview: headcount and movement, eNPS, a leave calendar with approvals and the hiring board. */
export function PeopleDashboard() {
  const { t, c, f } = useBlockFormat();
  const [requests, setRequests] = React.useState<LeaveRequest[]>(leaveRequests);
  const [roles, setRoles] = React.useState<OpenRole[]>(openRoles);

  const decide = (id: string, status: "approved" | "declined", reason?: string) => {
    const before = requests.find((r) => r.id === id);
    if (!before) return;
    setRequests((all) => all.map((r) => (r.id === id ? { ...r, status } : r)));
    const name = person(before.personId).name;
    const undo = { label: c("Undo", "Geri al"), onClick: () => setRequests((all) => all.map((r) => (r.id === id ? before : r))) };
    if (status === "approved") toast.success(c(`Leave approved for ${name}`, `${name} için izin onaylandı`), { description: f.dateRange(before.start, before.end), action: undo });
    else toast(c(`Leave declined for ${name}`, `${name} için izin reddedildi`), { description: reason ?? c("No reason given", "Gerekçe yazılmadı"), action: undo });
  };

  const advance = (id: string) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    const next = roleStages[roleStages.findIndex((s) => s.key === role.stage) + 1];
    if (!next) return;
    setRoles((all) => all.map((r) => (r.id === id ? { ...r, stage: next.key } : r)));
    toast.success(c(`${t(role.title)} moved to ${next.label.en}`, `${t(role.title)}: ${next.label.tr}`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setRoles((all) => all.map((r) => (r.id === id ? role : r))) },
    });
  };

  return (
    <div className="mx-auto max-w-[1320px]">
      <PageHeader
        size="lg"
        eyebrow={c("People · November 2026", "İnsan kaynakları · Kasım 2026")}
        title={c("Team pulse", "Ekip nabzı")}
        description={c("How many we are, how people feel, who is away and who is joining next.", "Kaç kişiyiz, ekip nasıl hissediyor, kim izinde ve sırada kim katılıyor.")}
        actions={
          <>
            <Button variant="secondary" onClick={() => toast(c("Headcount report exported", "Çalışan raporu dışa aktarıldı"), { description: "headcount-2026-11.csv" })}>
              <Download aria-hidden />
              {c("Export", "Dışa aktar")}
            </Button>
            <PostRoleDialog onCreate={(role) => setRoles((all) => [role, ...all])} />
          </>
        }
      />

      <div className="grid gap-(--gap) xl:grid-cols-[minmax(0,1fr)_360px]">
        <HeadcountCard />
        <EnpsCard />
      </div>

      <div className="mt-(--gap)">
        <LeaveBoard requests={requests} onDecide={decide} />
      </div>

      <div className="mt-(--gap)">
        <OpenRoles roles={roles} onAdvance={advance} />
      </div>
    </div>
  );
}

const departments: TeamKey[] = ["engineering", "support", "ops", "sales", "marketing", "design", "finance", "people"];

function PostRoleDialog({ onCreate }: { onCreate: (role: OpenRole) => void }) {
  const { t, c } = useBlockFormat();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [dept, setDept] = React.useState<TeamKey>("engineering");
  const [location, setLocation] = React.useState("Istanbul");
  const [error, setError] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError(true);
    onCreate({
      id: `r-new-${Date.now()}`,
      title: { en: title.trim(), tr: title.trim() },
      department: dept,
      location: location.trim() || "Istanbul",
      openedDate: day(0),
      applicants: 0,
      stage: "sourcing",
      hiringManagerId: "p-ece",
    });
    toast.success(c("Role posted", "Pozisyon yayınlandı"), { description: c("It is live on the careers page.", "Kariyer sayfasında yayında.") });
    setOpen(false);
    setTitle("");
    setError(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus aria-hidden />
          {c("Post a role", "Pozisyon aç")}
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <form onSubmit={submit} noValidate>
          <DialogHeader title={c("Post a role", "Pozisyon aç")} description={c("Starts in sourcing. You can add the full job description later.", "Aday arama aşamasında başlar. İlan metnini sonra ekleyebilirsiniz.")} />
          <DialogBody className="space-y-4">
            <div>
              <label htmlFor="role-title" className="mb-1.5 block text-[13px] font-medium text-fg">{c("Job title", "Pozisyon adı")}</label>
              <Input
                id="role-title"
                value={title}
                invalid={error}
                aria-describedby={error ? "role-title-error" : undefined}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(false);
                }}
                placeholder={c("Payroll Specialist", "Bordro Uzmanı")}
              />
              {error ? <p id="role-title-error" className="mt-1.5 text-xs text-danger">{c("Give the role a title.", "Pozisyona bir ad verin.")}</p> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label id="role-dept-label" className="mb-1.5 block text-[13px] font-medium text-fg">{c("Department", "Departman")}</label>
                <Select aria-labelledby="role-dept-label" value={dept} onValueChange={(v) => v && setDept(v as TeamKey)} items={departments.map((d) => ({ value: d, label: t(teamLabels[d]) }))} />
              </div>
              <div>
                <label htmlFor="role-location" className="mb-1.5 block text-[13px] font-medium text-fg">{c("Location", "Konum")}</label>
                <Input id="role-location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button type="submit" variant="primary">{c("Post role", "Yayınla")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
