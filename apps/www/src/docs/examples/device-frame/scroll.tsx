"use client";

import * as React from "react";
import { DeviceFrame, DeviceScreens } from "@vamos-ui/react";
import { PlanScreen, ShareScreen, TodayScreen } from "./_screens";

const chapters = [
  { id: "today", title: "See your day", text: "Everything due today on one screen, done items crossed out.", screen: <TodayScreen />, alt: "Today screen with three tasks" },
  { id: "plan", title: "Plan the week", text: "Drag tasks between days and see how full each day is.", screen: <PlanScreen />, alt: "Week plan with a bar per day" },
  { id: "share", title: "Share lists", text: "Invite the people you live or travel with to a list.", screen: <ShareScreen />, alt: "Three shared lists with their members" },
];

/** Scroll-synced: the chapter crossing the middle of the scroll box picks the screen. */
export default function DeviceFrameScroll() {
  const [active, setActive] = React.useState(chapters[0]!.id);
  const box = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const root = box.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.chapter!);
      },
      { root, rootMargin: "-45% 0px -45% 0px" },
    );
    root.querySelectorAll("[data-chapter]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const current = chapters.find((c) => c.id === active)!;
  return (
    <div className="grid w-full gap-8 sm:grid-cols-[1fr_14rem]">
      <div ref={box} tabIndex={0} aria-label="Feature chapters" role="region" className="h-96 overflow-y-auto rounded-ui border border-line focus-ring">
        {chapters.map((c) => (
          <section key={c.id} data-chapter={c.id} className="flex min-h-80 flex-col justify-center border-b border-line px-6 last:border-b-0">
            <h3 className={active === c.id ? "m-0 text-h3 text-fg" : "m-0 text-h3 text-fg-muted"}>{c.title}</h3>
            <p className="m-0 mt-2 text-fg-muted">{c.text}</p>
          </section>
        ))}
      </div>
      <div className="self-center">
        <DeviceFrame statusBar="09:41" label={current.alt}>
          <DeviceScreens active={active} screens={chapters.map((c) => ({ id: c.id, content: c.screen }))} />
        </DeviceFrame>
      </div>
    </div>
  );
}
