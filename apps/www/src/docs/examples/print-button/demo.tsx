import { PrintButton, PrintStyles } from "@vamos-ui/react";

export default function PrintButtonDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <PrintStyles />
      <article data-print="keep" className="rounded-ui-lg border border-line bg-surface p-5">
        <h3 className="m-0 text-base font-semibold text-fg">Weekly meal plan</h3>
        <p className="m-0 mt-1 text-sm text-fg-muted">
          Shopping list and recipes for five dinners. Source:{" "}
          <a className="text-accent-ink underline" href="https://example.com/plans/week-46">
            example.com/plans/week-46
          </a>
        </p>
        <p data-print="only" className="m-0 mt-3 text-xs text-fg-muted">
          Printed from example.com
        </p>
      </article>
      <div className="flex flex-wrap gap-2">
        <PrintButton />
        <PrintButton variant="primary" fileName="meal-plan-week-46">
          Download PDF
        </PrintButton>
      </div>
    </div>
  );
}
