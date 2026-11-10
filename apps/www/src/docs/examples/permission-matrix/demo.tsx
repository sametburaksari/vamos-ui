"use client";

import * as React from "react";
import { PermissionMatrix, type PermissionAction, type PermissionResource, type PermissionValue } from "@vamos-cms/ui/business";

// CMS "Editor" role, boolean actions.
const resources: PermissionResource[] = [
  { id: "posts", label: "Posts", group: "Content" },
  { id: "pages", label: "Pages", group: "Content" },
  { id: "media", label: "Media library", group: "Content", actions: ["view", "create", "delete"] },
  { id: "menus", label: "Menus", group: "Site", actions: ["view", "edit"] },
  { id: "redirects", label: "Redirects", group: "Site", description: "301 / 302 rules" },
];
const actions: PermissionAction[] = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "edit", label: "Edit" },
  { id: "publish", label: "Publish" },
  { id: "delete", label: "Delete", danger: true },
];

export default function PermissionMatrixDemo() {
  const [value, setValue] = React.useState<PermissionValue>({
    posts: { view: true, create: true, edit: true, publish: true },
    pages: { view: true, edit: true },
    media: { view: true, create: true },
    menus: { view: true },
  });
  return (
    <div className="w-full">
      <PermissionMatrix aria-label="Editor permissions" resources={resources} actions={actions} value={value} onValueChange={setValue} dependencies={[{ action: "edit", requires: "view" }, { action: "publish", requires: "edit" }, { action: "delete", requires: "view" }]} />
    </div>
  );
}
