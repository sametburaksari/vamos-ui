---
"@vamos-ui/react": minor
"vamos-ui": minor
"@vamos-ui/mcp": patch
---

Forms and measurement for websites. `@vamos-ui/react/blocks` adds `Analytics`: GA4, Google Tag Manager, Google Ads and the Meta pixel load only after the visitor's consent in `ConsentBanner` (analytics → GA4 / GTM, marketing → Ads / Meta; `mode="advanced"` loads the Google tag at once under Consent Mode), and phone, WhatsApp, email, directions and booking clicks plus contact form leads become events (`generate_lead`, `click_call`…, the Google Ads conversion per event, Meta `Lead` / `Contact`). `trackEvent()` sends one yourself. `ContactForm` with a URL `action` (a PHP mailer on static hosting) now submits with fetch once hydrated and shows the server's field errors; without JS it still posts and comes back with `?vb_sent=<form>`. A successful submit fires `vb:lead`.

`npx vamos-ui site form` writes the sender: `public/contact.php` for static exports on shared hosting, or a Next.js server action with Resend or SMTP (nodemailer), plus one field list shared by the page and the sender; honeypot, time trap, rate limit, cross-site posts refused, no visitor input in mail headers. `verify` reports `raw-tracking-script` for tags loaded by hand. The website plan's form and measurement tasks point to these.
