import { ConsentBanner } from "@vamos-ui/react/blocks";

// Preferences: one Switch per category, none pre-checked; "Necessary" is locked on.
// Saved as a first-party vb_consent cookie for six months.
export default function ConsentBannerPreferences() {
  return (
    <div className="w-full overflow-hidden rounded-ui border border-line">
      <ConsentBanner categories={["necessary", "functional", "analytics", "marketing"]} policyLink={{ href: "/cookies" }} contained forceShow />
    </div>
  );
}
