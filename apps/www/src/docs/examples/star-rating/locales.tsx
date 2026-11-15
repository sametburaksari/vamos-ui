import { commerceLabelsAr, commerceLabelsDe, commerceLabelsTr, StarRating } from "@vamos-ui/react/blocks";

// Labels and numbers per locale; in RTL the stars fill from the right.
export default function StarRatingLocales() {
  return (
    <div className="flex flex-col items-start gap-3">
      <StarRating value={4.5} showValue count={1240} locale="tr-TR" labels={commerceLabelsTr} />
      <StarRating value={4.5} showValue count={1240} locale="de-DE" labels={commerceLabelsDe} />
      <div dir="rtl">
        <StarRating value={4.5} showValue count={1240} locale="ar" labels={commerceLabelsAr} />
      </div>
    </div>
  );
}
