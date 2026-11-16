---
"@vamos-ui/react": patch
---

`tierQuote`, `estimatorDefaults`, `effectiveEstimatorValues`, `daysUntil`, `impactFor`, `choiceGridStep`, `highlightCode`, `parseLineRanges` and `deviceFrameSize` (with `deviceViewports`) now live in server-safe modules, so server components can call them (they used to fail with "Attempted to call … from the server"). Imports from `@vamos-ui/react` and the component modules are unchanged.
