export type Status = "ready" | "next" | "planned";
export interface InvItem { name: string; status: Status; extra?: boolean; slug?: string }
export interface InvGroup { group: string; items: InvItem[] }

/**
 * Component inventory — grouped by WHAT a component is, not by domain (CMS/CRM/HR).
 * A calendar is the same calendar in a CRM, an HR tool or a CMS.
 * Domain screens (post editor, sales pipeline, leave request…) are not components
 * but "Recipes": built from kit components and documented separately.
 *
 * extra: a Vamos original (business, CMS or site-specific component).
 */
const p = (name: string, extra = false): InvItem => ({ name, status: "planned", extra });
const n = (name: string, extra = false): InvItem => ({ name, status: "next", extra });
const r = (name: string, slug?: string, extra = false): InvItem => ({ name, status: "ready", slug, extra });

export const inventory: InvGroup[] = [
  { group: "Foundations", items: [
    r("Button", "button"), r("Icon Button", "button#icon-button"), n("Button Group"), r("Badge", "badge"),
    n("Kbd"), n("Avatar & avatar group"), n("Separator"), n("Spinner"), n("Skeleton"), n("Typography"),
  ] },
  { group: "Forms & inputs", items: [
    r("Input", "input"), r("Textarea", "input#textarea"), r("Field", "input#field"),
    n("Select"), n("Combobox"), n("Checkbox"), n("Radio Group"), n("Switch"), n("Slider (range)"),
    p("Input OTP"), p("Tag input", true), p("Color picker", true), p("Slug input", true),
    p("Formatted inputs (currency · phone · IBAN · ID)", true), p("Address field", true),
    p("Line items", true), p("File upload", true), p("Signature pad", true), p("Font picker", true),
  ] },
  { group: "Pickers", items: [
    p("Date Picker"), p("Date range picker", true), p("Time picker", true), p("Record picker (relation)", true),
    p("User picker", true), p("Status picker", true), p("Tree select", true),
  ] },
  { group: "Overlays & feedback", items: [
    n("Dialog"), n("Alert Dialog"), n("Sheet / Drawer"), n("Popover"), n("Tooltip"), p("Hover Card"),
    n("Dropdown Menu"), p("Context Menu"), n("Command (⌘K)"), n("Toast"), n("Alert"), n("Progress"),
    n("Empty state"), p("Notification center", true),
  ] },
  { group: "Navigation", items: [
    r("Sidebar (multi-level)", undefined, true), r("Top bar"), n("Tabs"), n("Breadcrumb"), n("Pagination"),
    p("Navigation Menu"), n("Menubar"), p("Accordion"), n("Collapsible"), p("Stepper", true),
  ] },
  { group: "Page layouts", items: [
    p("App shell", true), r("Page header"), p("List layout", true), p("Record detail layout", true),
    p("Editor layout (content + side panel)", true), p("Settings layout", true), p("Resizable"), p("Scroll Area"),
  ] },
  { group: "Data display", items: [
    r("Card", "card"), r("Stat / KPI", undefined, true), n("Table"), n("Data Table"), n("Filter bar", true),
    p("Saved views", true), p("Item / list row"), p("Entity card (person · company · product)", true),
    p("Description list", true), r("Activity timeline", undefined, true),
    p("Comment thread & mentions", true), p("Attachment list", true), p("Task / checklist", true),
    p("Tree view", true), p("Version history & diff", true), p("Audit log", true),
  ] },
  { group: "Charts", items: [
    p("Chart frame", true), r("Area"), n("Bar"), n("Line"), n("Donut / Pie"), p("Combo (bar + line)", true),
    p("Funnel", true), p("Gauge", true), r("Sparkline", undefined, true), p("Heatmap", true),
  ] },
  { group: "Calendar & time", items: [
    p("Calendar"), p("Agenda / scheduler", true), p("Resource calendar (people × days)", true),
    p("Gantt", true), p("Time tracker", true),
  ] },
  { group: "Editors & drag-and-drop", items: [
    p("Kanban", true), p("Sortable list / tree", true), p("Hierarchy chart", true),
    p("Rich text / block editor", true), p("Image cropper", true), p("Permission matrix", true),
  ] },
  { group: "Flows & wizards", items: [
    p("Multi-step form", true), p("Approval flow", true), p("Import wizard", true), p("Export", true),
    p("Setup checklist", true),
  ] },
  { group: "Media", items: [
    n("Image (aspect · blur placeholder)", true), n("Aspect Ratio"), n("Placeholder art", true), n("Carousel"), p("Gallery grid", true), p("Lightbox", true),
    p("Media library", true), p("Media picker", true), p("Image field (select · crop · focal point)", true),
    p("Video player", true), p("Link previews (search · social card)", true),
  ] },
  { group: "Site blocks", items: [
    p("Navbar", true), p("Hero (5 variants)", true), p("Feature grid", true), p("Logo strip", true),
    p("Stats band", true), p("Pricing table", true), p("Comparison table", true), p("Testimonials", true),
    p("Team", true), p("FAQ", true), p("Process / steps", true), p("CTA", true), p("Blog list", true),
    p("Article layout", true), p("Page intro", true), p("Rich text section", true), p("Media + text", true), p("Contact form", true), p("Map & opening hours", true),
    p("Menu / price list", true), p("Gallery section", true), p("Announcement bar", true),
    p("Cookie / consent banner", true), p("Contact dock (WhatsApp · call)", true), p("Footer", true), p("404", true),
  ] },
];

/** Recipes: domain screens built from the kit. */
export const recipes = [
  { area: "CMS", items: ["Post editor", "Media library", "Menu manager", "Comment moderation"] },
  { area: "CRM", items: ["Sales pipeline", "Contact detail", "Quote builder", "Activity feed"] },
  { area: "HR", items: ["Employee directory", "Leave request + approval", "Shift planner", "Org chart"] },
  { area: "PRM / Ops", items: ["Partner portal", "Project gantt", "Timesheet", "Invoice list"] },
  { area: "Shared", items: ["Dashboard", "Settings", "Users & roles", "Sign in / sign up"] },
];
