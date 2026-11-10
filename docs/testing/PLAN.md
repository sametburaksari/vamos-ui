# Vamos UI — test plan

Owner: test planner (orchestrated). Applies to every agent that builds a component, block or recipe, and to the QA agents that review them. Where this plan and a group plan (`docs/plan/0X-*.md`) disagree on testing, this plan wins; for behaviour, the group plan and `docs/plan/README.md` §1 (X1–X12) win.

---

## 1. Layers

| Layer | Tool | Where | Runs on | What it proves |
|---|---|---|---|---|
| Unit | vitest | `packages/ui/src/**/<slug>.test.tsx`, `src/lib/*.test.ts`, `src/format/*.test.ts` | jsdom | pure logic (format, text, date, checksums, reducers, schema) |
| Interaction | vitest + Testing Library + user-event | next to the component | jsdom | roles, states, keyboard map, controlled/uncontrolled, callbacks |
| A11y (unit) | vitest-axe via `expectNoA11yViolations()` | same file | jsdom | ARIA structure, names, labels (no contrast: jsdom has no layout) |
| Property | fast-check | `*.prop.test.ts` next to the module | node | invariants over random input (§3) |
| E2E smoke | Playwright (channel `chrome`) | `apps/www/e2e/*.spec.ts` | docs dev server :3200 | every docs page and block loads, 200, no console errors, in 4 themes |
| A11y (page) | `@axe-core/playwright` via `seriousA11y()` | `apps/www/e2e` | real Chrome | serious/critical rules incl. landmarks, name/content match, contrast (§6) |
| Visual review | Playwright screenshots + checklist §7 | `apps/www/e2e/visual.spec.ts` (M0 exit) | real Chrome | house style, all 5 axes, RTL, mobile |
| Performance | Lighthouse + bundle check §8 | `apps/www/e2e/perf.spec.ts` + `next build` output | prod build | site-block budgets |

Commands:

```bash
cd ~/CascadeProjects/vamos-ui/packages/ui && npx vitest run src/components/<slug>     # one component
cd ~/CascadeProjects/vamos-ui/packages/ui && npx vitest run                           # everything
cd ~/CascadeProjects/vamos-ui/apps/www && npx playwright test                          # e2e (needs :3200)
cd ~/CascadeProjects/vamos-ui/apps/www && npx playwright test -g "dark-glass"          # one theme cell
```

## 2. Helpers (use these, do not re-invent)

`packages/ui/test/utils.tsx`

| Helper | Use |
|---|---|
| `renderWithProviders(ui, { locale, messages, timeZone, currency, dir, theme })` | Render inside `LocaleProvider` → `VamosProvider` → `ThemeScope` (each only if the package exports it; until `ThemeScope` exists a `div` with the `data-*` axes is used). Returns RTL result + `user` (userEvent). |
| `expectNoA11yViolations(container = document.body)` | axe with contrast + region off. Default target is `body` so portalled popovers/dialogs are scanned — **open the layer first**, then call it. |
| `keys.*`, `press(user, key, n)` | WAI-ARIA key names (`keys.down`, `keys.home`, `keys.shiftTab`…). |
| `tabOrder(user, n)` | Focus order as accessible names. |
| `expectRovingFocus(items)` | Exactly one `tabIndex=0`, and it has focus. |
| `expectFocusReturned(trigger)` | Focus restored after a layer closes. |
| `expectFocusRing(el)` | Element carries `focus-ring`/`focus-visible` styling hook. |

`test/vitest-axe.d.ts` makes `toHaveNoViolations()` type-check under vitest 5.

`apps/www/e2e/helpers.ts`

| Helper | Use |
|---|---|
| `THEME_MATRIX` | light/dark × glass/solid (4 cells). |
| `setTheme(page, axes)` | Seeds `localStorage["vamos-theme"]` via `addInitScript` before the boot script runs. Call before `goto`. |
| `readTheme(page)` | Axes actually applied to `<html>`. |
| `collectConsoleErrors(page, ignore?)` | Live array of `pageerror` + `console.error` (HMR noise filtered); `.stop()` detaches. |
| `componentPages(page)` / `blockPages(page)` | Hrefs from `/docs/components` and `/blocks`. |
| `visitAllComponentPages(page, { blocks, theme, onPage })` | Visits all, asserts visible `h1`, returns `{ href, status, errors }[]`. Use `onPage` for axe or screenshots. |
| `seriousA11y(page, disable?)` | Serious/critical axe violations as `"rule: n [targets]"`. |

