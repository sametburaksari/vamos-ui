import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@vamos-ui/react";

// variant="ghost" drops the strip so the bar sits inside your own window header.
export default function MenubarAppWindow() {
  return (
    <div className="surface w-full max-w-2xl overflow-hidden rounded-ui-lg">
      <div className="flex items-center gap-3 border-b border-line px-3 py-1.5">
        <span className="font-mono text-[11px] tracking-[0.08em] text-fg-subtle uppercase">Ledgerline</span>
        <Menubar variant="ghost" aria-label="Ledgerline" size="sm">
          <MenubarMenu>
            <MenubarTrigger>Accounts</MenubarTrigger>
            <MenubarContent>
              <MenubarItem shortcut="mod+shift+a">New account</MenubarItem>
              <MenubarItem>Chart of accounts</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Reconcile Northbank ••4021</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Journal</MenubarTrigger>
            <MenubarContent>
              <MenubarItem shortcut="mod+j">New entry</MenubarItem>
              <MenubarItem>Recurring entries</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Reports</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Profit and loss</MenubarItem>
              <MenubarItem>Balance sheet</MenubarItem>
              <MenubarItem>VAT return · Q3</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger disabled>Payroll</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
        <span className="ms-auto text-[12px] tabular text-fg-subtle">FY 2026</span>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 px-4 py-4 text-[13px]">
        <span className="text-fg-muted">Operating account</span>
        <span className="tabular text-fg">€48,212.40</span>
        <span className="text-fg-muted">Tax reserve</span>
        <span className="tabular text-fg">€9,870.00</span>
      </div>
    </div>
  );
}
