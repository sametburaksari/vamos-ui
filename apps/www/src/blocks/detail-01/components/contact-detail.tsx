"use client";

import * as React from "react";
import { Mail, Phone, Plus } from "lucide-react";
import {
  ActivityTimeline,
  AttachmentList,
  Avatar,
  Badge,
  Button,
  CommentThread,
  DescriptionList,
  EntityCard,
  Progress,
  RecordAside,
  RecordAsideSection,
  RecordHeader,
  RecordLayout,
  RecordMain,
  RecordPager,
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
  type CommentData,
  type TaskData,
} from "@vamos-ui/react";
import { activity, colleagues, comments as initialComments, contact, deals, files as initialFiles, me, NOW, tasks as initialTasks, TODAY } from "./data";

/** CRM contact record: header facts, next steps, tabbed history, account context aside. */
export function ContactDetail() {
  const f = useFormat();
  const [index, setIndex] = React.useState(3);
  const [tasks, setTasks] = React.useState<TaskData[]>(initialTasks);
  const [comments, setComments] = React.useState<CommentData[]>(initialComments);
  const [files, setFiles] = React.useState<AttachmentData[]>(initialFiles);

  const openPipeline = deals.filter((d) => d.stage !== "Won").reduce((sum, d) => sum + d.amount, 0);

  return (
    <RecordLayout className="mx-auto max-w-[1280px]">
      <RecordHeader
        back={{ href: "/crm/contacts", label: "Contacts" }}
        media={<Avatar name={contact.name} size="xl" status="online" />}
        title={contact.name}
        subtitle={`${contact.role} · ${contact.company}`}
        status={<Badge tone="success" dot>Customer</Badge>}
        facts={[
          { label: "Owner", value: "Meltem Aydın" },
          { label: "Open pipeline", value: f.currency(openPipeline, { currency: "USD", maximumFractionDigits: 0 }) },
          { label: "Lifetime value", value: f.currency(48500, { currency: "USD", maximumFractionDigits: 0 }) },
          { label: "Last contact", value: "Today, 11:42" },
        ]}
        actions={
          <>
            <Button asChild>
              <a href={`mailto:${contact.email}`}>
                <Mail /> Email
              </a>
            </Button>
            <Button variant="primary" onClick={() => toast.success("Call logged for Laura Callahan")}>
              <Phone /> Log call
            </Button>
          </>
        }
        pager={<RecordPager index={index} total={128} onPrevious={() => setIndex((i) => i - 1)} onNext={() => setIndex((i) => i + 1)} />}
      />

      <RecordMain>
        <RecordSection title="Next steps" description="Open follow-ups across the Northwind account.">
          <TaskList
            items={tasks}
            today={TODAY}
            sortCompleted
            onToggle={(id, done) => setTasks((all) => all.map((t) => (t.id === id ? { ...t, done } : t)))}
            onAdd={(title) => setTasks((all) => [...all, { id: `t${all.length + 1}_${title.length}`, title, done: false, assignee: me }])}
            onEdit={(id, patch) => setTasks((all) => all.map((t) => (t.id === id ? { ...t, ...patch } : t)))}
            onRemove={(id) => setTasks((all) => all.filter((t) => t.id !== id))}
          />
        </RecordSection>

        <Tabs defaultValue="activity">
          <TabsList aria-label="Contact history">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="comments" count={comments.length}>Comments</TabsTrigger>
            <TabsTrigger value="files" count={files.length}>Files</TabsTrigger>
            <TabsTrigger value="deals" count={deals.length}>Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <RecordSection title="Activity" description="Calls, emails, meetings and notes from everyone on the account." action={<Button size="sm"><Plus /> Add note</Button>}>
              <ActivityTimeline items={activity} now={NOW} groupBy="day" />
            </RecordSection>
          </TabsContent>

          <TabsContent value="comments">
            <RecordSection title="Internal comments" description="Only your team sees these. Mention someone with @.">
              <CommentThread
                comments={comments}
                currentUserId={me.id}
                currentUser={me}
                now={NOW}
                onSubmit={({ body, parentId }) => setComments((c) => [...c, { id: `c${c.length + 1}`, author: me, body, parentId, createdAt: new Date().toISOString() }])}
                onEdit={(id, body) => setComments((c) => c.map((x) => (x.id === id ? { ...x, body, editedAt: new Date().toISOString() } : x)))}
                onDelete={(id) => setComments((c) => c.filter((x) => x.id !== id))}
                onResolve={(id, resolved) => setComments((c) => c.map((x) => (x.id === id ? { ...x, resolved, resolvedBy: resolved ? me.name : undefined } : x)))}
              />
            </RecordSection>
          </TabsContent>

          <TabsContent value="files">
            <RecordSection title="Files" description="Contracts, quotes and decks shared with Northwind.">
              <AttachmentList
                items={files}
                onPreview={(file) => toast(`Opening ${file.name}`)}
                onRemove={(file) => setFiles((all) => all.filter((x) => x.id !== file.id))}
                onAddFiles={(added) => toast.success(`${added.length} file(s) queued for upload`)}
              />
            </RecordSection>
          </TabsContent>

          <TabsContent value="deals">
            <RecordSection title="Deals" padding="none" action={<Button size="sm"><Plus /> New deal</Button>}>
              <TableContainer aria-label="Deals with Laura Callahan">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="max-md:hidden">Close date</TableHead>
                      <TableHead numeric>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div className="font-medium text-fg">{d.name}</div>
                          <Progress aria-label={`${d.name} win probability`} value={d.probability} size="xs" className="mt-1.5 max-w-32" />
                        </TableCell>
                        <TableCell><Badge tone={d.tone} dot>{d.stage}</Badge></TableCell>
                        <TableCell className="text-fg-muted max-md:hidden">{d.close}</TableCell>
                        <TableCell numeric>{f.currency(d.amount, { currency: "USD", maximumFractionDigits: 0 })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </RecordSection>
          </TabsContent>
        </Tabs>
      </RecordMain>

      <RecordAside>
        <RecordAsideSection title="Details" action={<Button size="xs" variant="ghost">Edit</Button>}>
          <DescriptionList
            layout="vertical"
            size="sm"
            items={[
              { key: "email", label: "Email", value: contact.email, copyable: true },
              { key: "phone", label: "Phone", value: contact.phone, copyable: true },
              { key: "tz", label: "Time zone", value: "San Francisco · UTC−8" },
              { key: "source", label: "Source", value: "Referral · Harbor Logistics" },
            ]}
          />
        </RecordAsideSection>
        <RecordAsideSection title="Company" collapsible>
          <EntityCard
            kind="organization"
            variant="compact"
            name={contact.company}
            subtitle="Wholesale food distribution · 420 employees"
            href="#northwind-traders"
            stats={[
              { label: "Contacts", value: 9 },
              { label: "Open deals", value: 2 },
            ]}
          />
        </RecordAsideSection>
        <RecordAsideSection title="Also at Northwind" collapsible>
          <div className="grid gap-2">
            {colleagues.map((c) => (
              <EntityCard key={c.name} variant="compact" name={c.name} subtitle={c.role} contact={{ email: c.email }} href={`#${c.name.toLowerCase().replace(/\s+/g, "-")}`} />
            ))}
          </div>
        </RecordAsideSection>
        <RecordAsideSection title="Tags" collapsible>
          <div className="flex flex-wrap gap-1.5">
            <Badge>Enterprise</Badge>
            <Badge>Renewal Q4</Badge>
            <Badge tone="accent">Champion</Badge>
          </div>
        </RecordAsideSection>
      </RecordAside>
    </RecordLayout>
  );
}