## 3. Property tests (fast-check)

Each module below ships a `*.prop.test.ts`. Use `fc.assert(fc.property(...), { numRuns: 500 })`; seed is printed on failure — paste it into the report.

| Module | Owner | Properties |
|---|---|---|
| `lib/text.ts` `foldText` | 01 | idempotent `fold(fold(s)) = fold(s)`; **length-preserving** per char (highlight ranges map 1:1); tr: `fold("İ") = fold("i")`, `fold("I") = fold("ı")` in `tr`, not in `en`; `fold` of ASCII lowercase is identity. |
| `matchText` / `highlightText` | 01 | if `matchText(q, s)` then highlight ranges are non-empty, sorted, non-overlapping, within `[0, s.length]`; empty query matches all. |
| `compareText` | 01 | antisymmetric, transitive (sort with it is stable vs `Intl.Collator(locale)`). |
| `slugify` | 01/03 | output matches `/^[a-z0-9]+(-[a-z0-9]+)*$/` or `""`; idempotent; `slugify("Çağrı İş") = "cagri-is"`. |
| `format` money/decimal | 03 | `parseNumber(format(x, locale), locale) = x` for decimal strings with ≤ fraction digits, in `en-US`, `tr-TR`, `de-DE`; never returns a float string with binary noise (`0.1+0.2`); negative/zero/large (`1e15`) survive. |
| `format` time ranges, reading time | 03/06 | reading time monotonic in word count; range `start ≤ end` else throws/normalises consistently. |
| date math (`lib/date.ts`, `locale-data`) | 01/04 | `addDays(d, n)` then `addDays(-n)` round-trips on `YYYY-MM-DD` across DST (Europe/Istanbul, America/New_York) — never `toISOString()` (X11); `countWorkingDays(a, b)` ≤ calendar days and additive over split ranges; week start from `weekInfo` is stable. |
| recurrence / scheduler | 04 | expansions are sorted, unique, inside the window, count ≤ `COUNT`. |
| IBAN mod-97 | 01/04 | generate valid IBANs (random BBAN + computed check digits) → `valid`; any single-digit substitution or adjacent transposition → `invalid`; spacing/case does not change the result; TR length 26 enforced. |
| TCKN | 01/04 | generator builds d10/d11 from 9 random digits (`d1 ≠ 0`) → valid; single-digit change → invalid; all-same-digit → invalid; `99…` reported as `tr-ykn`. |
| VKN | 01/04 | generator per plan 04 §2 → valid; single-digit change → invalid. |
| Line item totals (`computeTotals`) | 01/04 | sum of line totals = subtotal; rounding per pack is order-independent; withholding ≤ tax; all decimal strings. |
| Block schema (`blocks/schema`) | 06 | `parse(serialize(node)) = node`; `migrate` from every older `version` reaches current and validates; `localize(doc, locale)` never drops a block id. |
| URL list-state serializer | 03 | `parse(serialize(state)) = state` for arbitrary sort/filter/page. |
| Fonts registry (`fonts`) | 01 | every font id unique; every entry has a category and a fallback stack; generated Google Fonts URL contains each requested family once and only requested weights. |

## 4. Per-group checklist

Every component test file must cover **all** of the base items plus its group's items. Keyboard rows are the WAI-ARIA APG pattern; test each key listed.

