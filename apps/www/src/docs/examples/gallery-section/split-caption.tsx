import { GallerySection } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more, photos } from "../_site-2/data";

// Split caption (agency case study): sticky title on the start side, a vertical image stream with long captions.
export default function GallerySplitCaption() {
  return (
    <SiteFrame>
      <GallerySection
        variant="split-caption"
        eyebrow="Case study"
        title="Lena Clinic, *three* branches"
        lead="A booking site for a dermatology clinic: one calendar per doctor, deposits through iyzico, Turkish and English."
        lightbox={false}
        images={[
          { image: more.clinic, caption: "Reception at Nişantaşı. Photography was shot in natural light so the site never needed retouched stock." },
          { image: more.laptop, caption: "Booking flow: treatment, doctor, time, deposit — four steps, no account required." },
          { image: photos.flowers, caption: "Brand details carried into the confirmation emails and WhatsApp templates." },
        ]}
      />
    </SiteFrame>
  );
}
