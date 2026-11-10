import { Button, PageHeader, TabsLink, TabsLinkList, VamosProvider } from "@vamos-ui/react";

export default function PageHeaderWithTabs() {
  return (
    <VamosProvider currentPath="/people/payroll/runs">
      <PageHeader
        className="w-full"
        eyebrow="People"
        title="Payroll · November 2026"
        description="42 employees · due Nov 28"
        actions={<Button variant="primary">Run payroll</Button>}
        tabs={
          <TabsLinkList aria-label="Payroll sections">
            <TabsLink href="/people/payroll" exact>
              Overview
            </TabsLink>
            <TabsLink href="/people/payroll/runs" count={3}>
              Runs
            </TabsLink>
            <TabsLink href="/people/payroll/deductions">Deductions</TabsLink>
            <TabsLink href="/people/payroll/reports">Reports</TabsLink>
          </TabsLinkList>
        }
      />
    </VamosProvider>
  );
}