### Base (every component)
- [ ] Renders with defaults; `className` merges (custom class present, base classes kept).
- [ ] `ref` reaches the DOM node; `asChild` (where offered) renders the child element.
- [ ] Controlled (`value` + `onValueChange` — value does not change without parent) **and** uncontrolled (`defaultValue`).
- [ ] Each variant/size from the spec renders (one `it.each`).
- [ ] States: disabled (not focusable or `aria-disabled`, no callbacks), loading (`aria-busy`), error/invalid (`aria-invalid`, message linked via `aria-describedby`), empty, read-only.
- [ ] Built-in strings: English default; `labels` prop overrides; `messages` via `renderWithProviders({ messages })` overrides; prop beats dictionary (X1).
- [ ] `locale: "tr-TR"` renders numbers/dates with Intl (e.g. `1.234,56`) — no hard-coded formatting.
- [ ] `dir: "rtl"`: no physical-direction classes in output (`ml-`, `mr-`, `left-`, `right-`, `pl-`, `pr-` → test with a regex on `container.innerHTML`).
- [ ] Icon-only controls have an accessible name; decorative icons `aria-hidden`.
- [ ] Focus visible: interactive root carries `focus-ring`.
- [ ] No raw colours / `dark:` in class output (regex `/(#[0-9a-f]{3,8}|rgb\(|dark:)/i`).
- [ ] `expectNoA11yViolations()` in default state **and** in the opened/expanded/error state.

### Foundations (Button, Icon Button, Button Group, Badge, Kbd, Avatar, Separator, Spinner, Skeleton, Typography)
- Button: `Enter` and `Space` activate; `loading` → disabled + `aria-busy`; `asChild` link keeps `href`.
- Icon Button: name required (TS) and present; tooltip text = accessible name.
- Button Group: `role="group"` + label; toggle variant `aria-pressed`.
- Avatar: image fails → initials (via `lib/text` initials, tr-safe); group "+N" has a name ("3 more").
- Spinner/Skeleton: `role="status"` / `aria-hidden` per spec; reduced motion stops animation (class check).
- Separator: decorative vs semantic (`role="separator"` + `aria-orientation`).

### Forms & inputs (Input, Textarea, Field, Select, Combobox, Checkbox, Radio, Switch, Slider, OTP, Tag, Color, Slug, Formatted, Address, Line items, File upload, Signature)
- Field: label → control `for/id`; hint + error both in `aria-describedby` **and the child's own describedby is kept** (README §2 bug); required marker + `aria-required`.
- Select (APG select-only combobox): `Enter/Space/↓/↑` open; `↑/↓` move; `Home/End`; typeahead **folds tr** (`i` finds "İstanbul"); `Esc` closes and returns focus; selected has `aria-selected`.
- Combobox (APG combobox + listbox): typing filters via `foldText`; `↓` opens/moves, `↑`, `Enter` selects, `Esc` clears/closes, `aria-activedescendant` tracks; multi: `Backspace` on empty input removes last chip; creatable shows "Create “x”"; async: loading + error + retry announced (`aria-live`).
- Checkbox: `Space` toggles; `indeterminate` → `aria-checked="mixed"`. Radio Group: arrows move **and** select, roving tabindex (`expectRovingFocus`), `Tab` leaves group. Switch: `role="switch"`, `Space`/`Enter`.
- Slider: `←/→/↑/↓` step, `PageUp/PageDown` big step, `Home/End` min/max; `aria-valuetext` formatted; range thumbs cannot cross.
- OTP: paste fills all; `Backspace` moves back; `autocomplete="one-time-code"`.
- Tag input: `Enter`/`,` adds, paste splits, dedupe folds, `Backspace` removes, live region announces add/remove.
- Formatted inputs: caret position preserved while typing (assert `selectionStart`), value emitted is locale-free (decimal string / E.164 / compact IBAN), invalid shown on blur, `inputMode` correct, `dir="ltr"` in RTL.
- Line items: add/remove/reorder rows by keyboard; totals match `computeTotals`; money as strings.
- File upload: keyboard-activatable drop zone; rejects by type/size with localised message; progress `role="progressbar"`.

### Pickers (Date, Date range, Time, Record, User, Status, Tree select)
- Calendar grid (APG date picker dialog): arrows ±1 day/week, `PageUp/PageDown` ±month, `Shift+PageUp/Down` ±year, `Home/End` week start/end (from `weekInfo`), `Enter` selects, `Esc` closes → focus to trigger.
- Value is `YYYY-MM-DD`; test with `TZ` set to `Europe/Istanbul` (`process.env.TZ` in the file) that selecting a day emits that day (X11).
- Range: second click before first swaps; hover preview; min/max/disabled days not selectable.
- Record/User/Status picker: async search debounced (fake timers), empty + error states, keyboard as Combobox.
- Tree select (APG tree): `→` expand/child, `←` collapse/parent, `*` expand siblings, typeahead.

