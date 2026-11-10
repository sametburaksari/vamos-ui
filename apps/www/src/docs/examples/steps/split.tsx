import { Steps } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Split: a sticky title on the start side, big display-size numbers with hairline-separated
// steps on the end side.
export default function StepsSplit() {
  return (
    <SiteFrame>
      <Steps
        variant="split"
        eyebrow="Setup"
        title="Live in an *afternoon*"
        lead="No sales call needed. Most front desks are answering from Ledgerly the same day."
        actions={[{ link: { href: "/signup", label: "Try free for 14 days" }, style: "primary" }]}
        steps={[
          { title: "Connect WhatsApp Business", text: "Scan one QR code with the phone your front desk already uses. Existing chats stay where they are.", duration: "5 min" },
          { title: "Add Instagram and your site form", text: "Log in with Meta; paste one line of HTML into your website, or use our plugin.", duration: "10 min" },
          { title: "Invite the team", text: "Everyone gets their own login; conversations are assigned, never lost in someone’s phone.", duration: "2 min" },
        ]}
      />
    </SiteFrame>
  );
}
