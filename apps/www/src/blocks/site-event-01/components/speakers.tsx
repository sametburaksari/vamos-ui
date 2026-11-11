import { cn } from "@vamos-ui/react";
import { BlockImage, Container, Section, SectionHeader } from "@vamos-ui/react/blocks";
import { portrait, sessions, speakers, type Copy } from "./content";

const mask = {
  circle: "aspect-square rounded-full",
  square: "aspect-[4/5] rounded-none",
  arch: "aspect-[4/5] rounded-t-full",
  leaf: "aspect-[4/5] rounded-ss-[50%] rounded-ee-[50%]",
} as const;

/** Speakers: portraits cut into the conference's four shapes, with each speaker's talk. */
export function Speakers({ c }: { c: Copy }) {
  const { t, time, f } = c;
  return (
    <Section anchor="speakers" headingId="ifd-speakers-title">
      <Container size="wide">
        <SectionHeader
          headingId="ifd-speakers-title"
          align="split"
          eyebrow={t({ en: "Speakers", tr: "Konuşmacılar" })}
          title={t({ en: "Eight people who *ship*", tr: "Gerçekten *üreten* sekiz kişi" })}
          lead={t({ en: "No sponsored slots, no panels of five. Every speaker gives one talk and most also teach a workshop.", tr: "Sponsorlu konuşma yok, beş kişilik panel yok. Her konuşmacı bir konuşma yapıyor, çoğu bir de atölye veriyor." })}
        />
        <ul className="m-0 mt-12 grid list-none grid-cols-2 gap-x-4 gap-y-10 p-0 md:grid-cols-4 md:gap-x-6">
          {speakers.map((s) => {
            const talk = sessions.find((x) => x.speaker === s.id && x.kind !== "workshop");
            return (
              <li key={s.id} className="flex flex-col">
                <div className="flex aspect-[4/5] items-end">
                  <BlockImage
                    src={portrait(s.photo).src}
                    width={640}
                    height={800}
                    alt={`${s.name}, ${t(s.role)}, ${s.company}`}
                    aspect={s.shape === "circle" ? "1:1" : "4:5"}
                    className={cn("w-full overflow-hidden bg-surface-2", mask[s.shape])}
                    imgClassName="grayscale contrast-[1.1]"
                    sizes="(min-width: 48rem) 22vw, 45vw"
                  />
                </div>
                <h3 className="m-0 mt-4 text-lg leading-tight font-bold tracking-[-0.02em] text-fg">{s.name}</h3>
                <p className="m-0 mt-1 font-mono text-[11px] tracking-[0.04em] text-fg-muted">
                  {t(s.role)} · {s.company}
                </p>
                {talk ? (
                  <p className="m-0 mt-3 border-t border-line pt-3 text-small leading-snug text-fg">
                    “{t(talk.title)}”
                    <span className="mt-1 block font-mono text-[11px] text-fg-muted tabular">
                      {f.date(talk.day === 0 ? "2027-05-14" : "2027-05-15", { weekday: "short" })} {time(talk.start)}
                    </span>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