### Overlays & feedback (Dialog, Alert Dialog, Sheet, Popover, Tooltip, Hover Card, Dropdown, Context Menu, Command, Toast, Alert, Progress, Empty, Notification center)
- Dialog/Sheet (APG modal): focus moves inside on open, `Tab` trapped, `Esc` closes, focus returns (`expectFocusReturned`), `aria-labelledby` title, background `inert`/`aria-hidden`.
- Alert Dialog: `role="alertdialog"`, initial focus on the **least destructive** action, `useConfirm()` resolves `true/false`.
- Popover: `Esc` closes, outside click closes, focus return; portal goes into `PortalContainer` (theme of preview).
- Tooltip: shows on focus and hover, `Esc` hides, never contains interactive content, `aria-describedby`.
- Dropdown/Context menu (APG menu): `↑/↓`, `Home/End`, typeahead (folded), `→` opens submenu, `←` closes it, `Enter/Space` activates, `Esc` closes all; checkbox/radio items expose `aria-checked`. Context menu: `Shift+F10` / ContextMenu key opens.
- Command: `⌘K`/`Ctrl+K` opens, filter via `foldText` (not cmdk scoring), groups labelled, empty state, `Enter` runs.
- Toast: `role="status"` (polite) vs `alert` (error); pause on hover/focus; action button reachable by keyboard (F8 region if provided).
- Glass budget (X10): nested layer inside a layer has no `backdrop-blur` class.

### Navigation (Sidebar, Top bar, Tabs, Breadcrumb, Pagination, Navigation Menu, Accordion, Stepper)
- Sidebar: `nav` with label; current page `aria-current="page"`; collapse toggle `aria-expanded`; rail mode icon-only items have names; flyouts portalled; mobile → Sheet; `can()` hides items.
- Tabs (APG tabs): arrows move (automatic activation by default, manual option), `Home/End`, roving tabindex, `aria-controls`/`aria-labelledby` pairs.
- Breadcrumb: `nav aria-label="Breadcrumb"`, last item `aria-current="page"`, collapsed middle reachable.
- Pagination: `nav` + label, current `aria-current`, prev/next disabled at ends, labels localised.
- Accordion (APG): `Enter/Space` toggle, optional `↑/↓/Home/End` between headers, `aria-expanded` + region.
- Stepper: current step `aria-current="step"`, completed steps announced.
- **App switcher pattern:** when visible text exists do not set a different `aria-label` (axe `label-content-name-mismatch`); add context with an `sr-only` suffix instead.

### Page layouts (App shell, Page header, List/Record/Editor/Settings layouts, Resizable, Scroll Area)
- One `main`, one `banner`, unique landmark labels (axe `landmark-unique`); skip link to `main`.
- Resizable (APG window splitter): `role="separator"`, `aria-valuenow`, `←/→` resize, `Home/End`, `Enter` collapse.
- Scroll Area: scroll container focusable when it scrolls (`tabIndex=0`), keyboard scroll works.
- Responsive: shell collapses at the spec breakpoint (mock `matchMedia`).

### Data display (Card, Stat, Table, Data Table, Filter bar, Saved views, Item, Entity card, Description list, Timeline, Comments, Attachments, Task list, Tree view, Version history, Audit log)
- Table: real `<table>` with `<th scope>`; caption or `aria-label`.
- Data Table (APG grid only if cells are interactive, else table): sort header button with `aria-sort`; selection checkbox column with "Select all" name and `mixed` state; bulk bar appears with count (live region); pagination; empty + loading + error states; server mode calls `onStateChange` with serialisable state; mobile cards at narrow width. Written against **TanStack v9** (X12).
- Filter bar: chips removable by keyboard; state round-trips through URL serializer (§3).
- Stat: delta has text, not colour-only ("up 12%").
- Tree view (APG tree): same keys as Tree select; `aria-level/setsize/posinset`.
- Comments: mention typeahead folds tr; timestamps relative via `useFormat`.
- Version history: diff uses `ins/del` semantics or equivalent labels.

