import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-cms/ui";

const activity = [
  { when: "Today, 09:42", what: "Call with Laura Callahan — renewal scope agreed" },
  { when: "Yesterday", what: "Proposal v3 sent to procurement" },
  { when: "Nov 4", what: "Meeting: quarterly business review" },
];

export default function TabsDemo() {
  return (
    <Tabs defaultValue="activity" className="w-full max-w-xl">
      <TabsList aria-label="Northwind Traders">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="deals" count={4}>
          Deals
        </TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-fg-muted">
        Wholesale food distributor · 240 employees · Account owner: Andrew Fuller
      </TabsContent>
      <TabsContent value="activity">
        <ul className="divide-y divide-line text-sm">
          {activity.map((a) => (
            <li key={a.what} className="flex gap-4 py-2.5">
              <span className="w-24 shrink-0 tabular text-fg-subtle">{a.when}</span>
              <span className="text-fg">{a.what}</span>
            </li>
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="deals" className="text-sm text-fg-muted">
        4 open deals · $184,500 weighted pipeline
      </TabsContent>
      <TabsContent value="files" className="text-sm text-fg-muted">
        Master services agreement.pdf, Price list 2027.xlsx
      </TabsContent>
    </Tabs>
  );
}
