# Test report

Written by the orchestrator from the QA agents' results (subagents can't write report files).

## Wave 0 — foundations
- Kbd, Separator, Spinner, Skeleton; Input/Field (FieldContext, Fieldset, sizes, clearable, count, addons), Button, Badge, Card updates.
- Shared lib: labels, ICU-lite message format, locale-aware text utils (Turkish İ/ı), variants, ThemeScope, Layer, provider, format module (number, money, date, relative time).
- Unit: 132/132 passed. E2E: 7/7 passed.

## Wave 1 — overlays, forms, navigation, data basics, charts, fonts
- Unit and e2e green after QA fixes; visual review completed.

## Wave 2 — select/combobox, dates, pickers, shell & ⌘K, data table, formatted inputs, media
- Scope: 36 docs pages (demo + every example).
- `tsc --noEmit`: 0 errors (ui, www, admin).
- Unit: 799/799 passed. E2E: 167/167 passed (new `e2e/wave-2.spec.ts`, 36 page tests: no console errors, no hydration errors, axe).
- Fixed: label-in-name for date/range pickers, record/user pickers, user menu, app switcher, lightbox tiles; disallowed `aria-required` on button/group roles; command separator inside listbox; Node vs Chrome ICU differences in date ranges and country names (hydration); user-picker cache keys shared across pickers.
- Locale: 649 keys in 39 namespaces added to `en.ts` and `tr.ts`.
- Not run yet (final pass): contrast audit, keyboard spec, RTL and mobile screenshots.

## Wave 3 — flows, drag and drop, scheduler, records, layouts, media library, editor, site blocks
- Scope: 54 docs pages; all 143 inventory components ready.
- `tsc --noEmit`: 0 errors (ui, www, admin).
- Unit: 1172/1172 passed. E2E: 253/253 passed after re-runs (new `e2e/wave-3.spec.ts`).
- Fixed: server actions removed from the static export (contact-form example now runs client-side); static generation timeout raised to 300 s.

## Wave 4 — blocks (40 new, 43 total), blocks browser, agent layer
- Scope: app shells (4), dashboards (5), auth (7), lists and board (4), detail and editor (4), settings, forms and onboarding (6), empty and error states (6), websites and marketing pages (7); `/blocks` browser with category and domain filters and lazy previews.
- `tsc --noEmit`: 0 errors (ui, www, admin, cli, mcp).
- Unit: 1494/1494 passed (ui 1172, cli 223, mcp 79, registry 20).
- E2E: 331 tests (new `e2e/wave-4.spec.ts`, 78 tests). Against the static export: 330/331, and the one failure (sortable keyboard timing) was fixed and passed 8/8 on repeat. Against the dev server: 322 passed; the failures were page-load timeouts under memory pressure and two one-off hydration mismatches that passed on re-run. Every test has passed at least once and none fail consistently.
- Static export build: clean; 142 component pages, 43 `/view/<block>` pages, `/r` registry.
- Fixed in QA: Avatar initials contrast in light mode (worst slot 4.19:1 → 5.37:1); `<main>` landmark on home, charts and directory; shell-01 mobile sidebar as a Sheet (all shell-01 blocks now fit 390 px); editor-01 label-in-name; line-items discount-toggle names and focusable scroll region; consent-banner code sample focusable; e2e block discovery with lazy previews.
- Fixed in visual review: `cn()` now keeps theme type-scale classes (text-display-*, lead, eyebrow…); table head and pinned-cell mixes use oklab (dark + solid showed a maroon pinned column); read-only line-items fit the invoice card; description groups align to the top; "Acme" placeholder brand replaced with fictional "Northpoint"; map previews replaced with a neutral street-map SVG; photo and copy mismatches on agency, pricing and spa pages.
- Completeness check: inventory 143/143 across all 13 groups; no gaps.
- Known, not fixed: useId hydration mismatch seen twice under dev-server load only (maintenance-01, list-03), not reproducible in the export; floating contact dock can overlap the booking bar on restaurant and spa pages; en-US site pages mix 12-hour hours with 24-hour hero copy; unlabelled tables on detail-03 and shell-02 (console warning); older docs examples still use "Acme/Globex/Initech" placeholder names; dev-server e2e is slow on an 8 GB machine — run CI against the static export with `PW_WORKERS=3`.
