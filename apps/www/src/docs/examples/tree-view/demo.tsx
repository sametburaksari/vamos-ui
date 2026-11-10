"use client";

import * as React from "react";
import { FileText, House, Plus } from "lucide-react";
import { Badge, IconButton, TreeView, type TreeNode } from "@vamos-ui/react";

const page = (id: string, label: string, children?: TreeNode[], badge?: React.ReactNode): TreeNode => ({ id, label, children, badge, icon: id === "home" ? <House /> : <FileText /> });

const pages: TreeNode[] = [
  page("home", "Home"),
  page("services", "Services", [page("web", "Web design"), page("seo", "SEO audits"), page("ads", "Google Ads management", undefined, <Badge tone="warning" size="sm">Draft</Badge>)]),
  page("work", "Work", [page("case-dental", "Bosphorus Dental"), page("case-roasters", "Kadıköy Roasters")]),
  page("company", "Company", [page("about", "About"), page("careers", "Careers", [page("job-frontend", "Frontend engineer"), page("job-pm", "Project manager")]), page("contact", "Contact")]),
  page("legal", "Legal", [page("privacy", "Privacy policy"), page("terms", "Terms of service")]),
];

export default function TreeViewDemo() {
  const [selected, setSelected] = React.useState(["careers"]);
  const [opened, setOpened] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-sm gap-2">
      <div className="rounded-ui border border-line bg-surface p-1.5">
        <TreeView
          aria-label="Site pages"
          data={pages}
          defaultExpanded={["services", "company", "careers"]}
          selected={selected}
          onSelectedChange={setSelected}
          onAction={(node) => setOpened(node.label)}
          renderActions={(node) => (
            <IconButton label={`Add page under ${node.label}`} size="xs" variant="ghost" tooltip={false}>
              <Plus />
            </IconButton>
          )}
        />
      </div>
      <p className="text-xs text-fg-muted">{opened ? `Opened “${opened}” in the editor` : "Double-click or press Enter to open a page."}</p>
    </div>
  );
}
