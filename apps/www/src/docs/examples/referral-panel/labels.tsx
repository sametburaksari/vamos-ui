import { ReferralPanel } from "@vamos-ui/react";

export default function ReferralPanelLabels() {
  return (
    <div className="w-full max-w-3xl">
      <ReferralPanel
        position={38}
        shareUrl="https://example.com/r/t2v9"
        referrals={5}
        goal={5}
        reward="the founding badge"
        labels={{ title: "Bring your team", position: "Your spot", copy: "Copy invite" }}
      />
    </div>
  );
}
