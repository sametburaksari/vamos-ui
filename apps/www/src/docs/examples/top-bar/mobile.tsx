"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button, Sheet, SheetBody, SheetContent, SheetHeader, TopBar, TopBarActions, TopBarMenuButton, TopBarSearch, TopBarSpacer, TopBarStart, UserMenu } from "@vamos-cms/ui";

/** Below 560px the search collapses to an icon. The menu button shows below 768px (inside App shell it opens the nav sheet). */
export default function TopBarMobile() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-[360px] max-w-full overflow-hidden rounded-ui-lg border border-line">
      <TopBar sticky={false} className="px-3">
        <TopBarStart>
          <TopBarMenuButton className="inline-flex!" onClick={() => setOpen(true)} />
          <span className="font-display text-[17px]">Northwind</span>
        </TopBarStart>
        <TopBarSpacer />
        <TopBarActions>
          <TopBarSearch onOpen={() => {}} />
          <Button size="icon-sm" variant="primary" aria-label="New">
            <Plus />
          </Button>
          <UserMenu name="Ece Demir" email="ece@tuzlaplay.com" items={[{ id: "out", label: "Sign out" }]} />
        </TopBarActions>
      </TopBar>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="start" size="sm">
          <SheetHeader title="Menu" />
          <SheetBody className="text-sm text-fg-muted">App shell renders the sidebar here.</SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
