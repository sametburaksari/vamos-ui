import type { CSSProperties } from "react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { CourseProvider } from "./components/course-provider";
import { DrivingSite } from "./components/driving-site";

/** Grotesk axis with a heavy Hanken display face instead of the default headline font. */
const heavyHeadings = { "--font-heading": "var(--ff-hanken), ui-sans-serif" } as CSSProperties;

/**
 * Driving school, three pages: home (statement hero with a test-route card, results ledger,
 * courses as road lanes, five steps to test day, instructors, reviews, FAQ, office map), courses
 * and sign-up. Signature: the course comparison table — licence switch, a pace slider that
 * recomputes weeks to test, "only differences", and a chosen column that carries to sign-up.
 * Grotesk with heavy Hanken headings, signal red, glass, comfortable.
 */
export default function SiteDriving01() {
  return (
    <SiteShell accent="#DC2626" font="grotesk" material="glass" density="comfortable" pages={["home", "courses", "signup"]} className="min-h-dvh bg-scene" style={heavyHeadings}>
      <CourseProvider>
        <SiteShellLocale code="en">
          <DrivingSite locale="en" />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <DrivingSite locale="tr" />
        </SiteShellLocale>
      </CourseProvider>
    </SiteShell>
  );
}
