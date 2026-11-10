import { ResizableGroup, ResizableHandle, ResizablePanel } from "@vamos-ui/react";

// CMS template editor: source + preview, with a console under the source.
export default function ResizableNested() {
  return (
    <ResizableGroup className="h-80 w-full max-w-3xl overflow-hidden rounded-ui-lg border border-line">
      <ResizablePanel id="editor" defaultSize="50%" minSize="25%">
        <ResizableGroup orientation="vertical">
          <ResizablePanel id="source" defaultSize="70%" minSize="30%">
            <pre tabIndex={0} className="h-full overflow-auto bg-surface-2 p-4 focus-ring font-mono text-[12px] leading-relaxed text-fg">{`<section class="hero">
  <h1>{{ page.title }}</h1>
  <p>{{ page.lead }}</p>
</section>`}</pre>
          </ResizablePanel>
          <ResizableHandle aria-label="Resize console" />
          <ResizablePanel id="console" minSize="15%">
            <p className="p-3 font-mono text-[12px] text-fg-subtle">Compiled in 42 ms · 0 warnings</p>
          </ResizablePanel>
        </ResizableGroup>
      </ResizablePanel>
      <ResizableHandle withGrip aria-label="Resize preview" />
      <ResizablePanel id="preview" minSize="25%">
        <div className="flex h-full flex-col justify-center gap-2 p-6">
          <h4 className="font-display text-2xl leading-tight">Autumn menu is here</h4>
          <p className="text-[13px] text-fg-muted">Twelve new dishes from the Aegean coast, served from November 14.</p>
        </div>
      </ResizablePanel>
    </ResizableGroup>
  );
}
