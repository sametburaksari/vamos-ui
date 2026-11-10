# Vamos UI — screen recipes

Each recipe names the block to start from, the components it is built with and the decisions that make it right. Install the block with `npx vamos-ui add <block>`, then adapt content and columns to the real domain. Imports below use package mode (`@vamos-ui/react`); in copy mode replace it with the `importAlias` from vamos.json (e.g. `@/components/vamos`, `@/components/vamos/data-table`). Read props with MCP `get_item` / `npx vamos-ui view <name>` before writing code; the snippets show structure, not every prop.

## 0. Every app screen: the shell

- **Start from:** `shell-01` (multi-app sidebar, default), `shell-02` (icon rail for dense tools), `shell-03` (top navigation for portals and small apps), `shell-04` (app tiles + menu for team workspaces).
- **Built with:** `app-shell` (`AppShell`, `AppShellProvider`, `AppDefinition` nav data), `sidebar`, `top-bar`, `command` (⌘K), `notification-center`, `toast` (`Toaster`).
- **Decisions:** one `AppDefinition` per app drives the sidebar, the ⌘K "Go to" commands and the mobile sheet. Pass your router's `Link` through the provider. Every page inside starts with `PageHeader` (the one h1). Compact density suits back office.

## 1. CRM list (contacts, companies, deals, invoices)

- **Start from:** `list-02` (people with avatars, owner, tags), `list-01` (content/records with status and bulk publish), `list-03` (directory with a cards/table switch), `board-01` when the work is moving records through stages.
- **Built with:** `list-layout` (`ListLayout`, `ListContent`), `page-header`, `data-table` (`DataTable`, `DataTableToolbar`, `DataTableSavedViews`, `DataTableSearch`, `DataTableFilterBar`, `DataTableViewOptions`, `DataTableExport`, `DataTableContent`, `DataTableFooter`), `saved-views`, `filter-bar`, `badge`, `avatar`, `dropdown-menu` (row actions), `toast` (Undo), `empty-state` / `empty-02` (no results), `import-wizard` and `export` for data in and out.
- **Decisions:**
  - One primary action in the page header (New contact); Import is secondary.
  - Row actions in a ⋯ menu; destructive bulk actions confirm (`alert-dialog`) or offer Undo in a toast.
  - Lifecycle/status as `Badge` with text; owners as `Avatar` + name.
  - Default sort by last activity; 25 rows per page; saved views for the 3–5 views people actually use.
  - Empty collection → `empty-01`; search with no match → `empty-02`.

```tsx
import { Badge, Button, ListContent, ListLayout, PageHeader } from "@vamos-ui/react";
import { DataTable, DataTableContent, DataTableFilterBar, DataTableFooter, DataTableSavedViews, DataTableSearch, DataTableToolbar, DataTableViewOptions, DataTableExport } from "@vamos-ui/react/data-table";

<ListLayout width="wide">
  <PageHeader title="Contacts" meta={<Badge tone="outline">{rows.length}</Badge>}
    actions={<><Button>Import CSV</Button><Button variant="primary">New contact</Button></>} />
  <ListContent>
    <DataTable caption="Contacts" columns={columns} data={rows} getRowId={(r) => r.id} selectable bulkActions={bulk} rowActions={rowActions}>
      <DataTableToolbar>
        <DataTableSavedViews views={views} />
        <DataTableSearch placeholder="Search name, email or company…" />
        <DataTableFilterBar facets={facets} />
        <DataTableViewOptions /><DataTableExport />
      </DataTableToolbar>
      <DataTableContent />
      <DataTableFooter />
    </DataTable>
  </ListContent>
</ListLayout>
```

## 2. Record detail (contact, employee, invoice, project)

- **Start from:** `detail-01` (CRM contact/company), `detail-02` (employee with approvals), `detail-03` (invoice/quote/order with line items).
- **Built with:** `record-detail-layout` (`RecordLayout`, `RecordHeader`, `RecordPager`, `RecordMain`, `RecordSection`, `RecordAside`, `RecordAsideSection`), `tabs`, `description-list`, `activity-timeline`, `comment-thread`, `task-list`, `attachment-list`, `entity-card` (related company, colleagues), `status-picker`, `approval-flow`, `line-items` (read-only on detail).
- **Decisions:**
  - The record name is the h1 in `RecordHeader`; key facts (owner, stage, value) beside it; previous/next pager for list context.
  - Main column: tabs (Overview, Activity, Files…), with the next step (tasks) first. Side column: identity and relations.
  - Status changes inline with `StatusPicker`, not a separate edit form. Quick edits in a `Sheet`; full edits on their own page.
  - Money and dates via `useFormat()`; empty fields show "Not set", not blanks.

## 3. Settings

- **Start from:** `settings-01` (workspace/account settings with danger zone), `settings-02` (language, formats and appearance), `users-roles-01` (members, invites, permission matrix).
- **Built with:** `settings-layout` (`SettingsLayout`, `SettingsNav`, `SettingsSection`, `SettingsRow`, `SettingsSaveBar`), `input`, `select`, `switch`, `radio-group`, `tag-input`, `image-field`, `address-field`, `alert-dialog` (typed confirmation), `permission-matrix`, `font-picker`, `color-picker`.
- **Decisions:**
  - Label | control rows with a description that explains the consequence ("Changing it breaks bookmarks; old links redirect for 90 days").
  - `Switch` only for settings that apply immediately; everything else saves through the sticky save bar (⌘S) that appears with unsaved changes.
  - Danger zone last, destructive buttons `variant="danger"`, typed confirmation for irreversible actions.
  - Comfortable density; one column of rows, not a card per field.

