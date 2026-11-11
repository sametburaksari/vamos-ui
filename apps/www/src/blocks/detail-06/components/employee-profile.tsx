"use client";

import * as React from "react";
import { AlertTriangle, ArrowLeft, Eye, EyeOff, FileBadge, FileSignature, FileText, IdCard, Mail, MessageSquare, Phone, ScrollText, Upload } from "lucide-react";
import {
  Avatar, Badge, Button, Card, CardBody, CardHeader, IconButton, Tabs, TabsContent, TabsList, TabsTrigger, toast,
} from "@vamos-ui/react";
import { Reveal, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { employmentLabels, type EmployeeDocument } from "../../_shared/hr";
import { teamLabels } from "../../_shared/people";
import { daysBetween, TODAY } from "../../_shared/time";
import { documents as initialDocs, employment, equipment, initialLeave, manager, payroll, reports, subject, type LeaveEntry } from "./data";
import { TimeOff } from "./time-off";
import { Reviews } from "./reviews";

const docIcon = { contract: FileSignature, id: IdCard, certificate: FileBadge, payslip: ScrollText, policy: FileText };

/** HR record for one employee: who they are, where they sit, time off, documents and reviews. */
export function EmployeeProfile() {
  const { c, t, f } = useBlockFormat();
  const [tab, setTab] = React.useState("overview");
  const [leave, setLeave] = React.useState<LeaveEntry[]>(initialLeave);
  const [docs, setDocs] = React.useState<EmployeeDocument[]>(initialDocs);
  const [renewal, setRenewal] = React.useState<Set<string>>(new Set());
  const [showPay, setShowPay] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const tenureDays = daysBetween(employment.startDate, TODAY);
  const tenure = c(`${Math.floor(tenureDays / 365)} yr ${Math.floor((tenureDays % 365) / 30)} mo`, `${Math.floor(tenureDays / 365)} yıl ${Math.floor((tenureDays % 365) / 30)} ay`);
  const expiring = docs.filter((d) => d.expires && daysBetween(TODAY, d.expires) <= 45);
  const pending = leave.filter((l) => l.status === "pending").length;

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-(--gap)">
      <a href="#directory" className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-ui text-small text-fg-muted hover:text-fg">
        <ArrowLeft className="size-3.5" aria-hidden /> {c("Directory", "Rehber")}
      </a>

      <div className="grid items-start gap-(--gap) lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Identity column */}
        <aside className="grid gap-(--gap) lg:sticky lg:top-4" aria-label={c("Employee", "Çalışan")}>
          <Reveal effect="fade" className="surface grid gap-5 overflow-hidden rounded-ui-lg">
            <div className="grid gap-4 border-b border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <Avatar name={subject.name} size="xl" status={subject.status} />
                <span className="rounded-ui border border-line px-2 py-1 font-mono text-[11px] tracking-[0.08em] text-fg-muted">{employment.employeeNo}</span>
              </div>
              <div className="grid gap-1">
                <h1 className="font-heading text-[length:calc(28px*var(--display-scale,1))] leading-tight text-fg">{subject.name}</h1>
                <p className="text-fg-muted">
                  {t(subject.title)} · {t(teamLabels[employment.department])}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="success" dot>
                  {c("Active", "Aktif")}
                </Badge>
                <Badge tone="outline">{t(employmentLabels[employment.employment])}</Badge>
                <Badge tone="outline">{employment.location === "Ankara office" ? c("Ankara office", "Ankara ofisi") : employment.location}</Badge>
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <a href={`mailto:${subject.email}`}>
                    <Mail /> {c("Email", "E-posta")}
                  </a>
                </Button>
                <IconButton variant="secondary" label={c("Send a chat message", "Sohbet mesajı gönder")} onClick={() => toast(c("Chat opened", "Sohbet açıldı"))}>
                  <MessageSquare />
                </IconButton>
                <Button asChild variant="secondary" size="icon">
                  <a href={`tel:${subject.phone.replace(/\s/g, "")}`} aria-label={c(`Call ${subject.name}`, `${subject.name} kişisini ara`)}>
                    <Phone />
                  </a>
                </Button>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 text-small">
              <div>
                <dt className="text-fg-subtle">{c("Started", "Başlangıç")}</dt>
                <dd className="text-fg">{f.date(employment.startDate, "medium")}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">{c("Tenure", "Kıdem")}</dt>
                <dd className="text-fg">{tenure}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">{c("Local time", "Yerel saat")}</dt>
                <dd className="text-fg">10:24 · UTC+3</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-fg-subtle">{c("Phone", "Telefon")}</dt>
                <dd className="text-fg tabular">{subject.phone}</dd>
              </div>
            </dl>

            {/* Reporting line */}
            <div className="grid gap-2 border-t border-line p-5">
              <h2 className="text-small font-medium text-fg-muted">{c("Reporting line", "Raporlama hattı")}</h2>
              <ol className="grid gap-0" aria-label={c("Reporting line", "Raporlama hattı")}>
                {manager ? (
                  <ChainRow name={manager.name} role={t(manager.title)} caption={c("Manager", "Yönetici")} />
                ) : null}
                <ChainRow name={subject.name} role={t(subject.title)} current />
                <li className="ms-[13px] grid gap-1.5 border-s border-line ps-5 pt-2">
                  <span className="text-small text-fg-subtle">{c(`${reports.length} direct reports`, `${reports.length} doğrudan bağlı`)}</span>
                  <ul className="flex flex-wrap gap-1.5">
                    {reports.map((r) => (
                      <li key={r.id}>
                        <a href={`#${r.id}`} className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-line py-0.5 ps-0.5 pe-2.5 text-small text-fg hover:bg-hover">
                          <Avatar name={r.name} size="xs" status={r.status} /> {r.name.split(" ")[0]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ol>
            </div>
          </Reveal>

          {expiring.length ? (
            <div role="status" className="tone-warning tone-soft flex gap-3 rounded-ui-lg p-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div className="grid gap-1.5 text-small">
                <p className="font-medium">{c(`${expiring.length} document expires soon`, `${expiring.length} belgenin süresi doluyor`)}</p>
                <p>{expiring.map((d) => `${t(d.name)} · ${f.date(d.expires!, "medium")}`).join(", ")}</p>
                <Button size="sm" variant="link" className="w-fit" onClick={() => setTab("documents")}>
                  {c("Go to documents", "Belgelere git")}
                </Button>
              </div>
            </div>
          ) : null}
        </aside>

        {/* Record */}
        <Tabs value={tab} onValueChange={setTab} className="min-w-0">
          <TabsList aria-label={c("Employee record", "Çalışan kaydı")} variant="segmented">
            <TabsTrigger value="overview">{c("Overview", "Genel")}</TabsTrigger>
            <TabsTrigger value="time-off" count={pending || undefined}>
              {c("Time off", "İzinler")}
            </TabsTrigger>
            <TabsTrigger value="documents" count={docs.length}>
              {c("Documents", "Belgeler")}
            </TabsTrigger>
            <TabsTrigger value="reviews">{c("Reviews", "Değerlendirme")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-(--gap) grid gap-(--gap)">
            <Card>
              <CardHeader title={c("Role", "Görev")} />
              <CardBody>
                <Facts
                  columns={2}
                  items={[
                    { key: "title", label: c("Job title", "Unvan"), value: t(subject.title) },
                    { key: "dept", label: c("Department", "Departman"), value: t(teamLabels[employment.department]) },
                    { key: "mgr", label: c("Manager", "Yönetici"), value: manager?.name },
                    { key: "contract", label: c("Contract", "Sözleşme"), value: `${t(employmentLabels[employment.employment])} · ${c("permanent", "süresiz")}` },
                    { key: "pattern", label: c("Working pattern", "Çalışma düzeni"), value: c("Mon–Fri · 09:00–18:00 · weekend rota 1 in 4", "Pzt–Cum · 09:00–18:00 · 4 haftada 1 hafta sonu nöbeti") },
                    { key: "probation", label: c("Probation", "Deneme süresi"), value: c(`Passed ${f.date("2025-09-19", "medium")}`, `${f.date("2025-09-19", "medium")} tamamlandı`) },
                  ]}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={c("Pay", "Ücret")}
                description={c("Visible to People team and the line manager.", "İK ekibi ve yönetici görebilir.")}
                action={
                  <Button size="sm" variant="ghost" aria-pressed={showPay} onClick={() => setShowPay((v) => !v)}>
                    {showPay ? <EyeOff /> : <Eye />} {showPay ? c("Hide", "Gizle") : c("Show", "Göster")}
                  </Button>
                }
              />
              <CardBody>
                <Facts
                  columns={3}
                  items={[
                    { key: "gross", label: c("Gross monthly", "Aylık brüt"), value: showPay ? f.currency(payroll.gross, { currency: "TRY" }, { maximumFractionDigits: 0 }) : "••••••", hint: payroll.band },
                    { key: "change", label: c("Last change", "Son değişiklik"), value: showPay ? `${payroll.change}` : "••", hint: f.date(payroll.lastChange, "medium") },
                    { key: "iban", label: "IBAN", value: showPay ? payroll.iban : "TR•• •••• •••• •••• •••• •••• ••" },
                  ]}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={c("Equipment", "Demirbaş")} description={c("Returned on the last working day.", "Son iş gününde iade edilir.")} />
              <CardBody className="p-0">
                <ul className="divide-y divide-line border-t border-line">
                  {equipment.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-(--card-p) py-3">
                      <span className="text-fg">{e.name}</span>
                      <span className="text-small text-fg-muted">
                        <span className="font-mono">{e.tag}</span> · {c("since", "veriliş")} {f.date(e.since, "medium")}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="time-off" className="mt-(--gap)">
            <TimeOff leave={leave} setLeave={setLeave} />
          </TabsContent>

          <TabsContent value="documents" className="mt-(--gap)">
            <Card>
              <CardHeader
                title={c("Documents", "Belgeler")}
                description={c("Kerem sees his own files. Payslips are added by payroll each month.", "Kerem kendi belgelerini görür. Bordrolar her ay bordro ekibince eklenir.")}
                action={
                  <>
                    <input
                      ref={fileInput}
                      type="file"
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setDocs((all) => [{ id: `up-${all.length}`, personId: subject.id, name: { en: file.name, tr: file.name }, kind: "policy", uploaded: TODAY, size: file.size }, ...all]);
                        toast.success(c("Document uploaded", "Belge yüklendi"), { description: file.name });
                        e.target.value = "";
                      }}
                    />
                    <Button size="sm" onClick={() => fileInput.current?.click()}>
                      <Upload /> {c("Upload", "Yükle")}
                    </Button>
                  </>
                }
              />
              <CardBody className="p-0">
                <Stagger asChild step={50}>
                  <ul className="divide-y divide-line border-t border-line">
                    {docs.map((d) => {
                      const Icon = docIcon[d.kind];
                      const left = d.expires ? daysBetween(TODAY, d.expires) : null;
                      return (
                        <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-(--card-p) py-3.5">
                          <span className="grid size-9 shrink-0 place-items-center rounded-ui bg-selected text-fg-muted" aria-hidden>
                            <Icon className="size-4" />
                          </span>
                          <div className="grid min-w-0 flex-1 basis-48">
                            <span className="truncate font-medium text-fg">{t(d.name)}</span>
                            <span className="text-small text-fg-muted">
                              {f.bytes(d.size)} · {c("added", "eklendi")} {f.date(d.uploaded, "medium")}
                            </span>
                          </div>
                          {left !== null ? (
                            <Badge tone={left <= 45 ? "warning" : "neutral"} dot>
                              {c(`Expires in ${left} days`, `${left} gün sonra doluyor`)}
                            </Badge>
                          ) : null}
                          {left !== null && left <= 45 ? (
                            <Button
                              size="sm"
                              variant={renewal.has(d.id) ? "ghost" : "secondary"}
                              disabled={renewal.has(d.id)}
                              onClick={() => {
                                setRenewal((s) => new Set(s).add(d.id));
                                toast.success(c("Renewal requested", "Yenileme istendi"), { description: c("Kerem gets a task to upload the new certificate.", "Kerem yeni sertifikayı yüklemesi için görev aldı.") });
                              }}
                            >
                              {renewal.has(d.id) ? c("Renewal requested", "Yenileme istendi") : c("Request renewal", "Yenileme iste")}
                            </Button>
                          ) : null}
                          <Button size="sm" variant="ghost" onClick={() => toast(c(`Opening ${t(d.name)}`, `${t(d.name)} açılıyor`))}>
                            {c("View", "Görüntüle")}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </Stagger>
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-(--gap)">
            <Reviews />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/** Label/value pairs in a responsive grid. */
function Facts({ items, columns }: { items: Array<{ key: string; label: string; value: React.ReactNode; hint?: React.ReactNode }>; columns: 2 | 3 }) {
  return (
    <dl className={`grid gap-x-8 gap-y-5 sm:grid-cols-2 ${columns === 3 ? "xl:grid-cols-3" : ""}`}>
      {items.map((i) => (
        <div key={i.key} className="grid content-start gap-1">
          <dt className="text-small text-fg-muted">{i.label}</dt>
          <dd className="text-fg tabular">{i.value}</dd>
          {i.hint ? <dd className="text-small text-fg-subtle">{i.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

function ChainRow({ name, role, caption, current }: { name: string; role: string; caption?: string; current?: boolean }) {
  return (
    <li className={`relative flex items-center gap-3 py-1.5 ${current ? "" : "after:absolute after:top-9 after:bottom-[-6px] after:start-[13px] after:w-px after:bg-line"}`} aria-current={current ? "true" : undefined}>
      <Avatar name={name} size="sm" />
      <span className="grid min-w-0">
        <span className={`truncate ${current ? "font-semibold text-fg" : "text-fg"}`}>{name}</span>
        <span className="truncate text-small text-fg-muted">
          {caption ? `${caption} · ` : ""}
          {role}
        </span>
      </span>
    </li>
  );
}

