---
"@vamos-ui/react": minor
"vamos-ui": patch
"@vamos-ui/mcp": patch
---

New components for signups, following and community pages, generic and documented, with built-in labels in all six locales:

- `ReferralPanel`: place in line, a personal invite link to copy or send through the device's share sheet, and referral progress toward a reward.
- `EmailCapture`: a compact newsletter or waitlist signup (inline or stacked) with validation, success and error states, and the privacy link or KVKK checkbox. It posts to a URL, a server action or `onSubmit`, with the same fields as `ContactForm`.
- `SubscribeLinks`: "listen on / follow on" links from your own list (no bundled logos), with a Copy RSS feed button.
- `TopicList` and `TopicRow`: forum topics with tags, reply and view counts, the latest post, and pinned, solved, locked and unread states.
- `PrintButton` with `PrintStyles` / `printStyles()`: opens the print dialog with a suggested PDF file name, plus a print stylesheet that hides the site chrome and prints link addresses.
- The launch-waitlist, newsletter-writer, publication, podcast, community-forum and personal-cv recipes now use these components; a few other recipes list them as alternatives.
- Registry guidance (when to use, when not to, accessibility) for `ad-slot`, `billing-details`, `news-ticker`, `news-widgets`, `post-card` and `post-tabs`.
