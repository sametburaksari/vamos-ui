---
"@vamos-ui/react": patch
---

`FontProvider` (element scope) now keeps dialogs, menus and popovers opened inside it in its type pairing: overlays portal into its wrapper, like `ThemeScope`. Pass `portal={false}` for the old behaviour. The footer example uses a fictional company name.
