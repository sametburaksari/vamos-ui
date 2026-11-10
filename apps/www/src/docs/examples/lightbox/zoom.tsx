import { Button } from "@vamos-ui/react";
import { Lightbox, LightboxTrigger } from "@vamos-ui/react/media";
import { Maximize2 } from "lucide-react";

// Floor plans and contracts need real zoom: pinch, wheel, double-tap, or + − 0 on the keyboard.
const plan = {
  id: "plan",
  src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=2400&q=85&auto=format",
  width: 2400,
  height: 1600,
  alt: "Architectural floor plan of the third floor with desks and meeting rooms",
  caption: "Third floor plan — revision C, approved 4 November 2026",
};

export default function LightboxZoom() {
  return (
    <Lightbox items={[plan]} zoom={{ max: 5 }} backdrop="dim">
      <LightboxTrigger index={0} asChild>
        <Button>
          <Maximize2 /> Open floor plan
        </Button>
      </LightboxTrigger>
    </Lightbox>
  );
}
