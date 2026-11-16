// Pure helpers live in modules without "use client" so server components can call them (a
// function exported from a client module is a client reference on the server and throws when
// called). The component modules re-export them, so old deep imports keep working.
import fs from "node:fs";
import path from "node:path";
import * as amountPicker from "./amount-picker";
import * as amountImpact from "./amount-impact";
import * as choiceGrid from "./choice-grid";
import * as choiceGridStep from "./choice-grid-step";
import * as codeBlock from "./code-block";
import * as codeHighlight from "./code-highlight";
import * as deviceFrame from "./device-frame";
import * as deviceFrameSize from "./device-frame-size";
import * as estimator from "./estimator";
import * as estimatorValues from "./estimator-values";
import * as goalMeter from "./goal-meter";
import * as goalMeterDays from "./goal-meter-days";
import * as printButton from "./print-button";
import * as printStyles from "./print-styles";
import * as tierPricing from "./tier-pricing";
import * as tierQuote from "./tier-quote";

const cases: [module: string, names: string[], home: Record<string, unknown>, client: Record<string, unknown>][] = [
  ["tier-quote.ts", ["tierQuote"], tierQuote, tierPricing],
  ["estimator-values.ts", ["estimatorDefaults", "effectiveEstimatorValues"], estimatorValues, estimator],
  ["goal-meter-days.ts", ["daysUntil"], goalMeterDays, goalMeter],
  ["amount-impact.ts", ["impactFor"], amountImpact, amountPicker],
  ["choice-grid-step.ts", ["choiceGridStep"], choiceGridStep, choiceGrid],
  ["code-highlight.ts", ["highlightCode", "parseLineRanges"], codeHighlight, codeBlock],
  ["device-frame-size.ts", ["deviceFrameSize", "deviceViewports"], deviceFrameSize, deviceFrame],
  ["print-styles.tsx", ["printStyles", "PrintStyles"], printStyles, printButton],
];

describe("server-safe helpers", () => {
  it.each(cases)("%s has no \"use client\" and no hooks", (file) => {
    const src = fs.readFileSync(path.join(__dirname, file), "utf8");
    expect(src).not.toMatch(/^\s*["']use client["']/m);
    expect(src).not.toMatch(/\buse[A-Z]\w*\(/);
    // Only type imports from client modules (a value import would pull the client module in).
    for (const m of src.matchAll(/^import (?!type )[^;]*from "\.\/([^"]+)"/gm)) {
      const dep = fs.readdirSync(__dirname).find((f) => f.replace(/\.tsx?$/, "") === m[1]);
      expect(dep && fs.readFileSync(path.join(__dirname, dep), "utf8")).not.toMatch(/^\s*["']use client["']/m);
    }
  });

  it.each(cases)("%s: the component module re-exports the same values", (_file, names, home, client) => {
    for (const n of names) {
      expect(home[n]).toBeDefined();
      expect(client[n]).toBe(home[n]);
    }
  });
});
