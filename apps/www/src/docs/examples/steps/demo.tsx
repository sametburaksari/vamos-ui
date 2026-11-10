import { Steps } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Vertical: a thin rule along the start edge with mono numbers on it, a duration tag per
// step. An ordered list: the order is announced, the numbers are visual.
export default function StepsDemo() {
  return (
    <SiteFrame>
      <Steps
        eyebrow="How we work"
        title="Six weeks from *brief* to launch"
        lead="One team from the first visit to the thirtieth day after launch."
        actions={[{ link: { href: "/contact", label: "Start with a call" }, style: "primary" }]}
        steps={[
          { title: "Discovery", text: "Two hours at your place, not ours. We watch how bookings arrive today and who answers them.", duration: "Week 1" },
          { title: "Design", text: "Real copy and your own photos from day one. One direction, refined — never three to pick from.", duration: "Weeks 2–3" },
          { title: "Build & content", text: "Your staff learn to edit the menu while we build. Old URLs are redirected one by one.", duration: "Weeks 4–5" },
          { title: "Launch & first month", text: "We watch Search Console and booking volume daily for thirty days and fix what we find.", duration: "Week 6 →" },
        ]}
      />
    </SiteFrame>
  );
}