### Charts (Chart frame, Area, Bar, Line, Donut, Combo, Funnel, Gauge, Sparkline, Heatmap)
- Every chart has a text alternative (`figure` + `figcaption` or `aria-label`) and an accessible data table toggle.
- Colours come from `--chart-*` tokens (check computed style in e2e, not jsdom).
- Tooltip reachable by keyboard (focusable points or summary).
- Empty + loading states; numbers formatted with `useFormat` (`tr-TR` check).
- jsdom: stub `ResizeObserver` (done in setup) and give the container a size; assert SVG renders series count.

### Calendar & time (Calendar, Agenda, Resource calendar, Gantt, Time tracker)
- Grid navigation as Calendar grid; events are buttons with full text names (title + time range).
- Time zone explicit in every test (X11); DST week renders 23/25 h days correctly.
- Drag moves are also possible by keyboard (move dialog or arrow keys) — required for a11y.
- Week start respects `weekInfo` (`tr` = Monday).

### Editors & drag-and-drop (Sortable, Kanban, Hierarchy chart, Image cropper, Permission matrix)
- dnd-kit keyboard sensor: `Space` pick up, arrows move, `Space` drop, `Esc` cancel; live region announcements localised (X9).
- Kanban: card moves between columns by keyboard; WIP limit state.
- Cropper: arrows nudge crop, `+/-` zoom; output is deterministic for the same input.
- Permission matrix: grid with row/column headers; "toggle column" has a name.

### Flows & wizards (Multi-step form, Approval flow, Import wizard, Export, Setup checklist)
- Step change moves focus to the step heading; back keeps values; validation blocks next with error summary (`role="alert"`, links to fields).
- Import: CSV/Excel parsing behind dynamic import (mock); per-row validation uses locale-pack validators; error rows downloadable.
- Export: column selection, format; the file builder is called with the right rows.

### Media (Image, Carousel, Gallery, Lightbox, Media library, Media picker, Image field, Video, Link previews)
- Image: `alt` required (empty allowed only with `decorative`); width/height or aspect-ratio always set (CLS).
- Carousel (APG carousel): prev/next named, slide `role="group"` + "3 of 8", autoplay pauses on focus/hover and has a pause button, reduced motion disables autoplay.
- Lightbox: modal dialog rules; arrows navigate.
- Media library: grid selection (APG grid or listbox), upload via `MediaAdapter` memory adapter, empty/error states.
- Image field: focal point by keyboard; crop output stored as data, not pixels.

### Rich text / block editor
- Toolbar (APG toolbar): roving tabindex, `←/→`; marks toggle with shortcuts (`Mod+B/I/K`).
- Slash menu: typeahead folded, `Esc` closes.
- Round-trip: editor JSON → `VamosDoc` → render (RSC) → same text and marks (snapshot of `RichDoc` runs).
- Paste from Word/Google Docs keeps only allowed marks.

### Site blocks (Section infra, Navbar, Hero, Feature grid, CTA, FAQ, Map & hours, Contact form, Blog list, Footer, Consent banner, Page intro, Rich text, Media + text, Contact dock, others)
- Server component by default: the block file has no `"use client"`; islands only in their own files (grep check).
- Works **without JS**: Playwright with `javaScriptEnabled: false` — FAQ opens (`<details>`), mobile menu opens (`popover`), contact form posts.
- Heading levels: one `h1` per page (Hero / Page intro), sections `h2` with `aria-labelledby`.
- Navbar: skip link; mobile menu button `aria-expanded`; current link `aria-current`.
- Consent banner: nothing tracked before consent; reject as easy as accept; preferences dialog follows Dialog rules; choice persisted.
- Contact form: `autocomplete` tokens; error summary; privacy checkbox required where configured; marketing consent separate.
- Map & hours: facade until click; "Open now" uses business time zone (test with fixed `Date` + TZ).
- Section theming: `.light` inside `.dark` keeps light accent + glass values (README §2 fix) — Playwright computed-style check.
- Schema: every block's `meta`/schema parses its own default props (§3).
- Fonts: the selected Google Font loads at site level only (no per-section font), `font-display: swap`, no layout shift beyond CLS budget.

