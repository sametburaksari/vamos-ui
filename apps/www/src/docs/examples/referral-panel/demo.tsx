"use client";

import * as React from "react";
import { Button, ReferralPanel } from "@vamos-ui/react";

const START = 412;
const PER_FRIEND = 50;

export default function ReferralPanelDemo() {
  const [referrals, setReferrals] = React.useState(1);
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <ReferralPanel
        position={Math.max(1, START - referrals * PER_FRIEND)}
        total={2380}
        shareUrl="https://example.com/r/k7q2"
        shareText="I joined the early-access list. Join with my link:"
        referrals={referrals}
        goal={3}
        reward="early access"
        description={`Every friend who joins with your link moves you up ${PER_FRIEND} places.`}
      />
      <div>
        <Button size="sm" variant="ghost" onClick={() => setReferrals((n) => n + 1)}>
          Simulate a friend joining
        </Button>
      </div>
    </div>
  );
}
