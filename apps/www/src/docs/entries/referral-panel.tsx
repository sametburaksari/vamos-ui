import { ex, type DocEntry } from "../types";
import ReferralPanelDemo from "../examples/referral-panel/demo";
import ReferralPanelNoQueue from "../examples/referral-panel/no-queue";
import ReferralPanelLabels from "../examples/referral-panel/labels";

const entry: DocEntry = {
  slug: "referral-panel",
  title: "Referral panel",
  group: "Data display",
  description:
    "The \"you're on the list\" panel of a waitlist or referral programme: the person's place in line, a personal link to copy or send through the device's share sheet, and how many friends joined with it — with a progress bar toward a reward. The queue number is one polite sentence for screen readers; the copy result is announced.",
  source: ["components/referral-panel.tsx"],
  usage: `import { ReferralPanel } from "@vamos-ui/react";

<ReferralPanel
  position={signup.position}
  total={signup.total}
  shareUrl={\`https://example.com/r/\${signup.code}\`}
  referrals={signup.referrals}
  goal={3}
  reward="early access"
  description="Every friend who joins with your link moves you up the line."
/>`,
  demo: ex("demo", "Waitlist with a reward", "referral-panel/demo.tsx", ReferralPanelDemo, "The app owns the rules (places per friend, first-wave size); the panel shows the result and re-announces the position when it changes."),
  examples: [
    ex("no-queue", "Referral without a queue", "referral-panel/no-queue.tsx", ReferralPanelNoQueue, "Leave out position for a plain invite programme; without goal it shows the referral count."),
    ex("labels", "Reward unlocked, custom labels", "referral-panel/labels.tsx", ReferralPanelLabels, "Once referrals reach goal the bar turns success and data-state=\"unlocked\" is set."),
  ],
  api: [
    { name: "ReferralPanel", props: [
      { name: "shareUrl", type: "string", description: "The person's link: shown read-only, copied and shared as is." },
      { name: "shareText / shareTitle", type: "string", description: "Text and title for the native share sheet (navigator.share). The Share button only appears where the device has one." },
      { name: "position", type: "number", description: "Place in the queue. Leave out when there is none." },
      { name: "total", type: "number", description: "People in the queue (\"of 2,380\"). Only real numbers." },
      { name: "referrals", type: "number", default: "0", description: "Friends who joined with the link." },
      { name: "goal", type: "number", description: "Referrals needed for the reward; shows a progress bar." },
      { name: "reward", type: "string", description: "What the goal unlocks, as a phrase (\"early access\")." },
      { name: "title", type: "ReactNode | null", default: '"Invite friends"', description: "Heading; null hides it." },
      { name: "description", type: "ReactNode", description: "How the rules work, under the heading." },
      { name: "headingLevel", type: "2 | 3 | 4", default: "2", description: "Heading level." },
      { name: "onCopy / onShare", type: "(url: string) => void", description: "After a copy / a completed share (analytics)." },
      { name: "labels", type: "Partial<ReferralPanelLabels>", description: 'Dictionary namespace "referralPanel" (en, tr, de, fr, es, ar built in).' },
    ] },
  ],
  notes: [
    "Never show invented queue numbers or counts; the recipe for a launch waitlist calls this out.",
    "Copy falls back to a hidden textarea where the Clipboard API is missing, and says so when both fail.",
  ],
  covers: [],
};

export default entry;
