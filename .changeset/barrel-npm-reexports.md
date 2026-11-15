---
"vamos-ui": patch
---

`add` no longer writes an index that re-exports a package the project does not have (`export { z } from "zod"` after adding only site blocks broke `next build`). npm re-exports are kept when package.json declares the package or the same `add` installs it.
