import { ConsentBanner } from "@vamos-cms/ui/blocks";

// Bar: two lines of text, "Reject all" and "Accept all" at equal size and weight, "Preferences".
// `contained` + `forceShow` keep it inside this preview; on a site it is fixed to the bottom and
// disappears once the visitor has chosen.
export default function ConsentBannerDemo() {
  return (
    <div className="w-full overflow-hidden rounded-ui border border-line">
      <ConsentBanner policyLink={{ href: "/cookies" }} contained forceShow />
    </div>
  );
}
