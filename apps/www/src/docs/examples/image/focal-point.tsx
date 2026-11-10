import { Image } from "@vamos-cms/ui";

// The subject (the therapist's hands) sits at 72% / 58% of the photo. Every crop keeps it in frame.
const photo = {
  src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=80&auto=format&fit=crop",
  alt: "Therapist giving a back massage with warm oil",
  width: 1400,
  height: 933,
};

export default function ImageFocalPoint() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-fg-muted">Centered (default)</p>
        <div className="grid grid-cols-[1fr_0.55fr] gap-2">
          <Image {...photo} aspect="16/9" rounded="ui" />
          <Image {...photo} aspect="4/5" rounded="ui" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-medium text-fg-muted">Focal point 72% · 58%</p>
        <div className="grid grid-cols-[1fr_0.55fr] gap-2">
          <Image {...photo} focal={{ x: 0.72, y: 0.58 }} aspect="16/9" rounded="ui" />
          <Image {...photo} focal={{ x: 0.72, y: 0.58 }} aspect="4/5" rounded="ui" />
        </div>
      </div>
    </div>
  );
}
