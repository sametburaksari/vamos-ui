import { ReferralPanel } from "@vamos-ui/react";

export default function ReferralPanelNoQueue() {
  return (
    <div className="w-full max-w-lg">
      <ReferralPanel title="Give a month, get a month" description="When a friend subscribes with your link, you both get a month free." shareUrl="https://example.com/invite/m4p8" referrals={2} />
    </div>
  );
}
