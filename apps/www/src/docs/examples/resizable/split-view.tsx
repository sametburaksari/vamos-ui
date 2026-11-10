import { ResizableGroup, ResizableHandle, ResizablePanel } from "@vamos-cms/ui";

const threads = [
  { from: "Laura Callahan", subject: "Renewal — revised quote", preview: "Thanks, the 3-year option works for us if…", time: "09:42", unread: true },
  { from: "Jonas Weber", subject: "Onboarding call", preview: "Could we move it to Thursday at 14:00?", time: "08:15", unread: true },
  { from: "Priya Nair", subject: "Invoice INV-2026-0411", preview: "Payment was sent yesterday, reference…", time: "Mon", unread: false },
  { from: "Kenji Sato", subject: "API rate limits", preview: "We're hitting 429s on the contacts endpoint…", time: "Sun", unread: false },
];

// CRM inbox: the layout is remembered per user (autoSaveId → localStorage).
export default function ResizableSplitView() {
  return (
    <ResizableGroup autoSaveId="docs-inbox" className="h-80 w-full max-w-3xl overflow-hidden rounded-ui-lg border border-line">
      <ResizablePanel id="threads" defaultSize="38%" minSize="260px" maxSize="60%">
        <ul className="h-full divide-y divide-line overflow-y-auto">
          {threads.map((t, i) => (
            <li key={t.subject} className={i === 0 ? "bg-selected px-4 py-3" : "px-4 py-3"}>
              <div className="flex items-baseline justify-between gap-2 text-[13px]">
                <span className={t.unread ? "font-semibold text-fg" : "text-fg"}>{t.from}</span>
                <span className="tabular shrink-0 text-[12px] text-fg-subtle">{t.time}</span>
              </div>
              <p className="truncate text-[13px] text-fg">{t.subject}</p>
              <p className="truncate text-[12px] text-fg-subtle">{t.preview}</p>
            </li>
          ))}
        </ul>
      </ResizablePanel>
      <ResizableHandle withGrip aria-label="Resize thread list" />
      <ResizablePanel id="message" minSize="320px">
        <article className="flex h-full flex-col gap-3 overflow-y-auto p-5 text-sm">
          <header>
            <h3 className="font-semibold">Renewal — revised quote</h3>
            <p className="text-[13px] text-fg-muted">Laura Callahan · Northwind Traders</p>
          </header>
          <p className="text-fg-muted">
            Thanks, the 3-year option works for us if the onboarding hours can be included. Our board meets on December 3; I'd like to bring a signed
            draft.
          </p>
        </article>
      </ResizablePanel>
    </ResizableGroup>
  );
}
