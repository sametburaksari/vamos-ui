---
"vamos-ui": minor
---

`vamos-ui site store` writes an online store's checkout into the project: `store/catalog.ts` (the one price source), `store/checkout.ts`, and the endpoints as Next.js route handlers or as edge functions for static sites on Cloudflare Pages and Spacefast, with the environment variables and host secret commands to set. Static sites on shared hosting are refused with the options. Online-store plans get a "priced on the server" requirement and the recipe points the cart and checkout at it.
