import { Cta } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Newsletter: a plain form (works without JS) posting to a URL or a server action. Pass
// `status` + `message` back after the submit to show success or an error.
export default function CtaNewsletter() {
  return (
    <SiteFrame>
      <Cta
        variant="newsletter"
        title="The Thursday wine list, by email"
        lead="Four bottles we opened this week and what to eat with them. One email, Thursdays at noon."
        newsletter={{
          action: "/api/newsletter",
          placeholder: "you@example.com",
          consent: {
            type: "doc",
            content: [{ type: "paragraph", content: [{ text: "We only send the list. Unsubscribe in one click. See our " }, { text: "privacy notice", marks: [{ type: "link", href: "/privacy" }] }, { text: "." }] }],
          },
        }}
      />
    </SiteFrame>
  );
}
