import type * as React from "react";
import { Mail, MessageSquare, Phone, StickyNote, Trophy } from "lucide-react";
import {
  ActivityTimeline,
  Avatar,
  Badge,
  Button,
  DescriptionList,
  RecordAside,
  RecordAsideSection,
  RecordHeader,
  RecordMain,
  RecordSection,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TimelineEntry,
} from "@vamos-ui/react";

const now = "2026-11-10T10:00:00Z";
const activity: TimelineEntry[] = [
  { id: "a1", at: "2026-11-10T08:42:00Z", icon: Phone, actor: "Meltem Aydın", title: "logged a call · 14 min", body: "Agreed on the 3-year option if onboarding hours are included." },
  { id: "a2", at: "2026-11-09T15:10:00Z", icon: Mail, actor: "Laura Callahan", title: "replied to “Renewal — revised quote”" },
  { id: "a3", at: "2026-11-07T11:30:00Z", icon: Trophy, tone: "success", actor: "Can Demir", title: "moved Northwind renewal to Proposal" },
  { id: "a4", at: "2026-11-04T09:05:00Z", icon: StickyNote, actor: "Meltem Aydın", title: "added a note", body: "Board meets on December 3 — wants a signed draft before then." },
];

/** Shared contact record used by the Record detail layout examples. */
export function ContactHeader({ pager }: { pager?: React.ReactNode }) {
  return (
    <RecordHeader
      back={{ href: "/crm/contacts", label: "Contacts" }}
      media={<Avatar name="Laura Callahan" size="xl" />}
      title="Laura Callahan"
      subtitle="Head of Operations · Northwind Traders"
      status={<Badge tone="success">Customer</Badge>}
      facts={[
        { label: "Owner", value: "Meltem Aydın" },
        { label: "Stage", value: "Renewal · Proposal" },
        { label: "Lifetime value", value: "$48,500" },
        { label: "Last contact", value: "Today, 11:42" },
      ]}
      actions={
        <>
          <Button>
            <MessageSquare /> Email
          </Button>
          <Button variant="primary">
            <Phone /> Log call
          </Button>
        </>
      }
      pager={pager}
    />
  );
}

export function ContactMain() {
  return (
    <RecordMain>
      <Tabs defaultValue="activity">
        <TabsList aria-label="Contact sections">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="deals" count={2}>
            Deals
          </TabsTrigger>
          <TabsTrigger value="files" count={5}>
            Files
          </TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <RecordSection title="Activity" description="Calls, emails and notes from everyone on the account." action={<Button size="sm">Add note</Button>}>
            <ActivityTimeline items={activity} now={now} groupBy="day" />
          </RecordSection>
        </TabsContent>
        <TabsContent value="deals">
          <RecordSection title="Open deals">
            <DescriptionList
              items={[
                { key: "renewal", label: "Northwind renewal 2027", value: "$36,000 · Proposal" },
                { key: "addon", label: "Analytics add-on", value: "$12,500 · Qualified" },
              ]}
            />
          </RecordSection>
        </TabsContent>
        <TabsContent value="files">
          <RecordSection title="Files">
            <p className="text-sm text-fg-muted">Master services agreement, two signed order forms, the revised quote and a security questionnaire.</p>
          </RecordSection>
        </TabsContent>
      </Tabs>
    </RecordMain>
  );
}

export function ContactAside() {
  return (
    <RecordAside>
      <RecordAsideSection title="Details" action={<Button size="xs" variant="ghost">Edit</Button>}>
        <DescriptionList
          layout="vertical"
          size="sm"
          items={[
            { key: "email", label: "Email", value: "laura.callahan@northwind.example", copyable: true },
            { key: "phone", label: "Phone", value: "+1 (415) 555-0132" },
            { key: "tz", label: "Time zone", value: "San Francisco · UTC−8" },
          ]}
        />
      </RecordAsideSection>
      <RecordAsideSection title="Tags" collapsible>
        <div className="flex flex-wrap gap-1.5">
          <Badge>Enterprise</Badge>
          <Badge>Renewal Q4</Badge>
          <Badge tone="accent">Champion</Badge>
        </div>
      </RecordAsideSection>
      <RecordAsideSection title="Company" collapsible>
        <p className="text-[13px] font-medium">Northwind Traders</p>
        <p className="text-[13px] text-fg-muted">Wholesale food distribution · 420 employees</p>
      </RecordAsideSection>
    </RecordAside>
  );
}
