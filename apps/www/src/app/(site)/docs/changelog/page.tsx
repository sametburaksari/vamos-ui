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
    version: "0.4.2",
    date: "2026-11-12",
    changes: {
      Added: [
        "`npx vamos-ui audit <url>` audits a live website over HTTP: redirects, title and description length, canonical, Open Graph, JSON-LD, robots, sitemap, llms.txt and AI crawler policy, placeholder contact details, legal pages, broken internal links and heavy images. Score, `--json` and exit codes for CI. The MCP server has the same check as `audit_site` (public sites only on the hosted server).",
        "`vamos.site.json`: one file for a website's business details, legal ids, analytics ids and AI settings (`npx vamos-ui site init`). `site essentials` builds robots (AI crawlers allowed, blocked or listed), llms.txt, LocalBusiness / FAQ JSON-LD and the legal pages from it, with known [fill-in] fields filled. Nothing defaults to anyone's real data; verify lists the empty fields.",
        "`vamos-ui init` writes the AI assistant rules by default: AGENTS.md, CLAUDE.md, .github/copilot-instructions.md and .cursor/rules/vamos-ui.mdc (existing content kept; `--no-agent` skips them).",
        "ui.vamos.ist/llms.txt, llms-full.txt and a Markdown version of every docs page, component and block.",
        "Corners are a sixth theme axis: `data-radius=\"sharp\"` or `\"round\"` on `<html>` or any subtree (absent = default) scales `--radius` (default 14px / compact 10px, sharp 6px / 4px, round 20px / 14px) and works with every accent, material and density. Everything on `rounded-ui*` or `var(--radius)` follows it (buttons, inputs, selects, cards, dialogs, popovers, menus, tables, square badges, calendars, chart tooltips, site blocks); `rounded-full` pills, avatars, switches, radio dots, slider thumbs and progress bars stay round. ThemeScope and `themeAttributes` take `radius`.",
      ],
      Changed: [
        "Preset codes keep the corner letter but map it to `data-radius` instead of the generated brand accent, so sharp or round corners combine with a named accent (`v1dgokgs` is dark · glass · ocean · compact · grotesk · sharp) and `theme --preset` works without a project. `vamos-ui theme --radius`, `theme.radius` in vamos.json, and `brand apply` saves `brand.theme.radius` there instead of writing `--radius` into brand.css.",
        "The /themes editor's corner control is independent of the accent; the generated brand accent is only used for a custom colour.",
      ],
    },
  },
  {
    version: "0.4.1",
    date: "2026-11-12",
    changes: {
      Added: [
        "Website launch essentials: `npx vamos-ui site essentials` writes robots, sitemap and a page for every legal link in the footer, and runs by itself after `add site-…` in a Next.js App Router project.",
        "Legal page block (legal-01) with template text in English and Turkish: privacy policy, KVKK aydınlatma metni, cookie policy, terms of use, accessibility statement, return and refund policy, distance sales agreement (mesafeli satış sözleşmesi), pre-contract information form (ön bilgilendirme formu) and legal notice (yasal uyarı).",
        "The kit Footer emits Organization JSON-LD (`jsonLd` prop, `footerJsonLd` helper).",
        "Verify: placeholder contact details (000 00 00 phones, wa.me/90500…, .example emails, href=\"#\", invented map links), links to routes with no page, missing robots / sitemap / metadataBase / canonical / Open Graph / JSON-LD, title and meta description length, and images in public/ over 300 KB.",
        "MCP: a website launch checklist in the rules; plan_screen adds it for website screens; verify_design with projectDir runs the project checks.",
        "Block and website labels in German, French, Spanish and Arabic.",
      ],
      Changed: [
        "@vamos-ui/react is tree-shakeable: importing Button ships about 12 KB gzipped instead of the whole kit. Bundle budgets run in CI.",
        "The registry version follows the kit version.",
      ],
    },
  },
  {
    version: "0.4.0",
    date: "2026-11-12",
    changes: {
      Added: [
        "Components: Menubar, Collapsible, AspectRatio and PlaceholderArt (tasteful image placeholders from a seed, for blocks without photos).",
        "Commerce blocks: product detail, cart with mini-cart, one-page checkout (Turkish address fields, card / bank transfer / pay at the door) and order confirmation.",
        "Live theme editor at /themes: every theme axis plus a custom accent with contrast checks, a live preview, a shareable preset code and the matching CLI commands.",
        "CLI: `vamos-ui create` (Next.js or Vite), preset codes (`init --preset`, `theme --preset`, `preset`), an open registry (`add` from a URL, `github:owner/repo/item` or `@namespace/item`), `registry build` for third-party registries, and `mcp add` for Claude Code, Cursor, VS Code, Windsurf, Gemini CLI and Codex.",
        "UI strings in German, French, Spanish and Arabic (RTL), in addition to English and Turkish.",
        "Docs: install guides for Next.js, Vite and React Router; migration guide; accessibility, security, privacy and terms pages; MCP server page; publishing a registry; a full restaurant menu page example.",
        "CI on GitHub (types, unit tests with coverage, registry tests) and badges in the README.",
      ],
      Changed: [
        "/websites lists the example sites; /blocks lists app screens only and drops the domain filter.",
        "Each block preview is its own route, so a preview only loads its own code; the docs server sends compressed files.",
        "Opening hours read naturally in every state (\"Closing soon · open until 01:00\"); headings split over lines keep a real space between lines.",
        "Site blocks pass responsive image sizes, give icon-only links accessible names and meet touch target sizes.",
        "Ocean and rose accents are darker so white button text passes 4.5:1; status colours have text-safe ink variants.",
      ],
      Fixed: [
        "Section rhythm (tight / loose / none) had no effect.",
        "A navbar logo could render at its full image size.",
        "The page container shrank to its content inside flex columns, collapsing grid galleries.",
        "The rich-text editor's image margin leaked onto every kit Image.",
        "Compact currency rendered differently on server and client (hydration error).",
        "Marquee: pause control, and the duplicate track is no longer focusable.",
        "ComboChart ticks around zero; bar series get square legend swatches.",
        "Media library tile names; nav-rail badges in light mode.",
      ],
    },
  },
  {
    version: "0.3.0",
    date: "2026-11-11",
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
        "Motion kit at `@vamos-ui/react/motion` (`npx vamos-ui add motion`): Reveal and Stagger (fade, rise, blur, scale, clip), CountUp, Ticker, TextReveal, Parallax and ScrollProgress, Tilt and Magnetic, PageTransition (View Transitions with a fade fallback), SkeletonSwap, useScrollShrink, MotionScope and the vm-press, vm-lift, vm-underline and vm-nudge micro-interactions. CSS-first, opacity and transform only, no motion library.",
        "Motion never hides server-rendered content that is already on screen, keeps layout shift at zero, follows density for its durations and renders the final state under reduced motion or `data-motion=\"off\"`.",
        "SiteShell `motion` levels (subtle by default, full, off) with page and language switches that transition; the site blocks (Hero, Feature grid, Stats band, Pricing table, Testimonials, FAQ, CTA, Media + text, Steps, Gallery section, Logo strip) and every example site now use them.",
        "App shell blocks: Rail & flyout, Two-level ERP, Store top-nav, Multi-workspace, Field service mobile, Command palette, Support inbox and Page builder shells.",
        "Dashboard blocks: Sales forecast, Team pulse, Orders desk, Cash flow, Support SLA, Project portfolio, Marketing campaigns, Warehouse inventory, SaaS metrics, Realtime analytics and Dispatch console.",
        "Authentication blocks: Two-step verification setup, Passkey sign-in, Single sign-on lookup, Accept team invite, Account locked, Session expired and Sign in with product story.",
        "List blocks: Locations map, Audit log timeline, Bulk price & stock editor, Activity feed, Tree list and Tasks (list, board, calendar).",
        "Detail blocks: Customer 360, Order detail, Employee file, Product information, Quote builder, Support ticket, Project overview, Contract, Partner and Side-by-side compare.",
        "Settings, form and empty-state blocks: Plan & billing, API keys & webhooks, Notification preferences, Integrations marketplace, Security & sessions, Campaign wizard and First run with templates.",
        "Motion rules in the design rules (CLI agent skill, MCP `get_rules`) and motion guidance in the registry.",
        "End-to-end tests for motion (reveal, count-up, page switch, reduced motion, layout shift) and for the new admin blocks.",
      ],
    },
  },
  {
    version: "0.2.0",
    date: "2026-11-10",
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