### Fonts (`@vamos-ui/react/fonts`, 50–60 Google Fonts, categorised)
- Registry unit test: 50–60 entries, unique ids, each has `category` (e.g. sans, serif, display, mono, handwriting), `weights`, fallback stack, and a supported-subsets list that includes `latin-ext` (Turkish glyphs).
- Font picker: grouped by category (`role="group"` + label), typeahead folded, preview text renders in the font, keyboard as Select/Combobox.
- e2e: switching `data-font` on the docs site changes computed `font-family` on body; no console errors; Turkish sample "İıŞşĞğÇçÖöÜü" renders without fallback (check `document.fonts.check`).

## 5. E2E smoke (every docs page and block × 4 themes)

`apps/www/e2e/pages.spec.ts` runs, for each cell of `THEME_MATRIX` (light/dark × glass/solid):
1. Every `/docs/components/<slug>` and every `/view/<block>`: HTTP 200, visible `h1` (docs pages), **zero** `pageerror`/`console.error` (hydration mismatches included).
2. `setTheme` is honoured before first paint (`readTheme`).
3. Serious/critical axe on `/`, `/docs`, `/docs/theming`, `/docs/components`, `/blocks`.

To add at M0 exit (owner: QA agent):
- `a11y.spec.ts`: `seriousA11y` on **every** component page and block, in `light-solid` and `dark-glass`, with `color-contrast` **enabled** in solid (glass contrast is checked on token pairs, README risk 3).
- `visual.spec.ts`: `toHaveScreenshot()` of each docs example preview (`[data-preview]` locator) in the 4 cells + `rtl` + 390 px mobile; `maxDiffPixelRatio: 0.01`; animations disabled (`reducedMotion: "reduce"`).
- `keyboard.spec.ts`: for each overlay demo, open with keyboard, `Esc`, assert focus returned — catches portal/theme regressions jsdom cannot.
- Accent/density/font axes: one pass per non-default value on 10 representative pages (button, input, select, dialog, data-table, sidebar, tabs, chart, hero, navbar).

## 6. A11y rules of thumb (from findings so far)

- Visible text present → no `aria-label` that differs from it (`label-content-name-mismatch`). Fixed 2026-11-10 on the shell-01 app switcher (`apps/www/src/blocks/shell-01/components/app-sidebar.tsx`: `aria-label` only when collapsed, `sr-only` ", switch app" suffix otherwise). The same pattern still exists in `apps/admin/src/components/sidebar.tsx:174` (to be deleted at M2).
- Pages that embed several shells (e.g. `/blocks`) must label landmarks uniquely or render previews in iframes (`landmark-unique`, `region` are moderate today; tracked, not blocking).
- Every portalled layer is scanned while open (`expectNoA11yViolations(document.body)`).

## 7. Visual review checklist (QA agent, per component/block, from screenshots)

- [ ] Matches house style: smoked glass + lime, editorial, no purple gradients, no emoji, no Inter, no glows, no generic card walls.
- [ ] Accent used only for the one primary action / active state / data highlight.
- [ ] Light, dark, glass, solid all legible; glass surfaces ≤ 3 on screen, nested layers not blurred (X10).
- [ ] Density compact vs comfortable changes height via `--control-h` (no fixed px heights).
- [ ] Each of the 4 site fonts + a Google Font from each category: no clipped ascenders/descenders, Turkish glyphs OK.
- [ ] RTL mirrors layout (icons with direction flip, numbers stay LTR).
- [ ] 390 px: no horizontal scroll, touch targets ≥ 40 px, 16 px gutter.
- [ ] Focus ring visible on every interactive element in all themes.
- [ ] States shown in docs: disabled, loading, error, empty — and they look intentional.
- [ ] Example content realistic English (no Lorem, no "Item 1").
- [ ] Popovers open in the preview's theme, not the page theme (ThemeScope + PortalContainer).

## 8. Performance budgets (site blocks, from 06 D4)

