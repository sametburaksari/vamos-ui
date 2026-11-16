---
"@vamos-ui/react": minor
---

`ContactForm` takes an optional `turnstileSiteKey`. With it, the Cloudflare Turnstile script loads once per page and each form renders the widget, whose `cf-turnstile-response` token is posted for the sender to verify; without it nothing from Cloudflare loads. URL actions such as `"/api/contact"` (the new edge sender) work as before.
