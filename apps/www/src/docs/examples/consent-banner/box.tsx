import { ConsentBanner, site2LabelsTr } from "@vamos-ui/react/blocks";

// Box: a 360px panel for the bottom-start corner, buttons stacked — in Turkish (KVKK wording).
export default function ConsentBannerBox() {
  return (
    <ConsentBanner variant="box" locale="tr-TR" labels={site2LabelsTr} policyLink={{ href: "/cerez-politikasi" }} contained forceShow />
  );
}
