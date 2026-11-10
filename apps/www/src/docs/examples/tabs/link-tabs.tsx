import { TabsLink, TabsLinkList, VamosProvider } from "@vamos-ui/react";

// In your app VamosProvider sits at the root with your router's Link and the current path.
export default function TabsLinkTabs() {
  return (
    <VamosProvider currentPath="/contacts/1042/deals">
      <TabsLinkList aria-label="Contact sections" className="w-full max-w-xl">
        <TabsLink href="/contacts/1042" exact>
          Overview
        </TabsLink>
        <TabsLink href="/contacts/1042/activity">Activity</TabsLink>
        <TabsLink href="/contacts/1042/deals" count={4}>
          Deals
        </TabsLink>
        <TabsLink href="/contacts/1042/files">Files</TabsLink>
      </TabsLinkList>
    </VamosProvider>
  );
}
