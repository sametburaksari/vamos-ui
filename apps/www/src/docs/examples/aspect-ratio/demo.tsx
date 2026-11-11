import { AspectRatio, PlaceholderArt } from "@vamos-ui/react";

export default function AspectRatioDemo() {
  return (
    <div className="w-full max-w-lg">
      <AspectRatio ratio="16/9" rounded="ui-lg">
        <PlaceholderArt seed="product-tour" label="Product tour video, 2 minutes" caption="Product tour · 2:14" />
      </AspectRatio>
    </div>
  );
}
