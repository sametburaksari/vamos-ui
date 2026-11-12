---
"vamos-ui": minor
---

`vamos-ui new` plans a website by asking a few questions (business, site type, languages, current site, domain, hosting, one page or several, sections, store or booking needs, contact channels and form delivery, measurement, who runs the site) and writes `vamos.project.json` with the plan: pages and the components on them, legal pages, hosting and build output, forms with spam protection, measurement with consent mode, compliance notes for Turkey (KVKK, ETBİS, distance sales), domain ideas, tasks per specialist and open questions. It fills only the empty fields of `vamos.site.json`. `vamos-ui site import <url>` reads a current website (business details with their sources, navigation, texts, images) and warns about mismatches such as two phone numbers. Both are also a library: `vamos-ui/project`. `vamos.site.json` takes `analytics.metaPixel`.
