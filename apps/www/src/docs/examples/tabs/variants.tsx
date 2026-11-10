import { Tabs, TabsList, TabsTrigger } from "@vamos-ui/react";

export default function TabsVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Tabs defaultValue="personal">
        <TabsList variant="underline" aria-label="Employee record">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="open">
        <TabsList variant="pill" size="sm" aria-label="Ticket status">
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="solved">Solved</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="month">
        <TabsList variant="segmented" aria-label="Range">
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="quarter">Quarter</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
