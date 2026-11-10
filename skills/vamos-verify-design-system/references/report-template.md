# Design system report: <project or screen>

Date: <YYYY-MM-DD> · Brand: <name from vamos.brand.json, or "none"> · Routes: <list>

## Summary
<One or two sentences: on brand or not, number of blocking findings.>

| Check | Result |
|---|---|
| `npx vamos-ui verify` | <n errors, n warnings> |
| Brand profile and applied state (`brand check`) | <n errors, n warnings> |
| Automatic code fixes pending (`update --dry-run`) | <none / n changes in n files> |
| Screenshots | <n taken: desktop/mobile × light/dark> |

## Findings
### Blocking
1. **<title>** · <file:line or screenshot> · rule: <kit rule or brand field>
   Evidence: <quote / verifier line / what the screenshot shows>
   Fix: <smallest change>

### Off-brand
…

### Polish
…

## Missing assets
- <e.g. no white logo for dark mode; the header uses the dark logo on a dark bar>

## Conflicting rules
- <brand says X (field), kit rule says Y, screens do Z>

## Not checked
- <check> — <why: app needs login, no browser, no data>
