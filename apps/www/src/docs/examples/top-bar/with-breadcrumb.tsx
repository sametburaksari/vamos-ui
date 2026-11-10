"use client";

import { Share2 } from "lucide-react";
import { Breadcrumb, Button, TopBar, TopBarActions, TopBarSearch, TopBarSpacer, TopBarStart, UserMenu } from "@vamos-cms/ui";

export default function TopBarWithBreadcrumb() {
  return (
    <div className="w-full overflow-hidden rounded-ui-lg border border-line">
      <TopBar sticky={false}>
        <TopBarStart>
          <Breadcrumb
            size="sm"
            items={[
              { label: "CRM", href: "/crm" },
              { label: "Companies", href: "/crm/companies" },
              { label: "Northwind Traders" },
            ]}
          />
        </TopBarStart>
        <TopBarSpacer />
        <TopBarSearch className="max-w-56" placeholder="Search CRM…" onOpen={() => {}} />
        <TopBarActions>
          <Button size="sm" variant="ghost">
            <Share2 /> Share
          </Button>
          <UserMenu name="Mert Aydın" email="mert@lenaspa.com" items={[{ id: "out", label: "Sign out" }]} />
        </TopBarActions>
      </TopBar>
    </div>
  );
}
