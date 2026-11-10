---
name: vamos-verify-design-system
description: Check that a Vamos UI project or screen follows its design system - the kit rules and the brand profile (vamos.brand.json) - and report the gaps. Use after building or changing UI, before a release or handover, when the user asks "is this on brand", "check the design", "audit the UI", or when another Vamos skill says to verify. Runs the verifiers, takes desktop and mobile screenshots in light and dark, compares them with the brand, and reports evidence-based findings without guessing.
---

# Verify the design system

You produce a report, not a redesign. Every finding needs evidence: a verifier line, a screenshot, or a file and line. If you could not check something, list it under "Not checked" with the reason. Never mark a check as passed because it probably is.

## 1. Automated checks
Run all that apply, from the project root:

| Check | Command | MCP |
|---|---|---|
| Kit rules in code | `npx vamos-ui verify --json` | `verify_design({ projectDir })` (or `verify_code` per file) |
| Brand profile and how it is applied (contrast, brand.css up to date, import order, vamos.json, `<html>` attributes, asset files) | `npx vamos-ui brand check --json` | `get_brand({ projectDir })` |
| Code fixes still pending (palette classes, raw colours, `dark:`, fonts) | `npx vamos-ui update --dry-run` | `verify_design({ projectDir })` / `update_design({ projectDir })` |
| Project's own checks | typecheck, lint, tests | |

Record counts and the exact findings. Do not fix things in this skill unless the user asked for fixes; hand fixes to **vamos-update-design** or **vamos-apply-design-system**.

## 2. Screenshots
Use the browser tool you have, or Playwright (see [references/screenshots.md](references/screenshots.md) for a script that sets the theme attributes). For each screen that changed (or the main routes for an audit), capture:

| Viewport | Theme |
|---|---|
| Desktop 1440 × 900 | light, dark |
| Mobile 375 × 812 | light, dark |

Add `data-material="glass"` and `data-density="compact"` shots if the app uses them. Name files `<route>-<desktop|mobile>-<light|dark>.png` and keep them with the report.

If the app does not run (no dev server, needs login or data), say so and ask the user how to reach it. Do not describe screenshots you did not take.

## 3. Compare with the brand
Go through [references/checklist.md](references/checklist.md) for every screenshot. In short:
- **Accent:** brand colour only on the primary action, active/selected state and the one data highlight; text on it readable in both themes.
- **Type:** headings in the brand display font, UI in the body font (check computed `font-family` in the browser if unsure).
- **Logo:** the right file for the background, at or above its minimum size, not stretched or recoloured, `alt` set.
- **Voice:** sample the visible copy (buttons, titles, empty states, errors) against `voice.rules` and `voice.examples`. Quote the string and the rule it breaks.
- **Layout:** nothing clipped or overlapping at 375px; no horizontal scroll; dark mode has no white boxes or invisible text.

## 4. Report
Use [references/report-template.md](references/report-template.md). Order findings by severity: blocking (accessibility, wrong or missing logo, brand not applied) → off-brand → polish. For each finding give the evidence, the rule (kit rule or brand field), and the smallest fix.

Always include these, even when empty:
- **Missing assets:** logo variants the UI needs but the profile does not have (e.g. no white logo for dark mode, no square mark for the favicon).
- **Conflicting rules:** where the brand profile, the kit rules and the screens disagree. Name each side.
- **Not checked:** what you could not verify, and why.
