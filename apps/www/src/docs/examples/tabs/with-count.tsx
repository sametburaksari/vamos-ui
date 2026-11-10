import { Tabs, TabsList, TabsTrigger } from "@vamos-cms/ui";

export default function TabsWithCount() {
  return (
    <Tabs defaultValue="all">
      <TabsList variant="pill" aria-label="Posts by status">
        <TabsTrigger value="all" count={128}>
          All
        </TabsTrigger>
        <TabsTrigger value="published" count={96}>
          Published
        </TabsTrigger>
        <TabsTrigger value="draft" count={12}>
          Draft
        </TabsTrigger>
        <TabsTrigger value="review" count={3} badgeTone="warning">
          In review
        </TabsTrigger>
        <TabsTrigger value="trash" count={17} disabled>
          Trash
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
