import { Badge } from "@vamos-ui/react";
import { DocPage, H2 } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Changelog", description: "Release notes for the Vamos UI component kit, blocks, CLI and MCP server.", path: "/docs/changelog/" });

type Kind = "Added" | "Changed" | "Fixed" | "Removed";
interface Release {
  version: string;
  date: string;
  unreleased?: boolean;
  changes: Partial<Record<Kind, string[]>>;
}

/** Newest first. Append new releases at the top. */
const releases: Release[] = [
  {
    version: "0.3.0",
    date: "2026-11-11",
    unreleased: true,
    changes: {
      Added: [
        "53 example websites built only from kit components and site blocks, each with a home page and one to five inner pages, English and Turkish, and its own accent, font, material and density. Open any of them at /view/<name> or add it with `npx vamos-ui add <name>`.",
        "Most searched: online store, photography portfolio, editorial blog, mobile app, medical clinic, real estate agency, conference, online course, personal site and CV, law firm.",
        "Software and tech: AI product, developer tool, changelog, status page, waitlist, help centre.",
        "Community and culture: non-profit, podcast, musician, wedding.",
        "Local and professional services: car service, veterinary clinic, preschool, driving school, removals, florist, photo studio, event venue, therapist, dietitian, physiotherapy, accounting firm.",
        "Commerce, B2B and digital products: manufacturer, packaging wholesaler, construction company, careers site, template shop, coffee subscription box, makers' marketplace, writer's newsletter.",
        "Institutions, education, sport and games: municipality services, university department, sports club, community forum, indie game.",
        "Second design variants for store, portfolio, blog, mobile app, clinic, real estate, SaaS and agency.",
        "SiteShell: one wrapper for a whole website — scoped brand accent (a preset or one colour, contrast-checked), material, density and font, EN / TR switch and inner pages switched with `?page=`.",
        "End-to-end tests for every example site: a smoke pass over all of its pages at 1440 and 390 px plus one test of its signature interaction and the language switch.",
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-11-10",
    unreleased: true,
    changes: {
      Added: [
        "Full component inventory: all 143 planned items across 13 groups now have docs pages, live examples and props tables.",
        "Foundations: Avatar & avatar group, Button Group & Toggle Group, Kbd, Separator, Skeleton, Spinner, Typography.",
        "Forms & inputs: Select, Combobox, Checkbox, Radio Group, Switch, Slider, Input OTP, Tag input, Color picker, Slug input, Formatted inputs (currency, phone, IBAN, ID), Address field, Line items, File upload, Signature pad, Font picker.",
        "Pickers: Date Picker, Date range picker, Time picker, Record picker, User picker, Status picker, Tree select.",
        "Overlays & feedback: Dialog, Alert Dialog, Sheet / Drawer, Popover, Tooltip, Hover Card, Dropdown Menu, Context Menu, Command (⌘K), Toast, Alert, Progress, Empty state, Notification center.",
        "Navigation: Sidebar, Top bar, Tabs, Breadcrumb, Pagination, Navigation Menu, Accordion, Stepper.",
        "Page layouts: App shell, Page header, List layout, Record detail layout, Editor layout, Settings layout, Resizable, Scroll Area.",
        "Data display: Stat / KPI, Table, Data Table, Filter bar, Saved views, Item, Entity card, Description list, Activity timeline, Comment thread & mentions, Attachment list, Task list, Tree view, Version history & diff, Audit log.",
        "Charts: Chart frame, Area, Bar & Bar list, Line, Donut / Pie, Combo (bar + line), Funnel, Gauge & Progress ring, Sparkline, Heatmap.",
        "Calendar & time: Calendar, Agenda / scheduler, Resource calendar, Gantt, Time tracker.",
        "Editors & drag-and-drop: Kanban, Sortable list / tree, Hierarchy chart, Rich text / block editor, Image cropper, Permission matrix.",
        "Flows & wizards: Multi-step form, Approval flow, Import wizard, Export, Setup checklist.",
        "Media: Image, Carousel, Gallery grid, Lightbox, Media library, Media picker, Image field (select, crop, focal point), Video player, Link previews.",
        "Site blocks: Navbar, Hero (5 variants), Feature grid, Logo strip, Stats band, Pricing table, Comparison table, Testimonials, Team, FAQ, Process / steps, CTA, Blog list, Article layout, Page intro, Rich text section, Media + text, Contact form, Map & opening hours, Menu / price list, Gallery section, Announcement bar, Cookie / consent banner, Contact dock, Footer, 404 — plus the Blocks API.",
        "App shell blocks: Icon rail shell, Top navigation shell, Two-level sidebar shell.",
        "Authentication blocks: Sign in with SSO, Sign up with password strength, Forgot & reset password, Magic link sent, Two-step verification, Workspace & app chooser.",
        "Dashboard blocks: Sales, People, Projects & billing and Store dashboards.",
        "List and detail blocks: Posts list, Contacts list, Employee directory, Deals pipeline, CRM contact, Employee profile, Invoice detail, Post editor.",
        "Settings, form and onboarding blocks: Workspace settings, Language, formats & appearance, Users & roles, Leave request, Setup checklist, Welcome wizard.",
        "Empty and error state blocks: No posts yet, Search with no results, Not found in the app, Server error, No permission, Scheduled maintenance.",
        "Marketing and website blocks: Marketing sections, Pricing page, Contact page, and full Restaurant, Spa, Agency and SaaS websites.",
        "Blocks browser with category filters and lazily loaded previews.",
        "Component registry at /r/, the `vamos-ui` CLI and an MCP server for adding components and blocks to a project.",
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-11-10",
    unreleased: true,
    changes: {
      Added: [
        "Design tokens with five axes: theme, material (glass/solid), accent, density and font.",
        "Components: Button, IconButton, Badge, Input, Textarea, Field, Card (with Header, Body, Footer, Inset).",
        "LocaleProvider, useMessages and useFormat with the built-in English dictionary.",
        "Docs site with live preview, code from the real example files, installation tabs and props tables.",
        "Multi-app admin shell demo: Site, CRM, People and Work share one sidebar and top bar.",
        "Plan for ~142 components across 13 groups.",
      ],
      Fixed: ["A light section inside a dark page now gets the light accent values and keeps the glass material."],
    },
  },
];

const tone: Record<Kind, "success" | "info" | "warning" | "danger"> = { Added: "success", Changed: "info", Fixed: "warning", Removed: "danger" };

export default function ChangelogPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Changelog"
      description="Notable changes to Vamos UI. Follows Keep a Changelog and semantic versioning."
      toc={releases.map((r) => ({ id: `v${r.version}`, title: `v${r.version}` }))}
      prev={{ href: "/docs/license", title: "License" }}
    >
      {releases.map((r) => (
        <section key={r.version}>
          <H2 id={`v${r.version}`}>
            <span className="flex items-center gap-3">
              v{r.version}
              <span className="font-mono text-[13px] font-normal text-fg-subtle">{r.date}</span>
              {r.unreleased && <Badge tone="outline">Unreleased</Badge>}
            </span>
          </H2>
          <div className="mt-4 grid gap-5">
            {(Object.keys(r.changes) as Kind[]).map((k) => (
              <div key={k}>
                <Badge tone={tone[k]} size="md">{k}</Badge>
                <ul className="mt-2 grid list-disc gap-1.5 ps-5 marker:text-fg-subtle">
                  {r.changes[k]!.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </DocPage>
  );
}
