# Admin block fixtures (`blocks/_shared`)

Shared, fictional data for every admin block, so shells, dashboards, lists and detail pages
show the same company, people and numbers. Folders starting with `_` are skipped by
`scripts/gen.mjs` — this is not a block.

```ts
import { orders, orderStatusLabels, useBlockFormat } from "../_shared";
// or one file, to keep a block's Code tab small:
import { tickets } from "../_shared/tickets";

const { t, c, money, ago, f } = useBlockFormat(); // client components
t(orderStatusLabels[o.status]);  // { en, tr } copy → current language
c("Orders", "Siparişler");        // inline copy
money(o.total);                   // "₺12,240.00" / "₺12.240,00"
ago(o.placedAt);                  // "3 hours ago", measured from the fixed NOW
```

## Rules

- **Fictional only.** Brands, people, phones (`+90 216 000 00 xx`), emails and domains
  (`*.example.com`) are invented; IPs are documentation ranges (203.0.113.x, 198.51.100.x,
  192.0.2.x). No real companies or vendors — integrations and carriers are made up too.
- **Fixed clock.** `TODAY = 2026-11-18`, `NOW = 2026-11-18T10:24+03:00`. Use `day(n)`, `at(n, "09:30")`,
  `minutesFromNow(n)`, `month(n)`; never `new Date()` in fixtures. Pass `NOW_MS` to `SlaTimer now`
  and `f.relative(x, { now: NOW_MS })` so server and client render the same text.
- **Money** is `{ amount: "12450.00", currency: "TRY" | "USD" | "EUR" }` — decimal strings, sum with `sum()` / `addDecimal`.
- **Dates**: date-only values are `YYYY-MM-DD`; date-times are ISO with `+03:00`.
- **Copy**: every human-readable field is `L = { en, tr }`; status/enum labels are `…Labels` maps.
- **Avatars**: no photos. `<Avatar name={person.name} />` draws seeded initials, so a person looks
  the same in every block. Product photos are Unsplash ids (`productPhoto(p, 160)`).
- Generated rows use a seeded PRNG (`seeded`, `pick`, `int`, `series`) — deterministic.

## What exists

| File | Exports | Used by (planned) |
|---|---|---|
| `time.ts` | `TODAY`, `NOW`, `NOW_MS`, `day`, `at`, `minutesFromNow`, `month`, `daysBetween` | all |
| `l10n.ts` | `L`, `Lang`, `langOf`, `tx`, `LabelMap` | all |
| `format.ts` | `useBlockFormat()` → `{ f, lang, t, c, money, ago }`; re-exports `useFormat`, `useLocale` | all |
| `money.ts` | `Money`, `m()`, `sum`, `fmtMoney`, decimal helpers | all |
| `random.ts` | `seeded`, `pick`, `int`, `series` | generators |
| `people.ts` | 24 `people` (team, title, city, tz, presence), `me` (Defne Kaya), `teamLabels`, `person(id)`, `teamOf` | shells, assignees, owners |
| `companies.ts` | 16 customer `companies` (industry, plan, MRR, health, owner), 21 `contacts`, label maps | CRM, customer 360, SSO |
| `products.ts` | 14 `products` (variants, stock, reorder point, channel prices, cost), 3 `warehouses`, `stockState`, `productPhoto` | PIM, inventory, bulk edit |
| `orders.ts` | 48 `orders` with lines, VAT, fulfilment steps, carrier + tracking, refunds; 12 `customers`; `checkoutFunnel`, `returnReasons` | dashboard-08, list-04, detail-05 |
| `finance.ts` | 36 `invoices` (AR + AP), `ageingBucket`, 12-month `cashBalance`, `burn` (runway) | dashboard-09, settings-03 |
| `deals.ts` | 32 `deals` across `dealStages`, `repQuota` | dashboard-06, detail-04, detail-08 |
| `tickets.ts` | 30 `tickets` with SLA due times, `queues`, `slaPolicy`, `sampleThread` (reply / internal note / event), `macros`, `csatTrend` | shell-11, dashboard-10, detail-09 |
| `hr.ts` | `employees` (manager chain, leave balance, rating), `leaveRequests`, `openRoles`, `employeeDocuments`, `headcountTrend`, `enps` | dashboard-07, detail-06 |
| `projects.ts` | 6 `projects` (budget/spent, milestones, risks, health), 12 `tasks` | dashboard-11, detail-10, list-13, shell-08 |
| `partners.ts` | 4 `partners` (tier, MDF), `dealRegistrations`, `certifications` | detail-12, shell-08 |
| `events.ts` | 16 `bookings` over the next week, `resources`, 18 `activity` events with field `changes` and IPs | list-06, list-09, list-11, timelines |
| `geo.ts` | `sites` (stores/warehouses), `fieldJobs` + `technicianPositions`, `liveVisitorsByCity`, `istanbulBounds`, `europeBounds` | list-08, dashboard-15/16, shell-09 |
| `metrics.ts` | `dailyRevenue`, `saasMonths` (MRR movements), `cohorts`, `campaigns`, live visitors / pages / sources, `stockMovements` | dashboards 08, 12–15 |
| `account.ts` | `workspaces`, `currentPlan`, `usage`, `paymentMethod`, `apiKeys`, `apiScopes`, `webhookEndpoints`/`Deliveries`, `sessions`, `signInHistory`, `ipAllowList`, `backupCodes`, `totpUri()`, `ssoOrganisations`, `integrations`, `notifyChannels`/`notifyEvents` | auth-*, settings-03…07, shells |

## Kit components added for these blocks

| Component | Import | For |
|---|---|---|
| `QrCode`, `encodeQr`, `qrPath` | `@vamos-ui/react` | auth-2fa-setup-01, tickets, invites |
| `BackupCodes` | `@vamos-ui/react` | auth-2fa-setup-01, settings-07 |
| `SlaTimer`, `slaState` | `@vamos-ui/react` | shell-11, dashboard-10, detail-09, dispatch ETAs |
| `Tour` | `@vamos-ui/react` | onboarding-05 |
| `PinMap` | `@vamos-ui/react` | list-08, dashboard-15, dashboard-16, shell-09 |
| `SignerStatus` | `@vamos-ui/react/business` | detail-08, detail-11 |

Already in the kit — use these rather than rebuilding: `Stepper`, `MultiStepForm` (wizards),
`Timeline` / `ActivityTimeline`, `AuditLog`, `DiffView` / `FieldDiff` / `VersionHistory`,
`SortableTree` (`/sortable`), `Kanban`, `FileUpload` + `MediaLibrary` (`/media`, upload queue),
`ImportWizard` / `ImportMapping` (`/business`, CSV column mapping), `SetupChecklist`,
`PermissionMatrix`, `LineItems`, `SignaturePad`, `Progress tone="auto"` (usage meters),
`SavedViews` / `FilterBar` / `DataTable` (`/data-table`), `Scheduler` / `ResourceCalendar` / `Gantt`
(`/scheduler`), charts (`/charts`: area, bar, line, donut, funnel, gauge, heatmap).
