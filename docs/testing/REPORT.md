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
