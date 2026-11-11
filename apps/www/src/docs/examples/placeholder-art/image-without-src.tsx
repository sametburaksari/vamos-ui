import { Image } from "@vamos-ui/react";

const posts = [
  { title: "How we cut onboarding from 9 days to 3", cover: null, author: "Mira Castell" },
  { title: "A field guide to quarterly pricing reviews", cover: null, author: "Jonas Ferreira" },
  { title: "Notes from the spring partner summit", cover: "", author: "Ada Lindqvist" },
];

// A blog list where covers are optional: Image renders seeded art instead of a broken box or a stock photo.
export default function ImageWithoutSrc() {
  return (
    <div className="grid w-full gap-5 md:grid-cols-3">
      {posts.map((p) => (
        <article key={p.title} className="flex flex-col gap-3">
          <Image src={p.cover} alt={`Cover for “${p.title}”`} seed={p.title} aspect="16/9" rounded="ui-lg" />
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-[15px] leading-snug font-medium text-pretty text-fg">{p.title}</h3>
            <span className="text-[12px] text-fg-subtle">{p.author}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
