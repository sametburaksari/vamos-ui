"use client";

import * as React from "react";
import { CalendarPlus, Mail, Pencil } from "lucide-react";
import {
  AttachmentList,
  Avatar,
  Badge,
  Button,
  DescriptionGroup,
  DescriptionList,
  EntityCard,
  Progress,
  RecordAside,
  RecordAsideSection,
  RecordHeader,
  RecordLayout,
  RecordMain,
  RecordSection,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TaskList,
  toast,
  useFormat,
  type AttachmentData,
  type TaskData,
} from "@vamos-ui/react";
import { ApprovalFlow } from "@vamos-ui/react/business";
import { balances, directReports, documents as initialDocs, employee, leaveHistory, leaveStages, NOW, reviewChecklist, TODAY } from "./data";

/** HR employee profile: employment facts, leave balance and requests, documents, review cycle. */
export function EmployeeProfile() {
  const f = useFormat();
  const [docs, setDocs] = React.useState<AttachmentData[]>(initialDocs);
  const [review, setReview] = React.useState<TaskData[]>(reviewChecklist);
  const range = (from: string, to: string) => (from === to ? f.date(from, "medium") : `${f.date(from, "medium")} – ${f.date(to, "medium")}`);

  return (
    <RecordLayout className="mx-auto max-w-[1280px]">
      <RecordHeader
        back={{ href: "/people/employees", label: "Employees" }}
        media={<Avatar name={employee.name} size="xl" status="away" />}
        title={employee.name}
        subtitle={`${employee.title} · ${employee.team}`}
        status={<Badge tone="success" dot>Active</Badge>}
        facts={[
          { label: "Employee ID", value: <span className="font-mono">HR-0142</span> },
          { label: "Start date", value: f.date("2023-03-01", "medium") },
          { label: "Manager", value: "Ayşe Yılmaz" },
          { label: "Annual leave left", value: "11 days" },
        ]}
        actions={
          <>
            <Button asChild>
              <a href={`mailto:${employee.email}`}>
                <Mail /> Message
              </a>
            </Button>
            <Button variant="primary" onClick={() => toast("Leave request form opened")}>
              <CalendarPlus /> Request leave
            </Button>
          </>
        }
      />

      <RecordMain>
        <Tabs defaultValue="overview">
          <TabsList aria-label="Employee profile sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="time-off" count={1}>Time off</TabsTrigger>
            <TabsTrigger value="documents" count={docs.length}>Documents</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid gap-(--gap)">
            <RecordSection title="Employment" action={<Button size="sm" variant="ghost"><Pencil /> Edit</Button>}>
              <div className="grid gap-6">
                <DescriptionGroup title="Role">
                  <DescriptionList
                    layout="grid"
                    columns={3}
                    items={[
                      { key: "title", label: "Job title", value: employee.title },
                      { key: "dept", label: "Department", value: "Product" },
                      { key: "level", label: "Level", value: "IC4 · Senior" },
                      { key: "type", label: "Contract", value: "Full-time · Permanent" },
                      { key: "hours", label: "Working pattern", value: "Mon–Fri · 40 h/week" },
                      { key: "probation", label: "Probation", value: "Completed Jun 1, 2023" },
                    ]}
                  />
                </DescriptionGroup>
                <DescriptionGroup title="Pay" description="Visible to HR and the line manager only.">
                  <DescriptionList
                    layout="grid"
                    columns={3}
                    items={[
                      { key: "salary", label: "Gross salary", value: f.currency("142000", { currency: "TRY", maximumFractionDigits: 0 }), hint: "per month" },
                      { key: "review", label: "Last review", value: f.date("2026-03-01", "medium"), hint: "+18% adjustment" },
                      { key: "iban", label: "Payroll IBAN", value: "TR33 0006 1005 1978 6457 8413 26", copyable: true, span: 2 },
                    ]}
                  />
                </DescriptionGroup>
              </div>
            </RecordSection>
          </TabsContent>

          <TabsContent value="time-off" className="grid gap-(--gap)">
            <RecordSection title="Leave balance" description="2026 leave year · resets on January 1.">
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {balances.map((b) => (
                  <li key={b.id}>
                    <Progress
                      label={b.label}
                      value={b.used}
                      max={b.entitled}
                      size="md"
                      tone={b.used / b.entitled > 0.8 ? "warning" : "accent"}
                      valueText={`${b.used} of ${b.entitled} days used, ${b.entitled - b.used} left`}
                      showValue={(v, m) => (
                        <span className="tabular">
                          <span className="font-medium text-fg">{m - v}</span>
                          <span className="text-fg-subtle"> / {m} left</span>
                        </span>
                      )}
                      hint={b.note}
                    />
                  </li>
                ))}
              </ul>
            </RecordSection>

            <RecordSection title="Pending request" description="Annual leave · 10 working days">
              <ApprovalFlow
                aria-label="Annual leave, 17–28 November"
                requester={{ name: employee.name, at: "2026-11-03T09:12:00Z", note: "Family trip to Kaş. Handover doc shared with Mert." }}
                stages={leaveStages}
                now={NOW}
              />
            </RecordSection>

            <RecordSection title="History" padding="none">
              <TableContainer aria-label="Leave history">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead numeric>Days</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveHistory.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium text-fg">{l.type}</TableCell>
                        <TableCell className="text-fg-muted">{range(l.from, l.to)}</TableCell>
                        <TableCell numeric>{l.days}</TableCell>
                        <TableCell><Badge tone={l.tone} dot>{l.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </RecordSection>
          </TabsContent>

          <TabsContent value="documents">
            <RecordSection title="Documents" description="Contracts, letters and identity documents. Employees see their own files.">
              <AttachmentList
                items={docs}
                accept=".pdf,.jpg,.png,.docx"
                onPreview={(file) => toast(`Opening ${file.name}`)}
                onRemove={(file) => setDocs((all) => all.filter((d) => d.id !== file.id))}
                onAddFiles={(added) => toast.success(`${added.length} document(s) queued for upload`)}
              />
            </RecordSection>
          </TabsContent>

          <TabsContent value="review">
            <RecordSection title="Year-end review 2026" description="Due December 12 · led by Ayşe Yılmaz">
              <TaskList
                variant="checklist"
                showProgress
                items={review}
                today={TODAY}
                onToggle={(id, done) => setReview((all) => all.map((t) => (t.id === id ? { ...t, done } : t)))}
              />
            </RecordSection>
          </TabsContent>
        </Tabs>
      </RecordMain>

      <RecordAside>
        <RecordAsideSection title="Contact">
          <DescriptionList
            layout="vertical"
            size="sm"
            items={[
              { key: "email", label: "Work email", value: employee.email, copyable: true },
              { key: "phone", label: "Work phone", value: employee.workPhone },
              { key: "location", label: "Location", value: employee.location },
              { key: "tz", label: "Time zone", value: "Europe/İstanbul · UTC+3" },
            ]}
          />
        </RecordAsideSection>
        <RecordAsideSection title="Reports to" collapsible>
          <EntityCard variant="compact" name="Ayşe Yılmaz" subtitle="Head of Design" href="#ayse-yilmaz" />
        </RecordAsideSection>
        <RecordAsideSection title="Direct reports" collapsible>
          <div className="grid gap-2">
            {directReports.map((r) => (
              <EntityCard key={r.name} variant="compact" name={r.name} subtitle={r.role} href={`#${r.name.toLowerCase().replace(/\s+/g, "-")}`} />
            ))}
          </div>
        </RecordAsideSection>
        <RecordAsideSection title="Emergency contact" collapsible defaultOpen={false}>
          <DescriptionList
            layout="vertical"
            size="sm"
            items={[
              { key: "name", label: "Emre Aydın", value: "Partner" },
              { key: "phone", label: "Mobile", value: "+90 532 418 22 90", copyable: true },
            ]}
          />
        </RecordAsideSection>
      </RecordAside>
    </RecordLayout>
  );
}
