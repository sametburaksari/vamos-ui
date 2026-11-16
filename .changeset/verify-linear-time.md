---
"vamos-ui": patch
---

`vamos-ui verify` is linear on large files again: the class / style region lookup was a scan per string literal, which made big generated files quadratic.
