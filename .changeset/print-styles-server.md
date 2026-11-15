---
"@vamos-ui/react": patch
---

`printStyles()` and `PrintStyles` now live in a server-safe module, so a server component can call `printStyles()` (it used to fail with "Attempted to call printStyles() from the server"). Imports from `@vamos-ui/react` are unchanged.