| Metric | Budget | How |
|---|---|---|
| Block JS on a typical landing page | ≤ 15 KB gzip (excl. framework) | `next build` route size for the 3 demo sites; fail if First Load JS minus framework baseline > 15 KB |
| Island sizes | Nav dropdown ~8 KB (only if children), lightbox ~3 KB, carousel ~7 KB, consent ~3 KB, form ~2 KB, open-now ~1 KB, facades/dismiss ~0.5 KB | per-island chunk size in build stats |
| LCP | < 2.0 s, mid-range Android / 4G | Lighthouse mobile preset |
| CLS | < 0.05 | Lighthouse; every image has width/height or aspect-ratio |
| INP | < 150 ms | Lighthouse / web-vitals in Playwright |
| Lighthouse performance | ≥ 95 on each demo page (restaurant, spa, SaaS × en/tr) | M6 exit gate |
| `backdrop-filter` surfaces | ≤ 3 per page | Playwright: count elements with computed `backdrop-filter != none` |
| Heavy deps | zod, Tiptap, Recharts, dnd-kit never in a plain site's client bundle | grep built client chunks |
| Above-the-fold motion | navbar + hero never animate in | class check |

Admin panels: Data Table with 10 000 virtual rows scrolls without long tasks > 50 ms; dialog open < 100 ms.

## 9. Definition of done (a component is "ready" only when all hold)

1. `<slug>.test.tsx` exists, covers the Base + group checklist, passes; no `.skip`/`.only`.
2. Property tests pass for any pure module it adds (§3).
3. `expectNoA11yViolations()` passes in default and open/error state.
4. `npx tsc --noEmit` clean for its files in `packages/ui` and `apps/www`.
5. Docs page returns 200 and passes `pages.spec.ts` in all 4 theme cells with zero console errors.
6. `seriousA11y` returns `[]` on its docs page.
7. Visual checklist §7 reviewed by a QA agent, no open "blocker".
8. Strings: `en` defaults + `tr` keys stubbed; works under `tr-TR` + RTL.
9. Site blocks additionally: no-JS check and §8 budgets.

## 10. How QA agents work and report

Workflow per assignment (a list of slugs):
1. Read the component spec in `docs/plan/0X-*.md` and this plan.
2. Run `npx vitest run src/components/<slug>` and the Playwright specs filtered to the slug (`-g` or a temporary spec using the helpers; delete temporary specs afterwards).
3. Read the test file against the checklist; add missing tests **only in test files** (never edit component code — file a finding instead).
4. Take screenshots for §7 when visual review is assigned.

Report (final message is data, ≤ 40 lines):

```
qa: <slugs>
tests: { unit: "passed/failed", prop: "...", e2e: "...", axe: "..." }
coverage_gaps: [ "<slug>: missing <checklist item>" ]
findings:
  - id: <slug>-<n>
    severity: blocker | major | minor
    kind: a11y | keyboard | visual | i18n | perf | api | crash
    where: <file:line or URL + theme cell>
    repro: <steps or failing test name + fast-check seed>
    expected: <WAI-ARIA / plan reference>
    actual: <observed>
    fix_hint: <one line>
added_tests: [ <paths> ]
```

Severity: **blocker** = crash, console error, keyboard trap, missing name on a control, serious/critical axe, value corruption (date shift, float money); **major** = missing key in the APG map, theme axis broken, string not localisable; **minor** = visual polish, docs example gaps. A component with any blocker cannot be marked ready.

## 11. Known state (2026-11-10)

- vitest: helpers self-tested in `packages/ui/test/utils.test.tsx` (4 tests) + smoke (2).
- Playwright: 7/7 green (4 theme cells × 7 pages, setTheme, blocks index, axe). The theme matrix runs serially (`test.describe.serial`, 180 s per cell): with 4 parallel workers the Turbopack dev server's on-demand compile timed out.
- If the docs dev server's Turbopack SSR cache is stale after an edit to `apps/www/src/lib/site.ts`, every page reports a hydration mismatch (server `github.com/vamos-ist/vamos-ui` vs client `github.com/sametburaksari/vamos-ui`). Restart `pnpm dev` in `apps/www` to clear it; the matrix test catches this by design.
