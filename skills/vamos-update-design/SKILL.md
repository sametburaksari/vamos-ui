---
name: vamos-update-design
description: Bring an existing project in line with Vamos UI and its brand profile - apply a new or changed vamos.brand.json, update kit files, and migrate hand-rolled styles (raw colours, palette classes, custom modals, hard-coded fonts) to tokens and kit components. Use when the user wants to restyle, rebrand, migrate or "clean up" an existing UI, after vamos.brand.json changed, or when verify reports many violations. Always starts with a dry run and the user's go-ahead.
---

# Update a project's design

Updating touches many files, so it runs in two passes: plan (nothing changes), then apply in small, verifiable steps. The user approves the plan before anything is written.

## 1. Plan (dry run)
- `npx vamos-ui update --dry-run` from the project root. It prints the diff of the safe automatic fixes (palette classes and raw colours → tokens, mirrored `dark:` variants removed, hard-coded fonts → font tokens), a stale brand.css, the mapping table and what is left for a person. `npx vamos-ui update` without flags prints the same summary without the diff.
- Kit files that changed upstream are a separate command: `npx vamos-ui diff --summary` (plan) and `npx vamos-ui upgrade` (apply).
- MCP `update_design({ projectDir })` gives the same plan (automatic fixes with their mapping table, brand edits) plus the code violations grouped by rule and file.
- No vamos.json? Run `npx vamos-ui init` first (ask the user). No vamos.brand.json but the user wants a rebrand? Use **vamos-import-design-system** first.

## 2. Show the plan and agree on scope
Summarise for the user, in this order:
1. Brand: what changes (accent, fonts, theme defaults) and the files involved.
2. Automatic fixes: the mapping table (`bg-blue-500 → bg-accent` …) and the files it touches.
3. Kit: files that changed upstream (`diff --summary`), and locally edited kit files that will be kept (or overwritten only with `--overwrite`).
4. Code left for a person: violations per rule with counts and the top files.
5. What you will not touch (generated files, third-party code, `vamos-ui-ignore`d lines).

Ask which parts to do now. Large migrations go route by route or folder by folder.

## 3. Apply
1. **Brand:** `npx vamos-ui brand apply` (brand.css, the CSS import, vamos.json). Then set the `<html>` attributes and load the brand fonts as printed.
2. **Automatic fixes:** `npx vamos-ui update --fix [paths]`, scoped to the folders the user agreed to. It also regenerates a stale brand.css. Review the changed files.
3. **Kit:** `npx vamos-ui upgrade` only if the user wants upstream kit changes now.
4. **What is left, by hand**, one folder or route at a time, using [references/migration-map.md](references/migration-map.md):
   - raw colours and palette classes → semantic tokens (`bg-accent`, `text-fg-muted`, `border-line`…),
   - `dark:` variants → removed (tokens switch with `.dark`),
   - hand-rolled modals, menus, tooltips, selects → kit components (`npx vamos-ui add dialog dropdown-menu …`),
   - fixed px heights → density tokens, `z-[999]` → z tokens, font literals → `font-sans` / `font-display` / `font-mono`,
   - copy → the brand voice (`voice.rules`, `voice.examples`).
   Keep behaviour identical. A style migration is not the moment to change logic or layout.
5. After each step: `npx vamos-ui verify <changed paths>` and the project's typecheck/tests. Do not move on with errors.

## 4. Verify and hand over
- MCP `verify_design({ projectDir })` until it reports no errors.
- Run **vamos-verify-design-system** for screenshots (desktop + mobile, light + dark) of the routes you changed.
- Report: what changed (files and counts), what is left (remaining warnings, skipped folders), kit files kept because of local edits, and any conflict between the brand profile and the kit rules.

## Never
- Write before the dry run is shown and approved.
- Use `--overwrite` on kit files the user edited without asking. Show the diff (`npx vamos-ui diff <name>`) first.
- Silence violations with `vamos-ui-ignore` to make the numbers look good. Only use it with a reason the user agrees with.
- Replace a logo, colour or font the profile does not specify.
