import { SetupChecklist } from "@vamos-ui/react/business";

export default function SetupChecklistSidebar() {
  // Compact variant for the app shell sidebar footer: small ring, tighter rows, no estimates.
  return (
    <div className="w-64 rounded-ui-lg border border-line bg-surface p-3">
      <SetupChecklist
        variant="sidebar"
        title="New site setup"
        items={[
          { id: "theme", title: "Choose a theme", status: "done" },
          { id: "logo", title: "Upload your logo", status: "done" },
          { id: "page", title: "Create the first page", status: "todo", action: { label: "New page", href: "#pages/new" } },
          { id: "menu", title: "Set up menus", status: "todo", action: { label: "Open menus", href: "#menus" } },
        ]}
      />
    </div>
  );
}
