import { Steps } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Horizontal: a timeline on wide containers (numbers above the line, text below); the first
// dot carries the accent. Narrow containers turn it vertical.
export default function StepsHorizontal() {
  return (
    <SiteFrame>
      <Steps
        variant="horizontal"
        eyebrow="Your first visit"
        title="What happens when you *arrive*"
        lead="Come fifteen minutes early. Everything else is on us."
        steps={[
          { title: "Tea at reception", text: "A short form about pressure, allergies and anything we should avoid.", duration: "10 min" },
          { title: "Hammam", text: "Steam, a kese scrub and a foam wash on the warm stone.", duration: "20 min" },
          { title: "Your treatment", text: "Massage or facial in a private room on the second floor.", duration: "50–90 min" },
          { title: "Rest", text: "The relaxation room, linden tea and lokum for as long as you like.", duration: "No limit" },
        ]}
      />
    </SiteFrame>
  );
}