## 4. Authentication

- **Start from:** `login-01` (split sign-in), `login-02` (SSO first), `signup-01` (trial sign-up with password strength), `forgot-password-01`, `magic-link-01`, `otp-01` (2FA), `select-workspace-01` (after sign-in for multi-tenant apps).
- **Built with:** `card`, `input` (`Field`, `Input`), `button`, `checkbox`, `separator` (the "or"), `alert` (attempt-limit and errors), `input-otp`, `progress` (strength meter), `spinner`.
- **Decisions:**
  - One column, one primary action (Sign in). SSO buttons are secondary and name the provider.
  - Correct `autocomplete` tokens (`email`, `current-password`, `new-password`, `one-time-code`); show/hide password is a labelled button.
  - Errors say what to do ("Wrong email or password. 2 attempts left before a 15-minute lock."), never only red borders.
  - No app shell on these screens; no marketing hero.

## 5. Dashboard

- **Start from:** `dashboard-01` (CMS/site), `dashboard-02` (sales), `dashboard-03` (people/HR), `dashboard-04` (projects and billing), `dashboard-05` (store), `onboarding-01` while the workspace is still being set up.
- **Built with:** `page-header`, `stat` (`Stat`, `StatGroup`), `sparkline`, charts from the charts subpath (`area-chart`, `bar-chart` incl. `BarList`, `line-chart`, `donut-chart`, `funnel`, `gauge`, `heatmap`, `combo-chart` via the `chart` frame), `card`, `table`, `item`, `activity-timeline`, `button-group` (`ToggleGroup` for 7/30/90 days), `progress`.
- **Decisions:**
  - Lead with 3–5 KPIs that drive decisions, each with a delta in words and a previous-period comparison. Not 12 vanity tiles.
  - One highlighted series (`chart-1`, the accent); the rest neutral or categorical tokens.
  - Each widget answers one question and has a heading and a link to the full list.
  - Prefer `BarList` and tables over pies; `DonutChart` only for ≤ 6 parts of a whole.
  - Loading with `Skeleton` in the final shape; empty widgets explain how to get data in.

## 6. Landing page and websites

- **Start from:** `site-saas-01` (SaaS product), `site-agency-01` (agency/studio), `site-restaurant-01`, `site-spa-01` (local business), `page-pricing-01`, `page-contact-01`; compare section variants in `sections-01`.
- **Built with (site blocks subpath):** `navbar`, `announcement-bar`, `hero`, `logo-strip`, `feature-grid`, `media-text`, `stats-band`, `steps`, `testimonials`, `team`, `pricing-table`, `comparison-table`, `menu-list`, `gallery-section`, `faq`, `map-hours`, `contact-form`, `contact-dock`, `cta`, `blog-list`, `article-layout`, `page-intro`, `rich-text-section`, `footer`, `consent-banner`, `not-found`; the `blocks-api` primitives for new sections.
- **Decisions:**
  - Pick one hero character for the sector (editorial, split media, full bleed, product, statement); one h1 per page.
  - Card-less sections: hairlines, whitespace and real photos; numbers in `StatsBand` must be concrete and sourced.
  - One conversion per page: Book a table, Get a quote, Start a trial. Local businesses add `ContactDock` (Call · Directions · WhatsApp).
  - Server components by default; only islands ship JS. Maps and video sit behind `ConsentGate`; `ConsentBanner` when analytics run.
  - Footer carries legal company details where e-commerce law requires them.

## 7. Forms and flows

- **Start from:** `form-01` (multi-step request with approval), `onboarding-02` (welcome wizard), `editor-01` (CMS editor).
- **Built with:** `multi-step-form`, `stepper`, `input` (`Field`), `formatted-input`, `date-range-picker`, `user-picker`, `record-picker`, `combobox`, `select`, `radio-group`, `checkbox`, `file-upload`, `approval-flow`, `editor-layout`, `block-editor`, `slug-input`, `image-field`, `link-previews`.
- **Decisions:** short forms stay on one page; long ones split into 3–5 steps with per-step validation, an error summary and a review step (`DescriptionList`). Choose the control by option count: ≤ 5 → `RadioGroup`, 6–10 → `Select`, > 10 or searchable → `Combobox`, records → `RecordPicker` / `UserPicker`.

## 8. Empty, error and access states

- **Start from:** `empty-01` (first run), `empty-02` (no results), `error-404-01` (in-app 404), `error-500-01` (error.tsx), `no-access-01`, `maintenance-01`; websites use the `not-found` site block.
- **Built with:** `empty-state`, `alert`, `button`, `item` (recent links), `setup-checklist`.
- **Decisions:** say what happened and why in a sentence title, offer one next step, keep the shell and navigation visible inside the app, and give support an error ID to copy.
